#include "System/ResonanceComponent.h"
#include "System/OpenWorldGameInstance.h"
#include "System/PartyManagerComponent.h"
#include "System/CharacterRegistry.h"
#include "Combat/CharacterProgressionComponent.h"
#include "Combat/ShieldComponent.h"
#include "Character/CharacterBase.h"
#include "GameFramework/PlayerController.h"
#include "Engine/DataTable.h"
#include "MyGame.h"

UOpenWorldGameInstance* UResonanceComponent::GetGI() const
{
	return GetWorld() ? GetWorld()->GetGameInstance<UOpenWorldGameInstance>() : nullptr;
}

void UResonanceComponent::BindToPartyManager(UPartyManagerComponent* PartyManager)
{
	if (PartyManager)
	{
		PartyManager->OnPartySwapped.AddDynamic(this, &UResonanceComponent::HandlePartySwapped);
	}
}

void UResonanceComponent::HandlePartySwapped(int32 NewIndex, ACharacterBase* NewCharacter)
{
	// Resonance dihitung dari komposisi party (tidak berubah saat swap), tapi
	// karakter aktif baru butuh efek stat dipasang ulang.
	ComputeActiveResonances();
	ApplyToCharacter(NewCharacter);
}

EElement UResonanceComponent::GetElementForCharacter(FName CharacterId) const
{
	if (!CharacterTable || CharacterId.IsNone())
	{
		return EElement::None;
	}
	if (const FCharacterDefRow* Row = CharacterTable->FindRow<FCharacterDefRow>(CharacterId, TEXT("Resonance")))
	{
		return Row->Element;
	}
	return EElement::None;
}

void UResonanceComponent::ComputeActiveResonances()
{
	ActiveResonances.Reset();

	const UOpenWorldGameInstance* GI = GetGI();
	if (!GI)
	{
		return;
	}

	// Hitung jumlah tiap elemen dalam party.
	TMap<EElement, int32> Counts;
	for (const FName& Id : GI->SavedPartyCharacterIds)
	{
		const EElement E = GetElementForCharacter(Id);
		if (E != EElement::None)
		{
			Counts.FindOrAdd(E)++;
		}
	}

	auto CountOf = [&Counts](EElement E) { const int32* C = Counts.Find(E); return C ? *C : 0; };

	if (CountOf(EElement::Pyro)    >= 2) { ActiveResonances.Add(EElementalResonance::FerventFlames); }
	if (CountOf(EElement::Hydro)   >= 2) { ActiveResonances.Add(EElementalResonance::SoothingWater); }
	if (CountOf(EElement::Cryo)    >= 2) { ActiveResonances.Add(EElementalResonance::ShatteringIce); }
	if (CountOf(EElement::Electro) >= 2) { ActiveResonances.Add(EElementalResonance::HighVoltage); }
	if (CountOf(EElement::Anemo)   >= 2) { ActiveResonances.Add(EElementalResonance::ImpetuousWinds); }
	if (CountOf(EElement::Geo)     >= 2) { ActiveResonances.Add(EElementalResonance::EnduringRock); }
	if (CountOf(EElement::Dendro)  >= 2) { ActiveResonances.Add(EElementalResonance::SprawlingGreenery); }

	// Protective Canopy: 4 elemen berbeda (party of 4).
	if (Counts.Num() >= 4)
	{
		ActiveResonances.Add(EElementalResonance::ProtectiveCanopy);
	}

	OnResonanceChanged.Broadcast(ActiveResonances);
}

void UResonanceComponent::ApplyToCharacter(ACharacterBase* Character)
{
	if (!Character)
	{
		return;
	}

	// Terjemahkan resonance aktif → kontribusi stat.
	float ATKPercent = 0.f;
	float HPPercent = 0.f;
	float EMFlat = 0.f;
	float StaminaMult = 1.f;
	float RESBonus = 0.f;

	for (const EElementalResonance R : ActiveResonances)
	{
		switch (R)
		{
		case EElementalResonance::FerventFlames:     ATKPercent += 0.25f; break;
		case EElementalResonance::SoothingWater:     HPPercent += 0.25f;  break;
		case EElementalResonance::SprawlingGreenery: EMFlat += 50.f;      break;
		case EElementalResonance::ImpetuousWinds:    StaminaMult *= 0.85f; break;
		case EElementalResonance::ProtectiveCanopy:  RESBonus += 0.15f;   break;
		default: break; // kondisional — via query
		}
	}

	Character->StaminaCostMultiplier = StaminaMult;
	Character->FlatRESBonus = RESBonus;

	// Enduring Rock: shield strength bonus ke shield component.
	if (UShieldComponent* Shield = Character->FindComponentByClass<UShieldComponent>())
	{
		Shield->ExtraShieldStrength = HasResonance(EElementalResonance::EnduringRock) ? 0.15f : 0.f;
	}

	if (UCharacterProgressionComponent* Prog = Character->FindComponentByClass<UCharacterProgressionComponent>())
	{
		Prog->ResonanceATKPercent = ATKPercent;
		Prog->ResonanceHPPercent = HPPercent;
		Prog->ResonanceEMFlat = EMFlat;
		Prog->Recalculate(); // fold kontribusi ke stat final
	}
}

void UResonanceComponent::RefreshResonances()
{
	ComputeActiveResonances();

	// Terapkan ke karakter aktif (pawn yang dikuasai PlayerController).
	if (const APlayerController* PC = Cast<APlayerController>(GetOwner()))
	{
		if (ACharacterBase* Active = Cast<ACharacterBase>(PC->GetPawn()))
		{
			ApplyToCharacter(Active);
		}
	}
}
