// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "AbilitySystemComponent.h"
#include "GameplayTagContainer.h"
#include "StickmanAbilitySystemComponent.generated.h"

/**
 * Project-specific ASC. Adds tag-addressed skill activation (so "press E" can just say
 * "activate whatever ability owns Skill.Element.Pyro" instead of hunting for a spec handle),
 * input press/release forwarding, and a tiny combo-input queue used by the normal-attack chain.
 */
UCLASS()
class STICKMANIMPACT_API UStickmanAbilitySystemComponent : public UAbilitySystemComponent
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Abilities")
	void GrantDefaultAbilities(const TArray<TSubclassOf<UGameplayAbility>>& AbilitiesToGrant);

	// Finds the granted ability whose FSkillData::SkillTag matches SkillTag and activates it.
	UFUNCTION(BlueprintCallable, Category = "Abilities")
	bool ActivateSkillByTag(FGameplayTag SkillTag);

	UFUNCTION(BlueprintPure, Category = "Abilities")
	bool CanActivateSkill(FGameplayTag SkillTag) const;

	// For UI polling (cooldown radial fill, etc.) — the granted ability instance whose
	// FSkillData::SkillTag matches, or null if nothing's granted for that tag.
	UFUNCTION(BlueprintPure, Category = "Abilities")
	class UStickmanGameplayAbility* FindGrantedAbilityForSkillTag(FGameplayTag SkillTag) const;

	// For combo-style skills (normal attack): activates the ability if it's not running yet,
	// or queues the input as the next combo hit if it's already mid-chain.
	UFUNCTION(BlueprintCallable, Category = "Abilities")
	bool ActivateOrQueueComboSkill(FGameplayTag SkillTag);

	// Enhanced Input glue: call from Started/Completed bindings with the same tag used in
	// FSkillData::SkillTag for that action.
	void AbilityInputTagPressed(FGameplayTag InputTag);
	void AbilityInputTagReleased(FGameplayTag InputTag);

	// --- Combo queue -----------------------------------------------------
	// AnimNotify_ComboCheck calls QueueComboInput() when the player pressed attack again
	// inside the combo window; GA_NormalAttack polls ConsumeQueuedComboInput() at the end of
	// each hit to decide whether to chain into the next one or return to idle.
	UFUNCTION(BlueprintCallable, Category = "Combat|Combo")
	void QueueComboInput(FGameplayTag ComboTag);

	UFUNCTION(BlueprintCallable, Category = "Combat|Combo")
	bool ConsumeQueuedComboInput(FGameplayTag& OutTag);

	UFUNCTION(BlueprintCallable, Category = "Combat|Combo")
	void ClearQueuedComboInput();

private:
	FGameplayAbilitySpecHandle FindSpecHandleForSkillTag(FGameplayTag SkillTag) const;

	UPROPERTY()
	TArray<FGameplayAbilitySpecHandle> InputPressedSpecHandles;

	bool bHasQueuedComboInput = false;
	FGameplayTag QueuedComboTag;
};
