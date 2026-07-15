// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "BehaviorTree/BTDecorator.h"
#include "BTDecorator_HealthBelowThreshold.generated.h"

/** Gates the Retreat branch: true once the pawn's health percent drops at/below its own RetreatHealthPercent. */
UCLASS()
class STICKMANIMPACT_API UBTDecorator_HealthBelowThreshold : public UBTDecorator
{
	GENERATED_BODY()

public:
	UBTDecorator_HealthBelowThreshold();

	virtual bool CalculateRawConditionValue(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory) const override;
};
