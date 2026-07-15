// Copyright StickmanImpact Project.

#include "PartyBanterComponent.h"
#include "Dialogue/DialogueManager.h"
#include "Party/PartyManager.h"
#include "Progression/CharacterBondSubsystem.h"
#include "Kismet/GameplayStatics.h"
#include "TimerManager.h"

UPartyBanterComponent::UPartyBanterComponent()
{
	PrimaryComponentTick.bCanEverTick = false;
}

void UPartyBanterComponent::BeginPlay()
{
	Super::BeginPlay();
	ScheduleNext();
}

void UPartyBanterComponent::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
	if (GetWorld())
	{
		GetWorld()->GetTimerManager().ClearTimer(BanterTimerHandle);
	}
	Super::EndPlay(EndPlayReason);
}

void UPartyBanterComponent::ScheduleNext()
{
	const float Delay = FMath::Max(BanterInterval + FMath::FRandRange(-IntervalVariance, IntervalVariance), 10.f);
	GetWorld()->GetTimerManager().SetTimer(BanterTimerHandle, this, &UPartyBanterComponent::TryPlayBanter, Delay, false);
}

void UPartyBanterComponent::TryPlayBanter()
{
	ScheduleNext();

	const UGameInstance* GameInstance = GetOwner()->GetGameInstance();
	if (!GameInstance)
	{
		return;
	}

	// Never talk over real dialogue.
	if (const UDialogueManager* Dialogue = GameInstance->GetSubsystem<UDialogueManager>())
	{
		if (Dialogue->IsDialogueActive())
		{
			return;
		}
	}

	TArray<int32> Eligible;
	for (int32 Index = 0; Index < BanterLines.Num(); ++Index)
	{
		if (IsLineEligible(Index))
		{
			Eligible.Add(Index);
		}
	}
	if (Eligible.Num() == 0)
	{
		return;
	}

	const int32 Chosen = Eligible[FMath::RandRange(0, Eligible.Num() - 1)];
	const FBanterLine& Line = BanterLines[Chosen];

	RecentLineIndices.Add(Chosen);
	while (RecentLineIndices.Num() > RecentLineMemory)
	{
		RecentLineIndices.RemoveAt(0);
	}

	if (Line.VoiceLine)
	{
		UGameplayStatics::PlaySound2D(this, Line.VoiceLine);
	}
	OnBanterPlayed.Broadcast(Line.SpeakerCharacterID, Line.Line);
}

bool UPartyBanterComponent::IsLineEligible(int32 LineIndex) const
{
	if (RecentLineIndices.Contains(LineIndex))
	{
		return false;
	}

	const FBanterLine& Line = BanterLines[LineIndex];
	const UGameInstance* GameInstance = GetOwner()->GetGameInstance();
	if (!GameInstance)
	{
		return false;
	}

	if (const UPartyManager* Party = GameInstance->GetSubsystem<UPartyManager>())
	{
		bool bSpeakerInParty = false;
		for (const FPartyMemberState& Member : Party->GetPartyMembers())
		{
			if (Member.CharacterData.CharacterID == Line.SpeakerCharacterID)
			{
				bSpeakerInParty = true;
				break;
			}
		}
		if (!bSpeakerInParty)
		{
			return false;
		}
	}

	if (Line.RequiredStoryFlag.IsValid())
	{
		const UDialogueManager* Dialogue = GameInstance->GetSubsystem<UDialogueManager>();
		if (!Dialogue || !Dialogue->HasStoryFlag(Line.RequiredStoryFlag))
		{
			return false;
		}
	}

	if (Line.MinBondLevel > 0)
	{
		const UCharacterBondSubsystem* Bonds = GameInstance->GetSubsystem<UCharacterBondSubsystem>();
		if (!Bonds || Bonds->GetBondLevel(Line.SpeakerCharacterID) < Line.MinBondLevel)
		{
			return false;
		}
	}

	return true;
}
