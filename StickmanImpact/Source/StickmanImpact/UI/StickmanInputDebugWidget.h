// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "StickmanInputDebugWidget.generated.h"

class UTextBlock;

/**
 * Minimal on-screen readout of the current Move/Look input axes plus stamina and movement
 * state, so testers can confirm Enhanced Input reaches the character without opening logs.
 * Create a WBP subclass of this and bind the (optional) TextBlocks named below.
 */
UCLASS()
class STICKMANIMPACT_API UStickmanInputDebugWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	virtual void NativeTick(const FGeometry& MyGeometry, float InDeltaTime) override;

protected:
	// BindWidgetOptional: safe to leave unbound in the WBP if you'd rather read GetDebugText().
	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional))
	TObjectPtr<UTextBlock> MoveValueText;

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional))
	TObjectPtr<UTextBlock> LookValueText;

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional))
	TObjectPtr<UTextBlock> StaminaValueText;

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional))
	TObjectPtr<UTextBlock> MovementStateText;

	// Aggregated debug string, exposed for Blueprint-only widgets that don't use BindWidget.
	UFUNCTION(BlueprintPure, Category = "Debug")
	FString GetDebugText() const { return CachedDebugText; }

private:
	FString CachedDebugText;
};
