#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "UI/InventoryTypes.h"
#include "System/WeaponTypes.h"
#include "CharacterProgressionComponent.generated.h"

class ACharacterBase;
class UDataTable;

/** Hasil akhir stat setelah base + weapon + artifact digabung. */
USTRUCT(BlueprintType)
struct FDerivedStats
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly) float MaxHP = 0.f;
	UPROPERTY(BlueprintReadOnly) float ATK = 0.f;
	UPROPERTY(BlueprintReadOnly) float DEF = 0.f;
	UPROPERTY(BlueprintReadOnly) float ElementalMastery = 0.f;
	UPROPERTY(BlueprintReadOnly) float CritRate = 0.05f;
	UPROPERTY(BlueprintReadOnly) float CritDMG = 0.5f;
	UPROPERTY(BlueprintReadOnly) float EnergyRecharge = 1.f;
	UPROPERTY(BlueprintReadOnly) float ElementalDMGBonus = 0.f;
	UPROPERTY(BlueprintReadOnly) float HealingBonus = 0.f;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnStatsRecalculated, const FDerivedStats&, NewStats);

/**
 * Menghitung stat akhir karakter dari:
 *   base (level) + senjata (base ATK + substat) + 5 artifact (main+substat)
 *   + set bonus 2/4-piece + constellation.
 * Menulis hasil ke ACharacterBase (MaxHP/ATK/DEF/EM/Crit/ER).
 *
 * Rumus (Genshin-like):
 *   HP  = BaseHP  × (1 + HP%)  + flatHP
 *   ATK = (BaseCharATK + WeaponBaseATK) × (1 + ATK%) + flatATK
 *   DEF = BaseDEF × (1 + DEF%) + flatDEF
 * Panggil Recalculate() setiap ganti weapon/artifact/level/ascension.
 */
UCLASS(ClassGroup = (Progression), meta = (BlueprintSpawnableComponent))
class MYGAME_API UCharacterProgressionComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UCharacterProgressionComponent();

	/** Hitung ulang & tulis ke CharacterBase. Panggil saat gear berubah. */
	UFUNCTION(BlueprintCallable, Category = "Progression")
	void Recalculate();

	UFUNCTION(BlueprintPure, Category = "Progression")
	const FDerivedStats& GetDerivedStats() const { return CachedStats; }

	UFUNCTION(BlueprintPure, Category = "Progression")
	const FTalentLevels& GetTalents() const { return Talents; }

	/** Multiplier damage dari level talent (mis. skill lvl 6 = 1.5× base). */
	UFUNCTION(BlueprintPure, Category = "Progression")
	float GetTalentMultiplier(int32 TalentLevel) const;

	/** Constellation aktif (0-6). C1/C2/... dibaca gameplay via >=. */
	UFUNCTION(BlueprintPure, Category = "Progression")
	int32 GetConstellation() const { return ConstellationLevel; }

	UFUNCTION(BlueprintCallable, Category = "Progression")
	void SetConstellation(int32 NewLevel);

	UPROPERTY(BlueprintAssignable, Category = "Progression")
	FOnStatsRecalculated OnStatsRecalculated;

	// --- Sumber data (di-assign BP / diisi dari GameInstance) ---
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Progression|Gear")
	FWeaponInstance EquippedWeapon;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Progression|Gear")
	TArray<FArtifactInstance> EquippedArtifacts;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Progression|Talent")
	FTalentLevels Talents;

protected:
	virtual void BeginPlay() override;

	UPROPERTY(EditDefaultsOnly, Category = "Progression|Data")
	TObjectPtr<UDataTable> WeaponTable;

	/** Base stat karakter di level 1 (sebelum gear). */
	UPROPERTY(EditDefaultsOnly, Category = "Progression|Base")
	float BaseHPLevel1 = 800.f;

	UPROPERTY(EditDefaultsOnly, Category = "Progression|Base")
	float BaseATKLevel1 = 20.f;

	UPROPERTY(EditDefaultsOnly, Category = "Progression|Base")
	float BaseDEFLevel1 = 50.f;

	/** Faktor kali stat per level (approx: lvl 90 ≈ 8× base). */
	UPROPERTY(EditDefaultsOnly, Category = "Progression|Base")
	float StatPerLevelFactor = 0.08f;

private:
	UPROPERTY()
	TObjectPtr<ACharacterBase> OwnerChar;

	int32 ConstellationLevel = 0;
	FDerivedStats CachedStats;

	void AccumulateStat(EArtifactStat Stat, float Value, FDerivedStats& Flat, FDerivedStats& Percent) const;
	float LevelScale(int32 Level) const;
};
