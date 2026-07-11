// Copyright StickmanImpact Project.

#include "BTDecorator_HealthBelowThreshold.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "AIController.h"

UBTDecorator_HealthBelowThreshold::UBTDecorator_HealthBelowThreshold()
{
	NodeName = TEXT("Health Below Retreat Threshold");
	// Re-evaluated automatically on tick by the BT (flow abort), so a boss dropping into low
	// HP mid-attack interrupts straight into the Retreat branch rather than waiting its turn.
	FlowAbortMode = EBTFlowAbortMode::Both;
}

bool UBTDecorator_HealthBelowThreshold::CalculateRawConditionValue(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory) const
{
	AAIController* AIController = OwnerComp.GetAIOwner();
	AStickmanEnemyCharacter* Enemy = AIController ? Cast<AStickmanEnemyCharacter>(AIController->GetPawn()) : nullptr;
	if (!Enemy)
	{
		return false;
	}

	return Enemy->GetHealthPercent() <= Enemy->RetreatHealthPercent;
}
