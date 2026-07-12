// Copyright StickmanImpact Project.

#include "WaypointManager.h"
#include "WaypointActor.h"
#include "Kismet/GameplayStatics.h"
#include "NiagaraFunctionLibrary.h"
#include "GameFramework/Character.h"
#include "EngineUtils.h"

void UWaypointManager::UnlockWaypoint(AWaypointActor* Waypoint)
{
	if (!Waypoint || Waypoint->WaypointID.IsEmpty() || UnlockedWaypointIDs.Contains(Waypoint->WaypointID))
	{
		return;
	}
	UnlockedWaypointIDs.Add(Waypoint->WaypointID);
	UnlockedWaypoints.Add(Waypoint);
	OnWaypointUnlocked.Broadcast(Waypoint);
}

TArray<AWaypointActor*> UWaypointManager::GetUnlockedWaypoints() const
{
	TArray<AWaypointActor*> Result;
	Result.Reserve(UnlockedWaypoints.Num());
	for (AWaypointActor* Waypoint : UnlockedWaypoints)
	{
		if (Waypoint)
		{
			Result.Add(Waypoint);
		}
	}
	return Result;
}

void UWaypointManager::RestoreUnlockedFromIDs(const TArray<FString>& IDs, UWorld* World)
{
	UnlockedWaypointIDs = TSet<FString>(IDs);
	UnlockedWaypoints.Reset();
	if (!World)
	{
		return;
	}
	for (TActorIterator<AWaypointActor> It(World); It; ++It)
	{
		if (UnlockedWaypointIDs.Contains(It->WaypointID))
		{
			UnlockedWaypoints.Add(*It);
		}
	}
}

void UWaypointManager::TeleportTo(AWaypointActor* Destination)
{
	if (!Destination || !IsWaypointUnlocked(Destination->WaypointID))
	{
		return;
	}

	APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	if (!PlayerPawn)
	{
		return;
	}

	const float Distance = FVector::Dist(PlayerPawn->GetActorLocation(), Destination->GetActorLocation());
	if (Distance >= LoadingScreenDistanceThreshold)
	{
		// Far enough that a loading screen widget should show first; it should call
		// FinishTeleport() once it's done covering the screen.
		OnTeleportRequested.Broadcast(Destination);
		return;
	}

	FinishTeleport(Destination);
}

void UWaypointManager::FinishTeleport(AWaypointActor* Destination)
{
	APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	if (!PlayerPawn || !Destination)
	{
		return;
	}

	PlayerPawn->SetActorLocation(Destination->GetActorLocation() + FVector(0.f, 0.f, 50.f), false, nullptr,
		ETeleportType::TeleportPhysics);

	if (Destination->TeleportVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAtLocation(Destination, Destination->TeleportVFX, Destination->GetActorLocation());
	}
}
