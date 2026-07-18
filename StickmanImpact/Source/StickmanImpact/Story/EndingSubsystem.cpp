// Copyright StickmanImpact Project.

#include "EndingSubsystem.h"
#include "Dialogue/DialogueManager.h"

void UEndingSubsystem::AddEndingPoints(const FString& SourceDescription, int32 Delta)
{
	if (bEndingLocked || Delta == 0)
	{
		return;
	}

	EndingScore = FMath::Clamp(EndingScore + Delta, 0, 100);
	ChoiceLog.Add(FString::Printf(TEXT("%s (%+d)"), *SourceDescription, Delta));
	OnEndingScoreChanged.Broadcast(EndingScore, GetProjectedEnding());
}

bool UEndingSubsystem::AreTrueEndingConditionsMet() const
{
	if (TrueEndingRequiredFlags.Num() == 0)
	{
		return false; // the secret always needs authored flags
	}
	const UDialogueManager* Dialogue = GetGameInstance()->GetSubsystem<UDialogueManager>();
	if (!Dialogue)
	{
		return false;
	}
	for (const FGameplayTag& Flag : TrueEndingRequiredFlags)
	{
		if (!Dialogue->HasStoryFlag(Flag))
		{
			return false;
		}
	}
	return true;
}

EGameEnding UEndingSubsystem::GetProjectedEnding() const
{
	if (bEndingLocked)
	{
		return LockedEnding;
	}
	if (EndingScore <= 20) return EGameEnding::FallenHero;
	if (EndingScore <= 40) return EGameEnding::LoneSurvivor;
	if (EndingScore <= 60) return EGameEnding::Balance;
	if (EndingScore <= 80) return EGameEnding::HerosLegacy;
	// 81-100: True Savior only with the secret sequence; otherwise the good ending.
	return AreTrueEndingConditionsMet() ? EGameEnding::TrueSavior : EGameEnding::HerosLegacy;
}

EGameEnding UEndingSubsystem::LockEnding()
{
	if (!bEndingLocked)
	{
		LockedEnding = GetProjectedEnding();
		bEndingLocked = true;
		SeenEndings.Add(LockedEnding);
		OnEndingLocked.Broadcast(LockedEnding);
	}
	return LockedEnding;
}

void UEndingSubsystem::ExportSaveState(int32& OutScore, TArray<FString>& OutLog, TArray<EGameEnding>& OutSeen) const
{
	OutScore = EndingScore;
	OutLog = ChoiceLog;
	OutSeen = SeenEndings.Array();
}

void UEndingSubsystem::ImportSaveState(int32 InScore, const TArray<FString>& InLog, const TArray<EGameEnding>& InSeen)
{
	EndingScore = InScore;
	ChoiceLog = InLog;
	SeenEndings = TSet<EGameEnding>(InSeen);
}
