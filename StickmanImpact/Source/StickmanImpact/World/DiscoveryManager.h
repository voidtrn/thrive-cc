// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "DiscoveryManager.generated.h"

class UQuestDataAsset;

/** How buried a secret is. Drives journal grouping and the per-layer area stats. */
UENUM(BlueprintType)
enum class EDiscoveryLayer : uint8
{
	Surface,      // Visible landmarks, waypoints — found by walking around.
	Hidden,       // Puzzles, secret caves, breakable walls — found by looking.
	Deep,         // Lore tablets, ghost NPCs, hidden bosses — found by digging.
	TimeLocked,   // Only reachable at certain time-of-day/weather.
	AbilityGated  // Needs a specific element/skill to open.
};

/** Reward magnitude tier (Tier1 = common chest ... Tier5 = myth). Reward contents live on the site's FRewardData. */
UENUM(BlueprintType)
enum class EDiscoveryTier : uint8
{
	Tier1, Tier2, Tier3, Tier4, Tier5
};

/** One line in the Traveler's Journal — auto-recorded when a discovery is made. */
USTRUCT(BlueprintType)
struct FDiscoveryJournalEntry
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery")
	FString DiscoveryID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery")
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery")
	FName Area = NAME_None;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery")
	EDiscoveryLayer Layer = EDiscoveryLayer::Surface;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery")
	EDiscoveryTier Tier = EDiscoveryTier::Tier1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery")
	FVector Location = FVector::ZeroVector;

	// In-game clock hour when found (from ADayNightManager), for journal flavor.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery")
	float GameHourFound = 0.f;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnDiscoveryMade, const FDiscoveryJournalEntry&, Entry);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnClueCollected, FName, ClueSetID, int32, CollectedInSet);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnClueSetCompleted, FName, ClueSetID);

/**
 * Tracks every secret in the world: per-area totals (registered by ADiscoverySite at
 * BeginPlay), what's been found, the auto-recording Traveler's Journal, and clue sets
 * (collect all clues in a set -> a hidden quest unlocks via UQuestManager::AcceptQuest).
 *
 * "Area Discovery: 45%" = GetAreaDiscoveryPercent; "3 secrets remaining" =
 * GetSecretsRemaining. Both derive from live registration, so they stay correct as
 * levels stream in/out — totals only count sites that have registered this session.
 */
UCLASS()
class STICKMANIMPACT_API UDiscoveryManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// --- Site registration + discovery ---------------------------------------------------

	// Called by every ADiscoverySite in BeginPlay so area totals exist before anything is found.
	void RegisterSecret(const FString& DiscoveryID, FName Area);

	// Records a find. Returns false if this ID was already discovered (no double rewards).
	UFUNCTION(BlueprintCallable, Category = "Discovery")
	bool RecordDiscovery(const FDiscoveryJournalEntry& Entry);

	UFUNCTION(BlueprintPure, Category = "Discovery")
	bool IsDiscovered(const FString& DiscoveryID) const { return DiscoveredIDs.Contains(DiscoveryID); }

	UFUNCTION(BlueprintPure, Category = "Discovery")
	float GetAreaDiscoveryPercent(FName Area) const;

	UFUNCTION(BlueprintPure, Category = "Discovery")
	int32 GetSecretsRemaining(FName Area) const;

	UFUNCTION(BlueprintPure, Category = "Discovery")
	const TArray<FDiscoveryJournalEntry>& GetJournal() const { return Journal; }

	// --- Clue sets ------------------------------------------------------------------------

	// Called by AClueActor on pickup. When CollectedInSet reaches SetSize, UnlockedQuest is
	// accepted (if set) and OnClueSetCompleted fires. Duplicate ClueIDs are ignored.
	UFUNCTION(BlueprintCallable, Category = "Discovery")
	void RecordClue(const FString& ClueID, FName ClueSetID, int32 SetSize, UQuestDataAsset* UnlockedQuest);

	UFUNCTION(BlueprintPure, Category = "Discovery")
	bool HasClue(const FString& ClueID) const { return CollectedClueIDs.Contains(ClueID); }

	UFUNCTION(BlueprintPure, Category = "Discovery")
	int32 GetCluesCollectedInSet(FName ClueSetID) const;

	// --- Delegates ------------------------------------------------------------------------

	UPROPERTY(BlueprintAssignable, Category = "Discovery")
	FOnDiscoveryMade OnDiscoveryMade;

	UPROPERTY(BlueprintAssignable, Category = "Discovery")
	FOnClueCollected OnClueCollected;

	UPROPERTY(BlueprintAssignable, Category = "Discovery")
	FOnClueSetCompleted OnClueSetCompleted;

	// --- Save/load hooks. Area totals rebuild from site registration on level load, same
	// lazy pattern as UCollectibleManager. Not yet wired into UStickmanSaveManager's
	// format (versioned change) — see README. ----------------------------------------------
	void ExportSaveState(TArray<FDiscoveryJournalEntry>& OutJournal, TArray<FString>& OutClueIDs) const;
	void ImportSaveState(const TArray<FDiscoveryJournalEntry>& InJournal, const TArray<FString>& InClueIDs);

private:
	TSet<FString> DiscoveredIDs;
	TArray<FDiscoveryJournalEntry> Journal;

	// Area -> IDs of every secret that has registered this session.
	TMap<FName, TSet<FString>> AreaSecretIDs;

	TSet<FString> CollectedClueIDs;
	TMap<FName, int32> ClueSetCounts;
	TSet<FName> CompletedClueSets;
};
