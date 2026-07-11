// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Combat/StickmanGameplayAbility.h"
#include "GA_BowAimedShot.generated.h"

/**
 * Bow-only "aimed mode": holds ChargeTime seconds (slows movement, per an AnimBP/Blueprint
 * override reading IsChargingBowShot()), then fires a long-range hit-check scaled by how much
 * of ChargeTime was actually held (MinDamageMultiplier at a tap, DamageMultiplier at full
 * charge). Grant this alongside GA_NormalAttack on Bow-type party members for the "charged
 * shot" half of the weapon-type spec; GA_NormalAttack's own HitCheckRadius already covers
 * ordinary ranged auto-attacks (see README's weapon-type notes).
 */
UCLASS()
class STICKMANIMPACT_API UGA_BowAimedShot : public UStickmanGameplayAbility
{
	GENERATED_BODY()

public:
	UGA_BowAimedShot();

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Bow")
	float ChargeTime = 1.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Bow")
	float ShotRange = 3000.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Bow")
	float ShotRadius = 40.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Bow")
	float MinDamageMultiplier = 0.5f;

	UFUNCTION(BlueprintPure, Category = "Bow")
	bool IsChargingBowShot() const { return bIsCharging; }

	UFUNCTION(BlueprintPure, Category = "Bow")
	float GetChargePercent() const;

protected:
	virtual void OnAbilityActivated() override;
	virtual void OnAbilityEnded(bool bWasCancelled) override;

private:
	UFUNCTION()
	void FireShot(float TimeHeld);

	bool bIsCharging = false;
	float ChargeStartTime = 0.f;
	FTimerHandle AutoFireTimerHandle;
};
