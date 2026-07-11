// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "BehaviorTree/BTDecorator.h"
#include "BTDecorator_LineOfSightToTarget.generated.h"

/** Gates the Combat branch: true only if the AI controller has an unobstructed line-trace to Blackboard.TargetActor. */
UCLASS()
class STICKMANIMPACT_API UBTDecorator_LineOfSightToTarget : public UBTDecorator
{
	GENERATED_BODY()

public:
	UBTDecorator_LineOfSightToTarget();

	virtual bool CalculateRawConditionValue(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory) const override;
};
