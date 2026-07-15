// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "DevConsoleSubsystem.h"
#include "DeveloperConsoleWidget.generated.h"

class UEditableTextBox;
class UScrollBox;
class UTextBlock;

/**
 * The on-screen console UI over UDevConsoleSubsystem. Toggle with tilde (~): bind an input
 * action to ToggleConsole() on the player controller (an Enhanced Input IA_Console mapped
 * to the Tilde key — asset-side, one mapping), or call it from Blueprint. While open it
 * grabs keyboard focus and sets UI-only input mode; closing restores game input.
 *
 * Keys (handled in the input box's NativeOnPreviewKeyDown so they never reach the game):
 *   Enter      — execute
 *   Up/Down    — history
 *   Tab        — autocomplete (logs candidates when ambiguous)
 *   Tilde/Esc  — close
 *
 * WBP layout contract: a ScrollBox named "LogScroll" and an EditableTextBox named
 * "InputBox" (both BindWidgetOptional). Log lines arrive pre-colored per category from
 * the subsystem; the widget just appends UTextBlocks.
 */
UCLASS()
class STICKMANIMPACT_API UDeveloperConsoleWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "DevConsole")
	void ToggleConsole();

	UFUNCTION(BlueprintPure, Category = "DevConsole")
	bool IsConsoleOpen() const { return bOpen; }

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "DevConsole")
	int32 FontSize = 12;

protected:
	virtual void NativeConstruct() override;
	virtual void NativeDestruct() override;
	virtual FReply NativeOnPreviewKeyDown(const FGeometry& InGeometry, const FKeyEvent& InKeyEvent) override;

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional))
	TObjectPtr<UScrollBox> LogScroll;

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional))
	TObjectPtr<UEditableTextBox> InputBox;

private:
	UFUNCTION()
	void HandleConsoleLog(const FDevConsoleLine& Line);

	UFUNCTION()
	void HandleTextCommitted(const FText& Text, ETextCommit::Type CommitMethod);

	UDevConsoleSubsystem* GetConsole() const;
	void AppendLine(const FDevConsoleLine& Line);
	void OpenConsole();
	void CloseConsole();

	bool bOpen = false;
};
