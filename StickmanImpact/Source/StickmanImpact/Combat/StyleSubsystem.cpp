// Copyright StickmanImpact Project.

#include "StyleSubsystem.h"

void UStyleSubsystem::SetStyle(ECombatStyle NewStyle)
{
	if (NewStyle != ActiveStyle)
	{
		ActiveStyle = NewStyle;
		OnCombatStyleChanged.Broadcast(NewStyle);
	}
}

void UStyleSubsystem::AddStyleExp(int32 Amount)
{
	if (Amount <= 0)
	{
		return;
	}
	int32& Exp = StyleExp.FindOrAdd(ActiveStyle);
	const int32 OldLevel = LevelForExp(Exp);
	Exp += Amount;
	const int32 NewLevel = LevelForExp(Exp);
	if (NewLevel > OldLevel)
	{
		OnStyleLevelUp.Broadcast(ActiveStyle, NewLevel);
	}
}

int32 UStyleSubsystem::LevelForExp(int32 Exp) const
{
	int32 Level = 1;
	for (int32 Index = 0; Index < ExpPerLevel.Num(); ++Index)
	{
		if (Exp >= ExpPerLevel[Index])
		{
			Level = Index + 2;
		}
	}
	return Level;
}

int32 UStyleSubsystem::GetStyleLevel(ECombatStyle Style) const
{
	const int32* Exp = StyleExp.Find(Style);
	return LevelForExp(Exp ? *Exp : 0);
}

float UStyleSubsystem::GetStyleDamageMultiplier() const
{
	// Melee-focused styles hit harder; +3% per active-style level.
	const float Base = (ActiveStyle == ECombatStyle::Swordmaster || ActiveStyle == ECombatStyle::Gunslinger) ? 1.1f : 1.f;
	return Base + 0.03f * (GetStyleLevel(ActiveStyle) - 1);
}

float UStyleSubsystem::GetStyleEnergyMultiplier() const
{
	// RoyalGuard converts defense into energy; Gunslinger generates more on ranged hits.
	switch (ActiveStyle)
	{
		case ECombatStyle::RoyalGuard: return 1.25f;
		case ECombatStyle::Gunslinger: return 1.15f;
		default: return 1.f;
	}
}

int32 UStyleSubsystem::GetExtraAirDashes() const
{
	return ActiveStyle == ECombatStyle::Trickster ? GetStyleLevel(ECombatStyle::Trickster) : 0;
}
