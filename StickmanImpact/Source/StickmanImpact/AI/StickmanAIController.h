// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "AIController.h"
#include "StickmanAIController.generated.h"

class UBehaviorTree;
class UAIPerceptionComponent;
class UAISenseConfig_Sight;
class UAISenseConfig_Hearing;

/**
 * Runs BT_StickmanEnemy (or whichever BehaviorTree is assigned) and keeps the Blackboard's
 * TargetActor/AlertLevel in sync with AI Perception sight/hearing stimuli. One controller
 * class serves all 5 enemy archetypes — see AStickmanEnemyCharacter for the per-pawn tuning
 * the shared BT tasks read from.
 */
UCLASS()
class STICKMANIMPACT_API AStickmanAIController : public AAIController
{
	GENERATED_BODY()

public:
	AStickmanAIController();

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "AI")
	TObjectPtr<UBehaviorTree> BehaviorTree;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "AI")
	float SightRadius = 1500.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "AI")
	float LoseSightRadius = 2000.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "AI")
	float SightAngleDegrees = 60.f;

protected:
	virtual void OnPossess(APawn* InPawn) override;

	UFUNCTION()
	void HandlePerceptionUpdated(AActor* Actor, struct FAIStimulus Stimulus);

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "AI", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UAIPerceptionComponent> PerceptionComponent;

	UPROPERTY()
	TObjectPtr<UAISenseConfig_Sight> SightConfig;

	bool bHasNotifiedCombatEntry = false;
};
