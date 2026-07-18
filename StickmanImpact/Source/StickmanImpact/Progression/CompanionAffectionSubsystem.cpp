// Copyright StickmanImpact Project.

#include "CompanionAffectionSubsystem.h"

EAffectionMilestone UCompanionAffectionSubsystem::MilestoneForValue(int32 Value)
{
	if (Value >= 100) return EAffectionMilestone::SoulBond;
	if (Value >= 81)  return EAffectionMilestone::Beloved;
	if (Value >= 61)  return EAffectionMilestone::CloseFriend;
	if (Value >= 41)  return EAffectionMilestone::Friend;
	if (Value >= 21)  return EAffectionMilestone::Acquaintance;
	return EAffectionMilestone::Stranger;
}

// ---------------------------------------------------------------- affection -----------

void UCompanionAffectionSubsystem::AddAffection(const FString& CharacterID, int32 Amount)
{
	if (CharacterID.IsEmpty() || Amount == 0)
	{
		return;
	}

	FCompanionState& Companion = State(CharacterID);
	const EAffectionMilestone OldMilestone = MilestoneForValue(Companion.Affection);
	const int32 OldQuestPart = GetUnlockedQuestPart(CharacterID);

	Companion.Affection = FMath::Clamp(Companion.Affection + Amount, 0, 100);

	const EAffectionMilestone NewMilestone = MilestoneForValue(Companion.Affection);
	if (NewMilestone != OldMilestone)
	{
		OnAffectionMilestone.Broadcast(CharacterID, NewMilestone);
	}
	const int32 NewQuestPart = GetUnlockedQuestPart(CharacterID);
	if (NewQuestPart > OldQuestPart)
	{
		OnPersonalQuestUnlocked.Broadcast(CharacterID, NewQuestPart);
	}
}

int32 UCompanionAffectionSubsystem::GetAffection(const FString& CharacterID) const
{
	const FCompanionState* Companion = FindState(CharacterID);
	return Companion ? Companion->Affection : 0;
}

EAffectionMilestone UCompanionAffectionSubsystem::GetMilestone(const FString& CharacterID) const
{
	return MilestoneForValue(GetAffection(CharacterID));
}

// ---------------------------------------------------------------- gifts ---------------

void UCompanionAffectionSubsystem::SetGiftPreference(const FString& CharacterID, FName ItemCategory, float Multiplier)
{
	State(CharacterID).GiftPreferences.Add(ItemCategory, Multiplier);
}

void UCompanionAffectionSubsystem::GiveGift(const FString& CharacterID, FName ItemCategory, int32 BaseAffection)
{
	float Multiplier = 1.f;
	if (const float* Preference = State(CharacterID).GiftPreferences.Find(ItemCategory))
	{
		Multiplier = *Preference;
	}
	AddAffection(CharacterID, FMath::RoundToInt(BaseAffection * Multiplier));
}

// ---------------------------------------------------------------- personal quests -----

int32 UCompanionAffectionSubsystem::GetUnlockedQuestPart(const FString& CharacterID) const
{
	const int32 Affection = GetAffection(CharacterID);
	if (Affection >= 100) return 5;
	if (Affection >= 80)  return 4;
	if (Affection >= 60)  return 3;
	if (Affection >= 40)  return 2;
	if (Affection >= 20)  return 1;
	return 0;
}

void UCompanionAffectionSubsystem::MarkQuestPartCompleted(const FString& CharacterID, int32 Part)
{
	FCompanionState& Companion = State(CharacterID);
	Companion.CompletedQuestPart = FMath::Max(Companion.CompletedQuestPart, FMath::Clamp(Part, 0, 5));
}

int32 UCompanionAffectionSubsystem::GetCompletedQuestPart(const FString& CharacterID) const
{
	const FCompanionState* Companion = FindState(CharacterID);
	return Companion ? Companion->CompletedQuestPart : 0;
}

// ---------------------------------------------------------------- romance -------------

void UCompanionAffectionSubsystem::SetRomanceable(const FString& CharacterID, bool bRomanceable, bool bAcceptsPolyamory)
{
	FCompanionState& Companion = State(CharacterID);
	Companion.bRomanceable = bRomanceable;
	Companion.bAcceptsPolyamory = bAcceptsPolyamory;
}

void UCompanionAffectionSubsystem::ExpressRomanticInterest(const FString& CharacterID)
{
	State(CharacterID).bInterestExpressed = true;
}

bool UCompanionAffectionSubsystem::TryConfess(const FString& CharacterID)
{
	FCompanionState& Companion = State(CharacterID);
	if (!Companion.bRomanceable || !Companion.bInterestExpressed
		|| Companion.Affection < 80 || Companion.CompletedQuestPart < 4
		|| Companion.Romance == ERomanceState::Confessed)
	{
		return false;
	}

	// Jealousy: an active partner who doesn't accept polyamory loses affection and the new
	// confession still proceeds (the drama is the point) — unless THIS companion refuses
	// polyamory while another romance is active, in which case they decline.
	for (TPair<FString, FCompanionState>& Pair : Companions)
	{
		if (Pair.Key == CharacterID || Pair.Value.Romance != ERomanceState::Confessed)
		{
			continue;
		}
		if (!Companion.bAcceptsPolyamory)
		{
			return false; // this companion won't share
		}
		if (!Pair.Value.bAcceptsPolyamory)
		{
			Pair.Value.Affection = FMath::Max(Pair.Value.Affection - 20, 0);
			OnAffectionMilestone.Broadcast(Pair.Key, MilestoneForValue(Pair.Value.Affection));
		}
	}

	Companion.Romance = ERomanceState::Confessed;
	OnRomanceStateChanged.Broadcast(CharacterID, ERomanceState::Confessed);
	return true;
}

void UCompanionAffectionSubsystem::BreakUp(const FString& CharacterID)
{
	FCompanionState& Companion = State(CharacterID);
	if (Companion.Romance != ERomanceState::Confessed)
	{
		return;
	}
	Companion.Romance = ERomanceState::BrokenUp;
	Companion.Affection = FMath::Max(Companion.Affection - BreakUpAffectionCost, 0);
	OnRomanceStateChanged.Broadcast(CharacterID, ERomanceState::BrokenUp);
}

ERomanceState UCompanionAffectionSubsystem::GetRomanceState(const FString& CharacterID) const
{
	const FCompanionState* Companion = FindState(CharacterID);
	return Companion ? Companion->Romance : ERomanceState::None;
}

// ---------------------------------------------------------------- battle bond ---------

void UCompanionAffectionSubsystem::AddBattleBondXP(const FString& CharacterID, int32 Amount)
{
	if (Amount <= 0)
	{
		return;
	}
	FCompanionState& Companion = State(CharacterID);
	const int32 OldLevel = GetBattleBondLevel(CharacterID);
	Companion.BattleBondXP += Amount;
	const int32 NewLevel = GetBattleBondLevel(CharacterID);
	if (NewLevel > OldLevel)
	{
		OnBattleBondLevelUp.Broadcast(CharacterID, NewLevel);
	}
}

int32 UCompanionAffectionSubsystem::GetBattleBondLevel(const FString& CharacterID) const
{
	const FCompanionState* Companion = FindState(CharacterID);
	if (!Companion)
	{
		return 1;
	}
	int32 Level = 1;
	for (int32 Index = 0; Index < BattleBondXPPerLevel.Num(); ++Index)
	{
		if (Companion->BattleBondXP >= BattleBondXPPerLevel[Index])
		{
			Level = Index + 2;
		}
	}
	return Level;
}

// ---------------------------------------------------------------- save ----------------

void UCompanionAffectionSubsystem::ExportSaveState(TMap<FString, int32>& OutAffection, TMap<FString, int32>& OutQuestParts,
	TMap<FString, uint8>& OutRomance, TMap<FString, int32>& OutBattleBond) const
{
	for (const TPair<FString, FCompanionState>& Pair : Companions)
	{
		OutAffection.Add(Pair.Key, Pair.Value.Affection);
		OutQuestParts.Add(Pair.Key, Pair.Value.CompletedQuestPart);
		OutRomance.Add(Pair.Key, static_cast<uint8>(Pair.Value.Romance));
		OutBattleBond.Add(Pair.Key, Pair.Value.BattleBondXP);
	}
}

void UCompanionAffectionSubsystem::ImportSaveState(const TMap<FString, int32>& InAffection, const TMap<FString, int32>& InQuestParts,
	const TMap<FString, uint8>& InRomance, const TMap<FString, int32>& InBattleBond)
{
	for (const TPair<FString, int32>& Pair : InAffection)
	{
		State(Pair.Key).Affection = Pair.Value;
	}
	for (const TPair<FString, int32>& Pair : InQuestParts)
	{
		State(Pair.Key).CompletedQuestPart = Pair.Value;
	}
	for (const TPair<FString, uint8>& Pair : InRomance)
	{
		State(Pair.Key).Romance = static_cast<ERomanceState>(Pair.Value);
	}
	for (const TPair<FString, int32>& Pair : InBattleBond)
	{
		State(Pair.Key).BattleBondXP = Pair.Value;
	}
}
