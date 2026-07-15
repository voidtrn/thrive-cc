// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "StickmanInteractable.h"
#include "WaypointActor.generated.h"

class USphereComponent;
class UStaticMeshComponent;
class UNiagaraSystem;

/**
 * Teleport waypoint: unlocks (once) when the player first approaches, then can be fast-
 * traveled to from the map UI (or by interacting with it directly). Unlock plays
 * UnlockVFX/UnlockSound and broadcasts UWaypointManager::OnWaypointUnlocked for a map-marker
 * widget to react to.
 */
UCLASS()
class STICKMANIMPACT_API AWaypointActor : public AActor, public IStickmanInteractable
{
	GENERATED_BODY()

public:
	AWaypointActor();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Waypoint")
	FString WaypointID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Waypoint")
	FText WaypointName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Waypoint")
	float ActivationRadius = 500.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Waypoint")
	TObjectPtr<UNiagaraSystem> UnlockVFX;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Waypoint")
	TObjectPtr<UNiagaraSystem> TeleportVFX;

	virtual void Interact_Implementation(AActor* Instigator) override;
	virtual FText GetInteractionPrompt_Implementation() const override { return WaypointName; }

protected:
	virtual void BeginPlay() override;

	UFUNCTION()
	void OnActivationOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp,
		int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Waypoint", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStaticMeshComponent> WaypointMesh;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Waypoint", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<USphereComponent> ActivationSphere;
};
