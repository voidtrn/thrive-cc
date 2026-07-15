// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "BadLuckProtectionSubsystem.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnPityTriggered, FName, PoolID, int32, AttemptsTaken);

/**
 * Generic pity/mercy math for anything random-reward shaped. There is still no
 * gacha/wish or currency system in this project (deliberate — see the party-system scope
 * note); this exists so ANY random pool (chest rare rolls, boss drops, a future wish
 * banner) respects player time the same way:
 *
 * - RollWithPity: base chance, softly ramped after SoftPityAttempts (+RampPerAttempt per
 *   attempt past it), hard-guaranteed at HardPityAttempts. Counter resets on success.
 * - Duplicate protection: RegisterDuplicate counts dupes past max refinement;
 *   ShouldRerollDuplicate flips true so the caller rerolls into something new.
 * - Boss mercy: RegisterBossAttempt(BossID, bDefeated) — repeated defeats *by* a boss add
 *   +MercyDropBonusPerWipe to GetMercyDropBonus (spend it on drop quality/heals on the
 *   next kill), clearing the boss resets it. Pairs with UAdaptiveDifficultySubsystem's
 *   combat mercy — that eases the fight, this eases the reward.
 */
UCLASS()
class STICKMANIMPACT_API UBadLuckProtectionSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// Roll one attempt against a pool. Returns true = rare outcome; counter handled inside.
	UFUNCTION(BlueprintCallable, Category = "Pity")
	bool RollWithPity(FName PoolID, float BaseChance);

	UFUNCTION(BlueprintPure, Category = "Pity")
	int32 GetAttemptsSinceRare(FName PoolID) const;

	UFUNCTION(BlueprintCallable, Category = "Pity")
	void RegisterDuplicate(FName ItemID, int32 MaxUsefulCopies);

	UFUNCTION(BlueprintPure, Category = "Pity")
	bool ShouldRerollDuplicate(FName ItemID) const { return SaturatedItemIDs.Contains(ItemID); }

	UFUNCTION(BlueprintCallable, Category = "Pity")
	void RegisterBossAttempt(FName BossID, bool bDefeated);

	// Additive drop-quality bonus (0.15 per wipe, capped) for the next clear of this boss.
	UFUNCTION(BlueprintPure, Category = "Pity")
	float GetMercyDropBonus(FName BossID) const;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Pity")
	int32 SoftPityAttempts = 20;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Pity")
	int32 HardPityAttempts = 40;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Pity")
	float RampPerAttempt = 0.05f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Pity")
	float MercyDropBonusPerWipe = 0.15f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Pity")
	float MaxMercyDropBonus = 0.6f;

	UPROPERTY(BlueprintAssignable, Category = "Pity")
	FOnPityTriggered OnPityTriggered;

	// Save hooks (not yet in the binary save format — see README).
	void ExportSaveState(TMap<FName, int32>& OutAttempts) const { OutAttempts = AttemptsSinceRare; }
	void ImportSaveState(const TMap<FName, int32>& InAttempts) { AttemptsSinceRare = InAttempts; }

private:
	TMap<FName, int32> AttemptsSinceRare;
	TSet<FName> SaturatedItemIDs;
	TMap<FName, int32> DuplicateCounts;
	TMap<FName, int32> BossWipeCounts;
};
