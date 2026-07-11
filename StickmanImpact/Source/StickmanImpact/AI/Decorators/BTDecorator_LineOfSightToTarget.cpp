// Copyright StickmanImpact Project.

#include "BTDecorator_LineOfSightToTarget.h"
#include "AI/StickmanAITypes.h"
#include "AIController.h"
#include "BehaviorTree/BlackboardComponent.h"

UBTDecorator_LineOfSightToTarget::UBTDecorator_LineOfSightToTarget()
{
	NodeName = TEXT("Line of Sight To Target");
}

bool UBTDecorator_LineOfSightToTarget::CalculateRawConditionValue(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory) const
{
	AAIController* AIController = OwnerComp.GetAIOwner();
	APawn* Pawn = AIController ? AIController->GetPawn() : nullptr;
	UBlackboardComponent* Blackboard = OwnerComp.GetBlackboardComponent();
	if (!AIController || !Pawn || !Blackboard)
	{
		return false;
	}

	AActor* Target = Cast<AActor>(Blackboard->GetValueAsObject(StickmanBlackboardKeys::TargetActor));
	if (!Target)
	{
		return false;
	}

	return AIController->LineOfSightTo(Target, Pawn->GetActorLocation());
}
