// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "BehaviorTree/BTTaskNode.h"
#include "BTTask_MoveToSafeLocation.generated.h"

/** Retreat: moves the pawn directly away from Blackboard.TargetActor. */
UCLASS()
class STICKMANIMPACT_API UBTTask_MoveToSafeLocation : public UBTTaskNode
{
	GENERATED_BODY()

public:
	UBTTask_MoveToSafeLocation();

	UPROPERTY(EditAnywhere, Category = "Retreat")
	float RetreatDistance = 1000.f;

	virtual EBTNodeResult::Type ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory) override;
};
