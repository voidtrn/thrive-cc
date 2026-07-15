// Copyright StickmanImpact Project.

#include "StickmanDamageNumberWidget.h"
#include "Components/TextBlock.h"

void UStickmanDamageNumberWidget::Activate(float DamageAmount, EDamageNumberType Type)
{
	ElapsedTime = 0.f;
	bActive = true;
	SetVisibility(ESlateVisibility::HitTestInvisible);
	SetRenderOpacity(1.f);
	SetRenderTranslation(FVector2D::ZeroVector);

	// Bigger numbers (and reaction damage) read as bigger text, matching the design spec.
	const bool bIsReaction = Type == EDamageNumberType::Reaction;
	const float ScaleFromDamage = FMath::Clamp(0.8f + DamageAmount / 500.f, 0.8f, 1.6f);
	const float FinalScale = bIsReaction ? ScaleFromDamage * 1.3f : ScaleFromDamage;
	SetRenderScale(FVector2D(FinalScale, FinalScale));

	if (DamageText)
	{
		DamageText->SetText(FText::AsNumber(FMath::RoundToInt(DamageAmount)));
		DamageText->SetColorAndOpacity(FSlateColor(UStickmanDamageNumberStatics::GetDamageNumberColor(Type)));
	}
}

void UStickmanDamageNumberWidget::NativeTick(const FGeometry& MyGeometry, float InDeltaTime)
{
	Super::NativeTick(MyGeometry, InDeltaTime);

	if (!bActive)
	{
		return;
	}

	ElapsedTime += InDeltaTime;

	const FVector2D CurrentTranslation = GetRenderTransform().Translation;
	SetRenderTranslation(FVector2D(CurrentTranslation.X, CurrentTranslation.Y - RiseSpeed * InDeltaTime));

	const float FadeStartTime = Lifetime * FadeStartFraction;
	if (ElapsedTime > FadeStartTime)
	{
		const float FadeAlpha = FMath::Clamp((ElapsedTime - FadeStartTime) / (Lifetime - FadeStartTime), 0.f, 1.f);
		SetRenderOpacity(1.f - FadeAlpha);
	}

	if (ElapsedTime >= Lifetime)
	{
		bActive = false;
		SetVisibility(ESlateVisibility::Collapsed);
		OnLifetimeEnded.ExecuteIfBound(this);
	}
}
