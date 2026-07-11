// Copyright StickmanImpact Project.

#include "QuestJournalWidget.h"
#include "Components/ScrollBox.h"
#include "Components/TextBlock.h"
#include "Components/Button.h"
#include "Quest/QuestManager.h"
#include "Quest/QuestDataAsset.h"

UQuestManager* UQuestJournalWidget::GetQuestManager() const
{
	const UGameInstance* GameInstance = GetGameInstance();
	return GameInstance ? GameInstance->GetSubsystem<UQuestManager>() : nullptr;
}

void UQuestJournalWidget::NativeConstruct()
{
	Super::NativeConstruct();

	if (ActiveTabButton) ActiveTabButton->OnClicked.AddDynamic(this, &UQuestJournalWidget::OnActiveTab);
	if (CompletedTabButton) CompletedTabButton->OnClicked.AddDynamic(this, &UQuestJournalWidget::OnCompletedTab);
	if (TrackButton) TrackButton->OnClicked.AddDynamic(this, &UQuestJournalWidget::OnTrackClicked);
	if (AbandonButton) AbandonButton->OnClicked.AddDynamic(this, &UQuestJournalWidget::OnAbandonClicked);

	ShowActiveQuests();
}

void UQuestJournalWidget::ShowActiveQuests()
{
	bShowingCompleted = false;
	SelectedQuestID.Empty();
	RefreshQuestList();
	RefreshDetailView();
}

void UQuestJournalWidget::ShowCompletedQuests()
{
	bShowingCompleted = true;
	SelectedQuestID.Empty();
	RefreshQuestList();
	RefreshDetailView();
}

void UQuestJournalWidget::RefreshQuestList()
{
	UQuestManager* Manager = GetQuestManager();
	if (!Manager || !QuestListScrollBox)
	{
		return;
	}

	QuestListScrollBox->ClearChildren();

	if (bShowingCompleted)
	{
		// Completed quests: only IDs survive completion (the asset reference is dropped), so
		// the archive lists IDs. Keep a QuestID->asset DataTable if archived detail views are
		// ever needed.
		for (const FString& QuestID : Manager->GetCompletedQuestIDs())
		{
			UTextBlock* Entry = NewObject<UTextBlock>(this);
			Entry->SetText(FText::FromString(QuestID));
			QuestListScrollBox->AddChild(Entry);
		}
		return;
	}

	for (UQuestDataAsset* Quest : Manager->GetActiveQuests())
	{
		if (!Quest)
		{
			continue;
		}
		UTextBlock* Entry = NewObject<UTextBlock>(this);
		const bool bTracked = Manager->GetTrackedQuestID() == Quest->QuestID;
		Entry->SetText(FText::Format(NSLOCTEXT("Journal", "QuestEntry", "{0}{1}  (Lv. {2})"),
			bTracked ? FText::FromString(TEXT("[*] ")) : FText::GetEmpty(),
			Quest->QuestName, FText::AsNumber(Quest->RecommendedLevel)));
		QuestListScrollBox->AddChild(Entry);
		// Row selection: rows are plain TextBlocks here — a WBP subclass replaces them with a
		// button row widget calling SelectQuest(QuestID). SelectQuest is the working entry point.
	}
}

void UQuestJournalWidget::SelectQuest(const FString& QuestID)
{
	SelectedQuestID = QuestID;
	RefreshDetailView();
}

void UQuestJournalWidget::RefreshDetailView()
{
	UQuestManager* Manager = GetQuestManager();
	UQuestDataAsset* Quest = Manager ? Manager->GetActiveQuestAsset(SelectedQuestID) : nullptr;

	if (DetailNameText)
	{
		DetailNameText->SetText(Quest ? Quest->QuestName : FText::GetEmpty());
	}
	if (DetailDescriptionText)
	{
		DetailDescriptionText->SetText(Quest ? Quest->QuestDescription : FText::GetEmpty());
	}

	if (DetailObjectivesText)
	{
		FString ObjectivesString;
		if (Quest)
		{
			const FQuestStage Stage = Manager->GetCurrentStage(SelectedQuestID);
			for (const FQuestObjective& Objective : Stage.Objectives)
			{
				ObjectivesString += FString::Printf(TEXT("%s %s (%d/%d)\n"),
					Objective.IsComplete() ? TEXT("[x]") : TEXT("[ ]"),
					*Objective.ObjectiveDescription.ToString(), Objective.CurrentCount, Objective.RequiredCount);
			}
		}
		DetailObjectivesText->SetText(FText::FromString(ObjectivesString));
	}

	if (DetailRewardText)
	{
		FString RewardString;
		if (Quest)
		{
			const FRewardData& Reward = Quest->QuestCompletionReward;
			if (Reward.EXP > 0) RewardString += FString::Printf(TEXT("%d EXP  "), Reward.EXP);
			if (Reward.Currency > 0) RewardString += FString::Printf(TEXT("%d Coins  "), Reward.Currency);
			for (const auto& Pair : Reward.ItemRewards)
			{
				RewardString += FString::Printf(TEXT("%s x%d  "), *Pair.Key.ToString(), Pair.Value);
			}
		}
		DetailRewardText->SetText(FText::FromString(RewardString));
	}

	const bool bCanAct = Quest != nullptr && !bShowingCompleted;
	if (TrackButton)
	{
		TrackButton->SetVisibility(bCanAct ? ESlateVisibility::Visible : ESlateVisibility::Collapsed);
	}
	if (AbandonButton)
	{
		// Main quests can't be abandoned.
		const bool bAbandonable = bCanAct && Quest->QuestType != EQuestType::Main;
		AbandonButton->SetVisibility(bAbandonable ? ESlateVisibility::Visible : ESlateVisibility::Collapsed);
	}
}

void UQuestJournalWidget::TrackSelectedQuest()
{
	if (UQuestManager* Manager = GetQuestManager())
	{
		Manager->SetTrackedQuest(SelectedQuestID);
		RefreshQuestList();
	}
}

void UQuestJournalWidget::AbandonSelectedQuest()
{
	if (UQuestManager* Manager = GetQuestManager())
	{
		Manager->AbandonQuest(SelectedQuestID);
		SelectedQuestID.Empty();
		RefreshQuestList();
		RefreshDetailView();
	}
}
