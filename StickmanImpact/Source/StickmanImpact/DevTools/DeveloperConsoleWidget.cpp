// Copyright StickmanImpact Project.

#include "DeveloperConsoleWidget.h"
#include "Components/EditableTextBox.h"
#include "Components/ScrollBox.h"
#include "Components/TextBlock.h"
#include "Kismet/GameplayStatics.h"
#include "GameFramework/PlayerController.h"

UDevConsoleSubsystem* UDeveloperConsoleWidget::GetConsole() const
{
	const UGameInstance* GameInstance = GetGameInstance();
	return GameInstance ? GameInstance->GetSubsystem<UDevConsoleSubsystem>() : nullptr;
}

void UDeveloperConsoleWidget::NativeConstruct()
{
	Super::NativeConstruct();

	if (UDevConsoleSubsystem* Console = GetConsole())
	{
		Console->OnConsoleLog.AddDynamic(this, &UDeveloperConsoleWidget::HandleConsoleLog);
		// Backfill anything logged before the widget existed.
		for (const FDevConsoleLine& Line : Console->GetLogLines())
		{
			AppendLine(Line);
		}
	}
	if (InputBox)
	{
		InputBox->OnTextCommitted.AddDynamic(this, &UDeveloperConsoleWidget::HandleTextCommitted);
	}

	SetVisibility(ESlateVisibility::Collapsed); // Starts closed.
}

void UDeveloperConsoleWidget::NativeDestruct()
{
	if (UDevConsoleSubsystem* Console = GetConsole())
	{
		Console->OnConsoleLog.RemoveDynamic(this, &UDeveloperConsoleWidget::HandleConsoleLog);
	}
	Super::NativeDestruct();
}

void UDeveloperConsoleWidget::ToggleConsole()
{
	if (bOpen)
	{
		CloseConsole();
	}
	else
	{
		OpenConsole();
	}
}

void UDeveloperConsoleWidget::OpenConsole()
{
	bOpen = true;
	SetVisibility(ESlateVisibility::Visible);

	if (APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0))
	{
		FInputModeGameAndUI InputMode; // Game keeps rendering; keyboard goes to the console.
		if (InputBox)
		{
			InputMode.SetWidgetToFocus(InputBox->TakeWidget());
		}
		PC->SetInputMode(InputMode);
		PC->bShowMouseCursor = true;
	}
	if (InputBox)
	{
		InputBox->SetKeyboardFocus();
	}
}

void UDeveloperConsoleWidget::CloseConsole()
{
	bOpen = false;
	SetVisibility(ESlateVisibility::Collapsed);

	if (APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0))
	{
		PC->SetInputMode(FInputModeGameOnly());
		PC->bShowMouseCursor = false;
	}
}

FReply UDeveloperConsoleWidget::NativeOnPreviewKeyDown(const FGeometry& InGeometry, const FKeyEvent& InKeyEvent)
{
	if (!bOpen)
	{
		return Super::NativeOnPreviewKeyDown(InGeometry, InKeyEvent);
	}

	UDevConsoleSubsystem* Console = GetConsole();
	const FKey Key = InKeyEvent.GetKey();

	if (Key == EKeys::Tilde || Key == EKeys::Escape)
	{
		CloseConsole();
		return FReply::Handled();
	}
	if (Console && InputBox && Key == EKeys::Up)
	{
		InputBox->SetText(FText::FromString(Console->NavigateHistory(-1)));
		return FReply::Handled();
	}
	if (Console && InputBox && Key == EKeys::Down)
	{
		InputBox->SetText(FText::FromString(Console->NavigateHistory(+1)));
		return FReply::Handled();
	}
	if (Console && InputBox && Key == EKeys::Tab)
	{
		InputBox->SetText(FText::FromString(Console->Autocomplete(InputBox->GetText().ToString())));
		return FReply::Handled();
	}

	return Super::NativeOnPreviewKeyDown(InGeometry, InKeyEvent);
}

void UDeveloperConsoleWidget::HandleTextCommitted(const FText& Text, ETextCommit::Type CommitMethod)
{
	if (CommitMethod != ETextCommit::OnEnter)
	{
		return;
	}

	if (UDevConsoleSubsystem* Console = GetConsole())
	{
		Console->Execute(Text.ToString());
	}
	if (InputBox)
	{
		InputBox->SetText(FText::GetEmpty());
		InputBox->SetKeyboardFocus(); // Enter steals focus back — keep typing.
	}
}

void UDeveloperConsoleWidget::HandleConsoleLog(const FDevConsoleLine& Line)
{
	AppendLine(Line);
}

void UDeveloperConsoleWidget::AppendLine(const FDevConsoleLine& Line)
{
	if (!LogScroll)
	{
		return;
	}

	UTextBlock* TextBlock = NewObject<UTextBlock>(this);
	TextBlock->SetText(FText::FromString(Line.Text));
	TextBlock->SetColorAndOpacity(FSlateColor(Line.Color));
	FSlateFontInfo Font = TextBlock->GetFont();
	Font.Size = FontSize;
	TextBlock->SetFont(Font);
	LogScroll->AddChild(TextBlock);

	// Cap the widget-side line count too, then follow the tail.
	while (LogScroll->GetChildrenCount() > 300)
	{
		LogScroll->RemoveChildAt(0);
	}
	LogScroll->ScrollToEnd();
}
