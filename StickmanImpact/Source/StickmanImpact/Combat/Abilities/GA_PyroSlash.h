// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Combat/StickmanGameplayAbility.h"
#include "GA_PyroSlash.generated.h"

/**
 * Elemental Skill: character spins with a fire slash, hitting everyone in a 400-unit,
 * 180-degree arc in front of them for 150% ATK and applying Pyro (GE_PyroStatus).
 * 6 second cooldown, no energy cost (Elemental Skills are free — Bursts cost Energy).
 */
UCLASS()
class STICKMANIMPACT_API UGA_PyroSlash : public UStickmanGameplayAbility
{
	GENERATED_BODY()

public:
	UGA_PyroSlash();

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float AoERadius = 400.f;

	// Full arc width in degrees (180 => hits everyone in front of the character, ear to ear).
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float AoEArcDegrees = 180.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float SpinMontageDuration = 1.2f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	TSubclassOf<class UGameplayEffect> PyroStatusEffectClass;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	TSubclassOf<class UCameraShakeBase> HitCameraShakeClass;

protected:
	virtual void OnAbilityActivated() override;

private:
	void ApplySlashDamage();

	FTimerHandle DamageApplyTimerHandle;
};
