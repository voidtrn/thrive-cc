// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "WaypointManager.generated.h"

class AWaypointActor;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnWaypointUnlocked, AWaypointActor*, Waypoint);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnTeleportRequested, AWaypointActor*, Destination);

/** Tracks which AWaypointActors have been unlocked and performs the actual teleport. */
UCLASS()
class STICKMANIMPACT_API UWaypointManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Waypoint")
	void UnlockWaypoint(AWaypointActor* Waypoint);

	UFUNCTION(BlueprintPure, Category = "Waypoint")
	bool IsWaypointUnlocked(const FString& WaypointID) const { return UnlockedWaypointIDs.Contains(WaypointID); }

	UFUNCTION(BlueprintPure, Category = "Waypoint")
	TArray<AWaypointActor*> GetUnlockedWaypoints() const;

	// Beyond this range, TeleportTo fires OnTeleportRequested instead of teleporting instantly
	// so a loading-screen widget can show first (bound to it, calling FinishTeleport once ready).
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Waypoint")
	float LoadingScreenDistanceThreshold = 20000.f;

	UFUNCTION(BlueprintCallable, Category = "Waypoint")
	void TeleportTo(AWaypointActor* Destination);

	UFUNCTION(BlueprintCallable, Category = "Waypoint")
	void FinishTeleport(AWaypointActor* Destination);

	UPROPERTY(BlueprintAssignable, Category = "Waypoint")
	FOnWaypointUnlocked OnWaypointUnlocked;

	UPROPERTY(BlueprintAssignable, Category = "Waypoint")
	FOnTeleportRequested OnTeleportRequested;

private:
	UPROPERTY()
	TArray<TObjectPtr<AWaypointActor>> UnlockedWaypoints;

	TSet<FString> UnlockedWaypointIDs;
};
