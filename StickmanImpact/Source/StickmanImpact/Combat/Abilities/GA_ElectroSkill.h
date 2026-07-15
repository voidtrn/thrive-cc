// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Combat/StickmanGameplayAbility.h"
#include "GA_ElectroSkill.generated.h"

/** "Lightning Strike" — blink forward then detonate an AoE lightning burst, 160% ATK. */
UCLASS()
class STICKMANIMPACT_API UGA_ElectroSkill : public UStickmanGameplayAbility
{
	GENERATED_BODY()

public:
	UGA_ElectroSkill();

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float TeleportDistance = 500.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float StrikeRadius = 350.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	TSubclassOf<class UGameplayEffect> ElectroStatusEffectClass;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	TSubclassOf<class UCameraShakeBase> HitCameraShakeClass;

protected:
	virtual void OnAbilityActivated() override;

private:
	void TeleportAndStrike();

	FTimerHandle StrikeTimerHandle;
};
