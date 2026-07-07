#include "System/OpenWorldCheatManager.h"
#include "System/OpenWorldGameInstance.h"
#include "System/OpenWorldGameState.h"
#include "System/LevelingComponent.h"
#include "System/ResonanceComponent.h"
#include "System/OpenWorldPlayerController.h"
#include "Combat/StatusEffectComponent.h"
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

ULevelingComponent* UOpenWorldCheatManager::GetLeveling() const
{
	const APlayerController* PC = GetOuterAPlayerController();
	return PC ? PC->FindComponentByClass<ULevelingComponent>() : nullptr;
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
		GI->AddItem(ItemId, Count);
		UE_LOG(LogAetherRealm, Log, TEXT("[Cheat] +%d %s"), Count, *ItemId.ToString());
	}
}

void UOpenWorldCheatManager::LevelUpChar(int32 TargetLevel)
{
	ULevelingComponent* Lvl = GetLeveling();
	ACharacterBase* C = GetPlayerCharacter();
	if (Lvl && C)
	{
		const ELevelingResult R = Lvl->LevelUpCharacter(C, TargetLevel);
		UE_LOG(LogAetherRealm, Log, TEXT("[Cheat] LevelUpChar → %d, result %d"), C->Level, (int32)R);
	}
}

void UOpenWorldCheatManager::AscendChar()
{
	ULevelingComponent* Lvl = GetLeveling();
	ACharacterBase* C = GetPlayerCharacter();
	if (Lvl && C)
	{
		const ELevelingResult R = Lvl->AscendCharacter(C);
		UE_LOG(LogAetherRealm, Log, TEXT("[Cheat] AscendChar → phase %d, result %d"), C->Ascension, (int32)R);
	}
}

void UOpenWorldCheatManager::LevelTalent(int32 TalentIndex)
{
	ULevelingComponent* Lvl = GetLeveling();
	ACharacterBase* C = GetPlayerCharacter();
	if (Lvl && C)
	{
		const ETalentSource Talent = static_cast<ETalentSource>(FMath::Clamp(TalentIndex, 1, 3));
		const ELevelingResult R = Lvl->LevelUpTalent(C->CharacterID, Talent);
		UE_LOG(LogAetherRealm, Log, TEXT("[Cheat] LevelTalent %d, result %d"), TalentIndex, (int32)R);
	}
}

void UOpenWorldCheatManager::ShowResonance()
{
	const AOpenWorldPlayerController* PC = Cast<AOpenWorldPlayerController>(GetOuterAPlayerController());
	if (!PC || !PC->GetResonance())
	{
		return;
	}
	UResonanceComponent* Res = PC->GetResonance();
	Res->RefreshResonances();
	const TArray<EElementalResonance>& Active = Res->GetActiveResonances();
	UE_LOG(LogAetherRealm, Log, TEXT("[Cheat] Active resonances: %d"), Active.Num());
	for (const EElementalResonance R : Active)
	{
		UE_LOG(LogAetherRealm, Log, TEXT("  - Resonance %d"), (int32)R);
	}
}

void UOpenWorldCheatManager::TestStatus(float Duration)
{
	ACharacterBase* C = GetPlayerCharacter();
	if (!C)
	{
		return;
	}
	if (UStatusEffectComponent* Status = C->FindComponentByClass<UStatusEffectComponent>())
	{
		Status->ApplyStatus(TEXT("CheatSlow"), EStatusType::MoveSpeedMultiplier, 0.5f, Duration);
		Status->ApplyStatus(TEXT("CheatBurn"), EStatusType::DamageOverTime, 10.f, Duration, 1.f, EElement::Pyro);
		UE_LOG(LogAetherRealm, Log, TEXT("[Cheat] TestStatus: slow+burn %.1fs"), Duration);
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
