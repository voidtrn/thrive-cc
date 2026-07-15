// Copyright StickmanImpact Project.

#include "ReputationSubsystem.h"

void UReputationSubsystem::AddReputation(FName Region, EReputationSource Source)
{
	if (Region.IsNone())
	{
		return;
	}

	const int32* Amount = PointsPerSource.Find(Source);
	if (!Amount || *Amount <= 0)
	{
		return;
	}

	FRegionRep& Rep = Regions.FindOrAdd(Region);
	const int32 OldTier = TierForPoints(Rep.Points);
	Rep.Points += *Amount;
	Rep.HoursSinceActivity = 0.f;

	const int32 NewTier = TierForPoints(Rep.Points);
	if (NewTier > OldTier)
	{
		OnReputationTierChanged.Broadcast(Region, NewTier);
	}
}

void UReputationSubsystem::NotifyGameHoursPassed(float Hours)
{
	if (Hours <= 0.f)
	{
		return;
	}

	for (TPair<FName, FRegionRep>& Pair : Regions)
	{
		FRegionRep& Rep = Pair.Value;
		Rep.HoursSinceActivity += Hours;
		if (Rep.HoursSinceActivity <= DecayGraceHours)
		{
			continue;
		}

		const int32 Floor = TierFloor(TierForPoints(Rep.Points));
		const int32 Decay = FMath::RoundToInt(DecayPerHour * Hours);
		Rep.Points = FMath::Max(Rep.Points - Decay, Floor);
	}
}

int32 UReputationSubsystem::TierForPoints(int32 Points) const
{
	int32 Tier = 1;
	for (int32 Index = 0; Index < TierThresholds.Num(); ++Index)
	{
		if (Points >= TierThresholds[Index])
		{
			Tier = Index + 2;
		}
	}
	return Tier;
}

int32 UReputationSubsystem::TierFloor(int32 Tier) const
{
	return Tier >= 2 && TierThresholds.IsValidIndex(Tier - 2) ? TierThresholds[Tier - 2] : 0;
}

int32 UReputationSubsystem::GetReputationPoints(FName Region) const
{
	const FRegionRep* Rep = Regions.Find(Region);
	return Rep ? Rep->Points : 0;
}

int32 UReputationSubsystem::GetReputationTier(FName Region) const
{
	return TierForPoints(GetReputationPoints(Region));
}

void UReputationSubsystem::ExportSaveState(TMap<FName, int32>& OutPoints) const
{
	for (const TPair<FName, FRegionRep>& Pair : Regions)
	{
		OutPoints.Add(Pair.Key, Pair.Value.Points);
	}
}

void UReputationSubsystem::ImportSaveState(const TMap<FName, int32>& InPoints)
{
	Regions.Empty();
	for (const TPair<FName, int32>& Pair : InPoints)
	{
		Regions.Add(Pair.Key).Points = Pair.Value;
	}
}
