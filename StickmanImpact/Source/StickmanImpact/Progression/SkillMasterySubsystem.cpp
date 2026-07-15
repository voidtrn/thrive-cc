// Copyright StickmanImpact Project.

#include "SkillMasterySubsystem.h"

void USkillMasterySubsystem::RegisterSkillUse(FGameplayTag SkillTag)
{
	if (!SkillTag.IsValid())
	{
		return;
	}

	FSkillMasteryState& State = MasteryStates.FindOrAdd(SkillTag);
	if (State.Level >= MaxLevel || State.bAwaitingChallenge)
	{
		return;
	}

	++State.UsesThisLevel;
	const int32 CurveIndex = FMath::Clamp(State.Level - 1, 0, UsesPerLevel.Num() - 1);
	if (UsesPerLevel.IsValidIndex(CurveIndex) && State.UsesThisLevel < UsesPerLevel[CurveIndex])
	{
		return;
	}

	const int32 NextLevel = State.Level + 1;
	if (ChallengeGatedLevels.Contains(NextLevel))
	{
		State.bAwaitingChallenge = true;
		OnMasteryChallengeIssued.Broadcast(SkillTag, NextLevel);
		return;
	}

	GrantLevel(SkillTag, State);
}

void USkillMasterySubsystem::GrantLevel(FGameplayTag SkillTag, FSkillMasteryState& State)
{
	State.Level = FMath::Min(State.Level + 1, MaxLevel);
	State.UsesThisLevel = 0;
	State.bAwaitingChallenge = false;

	OnMasteryLevelUp.Broadcast(SkillTag, State.Level);
	if (State.Level >= MaxLevel)
	{
		OnSkillAwakened.Broadcast(SkillTag);
	}
}

void USkillMasterySubsystem::CompleteMasteryChallenge(FGameplayTag SkillTag)
{
	FSkillMasteryState* State = MasteryStates.Find(SkillTag);
	if (State && State->bAwaitingChallenge)
	{
		GrantLevel(SkillTag, *State);
	}
}

int32 USkillMasterySubsystem::GetMasteryLevel(FGameplayTag SkillTag) const
{
	const FSkillMasteryState* State = MasteryStates.Find(SkillTag);
	return State ? State->Level : 1;
}

float USkillMasterySubsystem::GetMasteryDamageMultiplier(FGameplayTag SkillTag) const
{
	return 1.f + DamagePerLevel * (GetMasteryLevel(SkillTag) - 1);
}

FSkillMasteryState USkillMasterySubsystem::GetMasteryState(FGameplayTag SkillTag) const
{
	const FSkillMasteryState* State = MasteryStates.Find(SkillTag);
	return State ? *State : FSkillMasteryState();
}
