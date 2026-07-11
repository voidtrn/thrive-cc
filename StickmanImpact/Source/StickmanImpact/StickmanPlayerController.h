// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "StickmanPlayerController.generated.h"

class UInputAction;
class UUserWidget;

/**
 * Owns the UI-level input bindings (inventory / map / pause) — kept separate from the
 * character's gameplay bindings so opening a menu doesn't depend on the pawn being alive.
 * Also spawns the on-screen input-debug widget for testing Enhanced Input wiring.
 */
UCLASS()
class STICKMANIMPACT_API AStickmanPlayerController : public APlayerController
{
	GENERATED_BODY()

public:
	AStickmanPlayerController();

protected:
	virtual void BeginPlay() override;
	virtual void SetupInputComponent() override;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> InventoryAction;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> MapAction;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> PauseAction;

	// Assign to WBP_InputDebug (parented to UStickmanInputDebugWidget) to auto-spawn it.
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "UI|Debug")
	TSubclassOf<UUserWidget> InputDebugWidgetClass;

	UPROPERTY(BlueprintReadOnly, Category = "UI|Debug")
	TObjectPtr<UUserWidget> InputDebugWidgetInstance;

	void OnToggleInventory();
	void OnToggleMap();
	void OnTogglePause();
};
