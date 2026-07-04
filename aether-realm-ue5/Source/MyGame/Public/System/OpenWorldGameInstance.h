#pragma once

#include "CoreMinimal.h"
#include "Engine/GameInstance.h"
#include "System/OpenWorldSaveGame.h"
#include "OpenWorldGameInstance.generated.h"

/**
 * Data persistent antar level & antar session (via SaveGame).
 * Hidup sepanjang proses game — dipakai saat pindah open world <-> dungeon
 * (Level Instance) tanpa kehilangan state party/progress.
 */
UCLASS()
class MYGAME_API UOpenWorldGameInstance : public UGameInstance
{
	GENERATED_BODY()

public:
	virtual void Init() override;

	// --- Party persistent (dibaca PlayerState saat spawn) ---
	UPROPERTY(BlueprintReadWrite, Category = "Persistent|Party")
	TArray<FName> SavedPartyCharacterIds;

	UPROPERTY(BlueprintReadWrite, Category = "Persistent|Party")
	int32 SavedActiveCharacterIndex = 0;

	UPROPERTY(BlueprintReadWrite, Category = "Persistent|Party")
	TArray<FCharacterSaveData> PartyCharacterData;

	// --- Progress dunia ---
	UPROPERTY(BlueprintReadWrite, Category = "Persistent|World")
	TSet<FName> UnlockedWaypoints;

	UPROPERTY(BlueprintReadWrite, Category = "Persistent|World")
	TSet<FName> CollectedItemIds;

	UPROPERTY(BlueprintReadWrite, Category = "Persistent|World")
	TSet<FName> OpenedChests;

	UPROPERTY(BlueprintReadWrite, Category = "Persistent|World")
	TSet<FName> CollectedOculi;

	UPROPERTY(BlueprintReadWrite, Category = "Persistent|World")
	FTransform LastOpenWorldTransform = FTransform::Identity;

	UPROPERTY(BlueprintReadWrite, Category = "Persistent|World")
	FName CurrentRegion = TEXT("Starter");

	// --- Quest ---
	UPROPERTY(BlueprintReadWrite, Category = "Persistent|Quest")
	TSet<FName> CompletedQuests;

	UPROPERTY(BlueprintReadWrite, Category = "Persistent|Quest")
	TMap<FName, int32> QuestProgress;

	// --- Inventory & currency ---
	UPROPERTY(BlueprintReadWrite, Category = "Persistent|Inventory")
	TMap<FName, int32> InventoryItems;

	UPROPERTY(BlueprintReadWrite, Category = "Persistent|Currency")
	int32 Primogems = 0;

	UPROPERTY(BlueprintReadWrite, Category = "Persistent|Currency")
	int32 Mora = 0;

	UPROPERTY(BlueprintReadWrite, Category = "Persistent|Rank")
	int32 AdventureRank = 1;

	UPROPERTY(BlueprintReadWrite, Category = "Persistent|Rank")
	int32 ARExperience = 0;

	// --- Upgrades ---
	/** Bonus stamina dari Statue of The Seven (+10 per upgrade, cap total 240). */
	UPROPERTY(BlueprintReadWrite, Category = "Persistent|Upgrades")
	float StaminaCapBonus = 0.f;

	// --- Settings ---
	UPROPERTY(BlueprintReadWrite, Category = "Persistent|Settings")
	FGameSettings GameSettings;

	// --- Save / Load ---
	UFUNCTION(BlueprintCallable, Category = "Persistent|Save")
	bool SaveToSlot(const FString& SlotName = TEXT("Slot0"));

	UFUNCTION(BlueprintCallable, Category = "Persistent|Save")
	bool LoadFromSlot(const FString& SlotName = TEXT("Slot0"));

	/** Auto-save: dipanggil teleport waypoint, masuk domain, selesai quest. */
	UFUNCTION(BlueprintCallable, Category = "Persistent|Save")
	void AutoSave();

	UFUNCTION(BlueprintPure, Category = "Persistent")
	float GetTotalPlayTimeSeconds() const;

protected:
	/** Default party untuk new game. Isi ID sesuai DT_Characters. */
	UPROPERTY(EditDefaultsOnly, Category = "Persistent|Party")
	TArray<FName> DefaultParty = { TEXT("Hero_Sword"), TEXT("Mage_Fire") };

private:
	float LoadedPlayTimeSeconds = 0.f;
	double SessionStartTime = 0.0;
};
