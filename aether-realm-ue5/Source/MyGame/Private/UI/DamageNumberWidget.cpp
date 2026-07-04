#include "UI/DamageNumberWidget.h"

void UDamageNumberWidget::SetDamageInfo(const FDamageResult& Result)
{
	DisplayText = FText::AsNumber(FMath::RoundToInt(Result.FinalDamage));
	bCrit = Result.bCrit;
	Reaction = Result.Reaction;

	if (Result.Reaction != EReactionType::None)
	{
		DisplayColor = GetReactionColor(Result.Reaction);
		FontScale = 1.5f;
	}
	else if (Result.bCrit)
	{
		DisplayColor = FLinearColor(1.f, 0.85f, 0.1f); // kuning
		FontScale = 1.35f;
	}
	else if (Result.Element != EElement::None)
	{
		DisplayColor = GetElementColor(Result.Element);
		FontScale = 1.f;
	}
	else
	{
		DisplayColor = FLinearColor::White;
		FontScale = 1.f;
	}

	OnDamageInfoSet();
}

void UDamageNumberWidget::SetHealInfo(float Amount)
{
	DisplayText = FText::Format(NSLOCTEXT("Damage", "HealFmt", "+{0}"),
		FText::AsNumber(FMath::RoundToInt(Amount)));
	DisplayColor = FLinearColor(0.3f, 0.9f, 0.35f); // hijau
	FontScale = 1.f;
	bCrit = false;
	Reaction = EReactionType::None;

	OnDamageInfoSet();
}

FLinearColor UDamageNumberWidget::GetElementColor(EElement Element)
{
	switch (Element)
	{
	case EElement::Pyro:    return FLinearColor(1.00f, 0.42f, 0.25f);
	case EElement::Hydro:   return FLinearColor(0.25f, 0.60f, 1.00f);
	case EElement::Cryo:    return FLinearColor(0.60f, 0.90f, 1.00f);
	case EElement::Electro: return FLinearColor(0.70f, 0.40f, 1.00f);
	case EElement::Anemo:   return FLinearColor(0.45f, 0.95f, 0.75f);
	case EElement::Geo:     return FLinearColor(1.00f, 0.80f, 0.30f);
	case EElement::Dendro:  return FLinearColor(0.55f, 0.85f, 0.25f);
	default:                return FLinearColor::White;
	}
}

FLinearColor UDamageNumberWidget::GetReactionColor(EReactionType Reaction)
{
	switch (Reaction)
	{
	case EReactionType::Vaporize:
	case EReactionType::Melt:
		return FLinearColor(1.f, 0.25f, 0.2f); // merah besar — amp

	case EReactionType::Overload:
	case EReactionType::Burgeon:
		return FLinearColor(1.f, 0.5f, 0.15f);

	case EReactionType::ElectroCharged:
	case EReactionType::Hyperbloom:
	case EReactionType::Aggravate:
		return FLinearColor(0.75f, 0.45f, 1.f);

	case EReactionType::Superconduct:
	case EReactionType::Freeze:
	case EReactionType::Shatter:
		return FLinearColor(0.65f, 0.92f, 1.f);

	case EReactionType::Swirl:
		return FLinearColor(0.45f, 0.95f, 0.75f);

	case EReactionType::Crystallize:
		return FLinearColor(1.f, 0.8f, 0.3f);

	case EReactionType::Bloom:
	case EReactionType::Quicken:
	case EReactionType::Spread:
		return FLinearColor(0.55f, 0.85f, 0.25f);

	default:
		return FLinearColor::White;
	}
}
