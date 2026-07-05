#include "System/DialogueManager.h"
#include "System/OpenWorldGameInstance.h"
#include "System/QuestManager.h"
#include "Engine/DataTable.h"
#include "MyGame.h"

bool UDialogueManager::StartDialogue(UDataTable* DialogueTable, FName StartNodeID)
{
	if (!DialogueTable || IsDialogueActive())
	{
		return false;
	}

	ActiveTable = DialogueTable;
	if (!EnterNode(StartNodeID))
	{
		ActiveTable = nullptr;
		return false;
	}
	return true;
}

bool UDialogueManager::EnterNode(FName NodeID)
{
	const FDialogueNode* Node = ActiveTable->FindRow<FDialogueNode>(NodeID, TEXT("Dialogue"));
	if (!Node)
	{
		UE_LOG(LogAetherRealm, Warning, TEXT("Dialogue node '%s' not found"), *NodeID.ToString());
		return false;
	}

	CurrentNodeID = NodeID;
	CurrentNode = *Node;

	ExecuteActions(Node->Actions);
	OnDialogueNodeChanged.Broadcast(NodeID, CurrentNode);
	return true;
}

void UDialogueManager::Advance()
{
	if (!IsDialogueActive())
	{
		return;
	}

	// Node dengan choices: harus SelectChoice, bukan Advance
	if (GetAvailableChoices().Num() > 0)
	{
		return;
	}

	if (CurrentNode.NextNodeID.IsNone() || !EnterNode(CurrentNode.NextNodeID))
	{
		EndDialogue();
	}
}

void UDialogueManager::SelectChoice(int32 ChoiceIndex)
{
	const TArray<FDialogueChoice> Choices = GetAvailableChoices();
	if (!Choices.IsValidIndex(ChoiceIndex))
	{
		return;
	}

	if (Choices[ChoiceIndex].NextNodeID.IsNone() || !EnterNode(Choices[ChoiceIndex].NextNodeID))
	{
		EndDialogue();
	}
}

void UDialogueManager::EndDialogue()
{
	if (!IsDialogueActive())
	{
		return;
	}
	ActiveTable = nullptr;
	CurrentNodeID = NAME_None;
	OnDialogueEnded.Broadcast();
}

TArray<FDialogueChoice> UDialogueManager::GetAvailableChoices() const
{
	TArray<FDialogueChoice> Result;
	for (const FDialogueChoice& Choice : CurrentNode.Choices)
	{
		if (CheckCondition(Choice.Condition))
		{
			Result.Add(Choice);
		}
	}
	return Result;
}

bool UDialogueManager::CheckCondition(const FDialogueCondition& Condition) const
{
	const UOpenWorldGameInstance* GI = Cast<UOpenWorldGameInstance>(GetGameInstance());
	const UQuestManager* QuestManager = GetGameInstance()->GetSubsystem<UQuestManager>();

	switch (Condition.Type)
	{
	case EDialogueConditionType::None:
		return true;

	case EDialogueConditionType::QuestCompleted:
		return QuestManager && QuestManager->IsQuestCompleted(Condition.TargetID);

	case EDialogueConditionType::QuestActive:
		return QuestManager && QuestManager->IsQuestActive(Condition.TargetID);

	case EDialogueConditionType::HasItem:
	{
		const int32* Count = GI ? GI->InventoryItems.Find(Condition.TargetID) : nullptr;
		return Count && *Count >= Condition.Count;
	}
	}
	return false;
}

void UDialogueManager::ExecuteActions(const TArray<FDialogueAction>& Actions)
{
	UOpenWorldGameInstance* GI = Cast<UOpenWorldGameInstance>(GetGameInstance());
	UQuestManager* QuestManager = GetGameInstance()->GetSubsystem<UQuestManager>();
	if (!GI)
	{
		return;
	}

	for (const FDialogueAction& Action : Actions)
	{
		switch (Action.Type)
		{
		case EDialogueActionType::GiveItem:
			GI->InventoryItems.FindOrAdd(Action.TargetID) += Action.Amount;
			break;

		case EDialogueActionType::TakeItem:
			if (int32* Count = GI->InventoryItems.Find(Action.TargetID))
			{
				*Count = FMath::Max(0, *Count - Action.Amount);
			}
			break;

		case EDialogueActionType::StartQuest:
			if (QuestManager)
			{
				QuestManager->StartQuest(Action.TargetID);
			}
			break;

		case EDialogueActionType::ReportTalkObjective:
			if (QuestManager)
			{
				QuestManager->ReportObjective(EObjectiveType::TalkToNPC, Action.TargetID, Action.Amount);
			}
			break;

		case EDialogueActionType::GivePrimogems:
			GI->Primogems += Action.Amount;
			break;

		case EDialogueActionType::GiveMora:
			GI->Mora += Action.Amount;
			break;

		default:
			break;
		}
	}
}
