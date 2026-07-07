#pragma once

#include "CoreMinimal.h"
#include "GameFramework/CheatManager.h"
#include "OpenWorldCheatManager.generated.h"

/**
 * Cheat/debug console commands untuk development. Aktif via console
 * (tekan ` / tilde saat Play) → ketik command.
 * Di-set di AOpenWorldPlayerController->CheatClass. Otomatis nonaktif di
 * Shipping build (CheatManager tidak dibuat di Shipping).
 *
 * Contoh: `AddPrimogems 1600`, `GodMode`, `GiveItem Oculus_Anemo 5`
 */
UCLASS()
class MYGAME_API UOpenWorldCheatManager : public UCheatManager
{
	GENERATED_BODY()

public:
	// --- Currency & wish ---
	UFUNCTION(Exec) void AddPrimogems(int32 Amount);
	UFUNCTION(Exec) void AddMora(int32 Amount);
	UFUNCTION(Exec) void AddFates(int32 Acquaint, int32 Intertwined);

	// --- Inventory ---
	UFUNCTION(Exec) void GiveItem(FName ItemId, int32 Count);

	// --- Character ---
	UFUNCTION(Exec) void HealFull();
	UFUNCTION(Exec) void SetCharLevel(int32 NewLevel);
	UFUNCTION(Exec) void FillEnergy();
	UFUNCTION(Exec) void AddConstellation(int32 Delta);

	// --- Leveling (konsumsi material via LevelingComponent) ---
	/** Naikkan level karakter aktif ke TargetLevel (butuh Hero's Wit + mora). */
	UFUNCTION(Exec) void LevelUpChar(int32 TargetLevel);
	/** Ascension karakter aktif (butuh material + level cap). */
	UFUNCTION(Exec) void AscendChar();
	/** Naikkan talent aktif 1 level. TalentIndex: 1=Normal 2=Skill 3=Burst. */
	UFUNCTION(Exec) void LevelTalent(int32 TalentIndex);

	/** Kebal damage (toggle). */
	UFUNCTION(Exec) void GodMode();

	// --- World ---
	UFUNCTION(Exec) void KillNearbyEnemies(float Radius = 2000.f);
	UFUNCTION(Exec) void UnlockAllWaypoints();
	UFUNCTION(Exec) void SetWorldTime(float Hours);
	UFUNCTION(Exec) void SetWeatherCheat(int32 WeatherIndex);

	// --- Save ---
	UFUNCTION(Exec) void SaveNow();
	UFUNCTION(Exec) void LoadNow();

private:
	bool bGodMode = false;

	class ACharacterBase* GetPlayerCharacter() const;
	class UOpenWorldGameInstance* GetGI() const;
	class ULevelingComponent* GetLeveling() const;
};
