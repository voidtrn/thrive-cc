// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Combat/StickmanGameplayAbility.h"
#include "GA_NormalAttack.generated.h"

/**
 * The basic melee combo chain (up to 5 hits, see FNormalAttackChain). Pressing attack again
 * inside SkillData's normal-attack combo window (buffered via
 * UStickmanAbilitySystemComponent::QueueComboInput, called from
 * AStickmanCharacter::OnNormalAttack when this ability is already active) advances to the
 * next hit; otherwise AN_AttackEnd closes the chain back to hit 0.
 *
 * "Pyro Slash": each hit applies a small amount of Pyro infusion (GE_PyroStatus) alongside
 * the physical damage, per the first-playable-skill spec.
 */
UCLASS()
class STICKMANIMPACT_API UGA_NormalAttack : public UStickmanGameplayAbility
{
	GENERATED_BODY()

public:
	UGA_NormalAttack();

	// The combo chain data (montages + per-hit multipliers). Assign in the ability Blueprint
	// default object, or copy in from a UStickmanSkillDataAsset on the owning character.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combo")
	FNormalAttackChain NormalAttackCombo;

	// Set by AStickmanCharacter::ApplyCharacterData from the active party member's weapon.
	// Claymore hits deal bonus damage to shielded targets; Catalyst normal attacks are
	// elemental (SkillData.Element set to the character's element) instead of physical.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combo")
	EWeaponType WeaponType = EWeaponType::Sword;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combo")
	float ClaymoreShieldBreakBonus = 0.5f;

	// Forward lunge distance applied on each hit (units).
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combo")
	float LungeDistance = 200.f;

	// Elemental status applied per hit (Pyro infusion for this skill).
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combo")
	TSubclassOf<class UGameplayEffect> HitStatusEffectClass;

	// Radius of the per-hit forward damage check.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combo")
	float HitCheckRadius = 150.f;

	// Finds the currently-active UGA_NormalAttack instance on AvatarActor's ASC, if any.
	// Used by the three AnimNotify classes (AN_ComboCheck/AN_AttackHitCheck/AN_AttackEnd)
	// to reach the running ability instance from inside the anim montage.
	static UGA_NormalAttack* GetActiveInstance(AActor* AvatarActor);

	// Called by AN_AttackHitCheck.
	UFUNCTION(BlueprintCallable, Category = "Combo")
	void HandleAttackHitCheckNotify();
	// Called by AN_ComboCheck.
	UFUNCTION(BlueprintCallable, Category = "Combo")
	void HandleComboCheckNotify();
	// Called by AN_AttackEnd. Also bound directly to the montage task's
	// OnCompleted/OnInterrupted/OnCancelled delegates, so must stay a UFUNCTION for AddDynamic.
	UFUNCTION(BlueprintCallable, Category = "Combo")
	void HandleAttackEndNotify();

protected:
	virtual void OnAbilityActivated() override;
	virtual void OnAbilityEnded(bool bWasCancelled) override;

private:
	void PlayComboHit(int32 ComboIndex);

	int32 CurrentComboIndex = 0;
};
