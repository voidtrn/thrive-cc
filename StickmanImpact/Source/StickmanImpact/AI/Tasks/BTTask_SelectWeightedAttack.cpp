// Copyright StickmanImpact Project.

#include "BTTask_SelectWeightedAttack.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "Combat/StickmanAbilitySystemComponent.h"
#include "AIController.h"

UBTTask_SelectWeightedAttack::UBTTask_SelectWeightedAttack()
{
	NodeName = TEXT("Select Weighted Attack");
}

EBTNodeResult::Type UBTTask_SelectWeightedAttack::ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory)
{
	AAIController* AIController = OwnerComp.GetAIOwner();
	AStickmanEnemyCharacter* Enemy = AIController ? Cast<AStickmanEnemyCharacter>(AIController->GetPawn()) : nullptr;
	if (!Enemy)
	{
		return EBTNodeResult::Failed;
	}

	const FGameplayTag ChosenAttack = Enemy->SelectWeightedAttack();
	if (!ChosenAttack.IsValid())
	{
		return EBTNodeResult::Failed;
	}

	UStickmanAbilitySystemComponent* ASC = Cast<UStickmanAbilitySystemComponent>(Enemy->GetAbilitySystemComponent());
	if (!ASC || !ASC->ActivateSkillByTag(ChosenAttack))
	{
		return EBTNodeResult::Failed;
	}

	return EBTNodeResult::Succeeded;
}
