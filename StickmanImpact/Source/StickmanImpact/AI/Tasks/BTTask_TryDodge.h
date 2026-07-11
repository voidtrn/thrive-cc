// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "BehaviorTree/BTTaskNode.h"
#include "BTTask_TryDodge.generated.h"

/**
 * Simplified "reaction system": rolls the pawn's DodgeChance and, on success, sidesteps
 * DodgeDistance units away from TargetActor. No incoming-attack telegraph system exists yet
 * to trigger this deterministically off a real attack windup — it's called periodically from
 * the Combat branch instead (see BT_StickmanEnemy setup in the README).
 */
UCLASS()
class STICKMANIMPACT_API UBTTask_TryDodge : public UBTTaskNode
{
	GENERATED_BODY()

public:
	UBTTask_TryDodge();

	virtual EBTNodeResult::Type ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory) override;
};
