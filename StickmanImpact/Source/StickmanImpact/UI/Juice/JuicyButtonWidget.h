// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "JuicyButtonWidget.generated.h"

class USoundBase;

/**
 * Base class for menu buttons that juice themselves — no per-button Blueprint graph needed.
 * Hover springs render-scale to HoverScale (110%) + fires HoverSound; press snaps to
 * PressScale (90%) then springs back on release + fires ClickSound (routed through
 * UStickmanAudioManager::PlayUISound so it obeys UI volume). Uses UUIJuiceLibrary's
 * damped spring so the motion overshoots and settles instead of snapping.
 *
 * Derive a WBP from this, put a Button named "RootButton" (BindWidgetOptional) inside for
 * click routing, and the scale animation applies to the whole widget's render transform.
 * OnJuicyClicked is the delegate WBPs bind their navigation to.
 */
UCLASS()
class STICKMANIMPACT_API UJuicyButtonWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnJuicyClicked);

	UPROPERTY(BlueprintAssignable, Category = "UI|Juice")
	FOnJuicyClicked OnJuicyClicked;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "UI|Juice")
	float HoverScale = 1.1f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "UI|Juice")
	float PressScale = 0.9f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "UI|Juice")
	float SpringStiffness = 22.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "UI|Juice")
	float SpringDamping = 0.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "UI|Juice")
	TObjectPtr<USoundBase> HoverSound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "UI|Juice")
	TObjectPtr<USoundBase> ClickSound;

protected:
	virtual void NativeConstruct() override;
	virtual void NativeTick(const FGeometry& MyGeometry, float InDeltaTime) override;
	virtual void NativeOnMouseEnter(const FGeometry& InGeometry, const FPointerEvent& InMouseEvent) override;
	virtual void NativeOnMouseLeave(const FPointerEvent& InMouseEvent) override;
	virtual FReply NativeOnMouseButtonDown(const FGeometry& InGeometry, const FPointerEvent& InMouseEvent) override;
	virtual FReply NativeOnMouseButtonUp(const FGeometry& InGeometry, const FPointerEvent& InMouseEvent) override;

	UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional))
	TObjectPtr<class UButton> RootButton;

private:
	UFUNCTION()
	void HandleRootButtonClicked();

	void PlayUI(USoundBase* Sound);

	float CurrentScale = 1.f;
	float TargetScale = 1.f;
	float ScaleVelocity = 0.f;
	bool bPressed = false;
};
