// Copyright StickmanImpact Project.

#include "FactionSubsystem.h"

EFactionRepTier UFactionSubsystem::TierForScore(int32 Score) const
{
	if (Score <= -50) return EFactionRepTier::Hated;
	if (Score <= -10) return EFactionRepTier::Hostile;
	if (Score < 10)   return EFactionRepTier::Neutral;
	if (Score < 50)   return EFactionRepTier::Friendly;
	if (Score < 80)   return EFactionRepTier::Honored;
	if (Score < 100)  return EFactionRepTier::Revered;
	return EFactionRepTier::Exalted;
}

void UFactionSubsystem::AddReputation(EFaction Faction, int32 Delta)
{
	if (Delta == 0)
	{
		return;
	}
	int32& Score = Reputation.FindOrAdd(Faction);
	const EFactionRepTier OldTier = TierForScore(Score);
	Score = FMath::Clamp(Score + Delta, -100, 100);
	const EFactionRepTier NewTier = TierForScore(Score);
	if (NewTier != OldTier)
	{
		OnFactionRepTierChanged.Broadcast(Faction, NewTier);
	}
}

int32 UFactionSubsystem::GetReputation(EFaction Faction) const
{
	const int32* Score = Reputation.Find(Faction);
	return Score ? *Score : 0;
}

EFactionRepTier UFactionSubsystem::GetRepTier(EFaction Faction) const
{
	return TierForScore(GetReputation(Faction));
}

bool UFactionSubsystem::IsHostile(EFaction Faction) const
{
	const EFactionRepTier Tier = GetRepTier(Faction);
	return Tier == EFactionRepTier::Hated || Tier == EFactionRepTier::Hostile;
}

// ---------------------------------------------------------------- territory -----------

void UFactionSubsystem::SetTerritoryController(FName Region, EFaction Faction)
{
	FTerritory& Territory = Territories.FindOrAdd(Region);
	if (Territory.Controller != Faction)
	{
		Territory.Controller = Faction;
		Territory.Influence.FindOrAdd(Faction) = 1.f;
		OnTerritoryControlChanged.Broadcast(Region, Faction);
	}
}

EFaction UFactionSubsystem::GetTerritoryController(FName Region) const
{
	const FTerritory* Territory = Territories.Find(Region);
	return Territory ? Territory->Controller : EFaction::AdventurersGuild;
}

float UFactionSubsystem::GetTerritoryInfluence(FName Region, EFaction Faction) const
{
	const FTerritory* Territory = Territories.Find(Region);
	if (!Territory)
	{
		return 0.f;
	}
	const float* Influence = Territory->Influence.Find(Faction);
	return Influence ? *Influence : 0.f;
}

void UFactionSubsystem::ShiftTerritoryInfluence(FName Region, EFaction Faction, float Delta)
{
	FTerritory& Territory = Territories.FindOrAdd(Region);
	float& Influence = Territory.Influence.FindOrAdd(Faction);
	Influence = FMath::Clamp(Influence + Delta, 0.f, 1.f);

	// The faction with the most influence controls the region; flipping fires the delegate.
	EFaction Leader = Territory.Controller;
	float Best = -1.f;
	for (const TPair<EFaction, float>& Pair : Territory.Influence)
	{
		if (Pair.Value > Best)
		{
			Best = Pair.Value;
			Leader = Pair.Key;
		}
	}
	if (Leader != Territory.Controller && Best >= 0.5f)
	{
		Territory.Controller = Leader;
		OnTerritoryControlChanged.Broadcast(Region, Leader);
	}
}

// ---------------------------------------------------------------- bounty --------------

void UFactionSubsystem::AddBounty(EFaction Faction, int32 Stars)
{
	if (Stars <= 0)
	{
		return;
	}
	int32& Bounty = Bounties.FindOrAdd(Faction);
	Bounty = FMath::Clamp(Bounty + Stars, 0, 5);
	// A crime also costs standing with that faction.
	AddReputation(Faction, -Stars * 5);
	OnBountyChanged.Broadcast(Faction, Bounty);
}

int32 UFactionSubsystem::GetBounty(EFaction Faction) const
{
	const int32* Bounty = Bounties.Find(Faction);
	return Bounty ? *Bounty : 0;
}

void UFactionSubsystem::ClearBounty(EFaction Faction)
{
	if (Bounties.Contains(Faction))
	{
		Bounties[Faction] = 0;
		OnBountyChanged.Broadcast(Faction, 0);
	}
}

// ---------------------------------------------------------------- save ----------------

void UFactionSubsystem::ExportSaveState(TMap<EFaction, int32>& OutRep, TMap<FName, EFaction>& OutTerritory, TMap<EFaction, int32>& OutBounty) const
{
	OutRep = Reputation;
	OutBounty = Bounties;
	OutTerritory.Empty();
	for (const TPair<FName, FTerritory>& Pair : Territories)
	{
		OutTerritory.Add(Pair.Key, Pair.Value.Controller);
	}
}

void UFactionSubsystem::ImportSaveState(const TMap<EFaction, int32>& InRep, const TMap<FName, EFaction>& InTerritory, const TMap<EFaction, int32>& InBounty)
{
	Reputation = InRep;
	Bounties = InBounty;
	Territories.Empty();
	for (const TPair<FName, EFaction>& Pair : InTerritory)
	{
		SetTerritoryController(Pair.Key, Pair.Value);
	}
}
