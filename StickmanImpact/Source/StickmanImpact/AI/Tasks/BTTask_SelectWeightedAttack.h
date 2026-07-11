// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "BehaviorTree/BTTaskNode.h"
#include "BTTask_SelectWeightedAttack.generated.h"

/** Rolls AStickmanEnemyCharacter::SelectWeightedAttack() and activates that ability by SkillTag on the pawn's ASC. */
UCLASS()
class STICKMANIMPACT_API UBTTask_SelectWeightedAttack : public UBTTaskNode
{
	GENERATED_BODY()

public:
	UBTTask_SelectWeightedAttack();

	virtual EBTNodeResult::Type ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory) override;
};
