// Copyright StickmanImpact Project.

#include "StickmanBodyComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Materials/MaterialInterface.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "UObject/ConstructorHelpers.h"

UStickmanBodyComponent::UStickmanBodyComponent()
{
	PrimaryComponentTick.bCanEverTick = false;

	// Engine primitives are cooked because we hard-reference them via FObjectFinder at CDO time.
	static ConstructorHelpers::FObjectFinder<UStaticMesh> SphereMesh(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
	static ConstructorHelpers::FObjectFinder<UStaticMesh> CylinderMesh(TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));

	UStaticMesh* Sphere = SphereMesh.Succeeded() ? SphereMesh.Object : nullptr;
	UStaticMesh* Cylinder = CylinderMesh.Succeeded() ? CylinderMesh.Object : nullptr;

	// Proportions target a 176cm-tall pawn whose capsule root sits at z=0 with feet at z=-88.
	//   sphere native = 100cm diameter, cylinder native = 100cm tall / 100cm wide.
	//
	//   head   : 32cm sphere, crown near +86              -> centre z=+70
	//   torso  : 28cm wide x 62cm tall cylinder           -> centre z=+20 (spans -11..+51)
	//   legs   : 14cm wide x 78cm tall, splayed +/-9 on Y -> centre z=-49 (feet at -88)
	//   arms   : 12cm wide x 50cm tall, hung +/-22 on Y   -> centre z=+18

	// Head — sphere.
	Head = MakePart(TEXT("Head"), Sphere,
		FVector(0.f, 0.f, 70.f), FRotator::ZeroRotator, FVector(0.32f));

	// Torso — upright cylinder.
	Torso = MakePart(TEXT("Torso"), Cylinder,
		FVector(0.f, 0.f, 20.f), FRotator::ZeroRotator, FVector(0.28f, 0.28f, 0.62f));

	// Legs — two thin cylinders, feet planted at the capsule bottom.
	LeftLeg = MakePart(TEXT("LeftLeg"), Cylinder,
		FVector(0.f, -9.f, -49.f), FRotator::ZeroRotator, FVector(0.14f, 0.14f, 0.78f));
	RightLeg = MakePart(TEXT("RightLeg"), Cylinder,
		FVector(0.f, 9.f, -49.f), FRotator::ZeroRotator, FVector(0.14f, 0.14f, 0.78f));

	// Arms — hung either side of the torso, angled slightly outward for a stickman read.
	LeftArm = MakePart(TEXT("LeftArm"), Cylinder,
		FVector(0.f, -22.f, 18.f), FRotator(0.f, 0.f, 12.f), FVector(0.12f, 0.12f, 0.5f));
	RightArm = MakePart(TEXT("RightArm"), Cylinder,
		FVector(0.f, 22.f, 18.f), FRotator(0.f, 0.f, -12.f), FVector(0.12f, 0.12f, 0.5f));
}

UStaticMeshComponent* UStickmanBodyComponent::MakePart(FName Name, UStaticMesh* Mesh,
	const FVector& RelLocation, const FRotator& RelRotation, const FVector& RelScale)
{
	UStaticMeshComponent* Part = CreateDefaultSubobject<UStaticMeshComponent>(Name);
	if (!Part)
	{
		return nullptr;
	}

	Part->SetupAttachment(this);
	Part->SetCollisionEnabled(ECollisionEnabled::NoCollision); // purely visual; capsule owns collision
	Part->SetCanEverAffectNavigation(false);
	Part->SetRelativeLocationAndRotation(RelLocation, RelRotation);
	Part->SetRelativeScale3D(RelScale);
	if (Mesh)
	{
		Part->SetStaticMesh(Mesh);
	}
	return Part;
}

void UStickmanBodyComponent::OnRegister()
{
	Super::OnRegister();
	ApplyBodyColor();
}

void UStickmanBodyComponent::ApplyBodyColor()
{
	DynMaterials.Reset();
	for (UStaticMeshComponent* Part : { Head.Get(), Torso.Get(), LeftLeg.Get(), RightLeg.Get(), LeftArm.Get(), RightArm.Get() })
	{
		if (!Part || !Part->GetStaticMesh())
		{
			continue;
		}

		// BasicShapeMaterial exposes a "Color" vector param; a dynamic instance lets us tint it.
		UMaterialInstanceDynamic* Dyn = Part->CreateAndSetMaterialInstanceDynamic(0);
		if (Dyn)
		{
			Dyn->SetVectorParameterValue(TEXT("Color"), BodyColor);
			DynMaterials.Add(Dyn);
		}
	}
}

void UStickmanBodyComponent::SetBodyColor(const FLinearColor& NewColor)
{
	BodyColor = NewColor;
	if (IsRegistered())
	{
		// Recolour existing instances in place when possible, else rebuild them.
		if (DynMaterials.Num() > 0)
		{
			for (UMaterialInstanceDynamic* Dyn : DynMaterials)
			{
				if (Dyn)
				{
					Dyn->SetVectorParameterValue(TEXT("Color"), BodyColor);
				}
			}
		}
		else
		{
			ApplyBodyColor();
		}
	}
}

void UStickmanBodyComponent::SetBodyHidden(bool bHidden)
{
	SetVisibility(!bHidden, /*bPropagateToChildren=*/true);
}
