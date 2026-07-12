// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/SaveGame.h"
#include "GameplayTagContainer.h"
#include "Party/StickmanPartyTypes.h"
#include "Data/InventoryManager.h"
#include "Quest/StickmanQuestTypes.h"
#include "StickmanSaveGame.generated.h"

/** One active quest's runtime progress, flattened for serialization. */
USTRUCT()
struct FQuestSaveState
{
	GENERATED_BODY()

	UPROPERTY()
	FString QuestID;

	// Asset path so load can resolve the UQuestDataAsset back (SoftObjectPath survives saves).
	UPROPERTY()
	FSoftObjectPath QuestAssetPath;

	UPROPERTY()
	int32 CurrentStageIndex = 0;

	// Objective progress for the current stage only (earlier stages are done by definition).
	UPROPERTY()
	TArray<int32> CurrentStageObjectiveCounts;
};

/** Slot metadata shown on the save/load slot UI without loading the whole save. */
USTRUCT(BlueprintType)
struct FSaveSlotMetadata
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "Save")
	bool bOccupied = false;

	UPROPERTY(BlueprintReadOnly, Category = "Save")
	float TotalPlaytimeSeconds = 0.f;

	UPROPERTY(BlueprintReadOnly, Category = "Save")
	int32 ActiveCharacterLevel = 1;

	UPROPERTY(BlueprintReadOnly, Category = "Save")
	FString LocationName;

	UPROPERTY(BlueprintReadOnly, Category = "Save")
	FDateTime Timestamp;
};

/**
 * Everything one save slot persists. Settings (graphics/audio/controls) are deliberately NOT
 * in here — they already persist globally via GameUserSettings.ini (see USettingsScreenWidget)
 * and per-slot settings would be wrong anyway. Minimap fog-of-war: the reveal render target
 * can't be cheaply serialized; VisitedFogPoints stores periodically-sampled player positions
 * the minimap re-stamps into the reveal RT on load (approximation, honest limitation).
 */
UCLASS()
class STICKMANIMPACT_API UStickmanSaveGame : public USaveGame
{
	GENERATED_BODY()

public:
	// Bump when the layout changes; USaveManager rejects/migrates mismatches.
	UPROPERTY()
	int32 SaveVersion = 1;

	UPROPERTY()
	FSaveSlotMetadata Metadata;

	// --- Player transform -------------------------------------------------
	UPROPERTY()
	FVector PlayerLocation = FVector::ZeroVector;

	UPROPERTY()
	FRotator PlayerRotation = FRotator::ZeroRotator;

	// --- Party (covers character level/stats/equipment IDs per member) -----
	UPROPERTY()
	TArray<FPartyMemberState> PartyMembers;

	UPROPERTY()
	int32 ActivePartyIndex = 0;

	// --- Inventory -----------------------------------------------------------
	UPROPERTY()
	TArray<FInventoryItem> InventoryItems;

	// --- Quests ----------------------------------------------------------------
	UPROPERTY()
	TArray<FQuestSaveState> ActiveQuests;

	UPROPERTY()
	TArray<FString> CompletedQuestIDs;

	UPROPERTY()
	FString TrackedQuestID;

	// --- Story / world ------------------------------------------------------------
	UPROPERTY()
	TArray<FGameplayTag> StoryFlags;

	UPROPERTY()
	TArray<FString> PlayedDialogueIDs;

	UPROPERTY()
	TArray<FString> WatchedCutsceneIDs;

	UPROPERTY()
	TArray<FString> UnlockedWaypointIDs;

	UPROPERTY()
	TArray<FString> CollectedItemIDs;

	UPROPERTY()
	TArray<FVector2D> VisitedFogPoints;

	UPROPERTY()
	float WorldTimeHour = 8.f;
};
