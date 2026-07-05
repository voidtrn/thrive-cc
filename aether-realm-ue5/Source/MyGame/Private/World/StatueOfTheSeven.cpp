#include "World/StatueOfTheSeven.h"
#include "Character/CharacterBase.h"
#include "System/OpenWorldGameInstance.h"
#include "MyGame.h"

AStatueOfTheSeven::AStatueOfTheSeven()
{
	PrimaryActorTick.bCanEverTick = false;
}

void AStatueOfTheSeven::Worship(APlayerController* Player)
{
	if (!Player)
	{
		return;
	}

	// Heal + full energy pawn aktif. Phase 5: loop seluruh party + revive
	// karakter mati dari PartyCharacterData.
	if (ACharacterBase* Character = Cast<ACharacterBase>(Player->GetPawn()))
	{
		Character->Heal(Character->MaxHP);
		Character->CurrentStamina = Character->MaxStamina;
		Character->CurrentEnergy = Character->MaxEnergy;
	}

	if (UOpenWorldGameInstance* GI = GetGameInstance<UOpenWorldGameInstance>())
	{
		// Revive semua anggota party di data persistent
		for (FCharacterSaveData& Data : GI->PartyCharacterData)
		{
			Data.CurrentHP = -1.f; // -1 = full
		}
		GI->AutoSave();
	}

	UE_LOG(LogAetherRealm, Log, TEXT("Statue worship: party healed (region %s)"), *RegionName.ToString());
}

bool AStatueOfTheSeven::OfferOculi(APlayerController* Player)
{
	UOpenWorldGameInstance* GI = GetGameInstance<UOpenWorldGameInstance>();
	if (!GI)
	{
		return false;
	}

	// Cap total: 100 base + bonus <= 240
	if (100.f + GI->StaminaCapBonus + StaminaPerUpgrade > 240.f)
	{
		return false;
	}

	int32* OculiCount = GI->InventoryItems.Find(OculiItemId);
	if (!OculiCount || *OculiCount < OculiPerUpgrade)
	{
		return false;
	}

	*OculiCount -= OculiPerUpgrade;
	GI->StaminaCapBonus += StaminaPerUpgrade;

	// Apply langsung ke pawn aktif
	if (Player)
	{
		if (ACharacterBase* Character = Cast<ACharacterBase>(Player->GetPawn()))
		{
			Character->MaxStamina = FMath::Min(240.f, 100.f + GI->StaminaCapBonus);
			Character->CurrentStamina = Character->MaxStamina;
		}
	}

	GI->AutoSave();
	UE_LOG(LogAetherRealm, Log, TEXT("Stamina upgraded: +%.0f (bonus total %.0f)"),
		StaminaPerUpgrade, GI->StaminaCapBonus);
	return true;
}
