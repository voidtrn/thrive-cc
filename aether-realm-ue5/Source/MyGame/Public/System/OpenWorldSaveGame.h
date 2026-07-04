#pragma once

#include "CoreMinimal.h"
#include "GameFramework/SaveGame.h"
#include "OpenWorldSaveGame.generated.h"

/** Bentuk serialisasi save slot. Diisi/dibaca oleh UOpenWorldGameInstance. */
UCLASS()
class MYGAME_API UOpenWorldSaveGame : public USaveGame
{
	GENERATED_BODY()

public:
	UPROPERTY()
	TArray<FName> PartyCharacterIds;

	UPROPERTY()
	int32 ActiveCharacterIndex = 0;

	UPROPERTY()
	TArray<FName> UnlockedWaypoints;

	UPROPERTY()
	TArray<FName> CollectedItemIds;

	UPROPERTY()
	FTransform LastOpenWorldTransform;
};
