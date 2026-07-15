// Copyright StickmanImpact Project.

#include "CharacterBondSubsystem.h"
#include "Quest/QuestManager.h"
#include "Party/PartyManager.h"

void UCharacterBondSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);

	Collection.InitializeDependency<UQuestManager>();
	Collection.InitializeDependency<UPartyManager>();

	if (UQuestManager* Quests = GetGameInstance()->GetSubsystem<UQuestManager>())
	{
		Quests->OnQuestCompleted.AddDynamic(this, &UCharacterBondSubsystem::HandleQuestCompleted);
	}

	// FTSTicker instead of a world timer: GameInstance subsystems outlive level loads.
	ActivePlayTickerHandle = FTSTicker::GetCoreTicker().AddTicker(FTickerDelegate::CreateWeakLambda(this,
		[this](float DeltaTime)
	{
		CreditActiveCharacter(EBondXPSource::ActivePlay);
		return true;
	}), 60.f);
}

void UCharacterBondSubsystem::Deinitialize()
{
	FTSTicker::GetCoreTicker().RemoveTicker(ActivePlayTickerHandle);
	Super::Deinitialize();
}

void UCharacterBondSubsystem::HandleQuestCompleted(UQuestDataAsset* Quest)
{
	CreditActiveCharacter(EBondXPSource::QuestCompleted);
}

void UCharacterBondSubsystem::CreditActiveCharacter(EBondXPSource Source)
{
	if (const UPartyManager* Party = GetGameInstance()->GetSubsystem<UPartyManager>())
	{
		AddBondXP(Party->GetActiveMember().CharacterData.CharacterID, Source);
	}
}

void UCharacterBondSubsystem::AddBondXP(const FString& CharacterID, EBondXPSource Source)
{
	if (CharacterID.IsEmpty())
	{
		return;
	}

	const int32* Amount = XPPerSource.Find(Source);
	if (!Amount || *Amount <= 0)
	{
		return;
	}

	int32& XP = BondXP.FindOrAdd(CharacterID);
	const int32 OldLevel = LevelForXP(XP);
	XP += *Amount;
	const int32 NewLevel = LevelForXP(XP);

	if (NewLevel > OldLevel)
	{
		OnBondLevelUp.Broadcast(CharacterID, NewLevel);
		for (int32 UnlockLevel : UnlockLevels)
		{
			if (UnlockLevel > OldLevel && UnlockLevel <= NewLevel)
			{
				OnBondUnlock.Broadcast(CharacterID, UnlockLevel);
			}
		}
	}
}

int32 UCharacterBondSubsystem::LevelForXP(int32 XP) const
{
	int32 Level = 1;
	for (int32 Index = 0; Index < LevelThresholds.Num(); ++Index)
	{
		if (XP >= LevelThresholds[Index])
		{
			Level = Index + 2;
		}
	}
	return Level;
}

int32 UCharacterBondSubsystem::GetBondLevel(const FString& CharacterID) const
{
	const int32* XP = BondXP.Find(CharacterID);
	return LevelForXP(XP ? *XP : 0);
}

int32 UCharacterBondSubsystem::GetBondXP(const FString& CharacterID) const
{
	const int32* XP = BondXP.Find(CharacterID);
	return XP ? *XP : 0;
}

float UCharacterBondSubsystem::GetBondPassiveScale(const FString& CharacterID) const
{
	return GetBondLevel(CharacterID) >= 7 ? PassiveBuffScale : 1.f;
}
