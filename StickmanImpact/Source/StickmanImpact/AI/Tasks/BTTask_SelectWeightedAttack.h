// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "BehaviorTree/BTTaskNode.h"
#include "BTTask_SelectWeightedAttack.generated.h"

/**
 * Full attack flow: request an attack token (denied = task fails, Selector falls through to
 * repositioning), run the telegraph tell (personality-scaled duration), then — unless it was
 * a feint — activate the rolled weighted attack. Latent task; the token releases on finish.
 */
UCLASS()
class STICKMANIMPACT_API UBTTask_SelectWeightedAttack : public UBTTaskNode
{
	GENERATED_BODY()

public:
	UBTTask_SelectWeightedAttack();

	virtual EBTNodeResult::Type ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory) override;

private:
	void OnTelegraphFinished(bool bAttackFollows, TWeakObjectPtr<UBehaviorTreeComponent> OwnerComp,
		TWeakObjectPtr<class AStickmanEnemyCharacter> Enemy);
};
