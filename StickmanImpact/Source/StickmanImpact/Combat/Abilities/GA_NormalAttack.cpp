// Copyright StickmanImpact Project.

#include "GA_NormalAttack.h"
#include "Combat/StickmanAbilitySystemComponent.h"
#include "Abilities/Tasks/AbilityTask_PlayMontageAndWait.h"
#include "AbilitySystemComponent.h"
#include "AbilitySystemInterface.h"

UGA_NormalAttack::UGA_NormalAttack()
{
	SkillData.SkillType = EStickmanSkillType::NormalAttack;
	SkillData.Cooldown = 0.f;
	SkillData.EnergyCost = 0.f;
}

UGA_NormalAttack* UGA_NormalAttack::GetActiveInstance(AActor* AvatarActor)
{
	if (!AvatarActor)
	{
		return nullptr;
	}
	const IAbilitySystemInterface* ASI = Cast<IAbilitySystemInterface>(AvatarActor);
	UAbilitySystemComponent* ASC = ASI ? ASI->GetAbilitySystemComponent() : nullptr;
	if (!ASC)
	{
		return nullptr;
	}

	for (const FGameplayAbilitySpec& Spec : ASC->GetActivatableAbilities())
	{
		if (!Spec.IsActive())
		{
			continue;
		}
		if (UGA_NormalAttack* Instance = Cast<UGA_NormalAttack>(Spec.GetPrimaryInstance()))
		{
			return Instance;
		}
	}
	return nullptr;
}

void UGA_NormalAttack::OnAbilityActivated()
{
	CurrentComboIndex = 0;
	PlayComboHit(CurrentComboIndex);
}

void UGA_NormalAttack::PlayComboHit(int32 ComboIndex)
{
	if (!NormalAttackCombo.AttackMontages.IsValidIndex(ComboIndex))
	{
		HandleAttackEndNotify();
		return;
	}

	// Lunge forward slightly on each hit for weight/reach, exactly like a Genshin combo swing.
	if (AActor* Avatar = GetAvatarActorFromActorInfo())
	{
		const FVector LungeTarget = Avatar->GetActorLocation() + Avatar->GetActorForwardVector() * LungeDistance;
		Avatar->SetActorLocation(LungeTarget, true);
	}

	if (UAbilityTask_PlayMontageAndWait* Task = PlayAbilityMontage(NormalAttackCombo.AttackMontages[ComboIndex]))
	{
		Task->OnCompleted.AddDynamic(this, &UGA_NormalAttack::HandleAttackEndNotify);
		Task->OnInterrupted.AddDynamic(this, &UGA_NormalAttack::HandleAttackEndNotify);
		Task->OnCancelled.AddDynamic(this, &UGA_NormalAttack::HandleAttackEndNotify);
	}
	else
	{
		// No montage authored yet — still resolve the hit so gameplay is testable pre-art.
		HandleAttackHitCheckNotify();
	}
}

void UGA_NormalAttack::HandleAttackHitCheckNotify()
{
	const float DamageMultiplier = NormalAttackCombo.DamageMultipliers.IsValidIndex(CurrentComboIndex)
		? NormalAttackCombo.DamageMultipliers[CurrentComboIndex]
		: 1.f;

	AActor* Avatar = GetAvatarActorFromActorInfo();
	if (!Avatar)
	{
		return;
	}

	TArray<AActor*> HitActors;
	// Normal attacks are a forward hemisphere in front of the character, not a full sphere.
	ApplyRadialElementalDamage(Avatar->GetActorLocation() + Avatar->GetActorForwardVector() * (HitCheckRadius * 0.5f),
		Avatar->GetActorForwardVector(), HitCheckRadius, 90.f, DamageMultiplier, HitStatusEffectClass, HitActors);
}

void UGA_NormalAttack::HandleComboCheckNotify()
{
	UStickmanAbilitySystemComponent* ASC = Cast<UStickmanAbilitySystemComponent>(GetAbilitySystemComponentFromActorInfo());
	if (!ASC)
	{
		return;
	}

	FGameplayTag QueuedTag;
	const bool bHasNextHit = NormalAttackCombo.AttackMontages.IsValidIndex(CurrentComboIndex + 1);
	if (bHasNextHit && ASC->ConsumeQueuedComboInput(QueuedTag) && QueuedTag == SkillData.SkillTag)
	{
		++CurrentComboIndex;
		PlayComboHit(CurrentComboIndex);
	}
	// Otherwise: no buffered input, or no more hits in the chain — let the montage play out
	// to its AN_AttackEnd notify, which closes the ability normally.
}

void UGA_NormalAttack::HandleAttackEndNotify()
{
	CurrentComboIndex = 0;
	if (UStickmanAbilitySystemComponent* ASC = Cast<UStickmanAbilitySystemComponent>(GetAbilitySystemComponentFromActorInfo()))
	{
		ASC->ClearQueuedComboInput();
	}
	EndAbility(CurrentSpecHandle, CurrentActorInfo, CurrentActivationInfo, true, false);
}

void UGA_NormalAttack::OnAbilityEnded(bool bWasCancelled)
{
	CurrentComboIndex = 0;
}
