// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "BehaviorTree/BTTaskNode.h"
#include "BTTask_FindRandomPatrolPoint.generated.h"

/** Sets Blackboard.TargetLocation to a random navmesh-reachable point within the pawn's PatrolRadius of its PatrolOrigin. */
UCLASS()
class STICKMANIMPACT_API UBTTask_FindRandomPatrolPoint : public UBTTaskNode
{
	GENERATED_BODY()

public:
	UBTTask_FindRandomPatrolPoint();

	virtual EBTNodeResult::Type ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory) override;
};
