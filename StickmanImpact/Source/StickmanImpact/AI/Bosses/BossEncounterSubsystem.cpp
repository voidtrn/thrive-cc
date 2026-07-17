// Copyright StickmanImpact Project.

#include "BossEncounterSubsystem.h"
#include "World/CollectibleManager.h"

void UBossEncounterSubsystem::BeginEncounter(const FString& BossID)
{
	ActiveBossID = BossID;
	EncounterStartTime = FPlatformTime::Seconds();
	bPlayerHitThisEncounter = false;
}

void UBossEncounterSubsystem::NotifyPlayerHitDuringBoss()
{
	if (!ActiveBossID.IsEmpty())
	{
		bPlayerHitThisEncounter = true;
	}
}

void UBossEncounterSubsystem::NotifyBossDefeated(const FString& BossID, EBossVariant Variant,
	const FRewardData& FirstClearReward, const FRewardData& FarmReward)
{
	UCollectibleManager* Collectibles = GetGameInstance()->GetSubsystem<UCollectibleManager>();

	const bool bFirstClear = !FirstClears.Contains(BossID);
	if (bFirstClear)
	{
		FirstClears.Add(BossID);
		if (Collectibles)
		{
			Collectibles->GrantReward(FirstClearReward);
		}
		OnBossFirstClear.Broadcast(BossID, Variant);
	}
	else if (Collectibles)
	{
		Collectibles->GrantReward(FarmReward);
	}

	// Kill count + milestone titles.
	const int32 NewCount = ++KillCounts.FindOrAdd(BossID);
	for (int32 Milestone : KillMilestones)
	{
		if (Milestone == NewCount)
		{
			OnBossKillMilestone.Broadcast(BossID, NewCount);
		}
	}

	// Speed-kill / no-hit bonuses (only meaningful for the active encounter).
	if (ActiveBossID == BossID && Collectibles)
	{
		const double Elapsed = FPlatformTime::Seconds() - EncounterStartTime;
		if (Elapsed <= SpeedKillSeconds)
		{
			Collectibles->GrantReward(FarmReward); // speed bonus = an extra farm grant
		}
		if (!bPlayerHitThisEncounter)
		{
			Collectibles->GrantReward(FarmReward); // no-hit bonus
		}
	}

	ActiveBossID.Reset();
}

int32 UBossEncounterSubsystem::GetKillCount(const FString& BossID) const
{
	const int32* Count = KillCounts.Find(BossID);
	return Count ? *Count : 0;
}

void UBossEncounterSubsystem::ExportSaveState(TArray<FString>& OutClears, TMap<FString, int32>& OutKills) const
{
	OutClears = FirstClears.Array();
	OutKills = KillCounts;
}

void UBossEncounterSubsystem::ImportSaveState(const TArray<FString>& InClears, const TMap<FString, int32>& InKills)
{
	FirstClears = TSet<FString>(InClears);
	KillCounts = InKills;
}
