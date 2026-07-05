#include "UI/UITweenSubsystem.h"
#include "Components/Widget.h"

void UUITweenSubsystem::Play(UWidget* Widget, EUITween Tween, float Duration)
{
	if (!Widget || Duration <= 0.f)
	{
		return;
	}

	// Replace tween aktif di widget yang sama
	ActiveTweens.RemoveAll([Widget](const FActiveTween& T) { return T.Widget.Get() == Widget; });

	FActiveTween NewTween;
	NewTween.Widget = Widget;
	NewTween.Type = Tween;
	NewTween.Duration = Duration;
	ActiveTweens.Add(NewTween);

	ApplyTween(Widget, Tween, 0.f); // frame pertama langsung state awal
}

void UUITweenSubsystem::Tick(float DeltaTime)
{
	for (int32 i = ActiveTweens.Num() - 1; i >= 0; --i)
	{
		FActiveTween& Tween = ActiveTweens[i];
		UWidget* Widget = Tween.Widget.Get();
		if (!Widget)
		{
			ActiveTweens.RemoveAt(i);
			continue;
		}

		Tween.Elapsed += DeltaTime;
		const float Alpha = FMath::Clamp(Tween.Elapsed / Tween.Duration, 0.f, 1.f);
		ApplyTween(Widget, Tween.Type, Alpha);

		if (Alpha >= 1.f)
		{
			ActiveTweens.RemoveAt(i);
		}
	}
}

float UUITweenSubsystem::EaseOutBack(float T)
{
	// Overshoot elastis — khas anime UI pop
	constexpr float C1 = 1.70158f;
	constexpr float C3 = C1 + 1.f;
	return 1.f + C3 * FMath::Pow(T - 1.f, 3) + C1 * FMath::Pow(T - 1.f, 2);
}

float UUITweenSubsystem::EaseOutCubic(float T)
{
	return 1.f - FMath::Pow(1.f - T, 3);
}

void UUITweenSubsystem::ApplyTween(UWidget* Widget, EUITween Type, float Alpha)
{
	switch (Type)
	{
	case EUITween::PopIn:
	{
		const float Scale = FMath::Lerp(0.6f, 1.f, EaseOutBack(Alpha));
		Widget->SetRenderScale(FVector2D(Scale, Scale));
		Widget->SetRenderOpacity(EaseOutCubic(Alpha));
		break;
	}
	case EUITween::PopOut:
	{
		const float Scale = FMath::Lerp(1.f, 0.85f, EaseOutCubic(Alpha));
		Widget->SetRenderScale(FVector2D(Scale, Scale));
		Widget->SetRenderOpacity(1.f - Alpha);
		break;
	}
	case EUITween::FadeIn:
		Widget->SetRenderOpacity(EaseOutCubic(Alpha));
		break;

	case EUITween::FadeOut:
		Widget->SetRenderOpacity(1.f - EaseOutCubic(Alpha));
		break;

	case EUITween::SlideInRight:
	{
		const float Offset = FMath::Lerp(60.f, 0.f, EaseOutCubic(Alpha));
		Widget->SetRenderTranslation(FVector2D(Offset, 0.f));
		Widget->SetRenderOpacity(EaseOutCubic(Alpha));
		break;
	}
	case EUITween::Pulse:
	{
		// 1 -> 1.08 -> 1 (sine bell)
		const float Scale = 1.f + 0.08f * FMath::Sin(Alpha * PI);
		Widget->SetRenderScale(FVector2D(Scale, Scale));
		break;
	}
	}
}
