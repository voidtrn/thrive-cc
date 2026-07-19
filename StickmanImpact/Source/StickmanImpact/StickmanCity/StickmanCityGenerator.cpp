// Copyright StickmanImpact Project.

#include "StickmanCityGenerator.h"
#include "Components/StaticMeshComponent.h"
#include "Components/InstancedStaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "UObject/ConstructorHelpers.h"
#include "Math/RandomStream.h"

AStickmanCityGenerator::AStickmanCityGenerator()
{
	PrimaryActorTick.bCanEverTick = false;

	SceneRoot = CreateDefaultSubobject<USceneComponent>(TEXT("SceneRoot"));
	SetRootComponent(SceneRoot);

	// Resolve engine primitives once (hard-referenced so they cook).
	static ConstructorHelpers::FObjectFinder<UStaticMesh> Cube(TEXT("/Engine/BasicShapes/Cube.Cube"));
	static ConstructorHelpers::FObjectFinder<UStaticMesh> Plane(TEXT("/Engine/BasicShapes/Plane.Plane"));
	static ConstructorHelpers::FObjectFinder<UStaticMesh> Cylinder(TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
	static ConstructorHelpers::FObjectFinder<UStaticMesh> Sphere(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
	CubeMesh = Cube.Succeeded() ? Cube.Object : nullptr;
	PlaneMesh = Plane.Succeeded() ? Plane.Object : nullptr;
	CylinderMesh = Cylinder.Succeeded() ? Cylinder.Object : nullptr;
	SphereMesh = Sphere.Succeeded() ? Sphere.Object : nullptr;

	Ground = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Ground"));
	Ground->SetupAttachment(SceneRoot);
	Ground->SetStaticMesh(PlaneMesh);
	Ground->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics);

	// Three building palette tiers, each its own instanced component so it can carry one tint.
	const TCHAR* TierNames[] = { TEXT("Buildings_Concrete"), TEXT("Buildings_Glass"), TEXT("Buildings_Brick") };
	for (const TCHAR* TierName : TierNames)
	{
		UInstancedStaticMeshComponent* Tier = CreateDefaultSubobject<UInstancedStaticMeshComponent>(TierName);
		Tier->SetupAttachment(SceneRoot);
		Tier->SetStaticMesh(CubeMesh);
		Tier->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics);
		BuildingTiers.Add(Tier);
	}

	Sidewalks = CreateDefaultSubobject<UInstancedStaticMeshComponent>(TEXT("Sidewalks"));
	Sidewalks->SetupAttachment(SceneRoot);
	Sidewalks->SetStaticMesh(CubeMesh);
	Sidewalks->SetCollisionEnabled(ECollisionEnabled::NoCollision);

	LampPosts = CreateDefaultSubobject<UInstancedStaticMeshComponent>(TEXT("LampPosts"));
	LampPosts->SetupAttachment(SceneRoot);
	LampPosts->SetStaticMesh(CylinderMesh);
	LampPosts->SetCollisionEnabled(ECollisionEnabled::NoCollision);

	LampHeads = CreateDefaultSubobject<UInstancedStaticMeshComponent>(TEXT("LampHeads"));
	LampHeads->SetupAttachment(SceneRoot);
	LampHeads->SetStaticMesh(SphereMesh);
	LampHeads->SetCollisionEnabled(ECollisionEnabled::NoCollision);
}

void AStickmanCityGenerator::OnConstruction(const FTransform& Transform)
{
	Super::OnConstruction(Transform);
	Generate(); // live preview when placed/edited in the level
}

void AStickmanCityGenerator::BeginPlay()
{
	Super::BeginPlay();
	Generate(); // authoritative build at runtime (also covers runtime-spawned generators)
}

void AStickmanCityGenerator::ClearInstances()
{
	for (UInstancedStaticMeshComponent* Tier : BuildingTiers)
	{
		if (Tier) { Tier->ClearInstances(); }
	}
	if (Sidewalks) { Sidewalks->ClearInstances(); }
	if (LampPosts) { LampPosts->ClearInstances(); }
	if (LampHeads) { LampHeads->ClearInstances(); }
}

void AStickmanCityGenerator::Generate()
{
	ClearInstances();

	const int32 Grid = FMath::Max(1, GridSize);
	const float Span = CellSpan();
	const float FullExtent = Grid * Span;
	const float HalfOffset = (Grid - 1) * 0.5f;

	// Ground: an asphalt plane a touch larger than the block grid. Plane native = 100x100cm.
	if (Ground)
	{
		const float GroundScale = (FullExtent * 1.25f) / 100.f;
		Ground->SetRelativeLocation(FVector::ZeroVector);
		Ground->SetRelativeScale3D(FVector(GroundScale, GroundScale, 1.f));
		TintComponent(Ground, FLinearColor(0.05f, 0.05f, 0.06f)); // dark asphalt
	}

	// Palette tints (concrete / glass / brick).
	const FLinearColor TierColors[] = {
		FLinearColor(0.55f, 0.55f, 0.58f), // concrete grey
		FLinearColor(0.30f, 0.55f, 0.70f), // glass blue
		FLinearColor(0.60f, 0.35f, 0.25f), // brick tan
	};
	for (int32 t = 0; t < BuildingTiers.Num(); ++t)
	{
		TintComponent(BuildingTiers[t], TierColors[t % 3]);
	}
	TintComponent(Sidewalks, FLinearColor(0.32f, 0.32f, 0.34f)); // pavement grey
	TintComponent(LampPosts, FLinearColor(0.08f, 0.08f, 0.09f)); // dark post
	TintComponent(LampHeads, FLinearColor(2.0f, 1.7f, 0.7f), /*bEmissive=*/true); // warm lamp glow

	FRandomStream Rng(Seed);

	for (int32 i = 0; i < Grid; ++i)
	{
		for (int32 j = 0; j < Grid; ++j)
		{
			const float BlockX = (i - HalfOffset) * Span;
			const float BlockY = (j - HalfOffset) * Span;

			// Sidewalk slab covering the block footprint (thin cube), sitting just above ground.
			if (Sidewalks)
			{
				const float SW = BlockSize / 100.f;
				FTransform T(FRotator::ZeroRotator, FVector(BlockX, BlockY, 6.f), FVector(SW, SW, 0.12f));
				Sidewalks->AddInstance(T);
			}

			// Subdivide the block into a 2x2 lot grid; each lot may host a tower.
			const float LotSpan = BlockSize * 0.5f;
			for (int32 lx = 0; lx < 2; ++lx)
			{
				for (int32 ly = 0; ly < 2; ++ly)
				{
					if (Rng.FRand() > 0.82f)
					{
						continue; // occasional gap = plaza / parking lot
					}

					const float LotX = BlockX + (lx - 0.5f) * LotSpan;
					const float LotY = BlockY + (ly - 0.5f) * LotSpan;

					const float Height = FMath::Lerp(MinBuildingHeight, MaxBuildingHeight, Rng.FRand() * Rng.FRand());
					const float FootW = LotSpan * Rng.FRandRange(0.6f, 0.85f);
					const float FootD = LotSpan * Rng.FRandRange(0.6f, 0.85f);

					// Cube native = 100^3 centred at origin, so bottom sits on ground at z = Height/2.
					FTransform T(
						FRotator(0.f, Rng.FRandRange(-4.f, 4.f), 0.f),
						FVector(LotX, LotY, Height * 0.5f + 12.f),
						FVector(FootW / 100.f, FootD / 100.f, Height / 100.f));

					const int32 Tier = Rng.RandRange(0, BuildingTiers.Num() - 1);
					if (BuildingTiers.IsValidIndex(Tier) && BuildingTiers[Tier])
					{
						BuildingTiers[Tier]->AddInstance(T);
					}
				}
			}

			// Street lamp at the block's near corner, out on the pavement edge.
			if (LampPosts && LampHeads)
			{
				const float Edge = BlockSize * 0.5f + StreetWidth * 0.4f;
				const FVector LampBase(BlockX - Edge, BlockY - Edge, 0.f);
				// Post: cylinder native height 100 -> scaleZ 4 = 400cm, centred at z=200.
				LampPosts->AddInstance(FTransform(FRotator::ZeroRotator,
					LampBase + FVector(0.f, 0.f, 200.f), FVector(0.12f, 0.12f, 4.f)));
				// Head: sphere native 100 -> scale 0.35 = 35cm, atop the post.
				LampHeads->AddInstance(FTransform(FRotator::ZeroRotator,
					LampBase + FVector(0.f, 0.f, 410.f), FVector(0.35f)));
			}
		}
	}
}

void AStickmanCityGenerator::TintComponent(UMeshComponent* Comp, const FLinearColor& Color, bool bEmissive)
{
	if (!Comp)
	{
		return;
	}
	if (UMaterialInstanceDynamic* Dyn = Comp->CreateAndSetMaterialInstanceDynamic(0))
	{
		// BasicShapeMaterial exposes a "Color" vector param; emissive params are ignored if absent.
		Dyn->SetVectorParameterValue(TEXT("Color"), Color);
		if (bEmissive)
		{
			Dyn->SetVectorParameterValue(TEXT("EmissiveColor"), Color);
			Dyn->SetScalarParameterValue(TEXT("EmissiveStrength"), 5.f);
		}
	}
}
