// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "DefenseSkillSubsystem.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnDefenseSkillUnlocked, bool, bParryTrack, int32, NewLevel);

/**
 * Defense skill-tree levels (0 = locked, 1-4). Two tracks, unlocked via party ascension:
 *
 * Perfect Dodge:  Lv1 witch time 1.5s | Lv2 witch time 2.5s | Lv3 witch time spreads to
 *                 nearby enemies | Lv4 auto-counter fires during witch time.
 * Parry:          Lv1 basic 0.15s | Lv2 window 0.20s | Lv3 reflect projectiles |
 *                 Lv4 parry emits an AoE blast.
 *
 * UDefenseComponent reads these to size its witch-time duration / parry window and to gate
 * the higher-tier behaviors. Unlock is driven off UPartyManager::OnMemberAscended — the
 * active character's ascension level unlocks both tracks up to that level (capped 4), so the
 * tree is "unlockable via character ascension" without a separate skill-point economy.
 */
UCLASS()
class STICKMANIMPACT_API UDefenseSkillSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;
	virtual void Deinitialize() override;

	UFUNCTION(BlueprintCallable, Category = "Defense")
	void SetPerfectDodgeLevel(int32 Level);

	UFUNCTION(BlueprintCallable, Category = "Defense")
	void SetParryLevel(int32 Level);

	UFUNCTION(BlueprintPure, Category = "Defense")
	int32 GetPerfectDodgeLevel() const { return PerfectDodgeLevel; }

	UFUNCTION(BlueprintPure, Category = "Defense")
	int32 GetParryLevel() const { return ParryLevel; }

	// Derived tunables the DefenseComponent asks for.
	UFUNCTION(BlueprintPure, Category = "Defense")
	float GetWitchTimeDuration() const { return PerfectDodgeLevel >= 2 ? 2.5f : 1.5f; }

	UFUNCTION(BlueprintPure, Category = "Defense")
	float GetParryWindow() const { return ParryLevel >= 2 ? 0.20f : 0.15f; }

	UFUNCTION(BlueprintPure, Category = "Defense")
	bool WitchTimeSpreads() const { return PerfectDodgeLevel >= 3; }

	UFUNCTION(BlueprintPure, Category = "Defense")
	bool HasAutoCounter() const { return PerfectDodgeLevel >= 4; }

	UFUNCTION(BlueprintPure, Category = "Defense")
	bool CanParryProjectiles() const { return ParryLevel >= 3; }

	UFUNCTION(BlueprintPure, Category = "Defense")
	bool ParryEmitsBlast() const { return ParryLevel >= 4; }

	UPROPERTY(BlueprintAssignable, Category = "Defense")
	FOnDefenseSkillUnlocked OnDefenseSkillUnlocked;

	// Save hooks (not yet in the binary save format — see README, same deferral as the other
	// progression subsystems).
	void ExportSaveState(int32& OutDodge, int32& OutParry) const { OutDodge = PerfectDodgeLevel; OutParry = ParryLevel; }
	void ImportSaveState(int32 InDodge, int32 InParry) { PerfectDodgeLevel = InDodge; ParryLevel = InParry; }

private:
	UFUNCTION()
	void HandleMemberAscended(int32 MemberIndex, int32 NewAscensionLevel);

	int32 PerfectDodgeLevel = 1; // Basic dodge/parry available from the start.
	int32 ParryLevel = 1;
};
