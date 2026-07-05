#include "UI/UIStatics.h"
#include "GameFramework/GameUserSettings.h"

FLinearColor UUIStatics::GetRarityColor(EItemRarity Rarity)
{
	switch (Rarity)
	{
	case EItemRarity::FiveStar:  return FLinearColor(0.95f, 0.75f, 0.25f); // emas
	case EItemRarity::FourStar:  return FLinearColor(0.65f, 0.45f, 0.90f); // ungu
	case EItemRarity::ThreeStar: return FLinearColor(0.35f, 0.60f, 0.95f); // biru
	case EItemRarity::TwoStar:   return FLinearColor(0.45f, 0.75f, 0.55f);
	default:                     return FLinearColor(0.65f, 0.65f, 0.65f);
	}
}

TArray<EElementalResonance> UUIStatics::GetPartyResonances(const TArray<EElement>& PartyElements)
{
	TArray<EElementalResonance> Result;

	TMap<EElement, int32> Counts;
	for (const EElement Element : PartyElements)
	{
		if (Element != EElement::None)
		{
			Counts.FindOrAdd(Element)++;
		}
	}

	static const TMap<EElement, EElementalResonance> PairResonance = {
		{ EElement::Pyro,    EElementalResonance::FerventFlames },
		{ EElement::Hydro,   EElementalResonance::SoothingWater },
		{ EElement::Cryo,    EElementalResonance::ShatteringIce },
		{ EElement::Electro, EElementalResonance::HighVoltage },
		{ EElement::Anemo,   EElementalResonance::ImpetuousWinds },
		{ EElement::Geo,     EElementalResonance::EnduringRock },
		{ EElement::Dendro,  EElementalResonance::SprawlingGreenery },
	};

	for (const auto& Pair : Counts)
	{
		if (Pair.Value >= 2)
		{
			if (const EElementalResonance* Resonance = PairResonance.Find(Pair.Key))
			{
				Result.Add(*Resonance);
			}
		}
	}

	// 4 elemen berbeda (party penuh, tanpa duplikat) = Protective Canopy
	if (Result.IsEmpty() && Counts.Num() >= 4)
	{
		Result.Add(EElementalResonance::ProtectiveCanopy);
	}

	return Result;
}

void UUIStatics::ApplyGraphicsSettings(const FGameSettings& Settings)
{
	UGameUserSettings* UserSettings = UGameUserSettings::GetGameUserSettings();
	if (!UserSettings)
	{
		return;
	}

	UserSettings->SetOverallScalabilityLevel(FMath::Clamp(Settings.GraphicsQuality, 0, 3));
	UserSettings->SetVSyncEnabled(true);
	UserSettings->SetFrameRateLimit(60.f); // target spec; expose kalau perlu
	UserSettings->ApplySettings(false);

	// Audio: volume via SoundMix/SoundClass — set di BP Settings screen
	// (SetSoundMixClassOverride per class Master/Music/SFX/Voice).
}
