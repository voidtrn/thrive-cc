// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "BestiarySubsystem.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnBestiaryEntryUpdated, FName, ArchetypeID);

/**
 * The monster journal. Records first sightings + per-archetype kill counts; weakness/loot
 * details in the journal UI unlock progressively (encountered → weakness revealed after
 * KillsToRevealWeakness). Feeds achievements ("catalogued N species") and the
 * discovery-percent style completion readout. Kill counts also drive material-farm
 * milestones.
 */
UCLASS()
class STICKMANIMPACT_API UBestiarySubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	void NotifyEncountered(FName ArchetypeID);

	UFUNCTION(BlueprintCallable, Category = "Bestiary")
	void NotifyKilled(FName ArchetypeID);

	UFUNCTION(BlueprintPure, Category = "Bestiary")
	bool HasEncountered(FName ArchetypeID) const { return EncounteredIDs.Contains(ArchetypeID); }

	UFUNCTION(BlueprintPure, Category = "Bestiary")
	int32 GetKillCount(FName ArchetypeID) const;

	UFUNCTION(BlueprintPure, Category = "Bestiary")
	bool IsWeaknessRevealed(FName ArchetypeID) const { return GetKillCount(ArchetypeID) >= KillsToRevealWeakness; }

	UFUNCTION(BlueprintPure, Category = "Bestiary")
	int32 GetSpeciesCatalogued() const { return EncounteredIDs.Num(); }

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Bestiary")
	int32 KillsToRevealWeakness = 5;

	UPROPERTY(BlueprintAssignable, Category = "Bestiary")
	FOnBestiaryEntryUpdated OnBestiaryEntryUpdated;

	// Save hooks (not yet in the binary format — see README).
	void ExportSaveState(TArray<FName>& OutSeen, TMap<FName, int32>& OutKills) const;
	void ImportSaveState(const TArray<FName>& InSeen, const TMap<FName, int32>& InKills);

private:
	TSet<FName> EncounteredIDs;
	TMap<FName, int32> KillCounts;
};
