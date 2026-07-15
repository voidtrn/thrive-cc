// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "StickmanSaveGame.h"
#include "SaveManager.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnSaveCompleted, int32, SlotIndex, bool, bSuccess);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnLoadCompleted, int32, SlotIndex, bool, bSuccess);

/**
 * Save/load orchestration: 4 slots, auto-save (quest progress, timer from the settings
 * screen's interval, waypoint unlock as the "area transition" proxy), manual save (call from
 * waypoint interact UI), and gather/apply against every stateful subsystem.
 *
 * File format (written via raw file IO, not SaveGameToSlot, so integrity wrapping is ours):
 *   [magic 4B][version 4B][CRC32 of payload 4B][payload = zlib-compressed, XOR-obfuscated
 *   serialized UStickmanSaveGame]
 * The XOR pass is tamper-DETERRENCE only, honestly not security — a determined user can
 * reverse it; real save protection needs server authority which a single-player game doesn't
 * have. CRC32 catches corruption; every write also copies the previous file to <slot>.bak,
 * and a failed CRC/versioned load falls back to the .bak, then to the auto-save slot.
 * Cloud saves: files live in the standard SaveGames dir, which Steam Auto-Cloud / GOG Galaxy
 * sync by path config — no code needed; console platforms replace file IO with their
 * ISaveGameSystem (documented in Docs/PACKAGING.md).
 *
 * Slot layout: 0 = auto-save, 1-3 = manual slots (4 total, per the design spec).
 */
UCLASS()
class STICKMANIMPACT_API USaveManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	static constexpr int32 NumSlots = 4;
	static constexpr int32 AutoSaveSlot = 0;

	virtual void Initialize(FSubsystemCollectionBase& Collection) override;
	virtual void Deinitialize() override;

	UFUNCTION(BlueprintCallable, Category = "Save")
	bool SaveToSlot(int32 SlotIndex);

	// Async: work happens on a background task, OnLoadCompleted fires back on the game thread.
	UFUNCTION(BlueprintCallable, Category = "Save")
	void LoadFromSlotAsync(int32 SlotIndex);

	UFUNCTION(BlueprintCallable, Category = "Save")
	bool LoadFromSlot(int32 SlotIndex);

	UFUNCTION(BlueprintPure, Category = "Save")
	FSaveSlotMetadata GetSlotMetadata(int32 SlotIndex) const;

	UFUNCTION(BlueprintCallable, Category = "Save")
	void RequestAutoSave(const FString& Reason);

	UFUNCTION(BlueprintPure, Category = "Save")
	float GetTotalPlaytimeSeconds() const;

	// Location name shown in slot metadata — set on region change (e.g. from the same place
	// that calls UStickmanAudioManager::SetCurrentRegion).
	UFUNCTION(BlueprintCallable, Category = "Save")
	void SetCurrentLocationName(const FString& LocationName) { CurrentLocationName = LocationName; }

	UPROPERTY(BlueprintAssignable, Category = "Save")
	FOnSaveCompleted OnSaveCompleted;

	UPROPERTY(BlueprintAssignable, Category = "Save")
	FOnLoadCompleted OnLoadCompleted;

private:
	UStickmanSaveGame* GatherWorldState();
	void ApplyWorldState(UStickmanSaveGame* SaveData);

	bool WriteSlotFile(int32 SlotIndex, const TArray<uint8>& RawSaveBytes) const;
	bool ReadSlotFile(int32 SlotIndex, TArray<uint8>& OutRawSaveBytes, bool bTryBackup) const;
	FString GetSlotFilePath(int32 SlotIndex) const;
	static void XORObfuscate(TArray<uint8>& Bytes);

	void StartAutoSaveTimer();
	UFUNCTION()
	void HandleQuestUpdated(class UQuestDataAsset* Quest, int32 StageIndex);
	UFUNCTION()
	void HandleWaypointUnlocked(class AWaypointActor* Waypoint);

	FString CurrentLocationName = TEXT("Open Field");
	double SessionStartSeconds = 0.0;
	float LoadedPlaytimeSeconds = 0.f;
	FTimerHandle AutoSaveTimerHandle;
	FTimerHandle FogSampleTimerHandle;

	// Fog-of-war approximation: sampled player positions, re-stamped on load.
	TArray<FVector2D> VisitedFogPoints;
	void SampleFogPoint();
};
