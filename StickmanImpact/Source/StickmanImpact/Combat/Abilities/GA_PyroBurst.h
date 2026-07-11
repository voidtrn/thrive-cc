// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GA_ElementalBurst_Base.h"
#include "GA_PyroBurst.generated.h"

/**
 * "Phoenix Dive" — the caster launches skyward, then slams down in a massive fiery
 * explosion (bigger radius than the base burst) applying Pyro to everyone caught in it.
 */
UCLASS()
class STICKMANIMPACT_API UGA_PyroBurst : public UGA_ElementalBurst_Base
{
	GENERATED_BODY()

public:
	UGA_PyroBurst();

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Burst")
	float LaunchUpwardVelocity = 1200.f;

	// Seconds from launch to the ground-slam impact — should roughly match the dive montage.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Burst")
	float DiveImpactDelay = 0.8f;

	// Phoenix Dive hits harder and wider than a generic burst.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Burst")
	float ExplosionRadiusMultiplier = 1.5f;

protected:
	virtual void OnAbilityActivated() override;

private:
	void SlamDown();

	FTimerHandle SlamTimerHandle;
};
