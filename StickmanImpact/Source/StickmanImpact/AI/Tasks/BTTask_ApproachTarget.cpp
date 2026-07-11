// Copyright StickmanImpact Project.

#include "BTTask_ApproachTarget.h"
#include "AI/StickmanAITypes.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "AIController.h"
#include "BehaviorTree/BlackboardComponent.h"

UBTTask_ApproachTarget::UBTTask_ApproachTarget()
{
	NodeName = TEXT("Approach Target (Optimal Distance)");
}

EBTNodeResult::Type UBTTask_ApproachTarget::ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory)
{
	AAIController* AIController = OwnerComp.GetAIOwner();
	AStickmanEnemyCharacter* Enemy = AIController ? Cast<AStickmanEnemyCharacter>(AIController->GetPawn()) : nullptr;
	UBlackboardComponent* Blackboard = OwnerComp.GetBlackboardComponent();
	if (!Enemy || !Blackboard)
	{
		return EBTNodeResult::Failed;
	}

	AActor* Target = Cast<AActor>(Blackboard->GetValueAsObject(StickmanBlackboardKeys::TargetActor));
	if (!Target)
	{
		return EBTNodeResult::Failed;
	}

	AIController->MoveToActor(Target, FMath::Max(Enemy->OptimalCombatDistance, 50.f));
	return EBTNodeResult::Succeeded;
}
