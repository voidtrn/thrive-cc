// Copyright StickmanImpact Project.

#include "PvPArenaSubsystem.h"

void UPvPArenaSubsystem::BeginMatch(EPvPMode Mode)
{
	bMatchActive = true;
	ActiveMode = Mode;
	BannedByTeamA.Empty();
	BannedByTeamB.Empty();
}

void UPvPArenaSubsystem::EndMatch(bool bWon)
{
	if (!bMatchActive)
	{
		return;
	}
	bMatchActive = false;

	if (ActiveMode == EPvPMode::Ranked)
	{
		UpdateElo(bWon);
		bPlayedRankedThisWeek = true;
		++PlacementMatchesPlayed;
	}

	// Arena tokens: win more, lose less; streak bonus.
	WinStreak = bWon ? WinStreak + 1 : 0;
	ArenaTokens += (bWon ? 50 : 20) + FMath::Min(WinStreak * 5, 25);

	OnPvPMatchEnded.Broadcast(bWon);
}

// ---------------------------------------------------------------- ban/pick ------------

bool UPvPArenaSubsystem::BanCharacter(const FString& CharacterID, bool bTeamA)
{
	TSet<FString>& Bans = bTeamA ? BannedByTeamA : BannedByTeamB;
	if (Bans.Num() >= 2 || IsCharacterBanned(CharacterID)) // 2 bans per team
	{
		return false;
	}
	Bans.Add(CharacterID);
	return true;
}

bool UPvPArenaSubsystem::IsCharacterBanned(const FString& CharacterID) const
{
	return BannedByTeamA.Contains(CharacterID) || BannedByTeamB.Contains(CharacterID);
}

// ---------------------------------------------------------------- rating --------------

void UPvPArenaSubsystem::UpdateElo(bool bWon)
{
	// Solo-queue Elo vs an implied equal opponent (real opponent ratings come with the
	// match service); placements move double.
	const float Expected = 0.5f;
	const float Score = bWon ? 1.f : 0.f;
	const int32 K = IsInPlacements() ? EloK * 2 : EloK;
	Rating = FMath::Max(0, Rating + FMath::RoundToInt(K * (Score - Expected)));
	OnPvPRatingChanged.Broadcast(Rating, GetTier());
}

EPvPTier UPvPArenaSubsystem::GetTier() const
{
	if (Rating >= 2600) return EPvPTier::Celestial;
	if (Rating >= 2400) return EPvPTier::Grandmaster;
	if (Rating >= 2200) return EPvPTier::Master;
	if (Rating >= 2000) return EPvPTier::Diamond;
	if (Rating >= 1800) return EPvPTier::Platinum;
	if (Rating >= 1500) return EPvPTier::Gold;
	if (Rating >= 1200) return EPvPTier::Silver;
	if (Rating >= 900)  return EPvPTier::Bronze;
	return EPvPTier::Iron;
}

void UPvPArenaSubsystem::ApplyWeeklyDecay()
{
	if (!bPlayedRankedThisWeek && !IsInPlacements())
	{
		Rating = FMath::Max(0, Rating - WeeklyDecayAmount);
		OnPvPRatingChanged.Broadcast(Rating, GetTier());
	}
	bPlayedRankedThisWeek = false;
}

// ---------------------------------------------------------------- tokens --------------

bool UPvPArenaSubsystem::SpendArenaTokens(int32 Amount)
{
	if (Amount <= 0 || ArenaTokens < Amount)
	{
		return false;
	}
	ArenaTokens -= Amount;
	return true;
}

// ---------------------------------------------------------------- save ----------------

void UPvPArenaSubsystem::ExportSaveState(int32& OutRating, int32& OutTokens, int32& OutPlacements) const
{
	OutRating = Rating;
	OutTokens = ArenaTokens;
	OutPlacements = PlacementMatchesPlayed;
}

void UPvPArenaSubsystem::ImportSaveState(int32 InRating, int32 InTokens, int32 InPlacements)
{
	Rating = InRating;
	ArenaTokens = InTokens;
	PlacementMatchesPlayed = InPlacements;
}
