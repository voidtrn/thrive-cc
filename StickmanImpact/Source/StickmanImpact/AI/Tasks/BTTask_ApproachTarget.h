// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "BehaviorTree/BTTaskNode.h"
#include "BTTask_ApproachTarget.generated.h"

/** Moves toward Blackboard.TargetActor, stopping at the pawn's OptimalCombatDistance instead of walking on top of it. */
UCLASS()
class STICKMANIMPACT_API UBTTask_ApproachTarget : public UBTTaskNode
{
	GENERATED_BODY()

public:
	UBTTask_ApproachTarget();

	virtual EBTNodeResult::Type ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory) override;
};
