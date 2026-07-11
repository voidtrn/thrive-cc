// Copyright StickmanImpact Project.

#include "StickmanPlayerController.h"
#include "EnhancedInputComponent.h"
#include "Blueprint/UserWidget.h"
#include "Engine/Engine.h"

AStickmanPlayerController::AStickmanPlayerController()
{
	bShowMouseCursor = false;
}

void AStickmanPlayerController::BeginPlay()
{
	Super::BeginPlay();

	if (InputDebugWidgetClass)
	{
		InputDebugWidgetInstance = CreateWidget<UUserWidget>(this, InputDebugWidgetClass);
		if (InputDebugWidgetInstance)
		{
			InputDebugWidgetInstance->AddToViewport();
		}
	}
}

void AStickmanPlayerController::SetupInputComponent()
{
	Super::SetupInputComponent();

	if (UEnhancedInputComponent* EIC = Cast<UEnhancedInputComponent>(InputComponent))
	{
		if (InventoryAction)
		{
			EIC->BindAction(InventoryAction, ETriggerEvent::Started, this, &AStickmanPlayerController::OnToggleInventory);
		}
		if (MapAction)
		{
			EIC->BindAction(MapAction, ETriggerEvent::Started, this, &AStickmanPlayerController::OnToggleMap);
		}
		if (PauseAction)
		{
			EIC->BindAction(PauseAction, ETriggerEvent::Started, this, &AStickmanPlayerController::OnTogglePause);
		}
	}
}

void AStickmanPlayerController::OnToggleInventory()
{
	if (GEngine)
	{
		GEngine->AddOnScreenDebugMessage(-1, 1.f, FColor::Orange, TEXT("Toggle Inventory"));
	}
}

void AStickmanPlayerController::OnToggleMap()
{
	if (GEngine)
	{
		GEngine->AddOnScreenDebugMessage(-1, 1.f, FColor::Orange, TEXT("Toggle Map"));
	}
}

void AStickmanPlayerController::OnTogglePause()
{
	if (GEngine)
	{
		GEngine->AddOnScreenDebugMessage(-1, 1.f, FColor::Orange, TEXT("Toggle Pause"));
	}
	SetPause(!IsPaused());
}
