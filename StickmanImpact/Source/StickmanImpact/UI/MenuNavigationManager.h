// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "MenuNavigationManager.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnMenuPushed, UUserWidget*, Menu);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnMenuPopped, UUserWidget*, Menu);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnMenuStackEmptied);

/**
 * Stack-based menu navigation: PushMenu creates+shows a widget on top (hiding whatever was
 * showing below it isn't required — each screen decides its own translucency), PopMenu
 * removes it and reveals whatever's now on top of the stack. Bind Escape/a controller Back
 * button to PopMenu() once and every menu screen gets "back" for free.
 */
UCLASS()
class STICKMANIMPACT_API UMenuNavigationManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Menu")
	UUserWidget* PushMenu(TSubclassOf<UUserWidget> MenuClass);

	UFUNCTION(BlueprintCallable, Category = "Menu")
	void PopMenu();

	UFUNCTION(BlueprintCallable, Category = "Menu")
	void PopToRoot();

	UFUNCTION(BlueprintPure, Category = "Menu")
	UUserWidget* GetCurrentMenu() const;

	UFUNCTION(BlueprintPure, Category = "Menu")
	bool IsMenuStackEmpty() const { return MenuStack.Num() == 0; }

	UPROPERTY(BlueprintAssignable, Category = "Menu")
	FOnMenuPushed OnMenuPushed;

	UPROPERTY(BlueprintAssignable, Category = "Menu")
	FOnMenuPopped OnMenuPopped;

	UPROPERTY(BlueprintAssignable, Category = "Menu")
	FOnMenuStackEmptied OnMenuStackEmptied;

private:
	UPROPERTY()
	TArray<TObjectPtr<UUserWidget>> MenuStack;
};
