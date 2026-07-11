// Copyright StickmanImpact Project.

#include "StickmanAbilitySystemComponent.h"
#include "StickmanGameplayAbility.h"

void UStickmanAbilitySystemComponent::GrantDefaultAbilities(const TArray<TSubclassOf<UGameplayAbility>>& AbilitiesToGrant)
{
	if (GetOwnerRole() != ROLE_Authority)
	{
		// Ability granting is server-authoritative; the effects of granted abilities replicate down.
		return;
	}

	for (const TSubclassOf<UGameplayAbility>& AbilityClass : AbilitiesToGrant)
	{
		if (!AbilityClass)
		{
			continue;
		}
		GiveAbility(FGameplayAbilitySpec(AbilityClass, 1, INDEX_NONE, this));
	}
}

FGameplayAbilitySpecHandle UStickmanAbilitySystemComponent::FindSpecHandleForSkillTag(FGameplayTag SkillTag) const
{
	for (const FGameplayAbilitySpec& Spec : GetActivatableAbilities())
	{
		const UStickmanGameplayAbility* StickmanAbility = Cast<UStickmanGameplayAbility>(Spec.Ability);
		if (StickmanAbility && StickmanAbility->SkillData.SkillTag == SkillTag)
		{
			return Spec.Handle;
		}
	}
	return FGameplayAbilitySpecHandle();
}

bool UStickmanAbilitySystemComponent::ActivateSkillByTag(FGameplayTag SkillTag)
{
	const FGameplayAbilitySpecHandle Handle = FindSpecHandleForSkillTag(SkillTag);
	if (!Handle.IsValid())
	{
		return false;
	}
	return TryActivateAbility(Handle);
}

bool UStickmanAbilitySystemComponent::CanActivateSkill(FGameplayTag SkillTag) const
{
	const FGameplayAbilitySpecHandle Handle = FindSpecHandleForSkillTag(SkillTag);
	if (!Handle.IsValid())
	{
		return false;
	}
	const FGameplayAbilitySpec* Spec = FindAbilitySpecFromHandle(Handle);
	return Spec && Spec->Ability && Spec->Ability->CanActivateAbility(Handle, AbilityActorInfo.Get());
}

bool UStickmanAbilitySystemComponent::ActivateOrQueueComboSkill(FGameplayTag SkillTag)
{
	const FGameplayAbilitySpecHandle Handle = FindSpecHandleForSkillTag(SkillTag);
	if (!Handle.IsValid())
	{
		return false;
	}

	const FGameplayAbilitySpec* Spec = FindAbilitySpecFromHandle(Handle);
	if (Spec && Spec->IsActive())
	{
		QueueComboInput(SkillTag);
		return true;
	}
	return TryActivateAbility(Handle);
}

void UStickmanAbilitySystemComponent::AbilityInputTagPressed(FGameplayTag InputTag)
{
	const FGameplayAbilitySpecHandle Handle = FindSpecHandleForSkillTag(InputTag);
	if (!Handle.IsValid())
	{
		return;
	}

	InputPressedSpecHandles.AddUnique(Handle);

	if (FGameplayAbilitySpec* Spec = FindAbilitySpecFromHandle(Handle))
	{
		AbilitySpecInputPressed(*Spec);
		if (!Spec->IsActive())
		{
			TryActivateAbility(Handle);
		}
	}
}

void UStickmanAbilitySystemComponent::AbilityInputTagReleased(FGameplayTag InputTag)
{
	const FGameplayAbilitySpecHandle Handle = FindSpecHandleForSkillTag(InputTag);
	if (!Handle.IsValid())
	{
		return;
	}

	InputPressedSpecHandles.Remove(Handle);

	if (FGameplayAbilitySpec* Spec = FindAbilitySpecFromHandle(Handle))
	{
		AbilitySpecInputReleased(*Spec);
	}
}

void UStickmanAbilitySystemComponent::QueueComboInput(FGameplayTag ComboTag)
{
	bHasQueuedComboInput = true;
	QueuedComboTag = ComboTag;
}

bool UStickmanAbilitySystemComponent::ConsumeQueuedComboInput(FGameplayTag& OutTag)
{
	if (!bHasQueuedComboInput)
	{
		return false;
	}
	OutTag = QueuedComboTag;
	ClearQueuedComboInput();
	return true;
}

void UStickmanAbilitySystemComponent::ClearQueuedComboInput()
{
	bHasQueuedComboInput = false;
	QueuedComboTag = FGameplayTag();
}
