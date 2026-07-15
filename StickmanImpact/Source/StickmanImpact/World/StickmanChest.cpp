// Copyright StickmanImpact Project.

#include "StickmanChest.h"
#include "CollectibleManager.h"
#include "Components/StaticMeshComponent.h"

AStickmanChest::AStickmanChest()
{
	PrimaryActorTick.bCanEverTick = false;

	ChestMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("ChestMesh"));
	RootComponent = ChestMesh;
}

void AStickmanChest::BeginPlay()
{
	Super::BeginPlay();

	if (const UGameInstance* GameInstance = GetGameInstance())
	{
		if (const UCollectibleManager* Manager = GameInstance->GetSubsystem<UCollectibleManager>())
		{
			bIsOpened = !ChestID.IsEmpty() && Manager->IsCollected(ChestID);
		}
	}
}

void AStickmanChest::Interact_Implementation(AActor* Instigator)
{
	if (bIsOpened)
	{
		return;
	}

	UGameInstance* GameInstance = GetGameInstance();
	UCollectibleManager* Manager = GameInstance ? GameInstance->GetSubsystem<UCollectibleManager>() : nullptr;
	if (!Manager || (!ChestID.IsEmpty() && !Manager->CollectItem(ChestID, NAME_None)))
	{
		return;
	}

	bIsOpened = true;
	Manager->GrantReward(Reward);
	// Play an open animation/VFX on ChestMesh's AnimBP or a Blueprint override of this event.
}

FText AStickmanChest::GetInteractionPrompt_Implementation() const
{
	if (bIsOpened)
	{
		return FText::GetEmpty();
	}
	switch (Rarity)
	{
		case EChestRarity::Rare: return NSLOCTEXT("Chest", "Rare", "Open Rare Chest");
		case EChestRarity::Luxurious: return NSLOCTEXT("Chest", "Luxurious", "Open Luxurious Chest");
		default: return NSLOCTEXT("Chest", "Common", "Open Chest");
	}
}
