// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "WorldEventActor.generated.h"

/**
 * Base for dynamic-event actors (BP subclasses own their concrete behavior — spawn a caravan
 * + attackers, rain meteor collectibles, run raid waves, walk an elite patrol, hand out a
 * treasure map, place elemental hazard zones). C++ owns the lifecycle: auto-fail on duration
 * expiry; call CompleteEvent() from the BP when the objective is met (reward granted).
 */
UCLASS()
class STICKMANIMPACT_API AWorldEventActor : public AActor
{
	GENERATED_BODY()

public:
	// Set by UWorldEventManager at spawn.
	float DurationSeconds = 180.f;

	UFUNCTION(BlueprintCallable, Category = "Event")
	void CompleteEvent();

	UFUNCTION(BlueprintCallable, Category = "Event")
	void FailEvent();

	// BP hook: build the event's content here (spawners, NPCs, hazards, collectibles).
	UFUNCTION(BlueprintImplementableEvent, Category = "Event")
	void OnEventBegin();

protected:
	virtual void BeginPlay() override;

private:
	void Finish(bool bCompleted);

	bool bFinished = false;
	FTimerHandle ExpiryTimerHandle;
};
