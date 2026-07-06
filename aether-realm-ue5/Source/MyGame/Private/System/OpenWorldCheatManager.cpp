#include "System/OpenWorldCheatManager.h"
#include "System/OpenWorldGameInstance.h"
#include "System/OpenWorldGameState.h"
#include "Character/CharacterBase.h"
#include "Character/EnemyBase.h"
#include "World/Waypoint.h"
#include "GameFramework/PlayerController.h"
#include "Kismet/GameplayStatics.h"
#include "MyGame.h"

ACharacterBase* UOpenWorldCheatManager::GetPlayerCharacter() const
{
	const APlayerController* PC = GetOuterAPlayerController();
	return PC ? Cast<ACharacterBase>(PC->GetPawn()) : nullptr;
}

UOpenWorldGameInstance* UOpenWorldCheatManager::GetGI() const
{
	const APlayerController* PC = GetOuterAPlayerController();
	return PC ? PC->GetGameInstance<UOpenWorldGameInstance>() : nullptr;
}

void UOpenWorldCheatManager::AddPrimogems(int32 Amount)
{
	if (UOpenWorldGameInstance* GI = GetGI()) { GI->Primogems += Amount; }
}

void UOpenWorldCheatManager::AddMora(int32 Amount)
{
	if (UOpenWorldGameInstance* GI = GetGI()) { GI->Mora += Amount; }
}

void UOpenWorldCheatManager::AddFates(int32 Acquaint, int32 Intertwined)
{
	if (UOpenWorldGameInstance* GI = GetGI())
	{
		GI->AcquaintFates += Acquaint;
		GI->IntertwinedFates += Intertwined;
	}
}

void UOpenWorldCheatManager::GiveItem(FName ItemId, int32 Count)
{
	if (UOpenWorldGameInstance* GI = GetGI())
	{
		GI->InventoryItems.FindOrAdd(ItemId) += Count;
		UE_LOG(LogAetherRealm, Log, TEXT("[Cheat] +%d %s"), Count, *ItemId.ToString());
	}
}

void UOpenWorldCheatManager::HealFull()
{
	if (ACharacterBase* C = GetPlayerCharacter())
	{
		C->Heal(C->MaxHP);
		C->CurrentStamina = C->MaxStamina;
	}
}

void UOpenWorldCheatManager::SetCharLevel(int32 NewLevel)
{
	if (ACharacterBase* C = GetPlayerCharacter())
	{
		C->Level = FMath::Clamp(NewLevel, 1, 90);
	}
}

void UOpenWorldCheatManager::FillEnergy()
{
	if (ACharacterBase* C = GetPlayerCharacter())
	{
		C->CurrentEnergy = C->MaxEnergy;
	}
}

void UOpenWorldCheatManager::AddConstellation(int32 Delta)
{
	if (ACharacterBase* C = GetPlayerCharacter())
	{
		if (UOpenWorldGameInstance* GI = GetGI())
		{
			int32& Con = GI->CharacterConstellations.FindOrAdd(C->CharacterID);
			Con = FMath::Clamp(Con + Delta, 0, 6);
		}
	}
}

void UOpenWorldCheatManager::GodMode()
{
	bGodMode = !bGodMode;
	if (ACharacterBase* C = GetPlayerCharacter())
	{
		C->SetInvulnerable(bGodMode);
	}
	UE_LOG(LogAetherRealm, Log, TEXT("[Cheat] GodMode %s"), bGodMode ? TEXT("ON") : TEXT("OFF"));
}

void UOpenWorldCheatManager::KillNearbyEnemies(float Radius)
{
	const ACharacterBase* Player = GetPlayerCharacter();
	if (!Player)
	{
		return;
	}

	TArray<AActor*> Enemies;
	UGameplayStatics::GetAllActorsOfClass(GetWorld(), AEnemyBase::StaticClass(), Enemies);
	for (AActor* Actor : Enemies)
	{
		if (FVector::Dist(Actor->GetActorLocation(), Player->GetActorLocation()) <= Radius)
		{
			if (ACharacterBase* Enemy = Cast<ACharacterBase>(Actor))
			{
				Enemy->ApplyDamage(Enemy->MaxHP * 10.f, EElement::None, EHitReaction::Heavy);
			}
		}
	}
}

void UOpenWorldCheatManager::UnlockAllWaypoints()
{
	TArray<AActor*> Waypoints;
	UGameplayStatics::GetAllActorsOfClass(GetWorld(), AWaypoint::StaticClass(), Waypoints);
	if (UOpenWorldGameInstance* GI = GetGI())
	{
		for (AActor* Actor : Waypoints)
		{
			if (const AWaypoint* WP = Cast<AWaypoint>(Actor))
			{
				GI->UnlockedWaypoints.Add(WP->GetWaypointId());
			}
		}
	}
}

void UOpenWorldCheatManager::SetWorldTime(float Hours)
{
	if (AOpenWorldGameState* GS = GetWorld()->GetGameState<AOpenWorldGameState>())
	{
		GS->SetWorldTimeHours(Hours);
	}
}

void UOpenWorldCheatManager::SetWeatherCheat(int32 WeatherIndex)
{
	if (AOpenWorldGameState* GS = GetWorld()->GetGameState<AOpenWorldGameState>())
	{
		GS->SetWeather(static_cast<EWeatherType>(FMath::Clamp(WeatherIndex, 0, 5)));
	}
}

void UOpenWorldCheatManager::SaveNow()
{
	if (UOpenWorldGameInstance* GI = GetGI()) { GI->SaveToSlot(TEXT("Slot0")); }
}

void UOpenWorldCheatManager::LoadNow()
{
	if (UOpenWorldGameInstance* GI = GetGI()) { GI->LoadFromSlot(TEXT("Slot0")); }
}
