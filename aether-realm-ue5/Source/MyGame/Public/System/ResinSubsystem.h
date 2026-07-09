#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "ResinSubsystem.generated.h"

class UOpenWorldGameInstance;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnResinChanged, int32, NewResin);

/**
 * Resin ("Aether Dew") — gate reward endgame ala Genshin Original Resin.
 * Domain reward 20, world boss 40, weekly boss 60 (caller yang menentukan;
 * BP panggil SpendResin sebelum kasih loot).
 *
 * Regen 1 per 8 menit real-time berbasis TIMESTAMP, bukan timer — jadi tetap
 * jalan saat game ditutup (dihitung ulang saat load). State persist di
 * GameInstance (Resin + LastResinUpdate), subsystem ini pure logic —
 * pola sama dengan UWishSystem.
 *
 * Aturan timestamp: LastResinUpdate maju hanya sebesar interval UTUH yang
 * dikonsumsi, sisa detik tidak hangus. Saat resin >= cap, regen berhenti
 * dan timestamp di-pin ke Now (mulai hitung lagi begitu turun di bawah cap).
 */
UCLASS()
class MYGAME_API UResinSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	static constexpr int32 ResinCap = 160;
	static constexpr int32 RegenSecondsPerResin = 480; // 8 menit
	/** Overflow dari item (Fragile Resin) boleh melewati cap sampai batas ini. */
	static constexpr int32 HardOverflowCap = 2000;

	/** Resin sekarang (lazily meng-apply regen sejak update terakhir). */
	UFUNCTION(BlueprintCallable, Category = "Resin")
	int32 GetResin();

	/** Belanja resin (reward domain/boss). False kalau kurang — tanpa perubahan. */
	UFUNCTION(BlueprintCallable, Category = "Resin")
	bool SpendResin(int32 Amount);

	/** Tambah resin dari item (boleh lewat cap — regen berhenti selama >= cap). */
	UFUNCTION(BlueprintCallable, Category = "Resin")
	void AddResin(int32 Amount);

	/** Detik sampai +1 resin berikutnya (0 kalau sudah >= cap). */
	UFUNCTION(BlueprintCallable, Category = "Resin")
	int32 SecondsUntilNextResin();

	/** Detik sampai penuh (0 kalau sudah >= cap). */
	UFUNCTION(BlueprintCallable, Category = "Resin")
	int32 SecondsUntilFull();

	UPROPERTY(BlueprintAssignable, Category = "Resin")
	FOnResinChanged OnResinChanged;

	/**
	 * Inti regen — pure static, deterministik, automation-testable.
	 * Menghitung resin baru + timestamp baru dari state lama dan Now.
	 */
	static void ComputeRegen(int32 CurrentResin, const FDateTime& LastUpdate, const FDateTime& Now,
		int32& OutResin, FDateTime& OutTimestamp);

protected:
	/** Apply regen ke GameInstance. Return resin terkini. */
	int32 RefreshFromClock();

	UOpenWorldGameInstance* GetOWGameInstance() const;
};
