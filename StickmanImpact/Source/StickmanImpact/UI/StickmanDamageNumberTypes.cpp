// Copyright StickmanImpact Project.

#include "StickmanDamageNumberTypes.h"

FLinearColor UStickmanDamageNumberStatics::GetDamageNumberColor(EDamageNumberType Type)
{
	switch (Type)
	{
		case EDamageNumberType::Physical: return FLinearColor::White;
		case EDamageNumberType::Pyro: return FLinearColor::Red;
		case EDamageNumberType::HydroCryo: return FLinearColor::Blue;
		case EDamageNumberType::Electro: return FLinearColor(0.6f, 0.2f, 0.9f); // Purple
		case EDamageNumberType::Critical: return FLinearColor(1.f, 0.84f, 0.f); // Gold
		case EDamageNumberType::Reaction: return FLinearColor(1.f, 0.5f, 0.f); // Orange
		default: return FLinearColor::White;
	}
}

EDamageNumberType UStickmanDamageNumberStatics::GetDamageNumberTypeForElement(EStickmanElement Element)
{
	switch (Element)
	{
		case EStickmanElement::Pyro: return EDamageNumberType::Pyro;
		case EStickmanElement::Hydro:
		case EStickmanElement::Cryo: return EDamageNumberType::HydroCryo;
		case EStickmanElement::Electro: return EDamageNumberType::Electro;
		default: return EDamageNumberType::Physical;
	}
}

FLinearColor UStickmanDamageNumberStatics::GetElementColor(EStickmanElement Element)
{
	switch (Element)
	{
		case EStickmanElement::Pyro: return FLinearColor::Red;
		case EStickmanElement::Cryo: return FLinearColor(0.f, 0.9f, 0.9f); // Cyan
		case EStickmanElement::Hydro: return FLinearColor::Blue;
		case EStickmanElement::Electro: return FLinearColor(0.6f, 0.2f, 0.9f); // Purple
		case EStickmanElement::Anemo: return FLinearColor(0.f, 0.8f, 0.7f); // Teal
		case EStickmanElement::Geo: return FLinearColor::Yellow;
		case EStickmanElement::Dendro: return FLinearColor::Green;
		default: return FLinearColor::White;
	}
}

FText UStickmanDamageNumberStatics::GetReactionDisplayName(EStickmanReactionType Reaction)
{
	switch (Reaction)
	{
		case EStickmanReactionType::Melt: return NSLOCTEXT("Reactions", "Melt", "MELT");
		case EStickmanReactionType::Vaporize: return NSLOCTEXT("Reactions", "Vaporize", "VAPORIZE");
		case EStickmanReactionType::Overload: return NSLOCTEXT("Reactions", "Overload", "OVERLOAD");
		case EStickmanReactionType::Burning: return NSLOCTEXT("Reactions", "Burning", "BURNING");
		case EStickmanReactionType::Frozen: return NSLOCTEXT("Reactions", "Frozen", "FROZEN");
		case EStickmanReactionType::Superconduct: return NSLOCTEXT("Reactions", "Superconduct", "SUPERCONDUCT");
		case EStickmanReactionType::ElectroCharged: return NSLOCTEXT("Reactions", "ElectroCharged", "ELECTRO-CHARGED");
		case EStickmanReactionType::Bloom: return NSLOCTEXT("Reactions", "Bloom", "BLOOM");
		case EStickmanReactionType::Swirl: return NSLOCTEXT("Reactions", "Swirl", "SWIRL");
		case EStickmanReactionType::Crystallize: return NSLOCTEXT("Reactions", "Crystallize", "CRYSTALLIZE");
		case EStickmanReactionType::Quicken: return NSLOCTEXT("Reactions", "Quicken", "QUICKEN");
		case EStickmanReactionType::Aggravate: return NSLOCTEXT("Reactions", "Aggravate", "AGGRAVATE");
		case EStickmanReactionType::Spread: return NSLOCTEXT("Reactions", "Spread", "SPREAD");
		default: return FText::GetEmpty();
	}
}
