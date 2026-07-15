// Copyright StickmanImpact Project.

#include "SubtitleWidget.h"
#include "Cutscene/CutsceneManager.h"
#include "Components/TextBlock.h"
#include "Components/Border.h"

void USubtitleWidget::NativeConstruct()
{
	Super::NativeConstruct();

	if (const UGameInstance* GameInstance = GetGameInstance())
	{
		if (UCutsceneManager* CutsceneManager = GameInstance->GetSubsystem<UCutsceneManager>())
		{
			CutsceneManager->OnSubtitleChanged.AddDynamic(this, &USubtitleWidget::HandleSubtitleChanged);
		}
	}

	HandleSubtitleChanged(FText::GetEmpty(), FLinearColor::White);
}

void USubtitleWidget::NativeDestruct()
{
	if (const UGameInstance* GameInstance = GetGameInstance())
	{
		if (UCutsceneManager* CutsceneManager = GameInstance->GetSubsystem<UCutsceneManager>())
		{
			CutsceneManager->OnSubtitleChanged.RemoveDynamic(this, &USubtitleWidget::HandleSubtitleChanged);
		}
	}
	Super::NativeDestruct();
}

void USubtitleWidget::HandleSubtitleChanged(FText Text, FLinearColor Color)
{
	const bool bHasText = !Text.IsEmpty();

	if (SubtitleText)
	{
		SubtitleText->SetText(Text);
		SubtitleText->SetColorAndOpacity(FSlateColor(Color));
	}
	if (BackgroundBorder)
	{
		FLinearColor BackgroundColor = FLinearColor::Black;
		BackgroundColor.A = BackgroundOpacity;
		BackgroundBorder->SetBrushColor(BackgroundColor);
	}

	SetVisibility(bHasText ? ESlateVisibility::HitTestInvisible : ESlateVisibility::Collapsed);
}
