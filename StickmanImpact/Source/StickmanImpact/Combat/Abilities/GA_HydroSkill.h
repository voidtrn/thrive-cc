// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Combat/StickmanGameplayAbility.h"
#include "GA_HydroSkill.generated.h"

/** "Aqua Vortex" — pulls everyone around the caster inward, 120% ATK, applies Hydro. */
UCLASS()
class STICKMANIMPACT_API UGA_HydroSkill : public UStickmanGameplayAbility
{
	GENERATED_BODY()

public:
	UGA_HydroSkill();

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float VortexRadius = 450.f;

	// Speed of the inward pull (units/sec) applied via LaunchCharacter.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float PullSpeed = 900.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	TSubclassOf<class UGameplayEffect> HydroStatusEffectClass;

protected:
	virtual void OnAbilityActivated() override;

private:
	void ApplyVortex();

	FTimerHandle DamageApplyTimerHandle;
};
