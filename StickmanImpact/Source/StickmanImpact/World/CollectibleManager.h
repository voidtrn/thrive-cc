// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Quest/StickmanQuestTypes.h" // reuse FRewardData for chest/collectible rewards
#include "CollectibleManager.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnCollectibleCollected, FString, ItemID, FName, Region);

/** Tracks which one-shot collectibles/chests/oculi have been collected, per-region, for a "regional progress" readout. */
UCLASS()
class STICKMANIMPACT_API UCollectibleManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Collectibles")
	void RegisterRegionTotal(FName Region, int32 TotalCount);

	UFUNCTION(BlueprintCallable, Category = "Collectibles")
	bool CollectItem(const FString& ItemID, FName Region);

	UFUNCTION(BlueprintPure, Category = "Collectibles")
	bool IsCollected(const FString& ItemID) const { return CollectedIDs.Contains(ItemID); }

	UFUNCTION(BlueprintPure, Category = "Collectibles")
	float GetRegionProgress(FName Region) const;

	UFUNCTION(BlueprintCallable, Category = "Collectibles")
	void GrantReward(const FRewardData& Reward) const;

	UPROPERTY(BlueprintAssignable, Category = "Collectibles")
	FOnCollectibleCollected OnCollectibleCollected;

private:
	TSet<FString> CollectedIDs;
	TMap<FName, int32> RegionTotals;
	TMap<FName, int32> RegionCollectedCounts;
};
