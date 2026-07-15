// Copyright StickmanImpact Project.

#include "BTTask_MoveToSafeLocation.h"
#include "AI/StickmanAITypes.h"
#include "AIController.h"
#include "BehaviorTree/BlackboardComponent.h"
#include "NavigationSystem.h"

UBTTask_MoveToSafeLocation::UBTTask_MoveToSafeLocation()
{
	NodeName = TEXT("Move To Safe Location (Retreat)");
}

EBTNodeResult::Type UBTTask_MoveToSafeLocation::ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory)
{
	AAIController* AIController = OwnerComp.GetAIOwner();
	APawn* Pawn = AIController ? AIController->GetPawn() : nullptr;
	UBlackboardComponent* Blackboard = OwnerComp.GetBlackboardComponent();
	if (!Pawn || !Blackboard)
	{
		return EBTNodeResult::Failed;
	}

	AActor* Target = Cast<AActor>(Blackboard->GetValueAsObject(StickmanBlackboardKeys::TargetActor));
	const FVector AwayDirection = Target
		? (Pawn->GetActorLocation() - Target->GetActorLocation()).GetSafeNormal()
		: -Pawn->GetActorForwardVector();

	FVector DesiredLocation = Pawn->GetActorLocation() + AwayDirection * RetreatDistance;

	if (UNavigationSystemV1* NavSystem = UNavigationSystemV1::GetCurrent(OwnerComp.GetWorld()))
	{
		FNavLocation ProjectedLocation;
		if (NavSystem->ProjectPointToNavigation(DesiredLocation, ProjectedLocation))
		{
			DesiredLocation = ProjectedLocation.Location;
		}
	}

	AIController->MoveToLocation(DesiredLocation);
	return EBTNodeResult::Succeeded;
}
