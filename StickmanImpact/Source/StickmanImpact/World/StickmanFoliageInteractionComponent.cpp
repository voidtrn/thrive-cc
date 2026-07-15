// Copyright StickmanImpact Project.

#include "StickmanFoliageInteractionComponent.h"
#include "Kismet/KismetMaterialLibrary.h"

UStickmanFoliageInteractionComponent::UStickmanFoliageInteractionComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
}

void UStickmanFoliageInteractionComponent::TickComponent(float DeltaTime, ELevelTick TickType,
	FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	const AActor* Owner = GetOwner();
	if (!FoliageMPC || !Owner)
	{
		return;
	}

	const FVector Location = Owner->GetActorLocation();
	UKismetMaterialLibrary::SetVectorParameterValue(this, FoliageMPC, PositionParameterName,
		FLinearColor(Location.X, Location.Y, Location.Z, 0.f));
}
