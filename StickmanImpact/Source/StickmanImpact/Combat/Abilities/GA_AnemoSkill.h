// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Combat/StickmanGameplayAbility.h"
#include "GA_AnemoSkill.generated.h"

/**
 * "Wind Blade" — a fast-moving wind projectile that drags anyone it clips along with it.
 * Simulated as a stepped sphere sweep (no separate projectile Actor) so the whole skill is
 * self-contained in the ability: each step overlaps a sphere at the current travel position,
 * damages/tags newly-hit actors once, and launches them toward the next step position.
 */
UCLASS()
class STICKMANIMPACT_API UGA_AnemoSkill : public UStickmanGameplayAbility
{
	GENERATED_BODY()

public:
	UGA_AnemoSkill();

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float ProjectileRange = 900.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float ProjectileRadius = 120.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	int32 TravelSteps = 8;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float TravelDuration = 0.5f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float PullAlongSpeed = 500.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	TSubclassOf<class UGameplayEffect> AnemoStatusEffectClass;

protected:
	virtual void OnAbilityActivated() override;
	virtual void OnAbilityEnded(bool bWasCancelled) override;

private:
	void AdvanceProjectileStep();

	FVector ProjectileOrigin = FVector::ZeroVector;
	FVector ProjectileForward = FVector::ForwardVector;
	int32 CurrentStep = 0;
	TSet<TWeakObjectPtr<AActor>> HitActorsThisCast;

	FTimerHandle ProjectileStepTimerHandle;
};
