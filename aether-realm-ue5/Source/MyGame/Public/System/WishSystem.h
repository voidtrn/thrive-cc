#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "System/WishTypes.h"
#include "WishSystem.generated.h"

class UOpenWorldGameInstance;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnWishCompleted, const TArray<FWishResult>&, Results);

/**
 * Wish/gacha engine. State (pity, currency, owned) hidup di GameInstance
 * supaya ikut save. Subsystem ini pure logic:
 *
 * Rates: 5* 0.6% / 4* 5.1% / 3* sisa.
 * Soft pity: mulai (hard-15), naik linear 6%/pull → hard pity 100%.
 * 4* guarantee tiap 10 pull. Pity carry over antar banner tipe sama.
 * 50/50 limited char, Epitomized Path weapon, Beginner cap 20 + diskon.
 */
UCLASS()
class MYGAME_API UWishSystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	/**
	 * Pull utama. Count 1 atau 10. Validasi currency + banner window + cap.
	 * Return kosong kalau gagal (currency kurang / banner expired / cap).
	 */
	UFUNCTION(BlueprintCallable, Category = "Wish")
	TArray<FWishResult> Pull(const FBannerData& Banner, int32 Count);

	/** Cek bisa pull (UI enable/disable tombol). */
	UFUNCTION(BlueprintPure, Category = "Wish")
	bool CanPull(const FBannerData& Banner, int32 Count) const;

	/** Fate cost. Beginner 10-pull = 8, sisanya 1:1. */
	UFUNCTION(BlueprintPure, Category = "Wish")
	static int32 GetFateCost(const FBannerData& Banner, int32 Count);

	UFUNCTION(BlueprintPure, Category = "Wish")
	static EFateType GetFateTypeForBanner(EBannerType Type);

	/** Pity state tipe banner (UI counter). */
	UFUNCTION(BlueprintPure, Category = "Wish")
	FBannerPityState GetPityState(EBannerType Type) const;

	/** Epitomized Path: pilih target weapon (weapon banner). */
	UFUNCTION(BlueprintCallable, Category = "Wish")
	void SetEpitomizedTarget(FName TargetItemId);

	// ---------- Currency ----------
	/** 160 Primogems = 1 Fate. */
	UFUNCTION(BlueprintCallable, Category = "Wish|Currency")
	bool ConvertPrimogemsToFates(EFateType Type, int32 FateCount);

	/** 5 Starglitter = 1 Fate. */
	UFUNCTION(BlueprintCallable, Category = "Wish|Currency")
	bool ExchangeStarglitterForFate(EFateType Type, int32 FateCount);

	/** 75 Stardust = 1 Fate, limit 5/bulan. */
	UFUNCTION(BlueprintCallable, Category = "Wish|Currency")
	bool ExchangeStardustForFate(EFateType Type, int32 FateCount);

	UPROPERTY(BlueprintAssignable, Category = "Wish")
	FOnWishCompleted OnWishCompleted;

	// ---------- Konstanta rate (tuning di satu tempat) ----------
	static constexpr float Rate5Star = 0.006f;
	static constexpr float Rate4Star = 0.051f;
	static constexpr float SoftPityStepPerPull = 0.06f;
	static constexpr int32 PrimogemsPerFate = 160;
	static constexpr int32 StarglitterPerFate = 5;
	static constexpr int32 StardustPerFate = 75;
	static constexpr int32 StardustFateMonthlyLimit = 5;
	static constexpr int32 BeginnerMaxPulls = 20;

protected:
	static void GetPityThresholds(EBannerType Type, int32& OutSoftPity, int32& OutHardPity);

	FWishResult RollSingle(const FBannerData& Banner, FBannerPityState& Pity);
	FWishResult MakeResult(const FBannerData& Banner, FBannerPityState& Pity, EWishRarity Rarity);
	void ApplyOwnershipRewards(FWishResult& Result);

	UOpenWorldGameInstance* GetOWGameInstance() const;
};
