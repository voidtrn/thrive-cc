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

	/** Log resonance party aktif + refresh efeknya. */
	UFUNCTION(Exec) void ShowResonance();

	// --- Meta progression ---
	/** Set Adventure Rank langsung (log world level baru). */
	UFUNCTION(Exec) void SetAR(int32 NewRank);
	/** Tambah resin (lewat cap boleh — simulasi Fragile Resin). */
	UFUNCTION(Exec) void AddResinCheat(int32 Amount);
	/** Log resin sekarang + waktu sampai penuh. */
	UFUNCTION(Exec) void ShowResin();
	/** Percepat semua expedition aktif jadi selesai sekarang. */
	UFUNCTION(Exec) void FinishExpeditions();

	/** Tambah counter achievement manual (test unlock). */
	UFUNCTION(Exec) void ReportStatCheat(FName StatKey, int32 Delta);
	/** Log semua lifetime stats. */
	UFUNCTION(Exec) void ShowStats();
	/** Tambah EXP reputasi region (log level baru). */
	UFUNCTION(Exec) void AddRep(FName Region, int32 Exp);

	/** Test status: slow 50% + burn DOT 10 dps ke diri sendiri, Duration detik. */
	UFUNCTION(Exec) void TestStatus(float Duration = 5.f);

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
