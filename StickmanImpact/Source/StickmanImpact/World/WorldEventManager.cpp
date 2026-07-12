// Copyright StickmanImpact Project.

#include "WorldEventManager.h"
#include "WorldEventActor.h"
#include "CollectibleManager.h"
#include "Engine/DataTable.h"
#include "Kismet/GameplayStatics.h"
#include "NavigationSystem.h"
#include "TimerManager.h"

void UWorldEventManager::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);
	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimerForNextTick([this]() { ScheduleNextEvent(); });
	}
}

void UWorldEventManager::ScheduleNextEvent()
{
	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimer(NextEventTimerHandle, this, &UWorldEventManager::TriggerRandomEventNow,
			FMath::FRandRange(EventIntervalRange.X, EventIntervalRange.Y), false);
	}
}

void UWorldEventManager::TriggerRandomEventNow()
{
	if (IsEventActive() || !EventTable)
	{
		ScheduleNextEvent();
		return;
	}

	// Weighted roll over the table.
	TArray<FWorldEventEntry> Entries;
	EventTable->ForeachRow<FWorldEventEntry>(TEXT("WorldEvents"),
		[&Entries](const FName&, const FWorldEventEntry& Row) { Entries.Add(Row); });
	float TotalWeight = 0.f;
	for (const FWorldEventEntry& Entry : Entries)
	{
		TotalWeight += FMath::Max(Entry.Weight, 0.f);
	}
	if (TotalWeight <= 0.f)
	{
		ScheduleNextEvent();
		return;
	}
	float Roll = FMath::FRandRange(0.f, TotalWeight);
	FWorldEventEntry Chosen = Entries.Last();
	for (const FWorldEventEntry& Entry : Entries)
	{
		Roll -= FMath::Max(Entry.Weight, 0.f);
		if (Roll <= 0.f)
		{
			Chosen = Entry;
			break;
		}
	}

	// Spawn near-but-not-on the player, navmesh-projected.
	const APawn* Player = UGameplayStatics::GetPlayerPawn(this, 0);
	if (!Player || !Chosen.EventActorClass)
	{
		ScheduleNextEvent();
		return;
	}
	const float Distance = FMath::FRandRange(SpawnDistanceRange.X, SpawnDistanceRange.Y);
	const FVector Direction = FRotator(0.f, FMath::FRandRange(0.f, 360.f), 0.f).Vector();
	FVector SpawnLocation = Player->GetActorLocation() + Direction * Distance;
	if (UNavigationSystemV1* Nav = UNavigationSystemV1::GetCurrent(GetWorld()))
	{
		FNavLocation Projected;
		if (Nav->ProjectPointToNavigation(SpawnLocation, Projected, FVector(2000.f)))
		{
			SpawnLocation = Projected.Location;
		}
	}

	AWorldEventActor* EventActor = GetWorld()->SpawnActorDeferred<AWorldEventActor>(Chosen.EventActorClass,
		FTransform(SpawnLocation));
	if (!EventActor)
	{
		ScheduleNextEvent();
		return;
	}
	EventActor->DurationSeconds = Chosen.DurationSeconds;
	EventActor->FinishSpawning(FTransform(SpawnLocation));

	ActiveEvent = EventActor;
	ActiveEntry = Chosen;
	OnWorldEventStarted.Broadcast(Chosen, SpawnLocation); // World message + map icon bind here.
}

void UWorldEventManager::NotifyEventEnded(bool bCompleted)
{
	if (bCompleted)
	{
		// Event-exclusive reward reuses the collectible manager's grant path.
		if (UCollectibleManager* Collectibles = GetGameInstance()->GetSubsystem<UCollectibleManager>())
		{
			Collectibles->GrantReward(ActiveEntry.Reward);
		}
	}
	OnWorldEventEnded.Broadcast(ActiveEntry, bCompleted);
	ActiveEvent = nullptr;
	ScheduleNextEvent();
}
