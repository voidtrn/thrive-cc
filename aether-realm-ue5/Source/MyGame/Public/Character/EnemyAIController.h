#pragma once

#include "CoreMinimal.h"
#include "AIController.h"
#include "EnemyAIController.generated.h"

class UAIPerceptionComponent;
class UBehaviorTree;

/**
 * AI Controller enemy: perception (sight 1500/90°, hearing 500),
 * team aggro (satu aggro → teman radius 800 ikut), run Behavior Tree.
 * BT asset dibuat di editor — layout di Docs/PHASE3_SETUP.md.
 */
UCLASS()
class MYGAME_API AEnemyAIController : public AAIController
{
	GENERATED_BODY()

public:
	AEnemyAIController();

	/** Paksa aggro ke target (dipanggil team aggro / damage taken). */
	UFUNCTION(BlueprintCallable, Category = "AI")
	void SetCombatTarget(AActor* Target);

protected:
	virtual void OnPossess(APawn* InPawn) override;

	UPROPERTY(EditDefaultsOnly, Category = "AI")
	TObjectPtr<UBehaviorTree> BehaviorTreeAsset;

	UPROPERTY(VisibleAnywhere, Category = "AI")
	TObjectPtr<UAIPerceptionComponent> Perception;

	/** Radius alarm teman saat aggro. */
	UPROPERTY(EditDefaultsOnly, Category = "AI")
	float TeamAggroRadius = 800.f;

	UFUNCTION()
	void OnPerceptionUpdated(AActor* Actor, struct FAIStimulus Stimulus);

private:
	bool bHasAggro = false;

	void AlertNearbyAllies(AActor* Target);
};
