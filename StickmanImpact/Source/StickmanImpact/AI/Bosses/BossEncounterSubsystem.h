// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "StickmanBossTypes.h"
#include "BossEncounterSubsystem.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnBossFirstClear, const FString&, BossID, EBossVariant, Variant);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnBossKillMilestone, const FString&, BossID, int32, KillCount);

/**
 * Tracks boss outcomes across the save: first-clear flags, per-boss kill counts (for
 * kill-count titles via UTitleManager/achievements), and the active encounter's fight
 * timer + hit flag so speed-kill and no-hit bonuses can be awarded. AStickmanBossCharacter
 * calls NotifyBossDefeated on death; the encounter start (BeginEncounter) is called when the
 * arena activates, and the defense/damage path calls NotifyPlayerHitDuringBoss.
 *
 * Reward routing goes through UCollectibleManager::GrantReward (first-clear grants
 * FirstClearReward, subsequent kills grant FarmReward; bonuses stack an extra farm grant).
 * Weekly/Abyss reward gating (limited per period, leaderboard) is a data/timestamp check
 * layered on top — the flags live here, the schedule is content.
 */
UCLASS()
class STICKMANIMPACT_API UBossEncounterSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Boss")
	void BeginEncounter(const FString& BossID);

	UFUNCTION(BlueprintCallable, Category = "Boss")
	void NotifyPlayerHitDuringBoss();

	// Called by AStickmanBossCharacter on death — grants rewards + bonuses, updates trackers.
	void NotifyBossDefeated(const FString& BossID, EBossVariant Variant,
		const FRewardData& FirstClearReward, const FRewardData& FarmReward);

	UFUNCTION(BlueprintPure, Category = "Boss")
	bool HasClearedBoss(const FString& BossID) const { return FirstClears.Contains(BossID); }

	UFUNCTION(BlueprintPure, Category = "Boss")
	int32 GetKillCount(const FString& BossID) const;

	// Bonus thresholds.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Boss")
	float SpeedKillSeconds = 120.f;

	// Kill-count milestones that fire OnBossKillMilestone (for titles).
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Boss")
	TArray<int32> KillMilestones = { 1, 10, 50, 100 };

	UPROPERTY(BlueprintAssignable, Category = "Boss")
	FOnBossFirstClear OnBossFirstClear;

	UPROPERTY(BlueprintAssignable, Category = "Boss")
	FOnBossKillMilestone OnBossKillMilestone;

	// Save hooks (not yet in the binary format — see README).
	void ExportSaveState(TArray<FString>& OutClears, TMap<FString, int32>& OutKills) const;
	void ImportSaveState(const TArray<FString>& InClears, const TMap<FString, int32>& InKills);

private:
	TSet<FString> FirstClears;
	TMap<FString, int32> KillCounts;

	FString ActiveBossID;
	double EncounterStartTime = 0.0;
	bool bPlayerHitThisEncounter = false;
};
