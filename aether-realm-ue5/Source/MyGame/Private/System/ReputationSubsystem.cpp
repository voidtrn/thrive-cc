#include "System/ReputationSubsystem.h"
#include "System/OpenWorldGameInstance.h"
#include "Engine/DataTable.h"
#include "MyGame.h"

UOpenWorldGameInstance* UReputationSubsystem::GetOWGameInstance() const
{
	return Cast<UOpenWorldGameInstance>(GetGameInstance());
}

FName UReputationSubsystem::RewardRowKey(FName Region, int32 Level)
{
	return *FString::Printf(TEXT("%s_%d"), *Region.ToString(), Level);
}

int32 UReputationSubsystem::ExpToReachLevel(int32 Level)
{
	// Naik dari N ke N+1 = 1000 + 500*(N-1). Kumulatif ke L (L1 = 0):
	// sum_{n=1}^{L-1} (1000 + 500*(n-1)) = 1000*(L-1) + 500*(L-2)*(L-1)/2
	const int32 L = FMath::Clamp(Level, 1, MaxReputationLevel);
	return 1000 * (L - 1) + 500 * (L - 2) * (L - 1) / 2;
}

int32 UReputationSubsystem::LevelForTotalExp(int32 TotalExp)
{
	int32 Level = 1;
	while (Level < MaxReputationLevel && TotalExp >= ExpToReachLevel(Level + 1))
	{
		Level++;
	}
	return Level;
}

void UReputationSubsystem::AddReputation(FName Region, int32 Exp)
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI || Region.IsNone() || Exp <= 0)
	{
		return;
	}

	int32& Total = GI->RegionReputation.FindOrAdd(Region);
	const int32 OldLevel = LevelForTotalExp(Total);

	// Cap EXP di puncak kurva — angka save tidak membengkak tanpa arti.
	Total = FMath::Min(Total + Exp, ExpToReachLevel(MaxReputationLevel));

	const int32 NewLevel = LevelForTotalExp(Total);
	for (int32 L = OldLevel + 1; L <= NewLevel; ++L)
	{
		UE_LOG(LogAetherRealm, Log, TEXT("Reputation '%s' naik ke level %d"), *Region.ToString(), L);
		OnReputationLevelUp.Broadcast(Region, L);
	}
}

int32 UReputationSubsystem::GetTotalExp(FName Region) const
{
	const UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI)
	{
		return 0;
	}
	const int32* Total = GI->RegionReputation.Find(Region);
	return Total ? *Total : 0;
}

int32 UReputationSubsystem::GetLevel(FName Region) const
{
	return LevelForTotalExp(GetTotalExp(Region));
}

bool UReputationSubsystem::IsRewardClaimed(FName Region, int32 Level) const
{
	const UOpenWorldGameInstance* GI = GetOWGameInstance();
	return GI && GI->ClaimedReputationRewards.Contains(RewardRowKey(Region, Level));
}

EClaimResult UReputationSubsystem::ClaimReward(const UDataTable* RewardTable, FName Region, int32 Level)
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI || !RewardTable)
	{
		return EClaimResult::InvalidData;
	}

	const FName RowKey = RewardRowKey(Region, Level);
	const FReputationRewardRow* Row =
		RewardTable->FindRow<FReputationRewardRow>(RowKey, TEXT("ReputationClaim"));
	if (!Row)
	{
		return EClaimResult::InvalidData;
	}
	if (GI->ClaimedReputationRewards.Contains(RowKey))
	{
		return EClaimResult::AlreadyClaimed;
	}
	if (GetLevel(Region) < Row->RequiredLevel)
	{
		return EClaimResult::NotUnlocked;
	}

	GI->ClaimedReputationRewards.Add(RowKey);
	GI->Mora += Row->MoraReward;
	for (const FMaterialCost& Reward : Row->ItemRewards)
	{
		GI->AddItem(Reward.ItemId, Reward.Count);
	}

	UE_LOG(LogAetherRealm, Log, TEXT("Reputation reward '%s' claimed"), *RowKey.ToString());
	GI->AutoSave();
	return EClaimResult::Success;
}
