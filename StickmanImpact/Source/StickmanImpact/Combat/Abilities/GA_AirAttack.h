// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Combat/StickmanGameplayAbility.h"
#include "GA_AirAttack.generated.h"

/**
 * 3-hit air string. Each hit briefly floats the attacker (velocity reset) so the string can
 * finish before gravity wins; hits feed enemies' juggle counters through the normal damage
 * path. Route it from OnNormalAttack the same way as plunge (grant it a distinct SkillTag
 * and choose air-attack vs plunge by tap vs hold, or bind a separate input) — the full air
 * combo per spec: launcher branch → air string → air skill → plunge finisher.
 * Air dash: the ordinary Dash already works airborne (MOVE_Flying drive) and costs stamina.
 */
UCLASS()
class STICKMANIMPACT_API UGA_AirAttack : public UStickmanGameplayAbility
{
	GENERATED_BODY()

public:
	UGA_AirAttack();

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Air Combo")
	TArray<TObjectPtr<UAnimMontage>> AirMontages;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Air Combo")
	TArray<float> AirDamageMultipliers = { 0.8f, 0.9f, 1.2f };

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Air Combo")
	float HitCheckRadius = 160.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Air Combo")
	float FloatVelocity = 150.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Air Combo")
	float HitInterval = 0.35f;

protected:
	virtual void OnAbilityActivated() override;
	virtual void OnAbilityEnded(bool bWasCancelled) override;

private:
	void DoAirHit();

	int32 AirHitIndex = 0;
	FTimerHandle AirHitTimerHandle;
};
