#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "System/AchievementTypes.h"   // EClaimResult
#include "System/LevelingTypes.h"      // FMaterialCost
#include "ReputationSubsystem.generated.h"

class UOpenWorldGameInstance;
class UDataTable;

/**
 * Row DT_ReputationRewards — reward satu level reputasi.
 * Row key konvensi: "<Region>_<Level>" — mis. "Starter_3".
 */
USTRUCT(BlueprintType)
struct FReputationRewardRow : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, meta = (ClampMin = 1))
	int32 RequiredLevel = 1;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int32 MoraReward = 0;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TArray<FMaterialCost> ItemRewards;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnReputationLevelUp, FName, Region, int32, NewLevel);

/**
 * Reputasi per region (Genshin City Reputation). EXP dari quest/bounty/
 * eksplorasi (BP lapor via AddReputation), level dari kurva statis,
 * reward per level diklaim manual dari DT_ReputationRewards.
 *
 * Kurva: naik dari level N ke N+1 butuh 1000 + 500×(N-1) EXP
 * (L1→2: 1000, L2→3: 1500, ... L9→10: 5000; total ke L10: 27000).
 * Yang di-save: total EXP per region + set reward yang diklaim.
 */
UCLASS()
class MYGAME_API UReputationSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	static constexpr int32 MaxReputationLevel = 10;

	/** Total EXP kumulatif untuk MENCAPAI Level (L1 = 0). Pure static, testable. */
	UFUNCTION(BlueprintPure, Category = "Reputation")
	static int32 ExpToReachLevel(int32 Level);

	/** Level dari total EXP (1..MaxReputationLevel). Pure static, testable. */
	UFUNCTION(BlueprintPure, Category = "Reputation")
	static int32 LevelForTotalExp(int32 TotalExp);

	/** Tambah EXP reputasi region. Broadcast tiap level yang terlewati. */
	UFUNCTION(BlueprintCallable, Category = "Reputation")
	void AddReputation(FName Region, int32 Exp);

	UFUNCTION(BlueprintPure, Category = "Reputation")
	int32 GetTotalExp(FName Region) const;

	UFUNCTION(BlueprintPure, Category = "Reputation")
	int32 GetLevel(FName Region) const;

	/** Klaim reward level (row key "<Region>_<Level>"). */
	UFUNCTION(BlueprintCallable, Category = "Reputation")
	EClaimResult ClaimReward(const UDataTable* RewardTable, FName Region, int32 Level);

	UFUNCTION(BlueprintPure, Category = "Reputation")
	bool IsRewardClaimed(FName Region, int32 Level) const;

	UPROPERTY(BlueprintAssignable, Category = "Reputation")
	FOnReputationLevelUp OnReputationLevelUp;

protected:
	static FName RewardRowKey(FName Region, int32 Level);
	UOpenWorldGameInstance* GetOWGameInstance() const;
};
