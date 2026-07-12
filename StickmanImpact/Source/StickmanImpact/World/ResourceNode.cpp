// Copyright StickmanImpact Project.

#include "ResourceNode.h"
#include "Components/StaticMeshComponent.h"
#include "Data/InventoryManager.h"
#include "TimerManager.h"

AResourceNode::AResourceNode()
{
	PrimaryActorTick.bCanEverTick = false;

	ResourceMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("ResourceMesh"));
	RootComponent = ResourceMesh;
}

void AResourceNode::Interact_Implementation(AActor* Instigator)
{
	if (!bIsAvailable)
	{
		return;
	}

	if (UGameInstance* GameInstance = GetGameInstance())
	{
		if (UInventoryManager* Inventory = GameInstance->GetSubsystem<UInventoryManager>())
		{
			FInventoryItem Item;
			Item.ItemID = ResourceType;
			Item.DisplayName = FText::FromName(ResourceType);
			Item.Category = EInventoryCategory::Materials;
			Inventory->AddItem(Item, GatherAmount);
		}
	}

	bIsAvailable = false;
	SetActorHiddenInGame(true);
	SetActorEnableCollision(false);

	// Over-harvesting consequence: rapid re-harvests stretch the respawn time (up to 3x).
	const double Now = GetWorld()->GetTimeSeconds();
	if (Now - LastHarvestTime < 120.0)
	{
		HarvestPressure = FMath::Min(HarvestPressure + 0.5f, 2.f);
	}
	else
	{
		HarvestPressure = FMath::Max(HarvestPressure - 0.5f, 0.f);
	}
	LastHarvestTime = Now;

	GetWorldTimerManager().SetTimer(RespawnTimerHandle, this, &AResourceNode::Respawn,
		RespawnTime * (1.f + HarvestPressure), false);
}

void AResourceNode::Respawn()
{
	bIsAvailable = true;
	SetActorHiddenInGame(false);
	SetActorEnableCollision(true);

	// Natural "regrow": scale in from small instead of popping to full size.
	SetActorScale3D(FVector(0.2f));
	GetWorldTimerManager().SetTimer(RegrowTimerHandle, FTimerDelegate::CreateWeakLambda(this, [this]()
	{
		const FVector Scale = GetActorScale3D();
		if (Scale.X >= 1.f)
		{
			SetActorScale3D(FVector(1.f));
			GetWorldTimerManager().ClearTimer(RegrowTimerHandle);
			return;
		}
		SetActorScale3D(Scale + FVector(0.05f));
	}), 0.5f, true);
}

FText AResourceNode::GetInteractionPrompt_Implementation() const
{
	return bIsAvailable ? FText::Format(NSLOCTEXT("Resource", "Gather", "Gather {0}"), FText::FromName(ResourceType))
		: FText::GetEmpty();
}
