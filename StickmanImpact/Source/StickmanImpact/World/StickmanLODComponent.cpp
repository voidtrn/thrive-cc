// Copyright StickmanImpact Project.

#include "StickmanLODComponent.h"
#include "Components/MaterialBillboardComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "GameFramework/Character.h"
#include "Kismet/GameplayStatics.h"

UStickmanLODComponent::UStickmanLODComponent()
{
	PrimaryComponentTick.bCanEverTick = true;

	BillboardComponent = CreateDefaultSubobject<UMaterialBillboardComponent>(TEXT("LODBillboard"));
	BillboardComponent->SetVisibility(false);
}

void UStickmanLODComponent::BeginPlay()
{
	Super::BeginPlay();

	if (AActor* Owner = GetOwner())
	{
		BillboardComponent->SetupAttachment(Owner->GetRootComponent());
		BillboardComponent->RegisterComponent();

		if (BillboardFlipbookMaterial)
		{
			BillboardComponent->Elements.Empty();
			FMaterialSpriteElement Element;
			Element.Material = BillboardFlipbookMaterial;
			Element.BaseSizeX = 100.f;
			Element.BaseSizeY = 180.f;
			BillboardComponent->Elements.Add(Element);
		}
	}
}

void UStickmanLODComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	TimeSinceCheck += DeltaTime;
	if (TimeSinceCheck < CheckInterval)
	{
		return;
	}
	TimeSinceCheck = 0.f;

	const APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	const AActor* Owner = GetOwner();
	if (!PlayerPawn || !Owner)
	{
		return;
	}

	const float Distance = FVector::Dist(PlayerPawn->GetActorLocation(), Owner->GetActorLocation());

	ELODState NewState = ELODState::Mesh;
	if (Distance >= LOD3StartDistance)
	{
		NewState = ELODState::Culled;
	}
	else if (Distance >= LOD2StartDistance)
	{
		NewState = ELODState::Billboard;
	}

	if (NewState != CurrentState)
	{
		ApplyLODState(NewState);
	}
}

void UStickmanLODComponent::ApplyLODState(ELODState NewState)
{
	CurrentState = NewState;

	const ACharacter* OwnerCharacter = Cast<ACharacter>(GetOwner());
	USkeletalMeshComponent* MeshComponent = OwnerCharacter ? OwnerCharacter->GetMesh() : nullptr;

	switch (NewState)
	{
		case ELODState::Mesh:
			if (MeshComponent) MeshComponent->SetVisibility(true);
			BillboardComponent->SetVisibility(false);
			GetOwner()->SetActorTickEnabled(true);
			break;
		case ELODState::Billboard:
			if (MeshComponent) MeshComponent->SetVisibility(false);
			BillboardComponent->SetVisibility(true);
			GetOwner()->SetActorTickEnabled(true);
			break;
		case ELODState::Culled:
			if (MeshComponent) MeshComponent->SetVisibility(false);
			BillboardComponent->SetVisibility(false);
			GetOwner()->SetActorTickEnabled(false);
			break;
	}
}
