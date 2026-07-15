// Copyright StickmanImpact Project.

#include "BTTask_TryDodge.h"
#include "AI/StickmanAITypes.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "AIController.h"
#include "BehaviorTree/BlackboardComponent.h"

UBTTask_TryDodge::UBTTask_TryDodge()
{
	NodeName = TEXT("Try Dodge");
}

EBTNodeResult::Type UBTTask_TryDodge::ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory)
{
	AAIController* AIController = OwnerComp.GetAIOwner();
	AStickmanEnemyCharacter* Enemy = AIController ? Cast<AStickmanEnemyCharacter>(AIController->GetPawn()) : nullptr;
	UBlackboardComponent* Blackboard = OwnerComp.GetBlackboardComponent();
	if (!Enemy || !Blackboard)
	{
		return EBTNodeResult::Failed;
	}

	if (FMath::FRand() > Enemy->DodgeChance)
	{
		return EBTNodeResult::Failed; // No dodge this time — lets the Selector fall through to attacking.
	}

	AActor* Target = Cast<AActor>(Blackboard->GetValueAsObject(StickmanBlackboardKeys::TargetActor));
	FVector DodgeDirection = Target
		? (Enemy->GetActorLocation() - Target->GetActorLocation()).GetSafeNormal()
		: -Enemy->GetActorForwardVector();
	DodgeDirection = FVector::CrossProduct(DodgeDirection, FVector::UpVector).GetSafeNormal(); // sidestep, not backpedal

	Enemy->LaunchCharacter(DodgeDirection * Enemy->DodgeDistance, true, false);
	return EBTNodeResult::Succeeded;
}
