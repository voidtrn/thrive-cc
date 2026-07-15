// Copyright StickmanImpact Project.

#include "BadLuckProtectionSubsystem.h"

bool UBadLuckProtectionSubsystem::RollWithPity(FName PoolID, float BaseChance)
{
	int32& Attempts = AttemptsSinceRare.FindOrAdd(PoolID);
	++Attempts;

	float Chance = BaseChance;
	if (Attempts > SoftPityAttempts)
	{
		Chance += RampPerAttempt * (Attempts - SoftPityAttempts);
	}

	const bool bHardPity = Attempts >= HardPityAttempts;
	const bool bRare = bHardPity || FMath::FRand() < Chance;
	if (bRare)
	{
		if (bHardPity)
		{
			OnPityTriggered.Broadcast(PoolID, Attempts);
		}
		Attempts = 0;
	}
	return bRare;
}

int32 UBadLuckProtectionSubsystem::GetAttemptsSinceRare(FName PoolID) const
{
	const int32* Attempts = AttemptsSinceRare.Find(PoolID);
	return Attempts ? *Attempts : 0;
}

void UBadLuckProtectionSubsystem::RegisterDuplicate(FName ItemID, int32 MaxUsefulCopies)
{
	const int32 Count = ++DuplicateCounts.FindOrAdd(ItemID);
	if (Count >= MaxUsefulCopies)
	{
		SaturatedItemIDs.Add(ItemID);
	}
}

void UBadLuckProtectionSubsystem::RegisterBossAttempt(FName BossID, bool bDefeated)
{
	if (bDefeated)
	{
		BossWipeCounts.Remove(BossID);
	}
	else
	{
		++BossWipeCounts.FindOrAdd(BossID);
	}
}

float UBadLuckProtectionSubsystem::GetMercyDropBonus(FName BossID) const
{
	const int32* Wipes = BossWipeCounts.Find(BossID);
	return Wipes ? FMath::Min(MercyDropBonusPerWipe * *Wipes, MaxMercyDropBonus) : 0.f;
}
