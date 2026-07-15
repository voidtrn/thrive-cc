// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Engine/DataTable.h"
#include "Quest/StickmanQuestTypes.h"
#include "SeasonPassSubsystem.generated.h"

/** One season-pass tier (DataTable row): XP needed + what each track pays out. */
USTRUCT(BlueprintType)
struct FSeasonPassTier : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Season")
	int32 TierIndex = 0;

	// Cumulative season XP to reach this tier.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Season")
	int32 RequiredXP = 0;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Season")
	FRewardData FreeReward;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Season")
	FRewardData PremiumReward;
};

/** One rotating seasonal challenge (DataTable row). Rotation = which biweekly window it belongs to. */
USTRUCT(BlueprintType)
struct FSeasonalChallenge : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Season")
	FName ChallengeID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Season")
	FText Description;

	// 0-based biweekly window within the season this challenge is live in.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Season")
	int32 RotationIndex = 0;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Season")
	int32 SeasonXPReward = 100;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnSeasonTierReached, int32, TierIndex);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnSeasonRewardClaimed, int32, TierIndex, bool, bPremium);

/**
 * Battle-pass-style seasonal track. Season identity (name/theme, e.g. "Season of Pyro"),
 * tier table, and challenge table are data; this subsystem owns XP, tier, claims, and the
 * catch-up multiplier (late starters earn boosted XP until they're at the tier the season
 * timeline expects — respects player time instead of punishing it).
 *
 * Scope honesty: "premium" here is a bool the game sets (bOwnsPremiumTrack) — there is no
 * store/monetization backend in this project. Season rotation is driven by SetSeasonDay
 * (call from save-game day counter or a server clock when one exists); nothing here talks
 * to a live service.
 */
UCLASS()
class STICKMANIMPACT_API USeasonPassSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Season")
	void SetSeasonTables(UDataTable* Tiers, UDataTable* Challenges);

	UFUNCTION(BlueprintCallable, Category = "Season")
	void AddSeasonXP(int32 Amount);

	// Complete a challenge from the current rotation — grants its SeasonXPReward once.
	UFUNCTION(BlueprintCallable, Category = "Season")
	void CompleteChallenge(FName ChallengeID);

	UFUNCTION(BlueprintPure, Category = "Season")
	int32 GetCurrentTier() const;

	UFUNCTION(BlueprintPure, Category = "Season")
	int32 GetSeasonXP() const { return SeasonXP; }

	// Challenges live in the current biweekly rotation window.
	UFUNCTION(BlueprintCallable, Category = "Season")
	TArray<FSeasonalChallenge> GetActiveChallenges() const;

	// Claim a reached tier's reward. Premium claims require bOwnsPremiumTrack.
	UFUNCTION(BlueprintCallable, Category = "Season")
	bool ClaimTierReward(int32 TierIndex, bool bPremium);

	// Day within the season (0-based). Drives rotation index (day / 14) and catch-up.
	UFUNCTION(BlueprintCallable, Category = "Season")
	void SetSeasonDay(int32 Day) { SeasonDay = FMath::Max(Day, 0); }

	// >1 while behind the tier the season timeline expects (ExpectedTiersPerDay * day).
	UFUNCTION(BlueprintPure, Category = "Season")
	float GetCatchUpMultiplier() const;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Season")
	bool bOwnsPremiumTrack = false;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Season")
	float ExpectedTiersPerDay = 0.7f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Season")
	float MaxCatchUpMultiplier = 2.f;

	UPROPERTY(BlueprintAssignable, Category = "Season")
	FOnSeasonTierReached OnSeasonTierReached;

	UPROPERTY(BlueprintAssignable, Category = "Season")
	FOnSeasonRewardClaimed OnSeasonRewardClaimed;

	// Save hooks (not yet in the binary save format — see README).
	void ExportSaveState(int32& OutXP, TArray<int32>& OutFreeClaims, TArray<int32>& OutPremiumClaims, TArray<FName>& OutChallenges) const;
	void ImportSaveState(int32 InXP, const TArray<int32>& InFreeClaims, const TArray<int32>& InPremiumClaims, const TArray<FName>& InChallenges);

private:
	int32 TierForXP(int32 XP) const;
	const FSeasonPassTier* FindTier(int32 TierIndex) const;

	UPROPERTY()
	TObjectPtr<UDataTable> TierTable;

	UPROPERTY()
	TObjectPtr<UDataTable> ChallengeTable;

	int32 SeasonXP = 0;
	int32 SeasonDay = 0;
	TSet<int32> ClaimedFreeTiers;
	TSet<int32> ClaimedPremiumTiers;
	TSet<FName> CompletedChallengeIDs;
};
