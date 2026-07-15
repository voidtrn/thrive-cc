// Copyright StickmanImpact Project.

#include "CollectibleManager.h"
#include "AbilitySystemBlueprintLibrary.h"
#include "AbilitySystemComponent.h"
#include "Kismet/GameplayStatics.h"

void UCollectibleManager::RegisterRegionTotal(FName Region, int32 TotalCount)
{
	RegionTotals.FindOrAdd(Region) = TotalCount;
	RegionCollectedCounts.FindOrAdd(Region, 0);
}

bool UCollectibleManager::CollectItem(const FString& ItemID, FName Region)
{
	if (ItemID.IsEmpty() || CollectedIDs.Contains(ItemID))
	{
		return false;
	}

	CollectedIDs.Add(ItemID);
	RegionCollectedCounts.FindOrAdd(Region)++;
	OnCollectibleCollected.Broadcast(ItemID, Region);
	return true;
}

float UCollectibleManager::GetRegionProgress(FName Region) const
{
	const int32* Total = RegionTotals.Find(Region);
	const int32* Collected = RegionCollectedCounts.Find(Region);
	if (!Total || *Total <= 0 || !Collected)
	{
		return 0.f;
	}
	return static_cast<float>(*Collected) / static_cast<float>(*Total);
}

void UCollectibleManager::GrantReward(const FRewardData& Reward) const
{
	UE_LOG(LogTemp, Log, TEXT("[CollectibleManager] Granting reward: %d EXP, %d Currency, %d item type(s)"),
		Reward.EXP, Reward.Currency, Reward.ItemRewards.Num());
	// No inventory/currency subsystem exists yet — EXP/Currency/Items are logged only.

	if (Reward.NewAbilities.Num() == 0)
	{
		return;
	}

	APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	UAbilitySystemComponent* ASC = PlayerPawn ? UAbilitySystemBlueprintLibrary::GetAbilitySystemComponent(PlayerPawn) : nullptr;
	if (!ASC)
	{
		return;
	}

	for (const TSoftClassPtr<UGameplayAbility>& SoftAbilityClass : Reward.NewAbilities)
	{
		if (UClass* AbilityClass = SoftAbilityClass.LoadSynchronous())
		{
			ASC->GiveAbility(FGameplayAbilitySpec(AbilityClass, 1, INDEX_NONE, ASC->GetOwner()));
		}
	}
}
