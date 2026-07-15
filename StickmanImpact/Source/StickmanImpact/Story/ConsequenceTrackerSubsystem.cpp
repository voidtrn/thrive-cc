// Copyright StickmanImpact Project.

#include "ConsequenceTrackerSubsystem.h"
#include "Dialogue/DialogueManager.h"

void UConsequenceTrackerSubsystem::RecordChoice(FName ChoiceID, FName OptionID)
{
	if (ChoiceID.IsNone() || Choices.Contains(ChoiceID))
	{
		return; // First answer stands — choices are permanent.
	}

	Choices.Add(ChoiceID, OptionID);
	ArmMatchingConsequences(ChoiceID, OptionID);
	OnChoiceRecorded.Broadcast(ChoiceID, OptionID);
}

FName UConsequenceTrackerSubsystem::GetChosenOption(FName ChoiceID) const
{
	const FName* Option = Choices.Find(ChoiceID);
	return Option ? *Option : NAME_None;
}

void UConsequenceTrackerSubsystem::AddFactionAlignment(FName Faction, int32 Delta)
{
	if (Faction.IsNone() || Delta == 0)
	{
		return;
	}

	int32& Score = FactionAlignment.FindOrAdd(Faction);
	const EFactionStanding OldStanding = StandingForScore(Score);
	Score += Delta;
	const EFactionStanding NewStanding = StandingForScore(Score);

	if (NewStanding != OldStanding)
	{
		OnFactionStandingChanged.Broadcast(Faction, NewStanding);
	}
}

int32 UConsequenceTrackerSubsystem::GetFactionAlignment(FName Faction) const
{
	const int32* Score = FactionAlignment.Find(Faction);
	return Score ? *Score : 0;
}

EFactionStanding UConsequenceTrackerSubsystem::GetFactionStanding(FName Faction) const
{
	return StandingForScore(GetFactionAlignment(Faction));
}

EFactionStanding UConsequenceTrackerSubsystem::StandingForScore(int32 Score) const
{
	if (Score <= -50) return EFactionStanding::Hostile;
	if (Score <= -10) return EFactionStanding::Unfriendly;
	if (Score < 10)   return EFactionStanding::Neutral;
	if (Score < 50)   return EFactionStanding::Friendly;
	return EFactionStanding::Allied;
}

void UConsequenceTrackerSubsystem::MarkNPCDead(FName NPCID)
{
	if (NPCID.IsNone() || DeadNPCIDs.Contains(NPCID))
	{
		return;
	}
	DeadNPCIDs.Add(NPCID);
	OnNPCDeathMarked.Broadcast(NPCID);
}

void UConsequenceTrackerSubsystem::RegisterDeferredConsequence(const FDeferredConsequence& Rule)
{
	// If the choice already happened, arm (or fire) immediately.
	const FName* Option = Choices.Find(Rule.ChoiceID);
	if (Option && *Option == Rule.RequiredOptionID)
	{
		ArmedConsequences.Add({ Rule, Rule.DelayGameHours });
	}
	else if (!Option)
	{
		PendingRules.Add(Rule);
	}
	// Choice made with a different option: rule can never fire — dropped.
}

void UConsequenceTrackerSubsystem::ArmMatchingConsequences(FName ChoiceID, FName OptionID)
{
	for (int32 Index = PendingRules.Num() - 1; Index >= 0; --Index)
	{
		if (PendingRules[Index].ChoiceID != ChoiceID)
		{
			continue;
		}
		if (PendingRules[Index].RequiredOptionID == OptionID)
		{
			ArmedConsequences.Add({ PendingRules[Index], PendingRules[Index].DelayGameHours });
		}
		PendingRules.RemoveAt(Index); // Either armed or unreachable now.
	}
}

void UConsequenceTrackerSubsystem::NotifyGameHoursPassed(float Hours)
{
	if (Hours <= 0.f)
	{
		return;
	}

	for (int32 Index = ArmedConsequences.Num() - 1; Index >= 0; --Index)
	{
		FArmedConsequence& Armed = ArmedConsequences[Index];
		Armed.HoursRemaining -= Hours;
		if (Armed.HoursRemaining > 0.f)
		{
			continue;
		}

		if (UDialogueManager* Dialogue = GetGameInstance()->GetSubsystem<UDialogueManager>())
		{
			Dialogue->SetStoryFlag(Armed.Rule.ConsequenceFlag);
		}
		OnConsequenceTriggered.Broadcast(Armed.Rule.ConsequenceFlag);
		ArmedConsequences.RemoveAt(Index);
	}
}

void UConsequenceTrackerSubsystem::ExportSaveState(TMap<FName, FName>& OutChoices,
	TMap<FName, int32>& OutFactions, TArray<FName>& OutDeadNPCs) const
{
	OutChoices = Choices;
	OutFactions = FactionAlignment;
	OutDeadNPCs = DeadNPCIDs.Array();
}

void UConsequenceTrackerSubsystem::ImportSaveState(const TMap<FName, FName>& InChoices,
	const TMap<FName, int32>& InFactions, const TArray<FName>& InDeadNPCs)
{
	Choices = InChoices;
	FactionAlignment = InFactions;
	DeadNPCIDs = TSet<FName>(InDeadNPCs);
	// Deferred-consequence timers intentionally re-arm from rules registered at startup —
	// a consequence lost to a reload fires DelayGameHours after the next load instead of
	// never, which errs on the side of the consequence happening.
}
