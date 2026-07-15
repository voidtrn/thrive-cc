// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Combat/StickmanGameplayAbility.h"
#include "GA_CryoSkill.generated.h"

/** "Frost Wave" — a forward ice path, 140% ATK, slows anyone hit by 40% for a few seconds. */
UCLASS()
class STICKMANIMPACT_API UGA_CryoSkill : public UStickmanGameplayAbility
{
	GENERATED_BODY()

public:
	UGA_CryoSkill();

	// Modelled as a narrow forward cone standing in for the ground ice path.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float PathLength = 700.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float PathHalfAngleDegrees = 18.f;

	// 40% slow => target keeps 60% of their walk speed.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float SlowSpeedFraction = 0.6f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float SlowDuration = 3.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	TSubclassOf<class UGameplayEffect> CryoStatusEffectClass;

protected:
	virtual void OnAbilityActivated() override;

private:
	void ApplyFrostWave();
	void ApplySlowToActor(AActor* TargetActor) const;

	FTimerHandle DamageApplyTimerHandle;
};
