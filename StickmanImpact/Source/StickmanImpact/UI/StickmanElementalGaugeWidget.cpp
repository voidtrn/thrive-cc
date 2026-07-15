// Copyright StickmanImpact Project.

#include "StickmanElementalGaugeWidget.h"
#include "StickmanDamageNumberTypes.h"
#include "Components/Image.h"
#include "Components/ProgressBar.h"
#include "Components/TextBlock.h"
#include "TimerManager.h"

void UStickmanElementalGaugeWidget::GetWidgetsForElement(EStickmanElement Element, UImage*& OutImage, UProgressBar*& OutBar)
{
	switch (Element)
	{
		case EStickmanElement::Pyro: OutImage = Image_Pyro; OutBar = Bar_Pyro; break;
		case EStickmanElement::Cryo: OutImage = Image_Cryo; OutBar = Bar_Cryo; break;
		case EStickmanElement::Hydro: OutImage = Image_Hydro; OutBar = Bar_Hydro; break;
		case EStickmanElement::Electro: OutImage = Image_Electro; OutBar = Bar_Electro; break;
		case EStickmanElement::Anemo: OutImage = Image_Anemo; OutBar = Bar_Anemo; break;
		case EStickmanElement::Geo: OutImage = Image_Geo; OutBar = Bar_Geo; break;
		case EStickmanElement::Dendro: OutImage = Image_Dendro; OutBar = Bar_Dendro; break;
		default: OutImage = nullptr; OutBar = nullptr; break;
	}
}

void UStickmanElementalGaugeWidget::SetElementWidgets(EStickmanElement Element, bool bVisible, float DurationPercent)
{
	UImage* ElementImage = nullptr;
	UProgressBar* ElementBar = nullptr;
	GetWidgetsForElement(Element, ElementImage, ElementBar);

	const ESlateVisibility Visibility = bVisible ? ESlateVisibility::HitTestInvisible : ESlateVisibility::Collapsed;

	if (ElementImage)
	{
		ElementImage->SetVisibility(Visibility);
		ElementImage->SetColorAndOpacity(FSlateColor(UStickmanDamageNumberStatics::GetElementColor(Element)));
	}
	if (ElementBar)
	{
		ElementBar->SetVisibility(Visibility);
		ElementBar->SetPercent(FMath::Clamp(DurationPercent, 0.f, 1.f));
		ElementBar->SetFillColorAndOpacity(UStickmanDamageNumberStatics::GetElementColor(Element));
	}
}

void UStickmanElementalGaugeWidget::UpdateGauges(const TArray<FActiveElement>& ActiveElements)
{
	static const EStickmanElement AllElements[] = {
		EStickmanElement::Pyro, EStickmanElement::Cryo, EStickmanElement::Hydro, EStickmanElement::Electro,
		EStickmanElement::Anemo, EStickmanElement::Geo, EStickmanElement::Dendro
	};

	const float Now = GetWorld() ? GetWorld()->GetTimeSeconds() : 0.f;

	for (EStickmanElement Element : AllElements)
	{
		const FActiveElement* Found = ActiveElements.FindByPredicate(
			[Element](const FActiveElement& A) { return A.Element == Element; });

		if (Found)
		{
			const float Percent = Found->Duration > 0.f ? Found->GetRemainingTime(Now) / Found->Duration : 0.f;
			SetElementWidgets(Element, true, Percent);
		}
		else
		{
			SetElementWidgets(Element, false, 0.f);
		}
	}
}

void UStickmanElementalGaugeWidget::ShowReactionPopup(EStickmanReactionType Reaction, float ReactionDamage)
{
	if (ReactionPopupText)
	{
		FText Text = UStickmanDamageNumberStatics::GetReactionDisplayName(Reaction);
		if (ReactionDamage > 0.f)
		{
			Text = FText::Format(NSLOCTEXT("Reactions", "PopupWithDamage", "{0} {1}"), Text,
				FText::AsNumber(FMath::RoundToInt(ReactionDamage)));
		}
		ReactionPopupText->SetText(Text);
		ReactionPopupText->SetColorAndOpacity(
			FSlateColor(UStickmanDamageNumberStatics::GetDamageNumberColor(EDamageNumberType::Reaction)));
		ReactionPopupText->SetVisibility(ESlateVisibility::HitTestInvisible);
	}

	if (ReactionPopupIcon)
	{
		if (TObjectPtr<UTexture2D>* Icon = ReactionIcons.Find(Reaction))
		{
			ReactionPopupIcon->SetBrushFromTexture(*Icon);
			ReactionPopupIcon->SetVisibility(ESlateVisibility::HitTestInvisible);
		}
		else
		{
			ReactionPopupIcon->SetVisibility(ESlateVisibility::Collapsed);
		}
	}

	if (ReactionPopupAnim)
	{
		PlayAnimation(ReactionPopupAnim);
	}

	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimer(PopupHideTimerHandle, this,
			&UStickmanElementalGaugeWidget::HideReactionPopup, PopupDisplayDuration, false);
	}
}

void UStickmanElementalGaugeWidget::HideReactionPopup()
{
	if (ReactionPopupText)
	{
		ReactionPopupText->SetVisibility(ESlateVisibility::Collapsed);
	}
	if (ReactionPopupIcon)
	{
		ReactionPopupIcon->SetVisibility(ESlateVisibility::Collapsed);
	}
}
