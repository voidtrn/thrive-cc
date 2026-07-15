// Copyright StickmanImpact Project.

#include "BTTask_FindRandomPatrolPoint.h"
#include "AI/StickmanAITypes.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "AIController.h"
#include "BehaviorTree/BlackboardComponent.h"
#include "NavigationSystem.h"

UBTTask_FindRandomPatrolPoint::UBTTask_FindRandomPatrolPoint()
{
	NodeName = TEXT("Find Random Patrol Point");
}

EBTNodeResult::Type UBTTask_FindRandomPatrolPoint::ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory)
{
	AAIController* AIController = OwnerComp.GetAIOwner();
	AStickmanEnemyCharacter* Enemy = AIController ? Cast<AStickmanEnemyCharacter>(AIController->GetPawn()) : nullptr;
	UNavigationSystemV1* NavSystem = UNavigationSystemV1::GetCurrent(OwnerComp.GetWorld());
	if (!Enemy || !NavSystem)
	{
		return EBTNodeResult::Failed;
	}

	FNavLocation ResultLocation;
	const bool bFound = NavSystem->GetRandomReachablePointInRadius(Enemy->PatrolOrigin, Enemy->PatrolRadius, ResultLocation);
	if (!bFound)
	{
		return EBTNodeResult::Failed;
	}

	OwnerComp.GetBlackboardComponent()->SetValueAsVector(StickmanBlackboardKeys::TargetLocation, ResultLocation.Location);
	return EBTNodeResult::Succeeded;
}
