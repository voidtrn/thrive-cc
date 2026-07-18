// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "ModManagerSubsystem.generated.h"

/** Parsed mod manifest (mod.json inside the .smod). */
USTRUCT(BlueprintType)
struct FModInfo
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "Mods")
	FString ModID;

	UPROPERTY(BlueprintReadOnly, Category = "Mods")
	FString DisplayName;

	UPROPERTY(BlueprintReadOnly, Category = "Mods")
	FString Author;

	UPROPERTY(BlueprintReadOnly, Category = "Mods")
	FString Version;

	// "skin" | "map" | "ui" | "gameplay" | "total-conversion"
	UPROPERTY(BlueprintReadOnly, Category = "Mods")
	FString ModType;

	// Asset mount roots this mod claims (conflict detection compares these).
	UPROPERTY(BlueprintReadOnly, Category = "Mods")
	TArray<FString> MountRoots;

	UPROPERTY(BlueprintReadOnly, Category = "Mods")
	TArray<FString> RequiredMods;

	UPROPERTY(BlueprintReadOnly, Category = "Mods")
	FString FilePath;

	UPROPERTY(BlueprintReadOnly, Category = "Mods")
	bool bEnabled = false;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnModListChanged, int32, ModCount);

/**
 * The .smod loader — a .smod is a cooked UE pak (renamed) with a mod.json manifest beside
 * it in the archive root. `ScanMods` reads <Game>/Mods/*.smod manifests; `SetModEnabled` +
 * `SetLoadOrder` persist the config; enabled mods mount at startup via the pak platform
 * file (assets override by mount order — later wins). `FindConflicts` flags mods claiming
 * the same MountRoots; `AreRequirementsMet` checks RequiredMods.
 *
 * Safety model (enforced by construction, not scanning): a cooked pak carries assets +
 * Blueprint bytecode only — no native code ships in a .smod. Blueprint mods script against
 * the same BP-exposed API every system already publishes (spawn via UEnemyFactory
 * archetype rows, quests as UQuestDataAssets, dialogue sequences, world-event rows, skins
 * as FSkinDef rows — the data-driven design IS the mod API). `bModsActive` flags the
 * session so ranked/online paths can refuse modded state; signature verification +
 * workshop distribution are backend/platform-side (Docs/MODDING.md).
 */
UCLASS()
class STICKMANIMPACT_API UModManagerSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// Scan <Project>/Mods for .smod manifests. Returns discovered count.
	UFUNCTION(BlueprintCallable, Category = "Mods")
	int32 ScanMods();

	UFUNCTION(BlueprintPure, Category = "Mods")
	const TArray<FModInfo>& GetMods() const { return Mods; }

	UFUNCTION(BlueprintCallable, Category = "Mods")
	void SetModEnabled(const FString& ModID, bool bEnabled);

	// Reorder: ModIDs earliest-mounted first (later mounts override earlier assets).
	UFUNCTION(BlueprintCallable, Category = "Mods")
	void SetLoadOrder(const TArray<FString>& OrderedModIDs);

	// Mount all enabled mods (call once at startup after ScanMods). Returns mounted count.
	UFUNCTION(BlueprintCallable, Category = "Mods")
	int32 MountEnabledMods();

	// Pairs of ModIDs claiming overlapping mount roots.
	UFUNCTION(BlueprintCallable, Category = "Mods")
	TArray<FString> FindConflicts() const;

	UFUNCTION(BlueprintPure, Category = "Mods")
	bool AreRequirementsMet(const FString& ModID) const;

	// True once any mod is mounted — ranked/online paths refuse modded sessions.
	UFUNCTION(BlueprintPure, Category = "Mods")
	bool AreModsActive() const { return bModsActive; }

	UFUNCTION(BlueprintPure, Category = "Mods")
	FString GetModsDirectory() const;

private:
	bool ParseManifest(const FString& SmodPath, FModInfo& OutInfo) const;

	TArray<FModInfo> Mods;
	bool bModsActive = false;
};
