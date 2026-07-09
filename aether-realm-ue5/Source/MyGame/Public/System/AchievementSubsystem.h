#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "System/AchievementTypes.h"
#include "AchievementSubsystem.generated.h"

class UOpenWorldGameInstance;
class UDataTable;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnStatReported, FName, StatKey, int32, NewValue);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnAchievementClaimed, FName, RowName);

/**
 * Achievement in-game (paralel dengan Steam achievement di
 * USteamIntegrationSubsystem — dua-duanya bisa dipicu dari stat yang sama).
 *
 * Model data minimal: yang di-save cuma LifetimeStats (counter) +
 * ClaimedAchievements. "Unlocked" TIDAK disimpan — selalu diturunkan dari
 * counter vs TargetCount, jadi tidak mungkin desync dan menambah achievement
 * baru di patch tidak butuh migrasi save.
 *
 * Pola table: UI pegang DT_Achievements, oper ke API (sama seperti
 * WishSystem/ExpeditionSubsystem).
 */
UCLASS()
class MYGAME_API UAchievementSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	/** Tambah counter. Dipanggil kode gameplay/BP tiap event. */
	UFUNCTION(BlueprintCallable, Category = "Achievement")
	void ReportStat(FName StatKey, int32 Delta = 1);

	/** Convenience untuk actor/world subsystem (ambil GI dari context). */
	static void Report(const UObject* WorldContext, FName StatKey, int32 Delta = 1);

	UFUNCTION(BlueprintPure, Category = "Achievement")
	int32 GetStat(FName StatKey) const;

	/** Unlocked = progress >= target (derived, tidak di-save). */
	UFUNCTION(BlueprintPure, Category = "Achievement")
	bool IsUnlocked(const UDataTable* AchievementTable, FName RowName) const;

	UFUNCTION(BlueprintPure, Category = "Achievement")
	bool IsClaimed(FName RowName) const;

	/** Klaim reward primogem. Genshin-style: unlock dulu, klaim manual. */
	UFUNCTION(BlueprintCallable, Category = "Achievement")
	EClaimResult ClaimAchievement(const UDataTable* AchievementTable, FName RowName);

	/** Jumlah unlocked-belum-diklaim (badge merah UI). */
	UFUNCTION(BlueprintPure, Category = "Achievement")
	int32 CountClaimable(const UDataTable* AchievementTable) const;

	UPROPERTY(BlueprintAssignable, Category = "Achievement")
	FOnStatReported OnStatReported;

	UPROPERTY(BlueprintAssignable, Category = "Achievement")
	FOnAchievementClaimed OnAchievementClaimed;

protected:
	UOpenWorldGameInstance* GetOWGameInstance() const;
};
