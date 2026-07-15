// Copyright StickmanImpact Project.

#include "SeasonPassSubsystem.h"
#include "World/CollectibleManager.h"

void USeasonPassSubsystem::SetSeasonTables(UDataTable* Tiers, UDataTable* Challenges)
{
	TierTable = Tiers;
	ChallengeTable = Challenges;
}

void USeasonPassSubsystem::AddSeasonXP(int32 Amount)
{
	if (Amount <= 0)
	{
		return;
	}

	const int32 OldTier = TierForXP(SeasonXP);
	SeasonXP += FMath::RoundToInt(Amount * GetCatchUpMultiplier());
	const int32 NewTier = TierForXP(SeasonXP);

	for (int32 Tier = OldTier + 1; Tier <= NewTier; ++Tier)
	{
		OnSeasonTierReached.Broadcast(Tier);
	}
}

void USeasonPassSubsystem::CompleteChallenge(FName ChallengeID)
{
	if (!ChallengeTable || CompletedChallengeIDs.Contains(ChallengeID))
	{
		return;
	}

	const int32 CurrentRotation = SeasonDay / 14;
	ChallengeTable->ForeachRow<FSeasonalChallenge>(TEXT("SeasonPass"),
		[&](const FName& RowName, const FSeasonalChallenge& Challenge)
	{
		if (Challenge.ChallengeID == ChallengeID && Challenge.RotationIndex == CurrentRotation)
		{
			CompletedChallengeIDs.Add(ChallengeID);
			AddSeasonXP(Challenge.SeasonXPReward);
		}
	});
}

TArray<FSeasonalChallenge> USeasonPassSubsystem::GetActiveChallenges() const
{
	TArray<FSeasonalChallenge> Result;
	if (!ChallengeTable)
	{
		return Result;
	}

	const int32 CurrentRotation = SeasonDay / 14;
	ChallengeTable->ForeachRow<FSeasonalChallenge>(TEXT("SeasonPass"),
		[&](const FName& RowName, const FSeasonalChallenge& Challenge)
	{
		if (Challenge.RotationIndex == CurrentRotation)
		{
			Result.Add(Challenge);
		}
	});
	return Result;
}

int32 USeasonPassSubsystem::TierForXP(int32 XP) const
{
	int32 Best = 0;
	if (!TierTable)
	{
		return Best;
	}
	TierTable->ForeachRow<FSeasonPassTier>(TEXT("SeasonPass"),
		[&](const FName& RowName, const FSeasonPassTier& Tier)
	{
		if (XP >= Tier.RequiredXP)
		{
			Best = FMath::Max(Best, Tier.TierIndex);
		}
	});
	return Best;
}

const FSeasonPassTier* USeasonPassSubsystem::FindTier(int32 TierIndex) const
{
	if (!TierTable)
	{
		return nullptr;
	}
	const FSeasonPassTier* Found = nullptr;
	TierTable->ForeachRow<FSeasonPassTier>(TEXT("SeasonPass"),
		[&](const FName& RowName, const FSeasonPassTier& Tier)
	{
		if (Tier.TierIndex == TierIndex)
		{
			Found = &Tier;
		}
	});
	return Found;
}

int32 USeasonPassSubsystem::GetCurrentTier() const
{
	return TierForXP(SeasonXP);
}

bool USeasonPassSubsystem::ClaimTierReward(int32 TierIndex, bool bPremium)
{
	if (TierIndex > GetCurrentTier() || (bPremium && !bOwnsPremiumTrack))
	{
		return false;
	}

	TSet<int32>& Claimed = bPremium ? ClaimedPremiumTiers : ClaimedFreeTiers;
	if (Claimed.Contains(TierIndex))
	{
		return false;
	}

	const FSeasonPassTier* Tier = FindTier(TierIndex);
	if (!Tier)
	{
		return false;
	}

	Claimed.Add(TierIndex);
	if (UCollectibleManager* Collectibles = GetGameInstance()->GetSubsystem<UCollectibleManager>())
	{
		Collectibles->GrantReward(bPremium ? Tier->PremiumReward : Tier->FreeReward);
	}
	OnSeasonRewardClaimed.Broadcast(TierIndex, bPremium);
	return true;
}

float USeasonPassSubsystem::GetCatchUpMultiplier() const
{
	const float ExpectedTier = ExpectedTiersPerDay * SeasonDay;
	const int32 CurrentTier = TierForXP(SeasonXP);
	if (ExpectedTier <= CurrentTier + 1)
	{
		return 1.f;
	}
	// +25% per full tier behind schedule, capped.
	const float Behind = ExpectedTier - CurrentTier;
	return FMath::Min(1.f + 0.25f * Behind, MaxCatchUpMultiplier);
}

void USeasonPassSubsystem::ExportSaveState(int32& OutXP, TArray<int32>& OutFreeClaims,
	TArray<int32>& OutPremiumClaims, TArray<FName>& OutChallenges) const
{
	OutXP = SeasonXP;
	OutFreeClaims = ClaimedFreeTiers.Array();
	OutPremiumClaims = ClaimedPremiumTiers.Array();
	OutChallenges = CompletedChallengeIDs.Array();
}

void USeasonPassSubsystem::ImportSaveState(int32 InXP, const TArray<int32>& InFreeClaims,
	const TArray<int32>& InPremiumClaims, const TArray<FName>& InChallenges)
{
	SeasonXP = InXP;
	ClaimedFreeTiers = TSet<int32>(InFreeClaims);
	ClaimedPremiumTiers = TSet<int32>(InPremiumClaims);
	CompletedChallengeIDs = TSet<FName>(InChallenges);
}
