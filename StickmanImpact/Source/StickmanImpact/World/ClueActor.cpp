// Copyright StickmanImpact Project.

#include "ClueActor.h"
#include "Components/StaticMeshComponent.h"
#include "DiscoveryManager.h"

AClueActor::AClueActor()
{
	PrimaryActorTick.bCanEverTick = false;

	ClueMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("ClueMesh"));
	RootComponent = ClueMesh;
	ClueMesh->SetCollisionResponseToAllChannels(ECR_Overlap);
	ClueMesh->SetCollisionResponseToChannel(ECC_Visibility, ECR_Block); // interact trace hits it
}

void AClueActor::BeginPlay()
{
	Super::BeginPlay();

	if (const UDiscoveryManager* Discovery = GetGameInstance()->GetSubsystem<UDiscoveryManager>())
	{
		if (Discovery->HasClue(ClueID))
		{
			Destroy();
			return;
		}
	}

	if (bDetectiveModeOnly)
	{
		SetActorHiddenInGame(true);
		SetActorEnableCollision(false);
	}
}

void AClueActor::RevealByDetectiveMode()
{
	if (bDetectiveModeOnly && IsHidden())
	{
		SetActorHiddenInGame(false);
		SetActorEnableCollision(true);
	}

	// Outline for the pulse — detective mode drives the stencil, clue just opts in.
	ClueMesh->SetRenderCustomDepth(true);
	ClueMesh->SetCustomDepthStencilValue(1);
}

void AClueActor::Interact_Implementation(AActor* Instigator)
{
	OnClueRead.Broadcast(ClueTitle, ClueText);

	if (UDiscoveryManager* Discovery = GetGameInstance()->GetSubsystem<UDiscoveryManager>())
	{
		Discovery->RecordClue(ClueID, ClueSetID, ClueSetSize, UnlockedQuest);
	}

	Destroy();
}

FText AClueActor::GetInteractionPrompt_Implementation() const
{
	return NSLOCTEXT("Clue", "InvestigatePrompt", "Investigate");
}
