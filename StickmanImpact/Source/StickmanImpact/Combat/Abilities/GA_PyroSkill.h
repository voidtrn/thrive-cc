// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Combat/StickmanGameplayAbility.h"
#include "GA_PyroSkill.generated.h"

/** "Flame Surge" — forward cone of fire, 180% ATK, applies Pyro. 6s cooldown. */
UCLASS()
class STICKMANIMPACT_API UGA_PyroSkill : public UStickmanGameplayAbility
{
	GENERATED_BODY()

public:
	UGA_PyroSkill();

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float ConeRange = 500.f;

	// Forward cone, narrower than Pyro Slash's full 180-degree swing.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float ConeHalfAngleDegrees = 45.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	TSubclassOf<class UGameplayEffect> PyroStatusEffectClass;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	TSubclassOf<class UCameraShakeBase> HitCameraShakeClass;

protected:
	virtual void OnAbilityActivated() override;
};
