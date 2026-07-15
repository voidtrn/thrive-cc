// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "Quest/StickmanQuestTypes.h"
#include "QuestTrackerWidget.generated.h"

class UTextBlock;
class UWidgetAnimation;
class UQuestDataAsset;

/** HUD widget showing the currently tracked quest (UQuestManager::GetTrackedQuestID()) and its current stage's objectives. */
UCLASS()
class STICKMANIMPACT_API UQuestTrackerWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	// How often to refresh distance-to-objective text (objective completion refreshes immediately via delegates).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Quest Tracker")
	float DistanceRefreshInterval = 0.5f;

protected:
	virtual void NativeConstruct() override;
	virtual void NativeDestruct() override;
	virtual void NativeTick(const FGeometry& MyGeometry, float InDeltaTime) override;

	UFUNCTION()
	void HandleQuestUpdated(UQuestDataAsset* Quest, int32 StageIndex);

	UFUNCTION()
	void HandleObjectiveUpdated(UQuestDataAsset* Quest, int32 StageIndex, int32 ObjectiveIndex);

	UFUNCTION()
	void HandleQuestCompleted(UQuestDataAsset* Quest);

	void RefreshDisplay();

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> QuestNameText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> StageNameText;

	// Up to 5 objective rows — bind only as many as your WBP layout needs.
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> ObjectiveText0;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> ObjectiveText1;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> ObjectiveText2;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> ObjectiveText3;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> ObjectiveText4;

	// Author a Widget Animation named "QuestUpdateSlideIn" and it auto-plays on every update.
	UPROPERTY(Transient, meta = (BindWidgetAnimOptional))
	TObjectPtr<UWidgetAnimation> QuestUpdateSlideIn;

private:
	float TimeSinceDistanceRefresh = 0.f;
};
