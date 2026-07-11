// Copyright StickmanImpact Project.

#include "DialogueManager.h"
#include "DialogueSequence.h"
#include "Kismet/GameplayStatics.h"

void UDialogueManager::StartDialogue(UDialogueSequence* Sequence)
{
	if (!Sequence || Sequence->Lines.Num() == 0)
	{
		return;
	}

	CurrentSequence = Sequence;
	CurrentLineIndex = INDEX_NONE;

	if (bPauseGameDuringDialogue)
	{
		UGameplayStatics::SetGamePaused(this, true);
	}

	OnDialogueStarted.Broadcast(Sequence);
	AdvanceLine();
}

void UDialogueManager::AdvanceLine()
{
	if (!CurrentSequence)
	{
		return;
	}

	// Apply the flags of the line we're leaving before moving to the next one.
	if (CurrentSequence->Lines.IsValidIndex(CurrentLineIndex))
	{
		for (const FGameplayTag& Flag : CurrentSequence->Lines[CurrentLineIndex].SetFlagsAfter)
		{
			SetStoryFlag(Flag);
		}
	}

	int32 NextIndex = CurrentLineIndex + 1;
	while (CurrentSequence->Lines.IsValidIndex(NextIndex) && !IsLineEligible(CurrentSequence->Lines[NextIndex]))
	{
		++NextIndex; // Skip lines whose RequiredFlags aren't satisfied.
	}

	if (!CurrentSequence->Lines.IsValidIndex(NextIndex))
	{
		PresentChoicesOrEnd();
		return;
	}

	CurrentLineIndex = NextIndex;
	const FDialogueLine& Line = CurrentSequence->Lines[CurrentLineIndex];
	HistoryLog.Add(Line);
	OnDialogueLineChanged.Broadcast(Line);
}

void UDialogueManager::SkipLine()
{
	if (!CurrentSequence || !CurrentSequence->bCanSkip || CurrentSequence->bImportantStory)
	{
		return;
	}
	PresentChoicesOrEnd();
}

void UDialogueManager::PresentChoicesOrEnd()
{
	if (!CurrentSequence)
	{
		return;
	}

	TArray<FDialogueChoice> AvailableChoices;
	for (const FDialogueChoice& Choice : CurrentSequence->Choices)
	{
		if (!Choice.RequiredFlag.IsValid() || HasStoryFlag(Choice.RequiredFlag))
		{
			AvailableChoices.Add(Choice);
			if (AvailableChoices.Num() >= 4)
			{
				break; // Design spec caps branching choices at 4.
			}
		}
	}

	if (AvailableChoices.Num() > 0)
	{
		OnDialogueChoicesPresented.Broadcast(AvailableChoices);
		return;
	}

	EndDialogue();
}

void UDialogueManager::SelectChoice(int32 ChoiceIndex)
{
	if (!CurrentSequence || !CurrentSequence->Choices.IsValidIndex(ChoiceIndex))
	{
		return;
	}

	UDialogueSequence* NextSequence = CurrentSequence->Choices[ChoiceIndex].NextSequence;
	EndDialogue();

	if (NextSequence)
	{
		StartDialogue(NextSequence);
	}
}

void UDialogueManager::EndDialogue()
{
	if (!CurrentSequence)
	{
		return;
	}

	if (!CurrentSequence->SequenceID.IsEmpty())
	{
		PlayedDialogueIDs.Add(CurrentSequence->SequenceID);
	}

	UDialogueSequence* EndedSequence = CurrentSequence;
	CurrentSequence = nullptr;
	CurrentLineIndex = INDEX_NONE;

	if (bPauseGameDuringDialogue)
	{
		UGameplayStatics::SetGamePaused(this, false);
	}

	OnDialogueEnded.Broadcast(EndedSequence);
}

bool UDialogueManager::IsLineEligible(const FDialogueLine& Line) const
{
	for (const FGameplayTag& RequiredFlag : Line.RequiredFlags)
	{
		if (!HasStoryFlag(RequiredFlag))
		{
			return false;
		}
	}
	return true;
}

float UDialogueManager::CalculateDisplayTime(const FDialogueLine& Line) const
{
	if (Line.DisplayTime > 0.f)
	{
		return Line.DisplayTime;
	}
	// ~15 characters/second reading speed, with a floor so short lines don't flash by.
	const int32 CharCount = Line.DialogueText.ToString().Len();
	return FMath::Max(1.5f, CharCount / 15.f);
}

FDialogueLine UDialogueManager::GetCurrentLine() const
{
	if (CurrentSequence && CurrentSequence->Lines.IsValidIndex(CurrentLineIndex))
	{
		return CurrentSequence->Lines[CurrentLineIndex];
	}
	return FDialogueLine();
}

void UDialogueManager::SetStoryFlag(FGameplayTag Flag)
{
	if (Flag.IsValid())
	{
		StoryFlags.AddTag(Flag);
	}
}

void UDialogueManager::ClearStoryFlag(FGameplayTag Flag)
{
	StoryFlags.RemoveTag(Flag);
}

bool UDialogueManager::HasStoryFlag(FGameplayTag Flag) const
{
	return StoryFlags.HasTag(Flag);
}

bool UDialogueManager::HasPlayedDialogue(const FString& SequenceID) const
{
	return PlayedDialogueIDs.Contains(SequenceID);
}

void UDialogueManager::ResetPlayedDialogue(const FString& SequenceID)
{
	PlayedDialogueIDs.Remove(SequenceID);
}

void UDialogueManager::ResetAllPlayedDialogue()
{
	PlayedDialogueIDs.Reset();
}
