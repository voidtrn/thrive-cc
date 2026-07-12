#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "Combat/CombatTypes.h"
#include "ElementalReactionSubsystem.generated.h"

class ACharacterBase;
enum class EWeatherType : uint8;

/** Aura elemen aktif di satu target. */
USTRUCT()
struct FElementalAura
{
	GENERATED_BODY()

	EElement Element = EElement::None;
	float Units = 0.f;
};

/** Hasil resolve reaction — dipakai CombatComponent buat damage & VFX. */
USTRUCT(BlueprintType)
struct FReactionResult
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly)
	EReactionType Reaction = EReactionType::None;

	/** Multiplier untuk amp reaction (Vaporize/Melt). 1.0 = no amp. */
	UPROPERTY(BlueprintReadOnly)
	float AmpMultiplier = 1.f;

	/** Flat bonus (Spread/Aggravate). */
	UPROPERTY(BlueprintReadOnly)
	float FlatBonus = 0.f;
};

USTRUCT()
struct FIcdRecord
{
	GENERATED_BODY()

	double LastApplyTime = -999.0;
	int32 HitsSinceApply = 0;
};

USTRUCT()
struct FDendroCore
{
	GENERATED_BODY()

	FVector Location = FVector::ZeroVector;
	double SpawnTime = 0.0;
	TWeakObjectPtr<ACharacterBase> Owner;
};

USTRUCT()
struct FElectroChargedInstance
{
	GENERATED_BODY()

	TWeakObjectPtr<ACharacterBase> Target;
	TWeakObjectPtr<ACharacterBase> Source;
	int32 TicksLeft = 2;
	double NextTickTime = 0.0;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_FourParams(FOnReactionTriggered,
	EReactionType, Reaction, AActor*, Target, AActor*, Instigator, FVector, Location);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FOnCrystallizeShield,
	EElement, Element, float, ShieldStrength, AActor*, Instigator);

/**
 * World subsystem pusat elemental gauge + reaction.
 * Alur: CombatComponent hit → ApplyElement() → cek ICD → resolve reaction
 * vs aura existing → return FReactionResult (amp/flat) + jalankan efek
 * transformative (AOE, DOT, freeze, dst) langsung dari sini.
 */
UCLASS()
class MYGAME_API UElementalReactionSubsystem : public UTickableWorldSubsystem
{
	GENERATED_BODY()

public:
	virtual void Tick(float DeltaTime) override;
	virtual TStatId GetStatId() const override
	{
		RETURN_QUICK_DECLARE_CYCLE_STAT(UElementalReactionSubsystem, STATGROUP_Tickables);
	}

	/**
	 * Apply elemen ke target. Return hasil reaction (kalau ada).
	 * ICD: per target per ICDTag — apply hanya tiap 2.5 detik ATAU tiap hit ke-3.
	 */
	FReactionResult ApplyElement(
		ACharacterBase* Target,
		ACharacterBase* Instigator,
		EElement Element,
		float GaugeUnits,
		FName ICDTag,
		bool bBluntHit);

	/** Aura aktif target (buat UI debuff icon / VFX loop). */
	UFUNCTION(BlueprintPure, Category = "Elemental")
	EElement GetPrimaryAura(AActor* Target) const;

	/**
	 * Weather × Element: multiplier gauge unit per cuaca (GAME_LONGEVITY
	 * PATTERNS.md §1c — "cuaca belum mempengaruhi gauge secara sistemik",
	 * sekarang iya). Pure static, testable tanpa World:
	 *   Rain: Hydro/Dendro 1.25/1.15, Electro 1.15, Pyro 0.75
	 *   Thunderstorm: Electro 1.3, Hydro 1.25, Pyro 0.6
	 *   Snow: Cryo 1.25, Pyro 0.8 · Fog: Hydro 1.1 · lainnya 1.0
	 * Dipakai ApplyElement — hujan bikin dunia "basah" (Hydro nempel lebih
	 * kuat, api susah nyala), badai bikin Electro chain lebih ganas.
	 */
	static float GetWeatherGaugeMultiplier(EWeatherType Weather, EElement Element);

	UPROPERTY(BlueprintAssignable, Category = "Elemental")
	FOnReactionTriggered OnReactionTriggered;

	UPROPERTY(BlueprintAssignable, Category = "Elemental")
	FOnCrystallizeShield OnCrystallizeShield;

protected:
	/** Decay gauge per detik. */
	static constexpr float DecayUnitsPerSecond = 0.8f;
	static constexpr double IcdSeconds = 2.5;
	static constexpr int32 IcdHitCount = 3;
	static constexpr float SwirlRadius = 300.f;
	static constexpr float OverloadRadius = 250.f;
	static constexpr float SuperconductRadius = 250.f;
	static constexpr double DendroCoreLifetime = 6.0;
	static constexpr int32 MaxDendroCores = 5;
	static constexpr float DendroCoreConvertRadius = 150.f;

	TMap<TWeakObjectPtr<ACharacterBase>, TArray<FElementalAura>> ActiveAuras;
	TMap<TWeakObjectPtr<ACharacterBase>, TMap<FName, FIcdRecord>> IcdRecords;
	TArray<FDendroCore> DendroCores;
	TArray<FElectroChargedInstance> ECInstances;
	TMap<TWeakObjectPtr<ACharacterBase>, double> FrozenUntil;
	TMap<TWeakObjectPtr<ACharacterBase>, double> QuickenUntil;

	bool PassesICD(ACharacterBase* Target, FName ICDTag);
	FReactionResult ResolveReaction(
		ACharacterBase* Target, ACharacterBase* Instigator,
		EElement Incoming, float Units, bool bBluntHit);

	void DoTransformativeDamage(
		ACharacterBase* Instigator, const FVector& Center, float Radius,
		EElement Element, float ReactionCoefficient, EReactionType Reaction,
		bool bKnockback = false);

	void AddAura(ACharacterBase* Target, EElement Element, float Units);
	FElementalAura* FindAura(ACharacterBase* Target, EElement Element);
	void ConsumeAura(ACharacterBase* Target, EElement Element, float Units);
};
