// Copyright StickmanImpact Project.

#include "BTTask_SelectWeightedAttack.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "AI/EnemyTelegraphComponent.h"
#include "AI/AttackTokenSubsystem.h"
#include "AI/AdaptiveDifficultySubsystem.h"
#include "Combat/StickmanAbilitySystemComponent.h"
#include "AIController.h"

UBTTask_SelectWeightedAttack::UBTTask_SelectWeightedAttack()
{
	NodeName = TEXT("Telegraphed Weighted Attack");
	bNotifyTick = false;
}

EBTNodeResult::Type UBTTask_SelectWeightedAttack::ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory)
{
	AAIController* AIController = OwnerComp.GetAIOwner();
	AStickmanEnemyCharacter* Enemy = AIController ? Cast<AStickmanEnemyCharacter>(AIController->GetPawn()) : nullptr;
	if (!Enemy)
	{
		return EBTNodeResult::Failed;
	}

	// Group rotation: no token = don't attack, fall through to circling/repositioning.
	UAttackTokenSubsystem* Tokens = Enemy->GetWorld()->GetSubsystem<UAttackTokenSubsystem>();
	if (Tokens && !Tokens->RequestAttackToken(Enemy))
	{
		return EBTNodeResult::Failed;
	}

	UEnemyTelegraphComponent* Telegraph = Enemy->FindComponentByClass<UEnemyTelegraphComponent>();
	if (!Telegraph)
	{
		// No telegraph component authored — attack immediately (legacy behavior).
		const FGameplayTag Chosen = Enemy->SelectWeightedAttack();
		UStickmanAbilitySystemComponent* ASC = Cast<UStickmanAbilitySystemComponent>(Enemy->GetAbilitySystemComponent());
		if (Tokens)
		{
			Tokens->ReleaseAttackToken(Enemy);
		}
		return (Chosen.IsValid() && ASC && ASC->ActivateSkillByTag(Chosen))
			? EBTNodeResult::Succeeded : EBTNodeResult::Failed;
	}

	// Tell duration: personality-tuned base, shortened by adaptive aggression, sped up by
	// berserker attack speed. Consistent enough per enemy to stay learnable.
	float TellDuration = Enemy->AttackTellDuration / Enemy->GetAttackSpeedMultiplier();
	if (const UAdaptiveDifficultySubsystem* Difficulty =
			Enemy->GetGameInstance()->GetSubsystem<UAdaptiveDifficultySubsystem>())
	{
		TellDuration *= Difficulty->GetAttackCooldownMultiplier();
	}
	TellDuration = FMath::Clamp(TellDuration, 0.5f, 1.5f);

	Telegraph->BeginTelegraph(TellDuration, UEnemyTelegraphComponent::FOnTelegraphFinished::CreateUObject(
		this, &UBTTask_SelectWeightedAttack::OnTelegraphFinished,
		TWeakObjectPtr<UBehaviorTreeComponent>(&OwnerComp), TWeakObjectPtr<AStickmanEnemyCharacter>(Enemy)));

	return EBTNodeResult::InProgress;
}

void UBTTask_SelectWeightedAttack::OnTelegraphFinished(bool bAttackFollows,
	TWeakObjectPtr<UBehaviorTreeComponent> OwnerComp, TWeakObjectPtr<AStickmanEnemyCharacter> Enemy)
{
	AStickmanEnemyCharacter* ResolvedEnemy = Enemy.Get();
	UBehaviorTreeComponent* ResolvedComp = OwnerComp.Get();

	bool bSucceeded = false;
	if (ResolvedEnemy)
	{
		if (bAttackFollows && !ResolvedEnemy->IsStaggered())
		{
			const FGameplayTag Chosen = ResolvedEnemy->SelectWeightedAttack();
			UStickmanAbilitySystemComponent* ASC =
				Cast<UStickmanAbilitySystemComponent>(ResolvedEnemy->GetAbilitySystemComponent());
			bSucceeded = Chosen.IsValid() && ASC && ASC->ActivateSkillByTag(Chosen);
		}
		if (UAttackTokenSubsystem* Tokens = ResolvedEnemy->GetWorld()->GetSubsystem<UAttackTokenSubsystem>())
		{
			Tokens->ReleaseAttackToken(ResolvedEnemy);
		}
	}

	if (ResolvedComp)
	{
		FinishLatentTask(*ResolvedComp, bSucceeded ? EBTNodeResult::Succeeded : EBTNodeResult::Failed);
	}
}
