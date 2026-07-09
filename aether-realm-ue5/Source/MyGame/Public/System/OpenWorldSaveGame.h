#pragma once

#include "CoreMinimal.h"
#include "GameFramework/SaveGame.h"
#include "System/WishTypes.h"
#include "System/QuestTypes.h"
#include "System/WeaponTypes.h"
#include "System/ExpeditionTypes.h"
#include "UI/InventoryTypes.h"
#include "OpenWorldSaveGame.generated.h"

/** State satu karakter di party. */
USTRUCT(BlueprintType)
struct FCharacterSaveData
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite) FName CharacterId;
	UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Level = 1;
	UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Ascension = 0;
	UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Experience = 0;
	UPROPERTY(EditAnywhere, BlueprintReadWrite) float CurrentHP = -1.f; // -1 = full
	UPROPERTY(EditAnywhere, BlueprintReadWrite) float CurrentEnergy = 0.f;
};

/** Item inventory. */
USTRUCT(BlueprintType)
struct FItemSaveData
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite) FName ItemId;
	UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Count = 1;
};

/** Settings game. */
USTRUCT(BlueprintType)
struct FGameSettings
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite) float MasterVolume = 1.f;
	UPROPERTY(EditAnywhere, BlueprintReadWrite) float MusicVolume = 1.f;
	UPROPERTY(EditAnywhere, BlueprintReadWrite) float SFXVolume = 1.f;
	UPROPERTY(EditAnywhere, BlueprintReadWrite) float MouseSensitivity = 1.f;
	UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 GraphicsQuality = 2; // 0-3
	UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bInvertY = false;
};

/**
 * Bentuk serialisasi save slot (spec 4D FSaveGameData).
 * Diisi/dibaca oleh UOpenWorldGameInstance. Steam Cloud: aktifkan
 * Auto-Cloud di Steamworks untuk folder Saved/SaveGames (lihat PHASE4_SETUP.md).
 */
UCLASS()
class MYGAME_API UOpenWorldSaveGame : public USaveGame
{
	GENERATED_BODY()

public:
	// --- Posisi ---
	UPROPERTY() FVector PlayerPosition = FVector::ZeroVector;
	UPROPERTY() FRotator PlayerRotation = FRotator::ZeroRotator;
	UPROPERTY() FName CurrentRegion;

	// --- Party ---
	UPROPERTY() TArray<FCharacterSaveData> PartyCharacters;
	UPROPERTY() int32 ActiveCharacterIndex = 0;

	// --- Inventory & progression ---
	UPROPERTY() TArray<FItemSaveData> InventoryItems;
	UPROPERTY() TArray<FName> OpenedChests;
	UPROPERTY() TArray<FName> CollectedOculi;
	UPROPERTY() TArray<FName> UnlockedWaypoints;
	UPROPERTY() TArray<FName> CompletedQuests;
	UPROPERTY() TMap<FName, int32> QuestProgress;
	UPROPERTY() TMap<FName, FActiveQuestState> ActiveQuestStates;
	UPROPERTY() FString DailyCommissionDate;
	UPROPERTY() TArray<FName> DailyCommissionQuests;

	// --- Currency & rank ---
	UPROPERTY() int32 Primogems = 0;
	UPROPERTY() int32 Mora = 0;
	UPROPERTY() int32 AdventureRank = 1;
	UPROPERTY() int32 ARExperience = 0;

	// --- Resin & expedition ---
	UPROPERTY() int32 Resin = 160;
	UPROPERTY() FDateTime LastResinUpdate;
	UPROPERTY() TArray<FActiveExpedition> ActiveExpeditions;

	// --- Wish / gacha ---
	UPROPERTY() int32 AcquaintFates = 0;
	UPROPERTY() int32 IntertwinedFates = 0;
	UPROPERTY() int32 Starglitter = 0;
	UPROPERTY() int32 Stardust = 0;
	UPROPERTY() TArray<FName> OwnedWishItems;
	UPROPERTY() TMap<EBannerType, FBannerPityState> WishPityStates;
	UPROPERTY() FString StardustExchangeMonth;
	UPROPERTY() int32 StardustExchangedThisMonth = 0;
	UPROPERTY() TArray<FWishHistoryEntry> WishHistory;

	// --- UI / map ---
	UPROPERTY() TArray<FMapPin> MapPins;
	UPROPERTY() TArray<FArtifactInstance> OwnedArtifacts;

	// --- Progression ---
	UPROPERTY() TArray<FWeaponInstance> OwnedWeapons;
	UPROPERTY() TMap<FName, FTalentLevels> CharacterTalents;
	UPROPERTY() TMap<FName, int32> CharacterConstellations;

	// --- Misc ---
	UPROPERTY() float PlayTimeSeconds = 0.f;
	UPROPERTY() float StaminaCapBonus = 0.f;
	UPROPERTY() FGameSettings GameSettings;
	UPROPERTY() FDateTime Timestamp;
};
