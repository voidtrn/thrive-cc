// Copyright StickmanImpact Project.

#include "GA_NormalAttack.h"
#include "Combat/StickmanAbilitySystemComponent.h"
#include "Combat/CombatFeedbackSubsystem.h"
#include "Character/StickmanCharacter.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "Abilities/Tasks/AbilityTask_PlayMontageAndWait.h"
#include "AbilitySystemComponent.h"
#include "AbilitySystemInterface.h"

UGA_NormalAttack::UGA_NormalAttack()
{
	SkillData.SkillType = EStickmanSkillType::NormalAttack;
	SkillData.Element = EStickmanElement::Pyro; // "Pyro Slash" combo infuses every hit.
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
	ActiveBranch = EComboBranch::Neutral;
	PlayComboHit(CurrentComboIndex);
}

const FNormalAttackChain& UGA_NormalAttack::GetActiveChain() const
{
	// Empty branch chains fall through to neutral so unauthored branches never dead-end.
	switch (ActiveBranch)
	{
		case EComboBranch::Forward:
			return ForwardBranchCombo.AttackMontages.Num() > 0 ? ForwardBranchCombo : NormalAttackCombo;
		case EComboBranch::Launcher:
			return LauncherBranchCombo.AttackMontages.Num() > 0 ? LauncherBranchCombo : NormalAttackCombo;
		case EComboBranch::Sweep:
			return SweepBranchCombo.AttackMontages.Num() > 0 ? SweepBranchCombo : NormalAttackCombo;
		default:
			return NormalAttackCombo;
	}
}

void UGA_NormalAttack::SelectBranchFromInput()
{
	const AStickmanCharacter* Character = Cast<AStickmanCharacter>(GetAvatarActorFromActorInfo());
	if (!Character)
	{
		return;
	}
	const FVector2D Input = Character->GetLastMoveInput();
	if (Input.IsNearlyZero(0.3f))
	{
		ActiveBranch = EComboBranch::Neutral;
	}
	else if (FMath::Abs(Input.X) > FMath::Abs(Input.Y))
	{
		ActiveBranch = EComboBranch::Sweep;      // Side + attack.
	}
	else if (Input.Y > 0.f)
	{
		ActiveBranch = EComboBranch::Forward;    // Forward + attack: gap closer.
	}
	else
	{
		ActiveBranch = EComboBranch::Launcher;   // Back + attack: knock-up.
	}
}

void UGA_NormalAttack::PlayComboHit(int32 ComboIndex)
{
	const FNormalAttackChain& Chain = GetActiveChain();
	if (!Chain.AttackMontages.IsValidIndex(ComboIndex))
	{
		HandleAttackEndNotify();
		return;
	}

	// Lunge forward slightly on each hit for weight/reach; the forward branch lunges double.
	if (AActor* Avatar = GetAvatarActorFromActorInfo())
	{
		const float Lunge = LungeDistance * (ActiveBranch == EComboBranch::Forward ? 2.f : 1.f);
		const FVector LungeTarget = Avatar->GetActorLocation() + Avatar->GetActorForwardVector() * Lunge;
		Avatar->SetActorLocation(LungeTarget, true);
	}

	// Branch-point glow at hits 2 and 3 (indices 1/2).
	OnBranchWindow.Broadcast(ComboIndex == 1 || ComboIndex == 2);

	if (UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr)
	{
		if (UCombatFeedbackSubsystem* CombatFeedback = GameInstance->GetSubsystem<UCombatFeedbackSubsystem>())
		{
			CombatFeedback->NotifyComboCountChanged(ComboIndex + 1);
		}
	}

	if (UAbilityTask_PlayMontageAndWait* Task = PlayAbilityMontage(Chain.AttackMontages[ComboIndex]))
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
	const FNormalAttackChain& Chain = GetActiveChain();
	float DamageMultiplier = Chain.DamageMultipliers.IsValidIndex(CurrentComboIndex)
		? Chain.DamageMultipliers[CurrentComboIndex]
		: 1.f;

	// Claymore flavor: hits harder than the other weapon types. (Bonus vs an actual "shielded"
	// status is a hook for once a generic shield/absorb system exists — see
	// AStickmanElementalShard's TODO — applied flat here in the meantime.)
	if (WeaponType == EWeaponType::Claymore)
	{
		DamageMultiplier *= 1.f + ClaymoreShieldBreakBonus;
	}

	AActor* Avatar = GetAvatarActorFromActorInfo();
	if (!Avatar)
	{
		return;
	}

	// Sweep branch = wider horizontal arc; everything else a forward hemisphere.
	const float HitArcHalfAngle = ActiveBranch == EComboBranch::Sweep ? 160.f : 90.f;
	TArray<AActor*> HitActors;
	ApplyRadialElementalDamage(Avatar->GetActorLocation() + Avatar->GetActorForwardVector() * (HitCheckRadius * 0.5f),
		Avatar->GetActorForwardVector(), HitCheckRadius, HitArcHalfAngle, DamageMultiplier, HitStatusEffectClass,
		HitActors);

	// Launcher branch: knock hit enemies airborne (feeds the juggle system).
	if (ActiveBranch == EComboBranch::Launcher)
	{
		for (AActor* HitActor : HitActors)
		{
			if (AStickmanEnemyCharacter* Enemy = Cast<AStickmanEnemyCharacter>(HitActor))
			{
				Enemy->LaunchIntoAir(LauncherKnockupVelocity);
			}
		}
	}
}

void UGA_NormalAttack::HandleComboCheckNotify()
{
	UStickmanAbilitySystemComponent* ASC = Cast<UStickmanAbilitySystemComponent>(GetAbilitySystemComponentFromActorInfo());
	if (!ASC)
	{
		return;
	}

	FGameplayTag QueuedTag;
	const bool bHasNextHit = GetActiveChain().AttackMontages.IsValidIndex(CurrentComboIndex + 1);
	if (bHasNextHit && ASC->ConsumeQueuedComboInput(QueuedTag) && QueuedTag == SkillData.SkillTag)
	{
		++CurrentComboIndex;
		// Branch points: hits 2 and 3 re-read directional input to pick the string.
		if (CurrentComboIndex == 1 || CurrentComboIndex == 2)
		{
			SelectBranchFromInput();
		}
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
	if (UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr)
	{
		if (UCombatFeedbackSubsystem* CombatFeedback = GameInstance->GetSubsystem<UCombatFeedbackSubsystem>())
		{
			CombatFeedback->NotifyComboCountChanged(0);
		}
	}
	EndAbility(CurrentSpecHandle, CurrentActorInfo, CurrentActivationInfo, true, false);
}

void UGA_NormalAttack::OnAbilityEnded(bool bWasCancelled)
{
	CurrentComboIndex = 0;
	ActiveBranch = EComboBranch::Neutral;
	OnBranchWindow.Broadcast(false);
}
