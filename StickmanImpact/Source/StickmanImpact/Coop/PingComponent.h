// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "PingComponent.generated.h"

class UNiagaraSystem;
class USoundBase;

UENUM(BlueprintType)
enum class EPingType : uint8
{
	Location,
	Enemy,
	Item,
	Danger
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FOnPingIssued, EPingType, PingType, FVector, WorldLocation, AActor*, PingedActor);

/**
 * Non-verbal communication: aim + ping. PingFromCamera() line-traces from the view —
 * hitting an enemy/pickup classifies the ping automatically (Enemy/Item), anything else
 * is a Location ping; PingDanger() is the explicit "watch out" variant. Spawns a world
 * marker VFX + sound and broadcasts OnPingIssued for the minimap/HUD to draw the icon
 * (both players' UI in co-op; equally useful solo as a self-note).
 *
 * Replicated-play note: under networking the ping must be a server RPC multicast so the
 * other player sees it — Docs/COOP_REPLICATION.md.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UPingComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Ping")
	void PingFromCamera();

	UFUNCTION(BlueprintCallable, Category = "Ping")
	void PingDanger();

	UFUNCTION(BlueprintCallable, Category = "Ping")
	void PingLocation(EPingType PingType, FVector WorldLocation, AActor* PingedActor);

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ping")
	float PingTraceRange = 10000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ping")
	float PingCooldown = 1.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ping")
	TMap<EPingType, TObjectPtr<UNiagaraSystem>> PingVFX;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ping")
	TObjectPtr<USoundBase> PingSound;

	UPROPERTY(BlueprintAssignable, Category = "Ping")
	FOnPingIssued OnPingIssued;

private:
	double LastPingTime = -100.0;
};
