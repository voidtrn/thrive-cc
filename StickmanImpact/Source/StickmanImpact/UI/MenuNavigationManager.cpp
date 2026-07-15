// Copyright StickmanImpact Project.

#include "MenuNavigationManager.h"
#include "Blueprint/UserWidget.h"
#include "Kismet/GameplayStatics.h"

UUserWidget* UMenuNavigationManager::PushMenu(TSubclassOf<UUserWidget> MenuClass)
{
	if (!MenuClass)
	{
		return nullptr;
	}

	APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0);
	if (!PC)
	{
		return nullptr;
	}

	UUserWidget* NewMenu = CreateWidget<UUserWidget>(PC, MenuClass);
	if (!NewMenu)
	{
		return nullptr;
	}

	// Each deeper menu stacks above the previous (ZOrder = depth).
	NewMenu->AddToViewport(10 + MenuStack.Num());
	MenuStack.Add(NewMenu);

	if (MenuStack.Num() == 1)
	{
		// First menu opened: pause + free the mouse. Popping the last one reverses this.
		UGameplayStatics::SetGamePaused(this, true);
		PC->SetShowMouseCursor(true);
		FInputModeGameAndUI InputMode;
		InputMode.SetWidgetToFocus(NewMenu->TakeWidget());
		PC->SetInputMode(InputMode);
	}

	OnMenuPushed.Broadcast(NewMenu);
	return NewMenu;
}

void UMenuNavigationManager::PopMenu()
{
	if (MenuStack.Num() == 0)
	{
		return;
	}

	UUserWidget* TopMenu = MenuStack.Pop();
	if (TopMenu)
	{
		TopMenu->RemoveFromParent();
	}
	OnMenuPopped.Broadcast(TopMenu);

	if (MenuStack.Num() == 0)
	{
		UGameplayStatics::SetGamePaused(this, false);
		if (APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0))
		{
			PC->SetShowMouseCursor(false);
			PC->SetInputMode(FInputModeGameOnly());
		}
		OnMenuStackEmptied.Broadcast();
	}
}

void UMenuNavigationManager::PopToRoot()
{
	while (MenuStack.Num() > 0)
	{
		PopMenu();
	}
}

UUserWidget* UMenuNavigationManager::GetCurrentMenu() const
{
	return MenuStack.Num() > 0 ? MenuStack.Last() : nullptr;
}
