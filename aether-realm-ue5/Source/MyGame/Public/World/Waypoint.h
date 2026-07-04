#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Waypoint.generated.h"

class USphereComponent;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnWaypointUnlocked, class AWaypoint*, Waypoint);

/**
 * Teleport waypoint. Unlock otomatis saat player mendekat (500 unit).
 * TeleportHere(): full heal party + auto-save. Loading screen = UI Phase 5.
 * ID unik = nama actor di level (stabil untuk save game).
 */
UCLASS()
class MYGAME_API AWaypoint : public AActor
{
	GENERATED_BODY()

public:
	AWaypoint();

	UFUNCTION(BlueprintPure, Category = "Waypoint")
	bool IsUnlocked() const { return bUnlocked; }

	UFUNCTION(BlueprintPure, Category = "Waypoint")
	FName GetWaypointId() const { return FName(*GetName()); }

	/** Dipanggil dari map UI. Teleport player ke sini + heal + save. */
	UFUNCTION(BlueprintCallable, Category = "Waypoint")
	void TeleportHere(APlayerController* Player);

	UPROPERTY(BlueprintAssignable, Category = "Waypoint")
	FOnWaypointUnlocked OnUnlocked;

	/** Nama tampil di map. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Waypoint")
	FText DisplayName;

protected:
	virtual void BeginPlay() override;

	UPROPERTY(VisibleAnywhere, Category = "Components")
	TObjectPtr<USphereComponent> UnlockRadius;

	UPROPERTY(EditAnywhere, Category = "Waypoint")
	float UnlockDistance = 500.f;

	/** Offset spawn dari root (biar tidak spawn di dalam mesh). */
	UPROPERTY(EditAnywhere, Category = "Waypoint")
	FVector SpawnOffset = FVector(150.f, 0.f, 100.f);

	UFUNCTION()
	void OnUnlockOverlap(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
		UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep,
		const FHitResult& SweepResult);

private:
	bool bUnlocked = false;

	void Unlock();
};
