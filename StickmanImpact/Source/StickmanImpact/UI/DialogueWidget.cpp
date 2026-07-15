// Copyright StickmanImpact Project.

#include "DialogueWidget.h"
#include "Dialogue/DialogueManager.h"
#include "Dialogue/DialogueSequence.h"
#include "Components/TextBlock.h"
#include "Components/Image.h"
#include "Components/Button.h"
#include "Components/PanelWidget.h"
#include "Components/ScrollBox.h"
#include "TimerManager.h"

namespace
{
	UDialogueManager* GetDialogueManager(const UUserWidget* Widget)
	{
		if (const UGameInstance* GameInstance = Widget ? Widget->GetGameInstance() : nullptr)
		{
			return GameInstance->GetSubsystem<UDialogueManager>();
		}
		return nullptr;
	}
}

void UDialogueWidget::NativeConstruct()
{
	Super::NativeConstruct();

	if (UDialogueManager* Manager = GetDialogueManager(this))
	{
		Manager->OnDialogueStarted.AddDynamic(this, &UDialogueWidget::HandleDialogueStarted);
		Manager->OnDialogueLineChanged.AddDynamic(this, &UDialogueWidget::HandleLineChanged);
		Manager->OnDialogueEnded.AddDynamic(this, &UDialogueWidget::HandleDialogueEnded);
		Manager->OnDialogueChoicesPresented.AddDynamic(this, &UDialogueWidget::HandleChoicesPresented);
	}

	if (SkipButton)
	{
		SkipButton->OnPressed.AddDynamic(this, &UDialogueWidget::HandleSkipButtonPressed);
		SkipButton->OnReleased.AddDynamic(this, &UDialogueWidget::HandleSkipButtonReleased);
	}
	if (ChoiceButton0) ChoiceButton0->OnClicked.AddDynamic(this, &UDialogueWidget::OnChoice0Clicked);
	if (ChoiceButton1) ChoiceButton1->OnClicked.AddDynamic(this, &UDialogueWidget::OnChoice1Clicked);
	if (ChoiceButton2) ChoiceButton2->OnClicked.AddDynamic(this, &UDialogueWidget::OnChoice2Clicked);
	if (ChoiceButton3) ChoiceButton3->OnClicked.AddDynamic(this, &UDialogueWidget::OnChoice3Clicked);

	if (ChoicePanel)
	{
		ChoicePanel->SetVisibility(ESlateVisibility::Collapsed);
	}
	SetVisibility(ESlateVisibility::Collapsed);
}

void UDialogueWidget::NativeDestruct()
{
	if (UDialogueManager* Manager = GetDialogueManager(this))
	{
		Manager->OnDialogueStarted.RemoveDynamic(this, &UDialogueWidget::HandleDialogueStarted);
		Manager->OnDialogueLineChanged.RemoveDynamic(this, &UDialogueWidget::HandleLineChanged);
		Manager->OnDialogueEnded.RemoveDynamic(this, &UDialogueWidget::HandleDialogueEnded);
		Manager->OnDialogueChoicesPresented.RemoveDynamic(this, &UDialogueWidget::HandleChoicesPresented);
	}
	Super::NativeDestruct();
}

void UDialogueWidget::HandleDialogueStarted(UDialogueSequence* Sequence)
{
	SetVisibility(ESlateVisibility::Visible);
}

void UDialogueWidget::HandleLineChanged(FDialogueLine Line)
{
	if (SpeakerNameText)
	{
		SpeakerNameText->SetText(Line.SpeakerName);
	}
	if (PortraitImage)
	{
		if (Line.SpeakerPortrait)
		{
			PortraitImage->SetBrushFromTexture(Line.SpeakerPortrait);
			PortraitImage->SetVisibility(ESlateVisibility::HitTestInvisible);
		}
		else
		{
			PortraitImage->SetVisibility(ESlateVisibility::Collapsed);
		}
	}

	FullLineText = Line.DialogueText.ToString();
	RevealedCharCount = 0;
	bTypewriterComplete = FullLineText.IsEmpty();
	TimeSinceLineStart = 0.f;

	if (DialogueBodyText)
	{
		DialogueBodyText->SetText(FText::GetEmpty());
	}
	if (ContinueIndicatorText)
	{
		ContinueIndicatorText->SetVisibility(ESlateVisibility::Collapsed);
	}
	if (ChoicePanel)
	{
		ChoicePanel->SetVisibility(ESlateVisibility::Collapsed);
	}
}

void UDialogueWidget::HandleDialogueEnded(UDialogueSequence* Sequence)
{
	SetVisibility(ESlateVisibility::Collapsed);
	if (ChoicePanel)
	{
		ChoicePanel->SetVisibility(ESlateVisibility::Collapsed);
	}
}

void UDialogueWidget::HandleChoicesPresented(const TArray<FDialogueChoice>& Choices)
{
	PendingChoices = Choices;

	UButton* Buttons[4] = { ChoiceButton0, ChoiceButton1, ChoiceButton2, ChoiceButton3 };
	UTextBlock* Texts[4] = { ChoiceText0, ChoiceText1, ChoiceText2, ChoiceText3 };

	for (int32 Index = 0; Index < 4; ++Index)
	{
		const bool bHasChoice = Choices.IsValidIndex(Index);
		if (Buttons[Index])
		{
			Buttons[Index]->SetVisibility(bHasChoice ? ESlateVisibility::Visible : ESlateVisibility::Collapsed);
		}
		if (bHasChoice && Texts[Index])
		{
			Texts[Index]->SetText(Choices[Index].ChoiceText);
		}
	}

	if (ChoicePanel)
	{
		ChoicePanel->SetVisibility(ESlateVisibility::Visible);
	}
	if (ContinueIndicatorText)
	{
		ContinueIndicatorText->SetVisibility(ESlateVisibility::Collapsed);
	}
}

void UDialogueWidget::SelectChoice(int32 Index)
{
	if (UDialogueManager* Manager = GetDialogueManager(this))
	{
		Manager->SelectChoice(Index);
	}
}

void UDialogueWidget::OnContinueClicked()
{
	if (!bTypewriterComplete)
	{
		CompleteTypewriter();
		return;
	}

	if (UDialogueManager* Manager = GetDialogueManager(this))
	{
		Manager->AdvanceLine();
	}
}

void UDialogueWidget::ToggleHistoryPanel()
{
	if (!HistoryPanel)
	{
		return;
	}

	const bool bWasVisible = HistoryPanel->GetVisibility() == ESlateVisibility::Visible;
	HistoryPanel->SetVisibility(bWasVisible ? ESlateVisibility::Collapsed : ESlateVisibility::Visible);

	if (!bWasVisible && HistoryScrollBox)
	{
		HistoryScrollBox->ClearChildren();
		if (const UDialogueManager* Manager = GetDialogueManager(this))
		{
			for (const FDialogueLine& Line : Manager->GetHistory())
			{
				UTextBlock* LineText = NewObject<UTextBlock>(this);
				LineText->SetText(FText::Format(NSLOCTEXT("Dialogue", "HistoryLineFormat", "{0}: {1}"),
					Line.SpeakerName, Line.DialogueText));
				HistoryScrollBox->AddChild(LineText);
			}
		}
	}
}

void UDialogueWidget::HandleSkipButtonPressed()
{
	bSkipButtonHeld = true;
	SkipHoldTime = 0.f;
}

void UDialogueWidget::HandleSkipButtonReleased()
{
	bSkipButtonHeld = false;
	SkipHoldTime = 0.f;
}

void UDialogueWidget::NativeTick(const FGeometry& MyGeometry, float InDeltaTime)
{
	Super::NativeTick(MyGeometry, InDeltaTime);

	RefreshTypewriter(InDeltaTime);

	if (bSkipButtonHeld)
	{
		SkipHoldTime += InDeltaTime;
		if (SkipHoldTime >= HoldToSkipDuration)
		{
			bSkipButtonHeld = false;
			if (UDialogueManager* Manager = GetDialogueManager(this))
			{
				Manager->SkipLine();
			}
		}
	}
}

void UDialogueWidget::RefreshTypewriter(float DeltaSeconds)
{
	if (bTypewriterComplete)
	{
		return;
	}

	TimeSinceLineStart += DeltaSeconds;
	const int32 TargetCharCount = FMath::Min(FullLineText.Len(),
		FMath::FloorToInt(TimeSinceLineStart * CharactersPerSecond));

	if (TargetCharCount != RevealedCharCount)
	{
		RevealedCharCount = TargetCharCount;
		if (DialogueBodyText)
		{
			DialogueBodyText->SetText(FText::FromString(FullLineText.Left(RevealedCharCount)));
		}
	}

	if (RevealedCharCount >= FullLineText.Len())
	{
		CompleteTypewriter();
	}
}

void UDialogueWidget::CompleteTypewriter()
{
	bTypewriterComplete = true;
	RevealedCharCount = FullLineText.Len();
	if (DialogueBodyText)
	{
		DialogueBodyText->SetText(FText::FromString(FullLineText));
	}
	if (ContinueIndicatorText)
	{
		ContinueIndicatorText->SetVisibility(ESlateVisibility::HitTestInvisible);
	}

	if (bAutoAdvance)
	{
		if (UDialogueManager* Manager = GetDialogueManager(this))
		{
			FTimerHandle AutoAdvanceHandle;
			GetWorld()->GetTimerManager().SetTimer(AutoAdvanceHandle, [Manager]() { Manager->AdvanceLine(); },
				Manager->GetCurrentLineDisplayTime(), false);
		}
	}
}
