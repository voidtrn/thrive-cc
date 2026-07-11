// Copyright StickmanImpact Project.

#include "StickmanDialogueTriggerComponent.h"
#include "Dialogue/DialogueManager.h"

void UStickmanDialogueTriggerComponent::Interact_Implementation(AActor* Instigator)
{
	if (!DialogueToPlay)
	{
		return;
	}

	if (UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr)
	{
		if (UDialogueManager* DialogueManager = GameInstance->GetSubsystem<UDialogueManager>())
		{
			DialogueManager->StartDialogue(DialogueToPlay);
		}
	}
}
