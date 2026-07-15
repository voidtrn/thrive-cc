// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "Dialogue/StickmanDialogueTypes.h"
#include "DialogueWidget.generated.h"

class UTextBlock;
class UImage;
class UButton;
class UPanelWidget;
class UScrollBox;

/**
 * UMG frontend for UDialogueManager: typewriter reveal, speaker name/portrait, a
 * click-to-continue indicator, optional auto-advance, hold-to-skip, a scrolling history
 * panel, and up to 4 branching-choice buttons.
 */
UCLASS()
class STICKMANIMPACT_API UDialogueWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	bool bAutoAdvance = false;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	float CharactersPerSecond = 30.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	float HoldToSkipDuration = 0.6f;

	UFUNCTION(BlueprintCallable, Category = "Dialogue")
	void OnContinueClicked();

	UFUNCTION(BlueprintCallable, Category = "Dialogue")
	void ToggleHistoryPanel();

protected:
	virtual void NativeConstruct() override;
	virtual void NativeDestruct() override;
	virtual void NativeTick(const FGeometry& MyGeometry, float InDeltaTime) override;

	UFUNCTION()
	void HandleLineChanged(FDialogueLine Line);

	UFUNCTION()
	void HandleDialogueStarted(class UDialogueSequence* Sequence);

	UFUNCTION()
	void HandleDialogueEnded(class UDialogueSequence* Sequence);

	UFUNCTION()
	void HandleChoicesPresented(const TArray<FDialogueChoice>& Choices);

	UFUNCTION()
	void HandleSkipButtonPressed();

	UFUNCTION()
	void HandleSkipButtonReleased();

	UFUNCTION()
	void OnChoice0Clicked() { SelectChoice(0); }
	UFUNCTION()
	void OnChoice1Clicked() { SelectChoice(1); }
	UFUNCTION()
	void OnChoice2Clicked() { SelectChoice(2); }
	UFUNCTION()
	void OnChoice3Clicked() { SelectChoice(3); }

	void SelectChoice(int32 Index);

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> SpeakerNameText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> DialogueBodyText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UImage> PortraitImage;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> ContinueIndicatorText;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> SkipButton;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UPanelWidget> HistoryPanel;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UScrollBox> HistoryScrollBox;

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UPanelWidget> ChoicePanel;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> ChoiceButton0;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> ChoiceText0;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> ChoiceButton1;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> ChoiceText1;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> ChoiceButton2;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> ChoiceText2;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UButton> ChoiceButton3;
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional)) TObjectPtr<UTextBlock> ChoiceText3;

private:
	void RefreshTypewriter(float DeltaSeconds);
	void CompleteTypewriter();

	FString FullLineText;
	int32 RevealedCharCount = 0;
	bool bTypewriterComplete = false;
	float TimeSinceLineStart = 0.f;

	bool bSkipButtonHeld = false;
	float SkipHoldTime = 0.f;

	TArray<FDialogueChoice> PendingChoices;
};
