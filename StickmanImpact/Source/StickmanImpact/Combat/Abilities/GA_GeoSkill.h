// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Combat/StickmanGameplayAbility.h"
#include "GA_GeoSkill.generated.h"

/**
 * "Stone Wall" — slams a rock shockwave (100% ATK) then raises a temporary blocking wall
 * (AStickmanGeoWall) in front of the caster. If the target already carries a Pyro or
 * Electro status this also counts as a Crystallize trigger (flagged here for the Combat
 * module's reaction system to pick up later — full elemental-reaction resolution is out of
 * scope for this scaffold).
 */
UCLASS()
class STICKMANIMPACT_API UGA_GeoSkill : public UStickmanGameplayAbility
{
	GENERATED_BODY()

public:
	UGA_GeoSkill();

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float ShockwaveRadius = 400.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float WallSpawnDistance = 200.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	TSubclassOf<class AStickmanGeoWall> WallClass;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	TSubclassOf<class UGameplayEffect> GeoStatusEffectClass;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	TSubclassOf<class UCameraShakeBase> HitCameraShakeClass;

protected:
	virtual void OnAbilityActivated() override;

private:
	void SlamAndRaiseWall();

	FTimerHandle SlamTimerHandle;
};
