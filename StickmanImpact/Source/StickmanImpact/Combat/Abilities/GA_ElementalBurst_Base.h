// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Combat/StickmanGameplayAbility.h"
#include "GA_ElementalBurst_Base.generated.h"

/**
 * Shared shape for every Elemental Burst: 3x ATK damage, full-screen cinematic moment
 * (brief slow-mo + camera shake), 60 Energy cost, 20s cooldown. Concrete elements override
 * OnAbilityActivated to add their own flourish (see GA_PyroBurst's "Phoenix Dive") but should
 * call Super::OnAbilityActivated() first to get the shared cast VFX/slow-mo/damage burst,
 * or call the individual PlayFullScreenBurstEffect() / ApplyBurstDamage() pieces directly if
 * they need custom timing (e.g. a dive that lands mid-animation).
 */
UCLASS(Abstract)
class STICKMANIMPACT_API UGA_ElementalBurst_Base : public UStickmanGameplayAbility
{
	GENERATED_BODY()

public:
	UGA_ElementalBurst_Base();

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Burst")
	float BurstRadius = 600.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Burst")
	float CastDuration = 1.5f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Burst")
	float SlowMoTimeDilation = 0.25f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Burst")
	float SlowMoDuration = 0.4f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Burst")
	TSubclassOf<class UGameplayEffect> BurstStatusEffectClass;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Burst")
	TSubclassOf<class UCameraShakeBase> BurstCameraShakeClass;

protected:
	virtual void OnAbilityActivated() override;

	// Brief hitstop/slow-mo for the "full screen effect" cinematic beat.
	void PlayFullScreenBurstEffect() const;

	// Sphere AoE around the caster for BurstRadius, DamageMultiplier (3x by default) ATK.
	void ApplyBurstDamage() const;
};
