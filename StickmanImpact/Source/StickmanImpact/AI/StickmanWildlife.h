// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "StickmanWildlife.generated.h"

/**
 * Ambient passive animal (birds, rabbits, deer, ...). No Behavior Tree/AIController — a full
 * combat AI stack is overkill for "flees when the player gets close", so this is a plain Tick
 * state machine (Grazing -> Fleeing) driven straight off distance-to-player.
 */
UCLASS()
class STICKMANIMPACT_API AStickmanWildlife : public ACharacter
{
	GENERATED_BODY()

public:
	AStickmanWildlife();

	virtual void Tick(float DeltaSeconds) override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Wildlife")
	float FleeTriggerDistance = 800.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Wildlife")
	float FleeSpeed = 600.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Wildlife")
	float GrazeSpeed = 100.f;

	// Members sharing a HerdTag flee together — one animal spotting the player alerts the rest.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Wildlife")
	FName HerdTag = NAME_None;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Wildlife")
	float HerdAlertRadius = 1000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Wildlife")
	TSubclassOf<AActor> ResourceDropClass;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Wildlife")
	TObjectPtr<UAnimMontage> GrazeMontage;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Wildlife")
	float GrazeIntervalSeconds = 6.f;

	// "Defeat" for wildlife just means it drops its resource and despawns — no health pool.
	UFUNCTION(BlueprintCallable, Category = "Wildlife")
	void OnDefeated();

	UFUNCTION(BlueprintCallable, Category = "Wildlife")
	void AlertHerd();

private:
	void UpdateFleeState(float DeltaSeconds);
	void TryPlayGraze(float DeltaSeconds);

	bool bIsFleeing = false;
	float TimeSinceLastGraze = 0.f;
};
