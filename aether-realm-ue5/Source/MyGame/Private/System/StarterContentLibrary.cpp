#include "System/StarterContentLibrary.h"
#include "System/QuestTypes.h"
#include "System/DialogueTypes.h"
#include "Engine/DataTable.h"

// ANTISIPASI #8 (CODE_REVIEW.md): disiplin FText + String Table dari awal,
// bukan FText::FromString mentah — biar retrofit localization nanti gak
// mahal. LOCTEXT butuh key unik per literal dalam namespace ini.
#define LOCTEXT_NAMESPACE "StarterContent"

const FName UStarterContentLibrary::Quest1_ID = TEXT("Quest_Prologue01_Tremors");
const FName UStarterContentLibrary::Quest2_ID = TEXT("Quest_Prologue02_Stormchaser");

TArray<UQuestDataAsset*> UStarterContentLibrary::BuildPrologueQuests(UObject* Outer)
{
	UObject* Home = Outer ? Outer : GetTransientPackage();

	// ---------- Quest 1: Tremors in Duskvale ----------
	UQuestDataAsset* Quest1 = NewObject<UQuestDataAsset>(Home);
	Quest1->QuestID = Quest1_ID;
	Quest1->QuestName = LOCTEXT("Quest1_Name", "Tremors in Duskvale");
	Quest1->QuestDescription = LOCTEXT("Quest1_Desc",
		"The ground near Duskvale's old ruins has been trembling for three "
		"nights straight — and each tremor pulses faintly with Resonance. "
		"Investigate before it spreads to the village.");
	Quest1->QuestType = EQuestType::ArchonQuest;
	Quest1->ARRequirement = 1;
	Quest1->bAutoStart = true;

	{
		FQuestStep Step1;
		Step1.StepID = TEXT("GoToTremorSite");
		Step1.StepDescription = LOCTEXT("Quest1_Step1", "Investigate the tremor site.");
		Step1.ObjectiveType = EObjectiveType::GoToLocation;
		Step1.TargetID = TEXT("Prologue_TremorSite");
		Step1.TargetLocation = FVector(2000.f, 1500.f, 200.f); // placeholder — reposisi saat level dibuat
		Step1.RequiredCount = 1;
		Quest1->QuestSteps.Add(Step1);

		FQuestStep Step2;
		Step2.StepID = TEXT("ClearHilichurl");
		Step2.StepDescription = LOCTEXT("Quest1_Step2", "Clear the Hilichurl blocking the ruins.");
		Step2.ObjectiveType = EObjectiveType::KillEnemy;
		Step2.TargetID = TEXT("Hilichurl_Melee");
		Step2.RequiredCount = 3;
		Quest1->QuestSteps.Add(Step2);

		FQuestStep Step3;
		Step3.StepID = TEXT("TalkYukine");
		Step3.StepDescription = LOCTEXT("Quest1_Step3", "Speak with the scholar at the ruins.");
		Step3.ObjectiveType = EObjectiveType::TalkToNPC;
		Step3.TargetID = TEXT("NPC_Yukine");
		Step3.RequiredCount = 1;
		Step3.PreStepDialogueNode = TEXT("Start"); // BP NPC: DialogueManager->StartDialogue(BuildYukineIntroDialogue result, "Start")
		Quest1->QuestSteps.Add(Step3);
	}

	Quest1->Rewards.Primogems = 60;
	Quest1->Rewards.Mora = 1000;
	Quest1->Rewards.ARExp = 100;

	// ---------- Quest 2: The Stormchaser's Warning ----------
	UQuestDataAsset* Quest2 = NewObject<UQuestDataAsset>(Home);
	Quest2->QuestID = Quest2_ID;
	Quest2->QuestName = LOCTEXT("Quest2_Name", "The Stormchaser's Warning");
	Quest2->QuestDescription = LOCTEXT("Quest2_Desc",
		"Yukine's notes point to a cracked Vision shard near the tremor site — "
		"and to someone else already tracking the same disturbance: Shiden.");
	Quest2->QuestType = EQuestType::ArchonQuest;
	Quest2->Prerequisites.Add(Quest1_ID);
	Quest2->ARRequirement = 2;
	Quest2->bAutoStart = true; // TryAutoStartQuests re-checks prereqs saat Quest1 selesai

	{
		FQuestStep Step1;
		Step1.StepID = TEXT("CollectShard");
		Step1.StepDescription = LOCTEXT("Quest2_Step1", "Recover the cracked Vision shard.");
		Step1.ObjectiveType = EObjectiveType::CollectItem;
		Step1.TargetID = TEXT("Item_CrackedVisionShard");
		Step1.RequiredCount = 1;
		Quest2->QuestSteps.Add(Step1);

		FQuestStep Step2;
		Step2.StepID = TEXT("TalkShiden");
		Step2.StepDescription = LOCTEXT("Quest2_Step2", "Report your findings to Shiden.");
		Step2.ObjectiveType = EObjectiveType::TalkToNPC;
		Step2.TargetID = TEXT("NPC_Shiden");
		Step2.RequiredCount = 1;
		Step2.PreStepDialogueNode = TEXT("Start"); // BP NPC: DialogueManager->StartDialogue(BuildShidenIntroDialogue result, "Start")
		Quest2->QuestSteps.Add(Step2);
	}

	Quest2->Rewards.Primogems = 60;
	Quest2->Rewards.Mora = 1200;
	Quest2->Rewards.ARExp = 120;

	return { Quest1, Quest2 };
}

UDataTable* UStarterContentLibrary::BuildYukineIntroDialogue(UObject* Outer)
{
	UDataTable* Table = NewObject<UDataTable>(Outer ? Outer : GetTransientPackage());
	Table->RowStruct = FDialogueNode::StaticStruct();

	FDialogueNode Start;
	Start.SpeakerName = LOCTEXT("Yukine_SpeakerName", "Yukine");
	Start.bPortraitLeft = true;
	Start.DialogueText = LOCTEXT("Yukine_Start",
		"...Another tremor. The Resonance here isn't settling — it's fraying, "
		"like a thread pulled too tight. You felt it too, didn't you?");

	FDialogueChoice ChoiceAsk;
	ChoiceAsk.ChoiceText = LOCTEXT("Yukine_Choice_Ask", "What do you mean, \"fraying\"?");
	ChoiceAsk.NextNodeID = TEXT("Explain");
	Start.Choices.Add(ChoiceAsk);

	FDialogueChoice ChoiceHelp;
	ChoiceHelp.ChoiceText = LOCTEXT("Yukine_Choice_Help", "I'm just here to help. What do you need?");
	ChoiceHelp.NextNodeID = TEXT("Thanks");
	Start.Choices.Add(ChoiceHelp);

	Table->AddRow(TEXT("Start"), Start);

	FDialogueNode Explain;
	Explain.SpeakerName = LOCTEXT("Yukine_SpeakerName2", "Yukine");
	Explain.bPortraitLeft = true;
	Explain.DialogueText = LOCTEXT("Yukine_Explain",
		"Resonance is supposed to flow between elements like breath — steady, "
		"cyclical. What I'm reading here spikes, then goes silent, then spikes "
		"again. Something is drawing on it unevenly. I don't like it.");
	Explain.NextNodeID = TEXT("Thanks");
	Table->AddRow(TEXT("Explain"), Explain);

	FDialogueNode Thanks;
	Thanks.SpeakerName = LOCTEXT("Yukine_SpeakerName3", "Yukine");
	Thanks.bPortraitLeft = true;
	Thanks.DialogueText = LOCTEXT("Yukine_Thanks",
		"Thank you for clearing the path. I've sent word to Shiden — they've "
		"seen this pattern before, further east. Find them; I'll keep studying "
		"the shard fragments here.");

	FDialogueAction ReportTalk;
	ReportTalk.Type = EDialogueActionType::ReportTalkObjective;
	ReportTalk.TargetID = TEXT("NPC_Yukine");
	Thanks.Actions.Add(ReportTalk);

	Table->AddRow(TEXT("Thanks"), Thanks);

	return Table;
}

UDataTable* UStarterContentLibrary::BuildShidenIntroDialogue(UObject* Outer)
{
	UDataTable* Table = NewObject<UDataTable>(Outer ? Outer : GetTransientPackage());
	Table->RowStruct = FDialogueNode::StaticStruct();

	FDialogueNode Start;
	Start.SpeakerName = LOCTEXT("Shiden_SpeakerName", "Shiden");
	Start.bPortraitLeft = false;
	Start.DialogueText = LOCTEXT("Shiden_Start",
		"Cracked shard, uneven Resonance spikes near old ruins. Same signature "
		"I tracked two regions back. It didn't stop on its own then, either.");
	Start.NextNodeID = TEXT("Warning");
	Table->AddRow(TEXT("Start"), Start);

	FDialogueNode Warning;
	Warning.SpeakerName = LOCTEXT("Shiden_SpeakerName2", "Shiden");
	Warning.bPortraitLeft = false;
	Warning.DialogueText = LOCTEXT("Shiden_Warning",
		"Whatever's doing this isn't finished. Stay sharp — next time it won't "
		"just be Hilichurl standing between us and it.");

	FDialogueAction ReportTalk;
	ReportTalk.Type = EDialogueActionType::ReportTalkObjective;
	ReportTalk.TargetID = TEXT("NPC_Shiden");
	Warning.Actions.Add(ReportTalk);

	Table->AddRow(TEXT("Warning"), Warning);

	return Table;
}

#undef LOCTEXT_NAMESPACE
