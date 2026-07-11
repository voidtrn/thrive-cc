// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Abilities/GameplayAbility.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "StickmanGameplayAbility.generated.h"

class UAbilityTask_PlayMontageAndWait;
class UGameplayEffect;
class UCameraShakeBase;
class UStickmanAttributeSet;

/**
 * Base class for every StickmanImpact skill.
 *
 * Cooldown and energy cost are tracked directly against SkillData instead of going through
 * hand-authored per-ability GameplayEffect assets: SkillData.SkillTag (already a unique,
 * registered tag per skill) is applied/removed as a loose ASC tag for the cooldown duration,
 * and energy cost is deducted straight from the AttributeSet. This keeps every ability
 * fully data-driven off one FSkillData row with no extra Blueprint assets required to test.
 */
UCLASS(Abstract)
class STICKMANIMPACT_API UStickmanGameplayAbility : public UGameplayAbility
{
	GENERATED_BODY()

public:
	UStickmanGameplayAbility();

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	FSkillData SkillData;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	TObjectPtr<UAnimMontage> MontageToPlay;

	// Percent-of-Attack damage multiplier quoted in the design (e.g. 1.8 for "180% ATK").
	// Actual hit damage = caster Attack * DamageMultiplier, computed in ApplyRadialElementalDamage.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Skill")
	float DamageMultiplier = 1.f;

	virtual bool CanActivateAbility(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo,
		const FGameplayTagContainer* SourceTags = nullptr, const FGameplayTagContainer* TargetTags = nullptr,
		FGameplayTagContainer* OptionalRelevantTags = nullptr) const override;

	virtual void ActivateAbility(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo,
		const FGameplayAbilityActivationInfo ActivationInfo, const FGameplayEventData* TriggerEventData) override;

	virtual void EndAbility(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo,
		const FGameplayAbilityActivationInfo ActivationInfo, bool bReplicateEndAbility, bool bWasCancelled) override;

	// True if SkillData.SkillTag is not currently marked on cooldown.
	UFUNCTION(BlueprintPure, Category = "Skill")
	bool CheckCooldown() const;

	// True if the owner has enough CurrentEnergy for SkillData.EnergyCost (0 cost always passes).
	UFUNCTION(BlueprintPure, Category = "Skill")
	bool CheckCost() const;

protected:
	// Called once cost + cooldown have both been committed — subclasses do their real work
	// here (play montage, spawn VFX, apply damage) instead of overriding ActivateAbility.
	virtual void OnAbilityActivated();

	// Mirror of EndAbility, called before Super::EndAbility so subclasses can clean up
	// (timers, spawned actors) without re-deriving the bWasCancelled plumbing.
	virtual void OnAbilityEnded(bool bWasCancelled);

	void CommitCooldown();
	void CommitCost();

	UAbilityTask_PlayMontageAndWait* PlayAbilityMontage(UAnimMontage* Montage, float PlayRate = 1.f,
		FName StartSection = NAME_None);

	// Plays Montage and ends the ability when it finishes/interrupts/cancels; if Montage is
	// unset, ends the ability after FallbackDuration seconds instead. Every skill in this
	// project uses this same shape (cast something, then close out) so it lives here once —
	// subclasses just schedule their own damage-application timer(s) alongside it.
	void PlayMontageThenEnd(UAnimMontage* Montage, float FallbackDuration);

	// Shared elemental-damage helper used by every element's ability: overlaps a cone/sphere
	// around Origin, applies Attack * DamageMultiplier as damage to each hit target, and (if
	// StatusEffectClass is set) applies that GameplayEffect to inflict the elemental status.
	// HalfAngleDegrees >= 180 behaves as a full sphere; below that it's a forward-facing cone.
	void ApplyRadialElementalDamage(const FVector& Origin, const FVector& ForwardDir, float Radius,
		float HalfAngleDegrees, float DamageMultiplier, TSubclassOf<UGameplayEffect> StatusEffectClass,
		TArray<AActor*>& OutHitActors, const TArray<AActor*>* ExtraActorsToIgnore = nullptr) const;

	void ApplyDamageToTarget(AActor* TargetActor, float DamageAmount, TSubclassOf<UGameplayEffect> StatusEffectClass) const;

	void PlayImpactCameraShake(TSubclassOf<UCameraShakeBase> ShakeClass) const;

	void PlayCastAudioVisuals() const;

	UStickmanAttributeSet* GetStickmanAttributeSet() const;

private:
	UFUNCTION()
	void HandleGenericMontageEnd();

	FTimerHandle CooldownTimerHandle;
	FTimerHandle GenericEndTimerHandle;
};
