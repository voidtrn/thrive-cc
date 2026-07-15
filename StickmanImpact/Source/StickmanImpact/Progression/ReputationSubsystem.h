// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "ReputationSubsystem.generated.h"

UENUM(BlueprintType)
enum class EReputationSource : uint8
{
	QuestCompleted,
	ExplorationMilestone, // e.g. area discovery % thresholds
	BountyCleared,
	Donation
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnReputationTierChanged, FName, Region, int32, NewTier);

/**
 * Per-region reputation. Points accrue from quests/exploration/bounties/donations; tiers
 * (1-5, thresholds below) unlock the region reward track — the rewards themselves
 * (gadget, shop discount, treasure map, glider skin, recipe) are content keyed off
 * GetReputationTier/OnReputationTierChanged by the systems that own them.
 *
 * Decay: ignoring a region slowly walks its points back toward the current tier's floor —
 * tiers already earned are never lost (decay is friction, not punishment). Time base is
 * in-game hours: ADayNightManager calls NotifyGameHoursPassed (or wire a 1-real-minute
 * timer if the day/night actor isn't in the level).
 */
UCLASS()
class STICKMANIMPACT_API UReputationSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Reputation")
	void AddReputation(FName Region, EReputationSource Source);

	UFUNCTION(BlueprintPure, Category = "Reputation")
	int32 GetReputationPoints(FName Region) const;

	UFUNCTION(BlueprintPure, Category = "Reputation")
	int32 GetReputationTier(FName Region) const;

	// Advance the decay clock. Regions with no activity for DecayGraceHours start losing
	// DecayPerHour points per game hour, floored at their current tier's threshold.
	UFUNCTION(BlueprintCallable, Category = "Reputation")
	void NotifyGameHoursPassed(float Hours);

	// Cumulative points for tier index+2 (index 0 = points for tier 2). Tier 1 is free.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Reputation")
	TArray<int32> TierThresholds = { 200, 500, 1000, 1800 };

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Reputation")
	TMap<EReputationSource, int32> PointsPerSource = {
		{ EReputationSource::QuestCompleted, 40 },
		{ EReputationSource::ExplorationMilestone, 60 },
		{ EReputationSource::BountyCleared, 50 },
		{ EReputationSource::Donation, 10 }
	};

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Reputation")
	float DecayGraceHours = 72.f; // 3 in-game days of neglect before decay starts.

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Reputation")
	float DecayPerHour = 2.f;

	UPROPERTY(BlueprintAssignable, Category = "Reputation")
	FOnReputationTierChanged OnReputationTierChanged;

	// Save hooks (not yet in the binary save format — see README).
	void ExportSaveState(TMap<FName, int32>& OutPoints) const;
	void ImportSaveState(const TMap<FName, int32>& InPoints);

private:
	struct FRegionRep
	{
		int32 Points = 0;
		float HoursSinceActivity = 0.f;
	};

	int32 TierForPoints(int32 Points) const;
	int32 TierFloor(int32 Tier) const;

	TMap<FName, FRegionRep> Regions;
};
