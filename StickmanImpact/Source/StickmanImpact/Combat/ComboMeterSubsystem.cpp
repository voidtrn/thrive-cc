// Copyright StickmanImpact Project.

#include "ComboMeterSubsystem.h"
#include "AI/AdaptiveDifficultySubsystem.h"
#include "Party/PartyManager.h"
#include "Character/StickmanCharacter.h"
#include "Combat/StickmanAbilitySystemComponent.h"
#include "Kismet/GameplayStatics.h"
#include "TimerManager.h"

void UComboMeterSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);

	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimerForNextTick([this]()
		{
			if (UPartyManager* Party = GetGameInstance()->GetSubsystem<UPartyManager>())
			{
				Party->OnPartySwitched.AddDynamic(this, &UComboMeterSubsystem::HandlePartySwitched);
			}
		});
	}
}

void UComboMeterSubsystem::RegisterHit(FGameplayTag SkillTag)
{
	++HitCount;

	// Learning-AI input: track which skills the player leans on.
	if (UAdaptiveDifficultySubsystem* Difficulty = GetGameInstance()->GetSubsystem<UAdaptiveDifficultySubsystem>())
	{
		Difficulty->RecordPlayerSkillUse(SkillTag);
	}

	// Style: variety over mashing — first use of a skill this combo is worth 3, repeats 1.
	const FString TagString = SkillTag.IsValid() ? SkillTag.ToString() : TEXT("Untagged");
	bool bAlreadyUsed = false;
	SkillsUsedThisCombo.Add(TagString, &bAlreadyUsed);
	StylePoints += bAlreadyUsed ? 1 : 3;

	RecalculateRank();

	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimer(DecayTimerHandle, this, &UComboMeterSubsystem::DecayCombo,
			ComboDecaySeconds, false);
	}
}

void UComboMeterSubsystem::RecalculateRank()
{
	EComboRank NewRank = EComboRank::None;
	for (int32 Index = 0; Index < RankThresholds.Num(); ++Index)
	{
		if (StylePoints >= RankThresholds[Index])
		{
			NewRank = static_cast<EComboRank>(Index + 1); // D..SS
		}
	}
	if (NewRank != CurrentRank)
	{
		CurrentRank = NewRank;
		OnComboRankChanged.Broadcast(CurrentRank, StylePoints);
	}
}

void UComboMeterSubsystem::DecayCombo()
{
	HitCount = 0;
	StylePoints = 0;
	SkillsUsedThisCombo.Reset();
	CurrentRank = EComboRank::None;
	bElementalTagBonusArmed = false;
	OnComboDropped.Broadcast();
	OnComboRankChanged.Broadcast(CurrentRank, 0);
}

float UComboMeterSubsystem::ConsumeDamageMultiplier()
{
	float Multiplier = 1.f + DamageBonusPerRank * static_cast<int32>(CurrentRank);
	if (bElementalTagBonusArmed)
	{
		Multiplier += ElementalTagBonus;
		bElementalTagBonusArmed = false; // One-shot: the tag attack itself gets the bonus.
	}
	return Multiplier;
}

void UComboMeterSubsystem::HandlePartySwitched(int32 NewIndex, int32 OldIndex)
{
	if (HitCount == 0)
	{
		return; // Not mid-combo — plain switch.
	}

	// Tag combo: keep the combo alive and auto-fire the incoming character's first attack.
	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimer(DecayTimerHandle, this, &UComboMeterSubsystem::DecayCombo,
			ComboDecaySeconds, false);
	}

	const UPartyManager* Party = GetGameInstance()->GetSubsystem<UPartyManager>();
	if (Party && Party->GetPartyMembers().IsValidIndex(NewIndex) && Party->GetPartyMembers().IsValidIndex(OldIndex)
		&& Party->GetPartyMembers()[NewIndex].CharacterData.Element
			!= Party->GetPartyMembers()[OldIndex].CharacterData.Element)
	{
		bElementalTagBonusArmed = true; // Different element = bonus on the tag attack.
	}

	if (AStickmanCharacter* Player = Cast<AStickmanCharacter>(UGameplayStatics::GetPlayerPawn(this, 0)))
	{
		if (UStickmanAbilitySystemComponent* ASC = Player->GetStickmanAbilitySystemComponent())
		{
			ASC->ActivateOrQueueComboSkill(Player->GetNormalAttackSkillTag()); // The tag attack.
		}
	}
}
