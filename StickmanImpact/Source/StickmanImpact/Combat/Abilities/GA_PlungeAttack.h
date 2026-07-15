// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Combat/StickmanGameplayAbility.h"
#include "GA_PlungeAttack.generated.h"

/**
 * Plunge attack: activated by attacking while airborne (AStickmanCharacter::OnNormalAttack
 * routes there via PlungeAttackSkillTag). Slams the character straight down, then deals
 * radial damage on impact scaled by fall speed. Damage carries the character's current
 * normal-attack element (Catalyst infusion etc. — set SkillData.Element like any skill).
 */
UCLASS()
class STICKMANIMPACT_API UGA_PlungeAttack : public UStickmanGameplayAbility
{
	GENERATED_BODY()

public:
	UGA_PlungeAttack();

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Plunge")
	float SlamVelocity = 2200.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Plunge")
	float ImpactRadius = 300.f;

	// Extra damage multiplier per 1000 uu/s of impact speed above SlamVelocity's baseline.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Plunge")
	float SpeedDamageBonus = 0.3f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Plunge")
	TSubclassOf<class UGameplayEffect> ImpactStatusEffectClass;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Plunge")
	TSubclassOf<class UCameraShakeBase> ImpactCameraShakeClass;

protected:
	virtual void OnAbilityActivated() override;
	virtual void OnAbilityEnded(bool bWasCancelled) override;

private:
	void CheckLanded();

	FTimerHandle LandCheckTimerHandle;
};
