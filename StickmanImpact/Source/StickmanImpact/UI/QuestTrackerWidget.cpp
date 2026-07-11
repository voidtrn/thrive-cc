// Copyright StickmanImpact Project.

#include "QuestTrackerWidget.h"
#include "Quest/QuestManager.h"
#include "Quest/QuestDataAsset.h"
#include "Components/TextBlock.h"
#include "Kismet/GameplayStatics.h"

namespace
{
	UQuestManager* GetQuestManager(const UUserWidget* Widget)
	{
		if (const UGameInstance* GameInstance = Widget ? Widget->GetGameInstance() : nullptr)
		{
			return GameInstance->GetSubsystem<UQuestManager>();
		}
		return nullptr;
	}
}

void UQuestTrackerWidget::NativeConstruct()
{
	Super::NativeConstruct();

	if (UQuestManager* Manager = GetQuestManager(this))
	{
		Manager->OnQuestUpdated.AddDynamic(this, &UQuestTrackerWidget::HandleQuestUpdated);
		Manager->OnObjectiveUpdated.AddDynamic(this, &UQuestTrackerWidget::HandleObjectiveUpdated);
		Manager->OnQuestCompleted.AddDynamic(this, &UQuestTrackerWidget::HandleQuestCompleted);
	}

	RefreshDisplay();
}

void UQuestTrackerWidget::NativeDestruct()
{
	if (UQuestManager* Manager = GetQuestManager(this))
	{
		Manager->OnQuestUpdated.RemoveDynamic(this, &UQuestTrackerWidget::HandleQuestUpdated);
		Manager->OnObjectiveUpdated.RemoveDynamic(this, &UQuestTrackerWidget::HandleObjectiveUpdated);
		Manager->OnQuestCompleted.RemoveDynamic(this, &UQuestTrackerWidget::HandleQuestCompleted);
	}
	Super::NativeDestruct();
}

void UQuestTrackerWidget::HandleQuestUpdated(UQuestDataAsset* Quest, int32 StageIndex)
{
	RefreshDisplay();
	if (QuestUpdateSlideIn)
	{
		PlayAnimation(QuestUpdateSlideIn);
	}
}

void UQuestTrackerWidget::HandleObjectiveUpdated(UQuestDataAsset* Quest, int32 StageIndex, int32 ObjectiveIndex)
{
	RefreshDisplay();
}

void UQuestTrackerWidget::HandleQuestCompleted(UQuestDataAsset* Quest)
{
	RefreshDisplay();
}

void UQuestTrackerWidget::RefreshDisplay()
{
	UQuestManager* Manager = GetQuestManager(this);
	const FString TrackedID = Manager ? Manager->GetTrackedQuestID() : FString();

	if (TrackedID.IsEmpty())
	{
		SetVisibility(ESlateVisibility::Collapsed);
		return;
	}
	SetVisibility(ESlateVisibility::HitTestInvisible);

	UQuestDataAsset* TrackedQuest = nullptr;
	for (UQuestDataAsset* Quest : Manager->GetActiveQuests())
	{
		if (Quest && Quest->QuestID == TrackedID)
		{
			TrackedQuest = Quest;
			break;
		}
	}
	if (!TrackedQuest)
	{
		return;
	}

	if (QuestNameText)
	{
		QuestNameText->SetText(TrackedQuest->QuestName);
	}

	const FQuestStage Stage = Manager->GetCurrentStage(TrackedID);
	if (StageNameText)
	{
		StageNameText->SetText(Stage.StageName);
	}

	const APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	const FVector PlayerLocation = PlayerPawn ? PlayerPawn->GetActorLocation() : FVector::ZeroVector;

	UTextBlock* ObjectiveTexts[5] = { ObjectiveText0, ObjectiveText1, ObjectiveText2, ObjectiveText3, ObjectiveText4 };
	for (int32 Index = 0; Index < 5; ++Index)
	{
		if (!ObjectiveTexts[Index])
		{
			continue;
		}

		if (!Stage.Objectives.IsValidIndex(Index))
		{
			ObjectiveTexts[Index]->SetVisibility(ESlateVisibility::Collapsed);
			continue;
		}

		const FQuestObjective& Objective = Stage.Objectives[Index];
		const TCHAR* CheckMark = Objective.IsComplete() ? TEXT("[x]") : TEXT("[ ]");

		FString DistanceSuffix;
		if (PlayerPawn && Objective.ObjectiveType == EObjectiveType::ReachLocation)
		{
			const float DistanceMeters = FVector::Dist(PlayerLocation, Objective.TargetLocation) / 100.f;
			DistanceSuffix = FString::Printf(TEXT(" (%.0fm)"), DistanceMeters);
		}

		const FString CountSuffix = Objective.RequiredCount > 1
			? FString::Printf(TEXT(" (%d/%d)"), Objective.CurrentCount, Objective.RequiredCount)
			: FString();

		ObjectiveTexts[Index]->SetText(FText::FromString(FString::Printf(TEXT("%s %s%s%s"), CheckMark,
			*Objective.ObjectiveDescription.ToString(), *CountSuffix, *DistanceSuffix)));
		ObjectiveTexts[Index]->SetVisibility(ESlateVisibility::Visible);
	}
}

void UQuestTrackerWidget::NativeTick(const FGeometry& MyGeometry, float InDeltaTime)
{
	Super::NativeTick(MyGeometry, InDeltaTime);

	TimeSinceDistanceRefresh += InDeltaTime;
	if (TimeSinceDistanceRefresh >= DistanceRefreshInterval)
	{
		TimeSinceDistanceRefresh = 0.f;
		RefreshDisplay();
	}
}
