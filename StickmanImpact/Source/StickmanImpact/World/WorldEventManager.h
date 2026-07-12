// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Quest/StickmanQuestTypes.h"
#include "WorldEventManager.generated.h"

class AWorldEventActor;

UENUM(BlueprintType)
enum class EWorldEventType : uint8
{
	CaravanUnderAttack,
	MeteorShower,
	EnemyRaid,
	WanderingBoss,
	TreasureHunt,
	ElementalStorm
};

/** One authorable event (DataTable row): what spawns, how long, what it pays. */
USTRUCT(BlueprintType)
struct FWorldEventEntry : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Event")
	EWorldEventType EventType = EWorldEventType::EnemyRaid;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Event")
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Event")
	float Weight = 1.f;

	// The event's own actor (BP subclass of AWorldEventActor) — owns its spawn logic.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Event")
	TSubclassOf<AWorldEventActor> EventActorClass;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Event")
	float DurationSeconds = 180.f;

	// Event-exclusive reward on completion.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Event")
	FRewardData Reward;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnWorldEventStarted, FWorldEventEntry, Entry, FVector, Location);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnWorldEventEnded, FWorldEventEntry, Entry, bool, bCompleted);

/**
 * Random dynamic events: every EventIntervalRange (5-15 min default) rolls a weighted entry
 * from EventTable and spawns its AWorldEventActor near (not on) the player. Notification =
 * OnWorldEventStarted (world message + map icon bind here). Difficulty scaling: the event
 * actor reads UAdaptiveDifficultySubsystem::DifficultyScale itself. One event live at a time.
 */
UCLASS()
class STICKMANIMPACT_API UWorldEventManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Events")
	TObjectPtr<class UDataTable> EventTable;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Events")
	FVector2D EventIntervalRange = FVector2D(300.f, 900.f);

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Events")
	FVector2D SpawnDistanceRange = FVector2D(2000.f, 5000.f);

	UFUNCTION(BlueprintCallable, Category = "Events")
	void TriggerRandomEventNow();

	UFUNCTION(BlueprintPure, Category = "Events")
	bool IsEventActive() const { return ActiveEvent.IsValid(); }

	// Called by the event actor on finish.
	void NotifyEventEnded(bool bCompleted);

	UPROPERTY(BlueprintAssignable, Category = "Events")
	FOnWorldEventStarted OnWorldEventStarted;

	UPROPERTY(BlueprintAssignable, Category = "Events")
	FOnWorldEventEnded OnWorldEventEnded;

private:
	void ScheduleNextEvent();

	TWeakObjectPtr<AWorldEventActor> ActiveEvent;
	FWorldEventEntry ActiveEntry;
	FTimerHandle NextEventTimerHandle;
};
