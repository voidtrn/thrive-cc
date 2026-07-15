// Copyright StickmanImpact Project.

#include "StickmanDialogueTriggerComponent.h"
#include "Dialogue/DialogueManager.h"
#include "Party/PartyManager.h"
#include "World/DayNightManager.h"
#include "World/WeatherManager.h"
#include "Kismet/GameplayStatics.h"

UDialogueSequence* UStickmanDialogueTriggerComponent::SelectContextDialogue() const
{
	const UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr;
	if (!GameInstance)
	{
		return DialogueToPlay;
	}

	const UDialogueManager* Dialogue = GameInstance->GetSubsystem<UDialogueManager>();
	const UWeatherManager* Weather = GameInstance->GetSubsystem<UWeatherManager>();
	const UPartyManager* Party = GameInstance->GetSubsystem<UPartyManager>();
	const ADayNightManager* DayNight = Cast<ADayNightManager>(
		UGameplayStatics::GetActorOfClass(this, ADayNightManager::StaticClass()));

	for (const FNPCDialogueVariant& Variant : Variants)
	{
		if (!Variant.Sequence)
		{
			continue;
		}
		if (Variant.RequiredStoryFlag.IsValid() && (!Dialogue || !Dialogue->HasStoryFlag(Variant.RequiredStoryFlag)))
		{
			continue;
		}
		if (Variant.bOnlyAtNight && (!DayNight || !DayNight->IsNight()))
		{
			continue;
		}
		if (Variant.bOnlyInRain && (!Weather
				|| (Weather->GetCurrentWeather() != EStickmanWeatherType::Rain
					&& Weather->GetCurrentWeather() != EStickmanWeatherType::Storm)))
		{
			continue;
		}
		if (InteractionCount < Variant.MinPreviousInteractions)
		{
			continue;
		}
		if (!Variant.RequiredActiveCharacterID.IsEmpty()
			&& (!Party || Party->GetActiveMember().CharacterData.CharacterID != Variant.RequiredActiveCharacterID))
		{
			continue;
		}
		return Variant.Sequence; // First match (top-down priority) wins.
	}
	return DialogueToPlay;
}

void UStickmanDialogueTriggerComponent::Interact_Implementation(AActor* Instigator)
{
	UDialogueSequence* Selected = SelectContextDialogue();
	if (!Selected)
	{
		return;
	}

	++InteractionCount; // NPC memory: they remember how often you've talked.

	if (UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr)
	{
		if (UDialogueManager* DialogueManager = GameInstance->GetSubsystem<UDialogueManager>())
		{
			DialogueManager->StartDialogue(Selected);
		}
	}
}
