#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "OpenWorldGameMode.generated.h"

/**
 * GameMode utama open world. Hanya ada di server (single-player = listen server
 * implisit), jadi logic spawn/respawn/party validation taruh di sini agar
 * arsitektur langsung siap co-op.
 */
UCLASS()
class MYGAME_API AOpenWorldGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	AOpenWorldGameMode();

	virtual void BeginPlay() override;
	virtual void PostLogin(APlayerController* NewPlayer) override;

	/** Respawn player di checkpoint/teleport waypoint terakhir. */
	UFUNCTION(BlueprintCallable, Category = "OpenWorld")
	void RespawnPlayer(APlayerController* Controller);

protected:
	/** Jumlah maksimal pemain untuk co-op nanti. Single-player = 1. */
	UPROPERTY(EditDefaultsOnly, Category = "OpenWorld|Multiplayer", meta = (ClampMin = 1, ClampMax = 4))
	int32 MaxPlayers = 1;
};
