// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "MountTypes.h"
#include "MountManagerSubsystem.generated.h"

class AMountBase;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnMountSummoned, AMountBase*, Mount);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnMountBondLevelUp, FName, MountID, int32, NewLevel);

/**
 * The stable + summon manager. Owns the collected-mounts records (FMountRecord: bond, name,
 * skin, armor), the active mount, and the post-dismount summon cooldown. `SummonMount(ID)`
 * spawns/relocates that mount's actor near the player (whistle) and runs it in; `SwitchMount`
 * at a stable changes the active one. Bond XP accrues from riding (`AddBondXP`) and unlocks
 * mount abilities / stat scaling (read by the mount on mount).
 *
 * Taming wild mounts (open-world mini-game) registers a new FMountRecord via `RegisterMount`;
 * legendary mounts are just records with maxed stats + a unique skin. Breeding / racing /
 * photo poses are content on this foundation. Vehicle alternatives (steam cycle, glider pack,
 * skiff, teleport beacon) are separate simple actors — documented, not mounts.
 */
UCLASS()
class STICKMANIMPACT_API UMountManagerSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// Class to spawn for a given mount record — assign a map in a GameInstance/BP init, or use
	// DefaultMountClass. Kept simple: one class, configured from the record + a data table BP-side.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Mount")
	TSubclassOf<AMountBase> DefaultMountClass;

	UFUNCTION(BlueprintCallable, Category = "Mount")
	void RegisterMount(const FMountRecord& Record);

	UFUNCTION(BlueprintCallable, Category = "Mount")
	AMountBase* SummonMount(FName MountID);

	UFUNCTION(BlueprintCallable, Category = "Mount")
	void SwitchActiveMount(FName MountID) { ActiveMountID = MountID; }

	UFUNCTION(BlueprintCallable, Category = "Mount")
	void AddBondXP(FName MountID, int32 Amount);

	UFUNCTION(BlueprintCallable, Category = "Mount")
	void NotifyDismounted(FName MountID);

	UFUNCTION(BlueprintPure, Category = "Mount")
	bool IsSummonReady() const;

	UFUNCTION(BlueprintPure, Category = "Mount")
	bool GetMountRecord(FName MountID, FMountRecord& OutRecord) const;

	UFUNCTION(BlueprintPure, Category = "Mount")
	TArray<FName> GetOwnedMounts() const;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Mount")
	float SummonCooldown = 10.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Mount")
	TArray<int32> BondXPPerLevel = { 100, 300, 600, 1000, 1500 };

	UPROPERTY(BlueprintAssignable, Category = "Mount")
	FOnMountSummoned OnMountSummoned;

	UPROPERTY(BlueprintAssignable, Category = "Mount")
	FOnMountBondLevelUp OnMountBondLevelUp;

	// Save hooks (not yet in the binary format — see README).
	void ExportSaveState(TArray<FMountRecord>& OutRecords, FName& OutActive) const;
	void ImportSaveState(const TArray<FMountRecord>& InRecords, FName InActive);

private:
	int32 LevelForXP(int32 XP) const;

	TMap<FName, FMountRecord> OwnedMounts;
	FName ActiveMountID = NAME_None;
	double LastDismountTime = -1000.0;

	UPROPERTY()
	TObjectPtr<AMountBase> ActiveMountActor;
};
