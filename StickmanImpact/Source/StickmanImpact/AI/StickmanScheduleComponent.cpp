// Copyright StickmanImpact Project.

#include "StickmanScheduleComponent.h"
#include "AIController.h"
#include "Navigation/PathFollowingComponent.h"
#include "GameFramework/Pawn.h"
#include "World/DayNightManager.h"
#include "Kismet/GameplayStatics.h"

UStickmanScheduleComponent::UStickmanScheduleComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
	PrimaryComponentTick.TickInterval = 5.f; // Schedules don't need to be checked every frame.
}

float UStickmanScheduleComponent::GetCurrentHour_Implementation() const
{
	if (DebugOverrideHour >= 0.f)
	{
		return FMath::Fmod(DebugOverrideHour, 24.f);
	}

	if (const ADayNightManager* DayNight = Cast<ADayNightManager>(
			UGameplayStatics::GetActorOfClass(this, ADayNightManager::StaticClass())))
	{
		return DayNight->GetCurrentHour();
	}

	// Fallback clock if no ADayNightManager is placed in the level: a 24-real-minute day.
	const UWorld* World = GetWorld();
	const float DayLengthSeconds = 24.f * 60.f;
	const float SecondsIntoDay = World ? FMath::Fmod(World->GetTimeSeconds(), DayLengthSeconds) : 0.f;
	return (SecondsIntoDay / DayLengthSeconds) * 24.f;
}

void UStickmanScheduleComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	const float CurrentHour = GetCurrentHour();

	const FNPCScheduleEntry* MatchingEntry = DailySchedule.FindByPredicate(
		[CurrentHour](const FNPCScheduleEntry& Entry) { return Entry.ContainsHour(CurrentHour); });
	if (!MatchingEntry)
	{
		return;
	}

	if (MatchingEntry->Routine != CurrentRoutine)
	{
		CurrentRoutine = MatchingEntry->Routine;
		OnRoutineChanged.Broadcast(CurrentRoutine);
	}

	if (!MatchingEntry->DestinationLocation.Equals(CurrentDestination, 10.f))
	{
		CurrentDestination = MatchingEntry->DestinationLocation;

		APawn* OwnerPawn = Cast<APawn>(GetOwner());
		if (AAIController* AIController = OwnerPawn ? Cast<AAIController>(OwnerPawn->GetController()) : nullptr)
		{
			AIController->MoveToLocation(CurrentDestination);
		}
	}
}
