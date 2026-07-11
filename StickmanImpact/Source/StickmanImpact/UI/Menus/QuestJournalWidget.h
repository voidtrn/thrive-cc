// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "QuestJournalWidget.generated.h"

class UScrollBox;
class UTextBlock;
class UButton;
class UQuestDataAsset;

/**
 * Quest journal: active-quest list, completed archive tab, detail view with objective
 * checklist, a Track button (sets UQuestManager's tracked quest, which the HUD tracker and
 * map markers already follow — that IS "navigate to objective" in this codebase), and a
 * reward preview built from the quest's FRewardData.
 */
UCLASS()
class STICKMANIMPACT_API UQuestJournalWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Quest Journal")
	void ShowActiveQuests();

	UFUNCTION(BlueprintCallable, Category = "Quest Journal")
	void ShowCompletedQuests();

	UFUNCTION(BlueprintCallable, Category = "Quest Journal")
	void SelectQuest(const FString& QuestID);

	UFUNCTION(BlueprintCallable, Category = "Quest Journal")
	void TrackSelectedQuest();

	UFUNCTION(BlueprintCallable, Category = "Quest Journal")
	void AbandonSelectedQuest();

protected:
	virtual void NativeConstruct() override;

	UFUNCTION()
	void OnActiveTab() { ShowActiveQuests(); }
	UFUNCTION()
	void OnCompletedTab() { ShowCompletedQuests(); }
	UFUNCTION()
	void OnTrackClicked() { TrackSelectedQuest(); }
	UFUNCTION()
	void OnAbandonClicked() { AbandonSelectedQuest(); }

	void RefreshQuestList();
	void RefreshDetailView();

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UScrollBox> QuestListScrollBox;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> ActiveTabButton;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> CompletedTabButton;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> TrackButton;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> AbandonButton;

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> DetailNameText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> DetailDescriptionText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> DetailObjectivesText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> DetailRewardText;

private:
	class UQuestManager* GetQuestManager() const;

	bool bShowingCompleted = false;
	FString SelectedQuestID;
};
