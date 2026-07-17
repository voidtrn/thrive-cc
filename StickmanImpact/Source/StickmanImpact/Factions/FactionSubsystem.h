// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "FactionTypes.h"
#include "FactionSubsystem.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnFactionRepTierChanged, EFaction, Faction, EFactionRepTier, NewTier);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnTerritoryControlChanged, FName, Region, EFaction, NewController);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnBountyChanged, EFaction, Faction, int32, Stars);

/**
 * The 6-faction world state: per-faction reputation (-100..+100 → 7 tiers), territory control
 * (region → controlling faction + influence), and per-faction bounties (0-5 stars). This is
 * the broader faction layer over the region-scoped UReputationSubsystem and the choice-scoped
 * UConsequenceTrackerSubsystem — those feed it (dialogue/quest choices call AddReputation
 * here; killing faction members raises a bounty).
 *
 * Territory control drives spawn tables / vendors / patrols / music / safe-vs-danger zones
 * (systems read GetTerritoryController). Territory can flip via ShiftTerritoryInfluence
 * (battles, story, dynamic events) — "Battle for [Region]" events resolve into an influence
 * swing. Weekly faction-strength drift is a scheduled ShiftTerritoryInfluence call.
 */
UCLASS()
class STICKMANIMPACT_API UFactionSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// --- Reputation -----------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Faction")
	void AddReputation(EFaction Faction, int32 Delta);

	UFUNCTION(BlueprintPure, Category = "Faction")
	int32 GetReputation(EFaction Faction) const;

	UFUNCTION(BlueprintPure, Category = "Faction")
	EFactionRepTier GetRepTier(EFaction Faction) const;

	UFUNCTION(BlueprintPure, Category = "Faction")
	bool IsHostile(EFaction Faction) const;

	// --- Territory ------------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Faction")
	void SetTerritoryController(FName Region, EFaction Faction);

	UFUNCTION(BlueprintPure, Category = "Faction")
	EFaction GetTerritoryController(FName Region) const;

	UFUNCTION(BlueprintPure, Category = "Faction")
	float GetTerritoryInfluence(FName Region, EFaction Faction) const;

	// Swing influence toward a faction in a region; if it passes 0.5 the controller flips.
	UFUNCTION(BlueprintCallable, Category = "Faction")
	void ShiftTerritoryInfluence(FName Region, EFaction Faction, float Delta);

	// --- Bounty ---------------------------------------------------------------------------

	// Raise the player's bounty with a faction (crime severity → stars, capped at 5).
	UFUNCTION(BlueprintCallable, Category = "Faction")
	void AddBounty(EFaction Faction, int32 Stars);

	UFUNCTION(BlueprintPure, Category = "Faction")
	int32 GetBounty(EFaction Faction) const;

	UFUNCTION(BlueprintCallable, Category = "Faction")
	void ClearBounty(EFaction Faction);

	UPROPERTY(BlueprintAssignable, Category = "Faction")
	FOnFactionRepTierChanged OnFactionRepTierChanged;

	UPROPERTY(BlueprintAssignable, Category = "Faction")
	FOnTerritoryControlChanged OnTerritoryControlChanged;

	UPROPERTY(BlueprintAssignable, Category = "Faction")
	FOnBountyChanged OnBountyChanged;

	// Save hooks (not yet in the binary format — see README).
	void ExportSaveState(TMap<EFaction, int32>& OutRep, TMap<FName, EFaction>& OutTerritory, TMap<EFaction, int32>& OutBounty) const;
	void ImportSaveState(const TMap<EFaction, int32>& InRep, const TMap<FName, EFaction>& InTerritory, const TMap<EFaction, int32>& InBounty);

private:
	EFactionRepTier TierForScore(int32 Score) const;

	struct FTerritory
	{
		EFaction Controller = EFaction::AdventurersGuild;
		TMap<EFaction, float> Influence;
	};

	TMap<EFaction, int32> Reputation;
	TMap<FName, FTerritory> Territories;
	TMap<EFaction, int32> Bounties;
};
