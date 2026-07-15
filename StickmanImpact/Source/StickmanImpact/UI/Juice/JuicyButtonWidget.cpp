// Copyright StickmanImpact Project.

#include "JuicyButtonWidget.h"
#include "UIJuiceLibrary.h"
#include "Components/Button.h"
#include "Audio/StickmanAudioManager.h"

void UJuicyButtonWidget::NativeConstruct()
{
	Super::NativeConstruct();

	if (RootButton)
	{
		RootButton->OnClicked.AddDynamic(this, &UJuicyButtonWidget::HandleRootButtonClicked);
	}
	SetRenderScale(FVector2D(1.f, 1.f));
}

void UJuicyButtonWidget::NativeTick(const FGeometry& MyGeometry, float InDeltaTime)
{
	Super::NativeTick(MyGeometry, InDeltaTime);

	if (!FMath::IsNearlyEqual(CurrentScale, TargetScale, 0.001f) || !FMath::IsNearlyZero(ScaleVelocity, 0.001f))
	{
		CurrentScale = UUIJuiceLibrary::SpringInterp(CurrentScale, TargetScale, ScaleVelocity, InDeltaTime,
			SpringStiffness, SpringDamping);
		SetRenderScale(FVector2D(CurrentScale, CurrentScale));
	}
}

void UJuicyButtonWidget::NativeOnMouseEnter(const FGeometry& InGeometry, const FPointerEvent& InMouseEvent)
{
	Super::NativeOnMouseEnter(InGeometry, InMouseEvent);
	TargetScale = HoverScale;
	PlayUI(HoverSound);
}

void UJuicyButtonWidget::NativeOnMouseLeave(const FPointerEvent& InMouseEvent)
{
	Super::NativeOnMouseLeave(InMouseEvent);
	bPressed = false;
	TargetScale = 1.f;
}

FReply UJuicyButtonWidget::NativeOnMouseButtonDown(const FGeometry& InGeometry, const FPointerEvent& InMouseEvent)
{
	bPressed = true;
	TargetScale = PressScale;
	return Super::NativeOnMouseButtonDown(InGeometry, InMouseEvent);
}

FReply UJuicyButtonWidget::NativeOnMouseButtonUp(const FGeometry& InGeometry, const FPointerEvent& InMouseEvent)
{
	if (bPressed)
	{
		bPressed = false;
		TargetScale = IsHovered() ? HoverScale : 1.f;
		// No RootButton to route the click? Treat mouse-up-inside as the click.
		if (!RootButton)
		{
			HandleRootButtonClicked();
		}
	}
	return Super::NativeOnMouseButtonUp(InGeometry, InMouseEvent);
}

void UJuicyButtonWidget::HandleRootButtonClicked()
{
	PlayUI(ClickSound);
	OnJuicyClicked.Broadcast();
}

void UJuicyButtonWidget::PlayUI(USoundBase* Sound)
{
	if (!Sound)
	{
		return;
	}
	if (const UGameInstance* GameInstance = GetGameInstance())
	{
		if (UStickmanAudioManager* Audio = GameInstance->GetSubsystem<UStickmanAudioManager>())
		{
			Audio->PlayUISound(Sound);
		}
	}
}
