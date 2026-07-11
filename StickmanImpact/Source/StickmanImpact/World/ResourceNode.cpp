// Copyright StickmanImpact Project.

#include "ResourceNode.h"
#include "Components/StaticMeshComponent.h"
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

	UE_LOG(LogTemp, Log, TEXT("[ResourceNode] Gathered %d x %s (no inventory system yet — logged only)"),
		GatherAmount, *ResourceType.ToString());

	bIsAvailable = false;
	SetActorHiddenInGame(true);
	SetActorEnableCollision(false);

	GetWorldTimerManager().SetTimer(RespawnTimerHandle, this, &AResourceNode::Respawn, RespawnTime, false);
}

void AResourceNode::Respawn()
{
	bIsAvailable = true;
	SetActorHiddenInGame(false);
	SetActorEnableCollision(true);
}

FText AResourceNode::GetInteractionPrompt_Implementation() const
{
	return bIsAvailable ? FText::Format(NSLOCTEXT("Resource", "Gather", "Gather {0}"), FText::FromName(ResourceType))
		: FText::GetEmpty();
}
