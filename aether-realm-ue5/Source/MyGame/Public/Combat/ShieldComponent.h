#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "Combat/CombatTypes.h"
#include "ShieldComponent.generated.h"

class ACharacterBase;

/** Satu shield aktif — punya elemen, jumlah, sisa waktu. */
USTRUCT(BlueprintType)
struct FActiveShield
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly) FName SourceId;

	/** Elemen shield. None = universal/geo (tak dapat bonus 2.5× vs elemen). */
	UPROPERTY(BlueprintReadOnly) EElement Element = EElement::None;

	UPROPERTY(BlueprintReadOnly) float Amount = 0.f;

	UPROPERTY(BlueprintReadOnly) float TimeRemaining = 0.f;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnShieldChanged, float, TotalShield);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnShieldBroken);

/**
 * Shield absorb damage sebelum HP. Elemental shield 2.5× lebih efektif
 * melawan elemen yang cocok (Genshin). Shield strength bonus (Geo resonance,
 * artifact) via `ExtraShieldStrength`.
 *
 * Pasang di CharacterBase. `ApplyDamage` route lewat `AbsorbDamage` dulu.
 */
UCLASS(ClassGroup = (Combat), meta = (BlueprintSpawnableComponent))
class MYGAME_API UShieldComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UShieldComponent();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType,
		FActorComponentTickFunction* ThisTickFunction) override;

	/**
	 * Pasang shield. SourceId sama = refresh (ambil yang lebih besar, reset timer).
	 * @param BaseAmount  jumlah dasar sebelum shield strength bonus.
	 */
	UFUNCTION(BlueprintCallable, Category = "Shield")
	void ApplyShield(FName SourceId, EElement Element, float BaseAmount, float Duration);

	/**
	 * Serap damage lewat shield. Return sisa damage yang tembus ke HP.
	 * Elemen cocok → shield 2.5× efektif.
	 */
	UFUNCTION(BlueprintCallable, Category = "Shield")
	float AbsorbDamage(float Damage, EElement DamageElement);

	UFUNCTION(BlueprintPure, Category = "Shield")
	float GetTotalShield() const;

	UFUNCTION(BlueprintPure, Category = "Shield")
	bool IsShielded() const { return GetTotalShield() > 0.f; }

	UFUNCTION(BlueprintCallable, Category = "Shield")
	void ClearAllShields();

	/** Bonus kekuatan shield (Geo resonance 0.15, di-set ResonanceComponent). */
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Shield")
	float ExtraShieldStrength = 0.f;

	UPROPERTY(BlueprintAssignable, Category = "Shield")
	FOnShieldChanged OnShieldChanged;

	UPROPERTY(BlueprintAssignable, Category = "Shield")
	FOnShieldBroken OnShieldBroken;

private:
	UPROPERTY()
	TArray<FActiveShield> ActiveShields;

	/** Efektivitas shield vs elemen (2.5× kalau cocok). */
	static float ElementMultiplier(EElement ShieldElement, EElement DamageElement);
};
