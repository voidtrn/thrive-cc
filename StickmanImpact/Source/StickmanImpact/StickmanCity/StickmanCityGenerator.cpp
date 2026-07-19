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

	static ConstructorHelpers::FObjectFinder<UStaticMesh> Cube(TEXT("/Engine/BasicShapes/Cube.Cube"));
	static ConstructorHelpers::FObjectFinder<UStaticMesh> Plane(TEXT("/Engine/BasicShapes/Plane.Plane"));
	static ConstructorHelpers::FObjectFinder<UStaticMesh> Cylinder(TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
	static ConstructorHelpers::FObjectFinder<UStaticMesh> Sphere(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
	static ConstructorHelpers::FObjectFinder<UStaticMesh> Cone(TEXT("/Engine/BasicShapes/Cone.Cone"));
	CubeMesh = Cube.Succeeded() ? Cube.Object : nullptr;
	PlaneMesh = Plane.Succeeded() ? Plane.Object : nullptr;
	CylinderMesh = Cylinder.Succeeded() ? Cylinder.Object : nullptr;
	SphereMesh = Sphere.Succeeded() ? Sphere.Object : nullptr;
	ConeMesh = Cone.Succeeded() ? Cone.Object : nullptr;

	Ground = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Ground"));
	Ground->SetupAttachment(SceneRoot);
	Ground->SetStaticMesh(PlaneMesh);
	Ground->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics);

	// Roads / markings.
	Roads      = MakeISM(TEXT("Roads"),      CubeMesh,     true);
	LaneMarks  = MakeISM(TEXT("LaneMarks"),  CubeMesh,     false);
	Crosswalks = MakeISM(TEXT("Crosswalks"), CubeMesh,     false);
	Sidewalks  = MakeISM(TEXT("Sidewalks"),  CubeMesh,     false);

	// Buildings + rooftops.
	const TCHAR* TierNames[] = { TEXT("Buildings_Concrete"), TEXT("Buildings_Glass"), TEXT("Buildings_Brick") };
	for (const TCHAR* TierName : TierNames)
	{
		BuildingTiers.Add(MakeISM(TierName, CubeMesh, true));
	}
	Rooftops = MakeISM(TEXT("Rooftops"), CubeMesh, false);

	// Vegetation.
	GrassPatches = MakeISM(TEXT("GrassPatches"), CubeMesh,     false);
	TreeTrunks   = MakeISM(TEXT("TreeTrunks"),   CylinderMesh, true);
	TreeCanopies = MakeISM(TEXT("TreeCanopies"), SphereMesh,   false);
	Bushes       = MakeISM(TEXT("Bushes"),       SphereMesh,   false);

	// Vehicles.
	CarBodies = MakeISM(TEXT("CarBodies"), CubeMesh,     true);
	CarCabins = MakeISM(TEXT("CarCabins"), CubeMesh,     false);
	CarWheels = MakeISM(TEXT("CarWheels"), CylinderMesh, false);

	// Street furniture.
	LampPosts     = MakeISM(TEXT("LampPosts"),     CylinderMesh, false);
	LampHeads     = MakeISM(TEXT("LampHeads"),     SphereMesh,   false);
	Benches       = MakeISM(TEXT("Benches"),       CubeMesh,     false);
	Hydrants      = MakeISM(TEXT("Hydrants"),      CylinderMesh, false);
	TrashCans     = MakeISM(TEXT("TrashCans"),     CylinderMesh, false);
	TrafficPosts  = MakeISM(TEXT("TrafficPosts"),  CylinderMesh, false);
	TrafficLights = MakeISM(TEXT("TrafficLights"), SphereMesh,   false);
}

UInstancedStaticMeshComponent* AStickmanCityGenerator::MakeISM(FName Name, UStaticMesh* Mesh, bool bCollide)
{
	UInstancedStaticMeshComponent* Comp = CreateDefaultSubobject<UInstancedStaticMeshComponent>(Name);
	Comp->SetupAttachment(SceneRoot);
	if (Mesh)
	{
		Comp->SetStaticMesh(Mesh);
	}
	Comp->SetCollisionEnabled(bCollide ? ECollisionEnabled::QueryAndPhysics : ECollisionEnabled::NoCollision);
	Comp->SetCanEverAffectNavigation(false);
	return Comp;
}

void AStickmanCityGenerator::OnConstruction(const FTransform& Transform)
{
	Super::OnConstruction(Transform);
	Generate();
}

void AStickmanCityGenerator::BeginPlay()
{
	Super::BeginPlay();
	Generate();
}

void AStickmanCityGenerator::ClearInstances()
{
	for (UInstancedStaticMeshComponent* Tier : BuildingTiers)
	{
		if (Tier) { Tier->ClearInstances(); }
	}
	UInstancedStaticMeshComponent* All[] = {
		Roads, LaneMarks, Crosswalks, Sidewalks, Rooftops, GrassPatches, TreeTrunks, TreeCanopies,
		Bushes, CarBodies, CarCabins, CarWheels, LampPosts, LampHeads, Benches, Hydrants, TrashCans,
		TrafficPosts, TrafficLights };
	for (UInstancedStaticMeshComponent* C : All)
	{
		if (C) { C->ClearInstances(); }
	}
}

void AStickmanCityGenerator::Generate()
{
	ClearInstances();

	const int32 Grid = FMath::Max(1, GridSize);
	const float FullExtent = Grid * CellSpan();

	// Ground: muted grass-grey base a touch larger than the built area (plane native = 100cm).
	if (Ground)
	{
		const float GroundScale = (FullExtent * 1.4f) / 100.f;
		Ground->SetRelativeLocation(FVector::ZeroVector);
		Ground->SetRelativeScale3D(FVector(GroundScale, GroundScale, 1.f));
		TintComponent(Ground, FLinearColor(0.10f, 0.14f, 0.09f)); // grass/dirt
	}

	// Fixed per-component palettes.
	const FLinearColor TierColors[] = {
		FLinearColor(0.55f, 0.55f, 0.58f), // concrete grey
		FLinearColor(0.28f, 0.52f, 0.68f), // glass blue
		FLinearColor(0.58f, 0.33f, 0.24f), // brick tan
	};
	for (int32 t = 0; t < BuildingTiers.Num(); ++t)
	{
		TintComponent(BuildingTiers[t], TierColors[t % 3]);
	}
	TintComponent(Roads,        FLinearColor(0.045f, 0.045f, 0.05f));
	TintComponent(LaneMarks,    FLinearColor(0.85f, 0.82f, 0.55f));  // warm centre line
	TintComponent(Crosswalks,   FLinearColor(0.85f, 0.85f, 0.85f));
	TintComponent(Sidewalks,    FLinearColor(0.34f, 0.34f, 0.36f));
	TintComponent(Rooftops,     FLinearColor(0.20f, 0.20f, 0.22f));
	TintComponent(GrassPatches, FLinearColor(0.11f, 0.30f, 0.10f));
	TintComponent(TreeTrunks,   FLinearColor(0.28f, 0.18f, 0.09f));
	TintComponent(TreeCanopies, FLinearColor(0.13f, 0.36f, 0.14f));
	TintComponent(Bushes,       FLinearColor(0.16f, 0.34f, 0.15f));
	TintComponent(CarBodies,    FLinearColor(0.45f, 0.10f, 0.12f));  // maroon
	TintComponent(CarCabins,    FLinearColor(0.10f, 0.11f, 0.13f));  // tinted glass
	TintComponent(CarWheels,    FLinearColor(0.03f, 0.03f, 0.03f));
	TintComponent(LampPosts,    FLinearColor(0.08f, 0.08f, 0.09f));
	TintComponent(LampHeads,    FLinearColor(2.0f, 1.7f, 0.7f), true);
	TintComponent(Benches,      FLinearColor(0.30f, 0.19f, 0.10f));
	TintComponent(Hydrants,     FLinearColor(0.70f, 0.08f, 0.06f));
	TintComponent(TrashCans,    FLinearColor(0.12f, 0.28f, 0.15f));
	TintComponent(TrafficPosts, FLinearColor(0.07f, 0.07f, 0.08f));
	TintComponent(TrafficLights,FLinearColor(1.6f, 1.1f, 0.2f), true);

	BuildRoads();

	FRandomStream Rng(Seed);
	for (int32 i = 0; i < Grid; ++i)
	{
		for (int32 j = 0; j < Grid; ++j)
		{
			BuildBlock(i, j, Rng);
		}
	}
}

void AStickmanCityGenerator::BuildRoads()
{
	const int32 Grid = FMath::Max(1, GridSize);
	const float Span = CellSpan();
	const float RoadLen = Grid * Span + StreetWidth;

	// Street lines run between and around the blocks: pos(k) = (k - Grid/2) * Span, k in 0..Grid.
	auto StreetLine = [&](int32 k) { return (k - Grid * 0.5f) * Span; };

	for (int32 k = 0; k <= Grid; ++k)
	{
		const float P = StreetLine(k);

		// Horizontal road (long along X) and vertical road (long along Y).
		if (Roads)
		{
			Roads->AddInstance(FTransform(FRotator::ZeroRotator,
				FVector(0.f, P, 4.f), FVector(RoadLen / 100.f, StreetWidth / 100.f, 0.08f)));
			Roads->AddInstance(FTransform(FRotator::ZeroRotator,
				FVector(P, 0.f, 4.f), FVector(StreetWidth / 100.f, RoadLen / 100.f, 0.08f)));
		}

		// Dashed centre line along each road.
		if (LaneMarks)
		{
			const float Step = 700.f;
			for (float d = -RoadLen * 0.5f; d <= RoadLen * 0.5f; d += Step)
			{
				LaneMarks->AddInstance(FTransform(FRotator::ZeroRotator,
					FVector(d, P, 9.f), FVector(3.2f, 0.2f, 0.1f)));   // along X
				LaneMarks->AddInstance(FTransform(FRotator::ZeroRotator,
					FVector(P, d, 9.f), FVector(0.2f, 3.2f, 0.1f)));   // along Y
			}
		}

		// Zebra crossings on the four approaches of each intersection.
		if (Crosswalks)
		{
			for (int32 m = 0; m <= Grid; ++m)
			{
				const float Q = StreetLine(m);
				const float Off = StreetWidth * 0.55f;
				for (int32 s = -2; s <= 2; ++s)
				{
					const float t = s * 90.f;
					Crosswalks->AddInstance(FTransform(FRotator::ZeroRotator, // north/south of node
						FVector(P + t, Q + Off, 9.5f), FVector(0.5f, 1.6f, 0.1f)));
					Crosswalks->AddInstance(FTransform(FRotator::ZeroRotator, // east/west of node
						FVector(P + Off, Q + t, 9.5f), FVector(1.6f, 0.5f, 0.1f)));
				}
			}
		}
	}
}

EStickmanBlockKind AStickmanCityGenerator::ClassifyBlock(int32 i, int32 j, FRandomStream& Rng) const
{
	const int32 Grid = FMath::Max(1, GridSize);
	const float Centre = (Grid - 1) * 0.5f;
	const float Norm = FMath::Max(FMath::Abs(i - Centre), FMath::Abs(j - Centre)) / FMath::Max(1.f, Grid * 0.5f);

	if (Rng.FRand() < ParkChance)
	{
		return EStickmanBlockKind::Park;
	}
	if (Norm < 0.35f) { return EStickmanBlockKind::Downtown; }
	if (Norm < 0.70f) { return EStickmanBlockKind::Midtown; }
	return EStickmanBlockKind::Suburb;
}

void AStickmanCityGenerator::BuildBlock(int32 i, int32 j, FRandomStream& Rng)
{
	const int32 Grid = FMath::Max(1, GridSize);
	const float Span = CellSpan();
	const float Centre = (Grid - 1) * 0.5f;
	const float BlockX = (i - Centre) * Span;
	const float BlockY = (j - Centre) * Span;
	const float Half = BlockSize * 0.5f;

	const EStickmanBlockKind Kind = ClassifyBlock(i, j, Rng);

	// Sidewalk slab covering the lot, sitting just above the road.
	if (Sidewalks)
	{
		Sidewalks->AddInstance(FTransform(FRotator::ZeroRotator,
			FVector(BlockX, BlockY, 6.f), FVector(BlockSize / 100.f, BlockSize / 100.f, 0.12f)));
	}

	// Street lamp + traffic light at the block's near corner (out on the pavement).
	const FVector Corner(BlockX - Half - StreetWidth * 0.35f, BlockY - Half - StreetWidth * 0.35f, 0.f);
	AddStreetLamp(Corner);
	if (Kind == EStickmanBlockKind::Downtown || Kind == EStickmanBlockKind::Midtown)
	{
		AddTrafficLight(Corner + FVector(60.f, 60.f, 0.f), 0.f);
	}

	if (Kind == EStickmanBlockKind::Park)
	{
		// Grass patch + scattered trees/bushes + a couple of benches.
		if (GrassPatches)
		{
			GrassPatches->AddInstance(FTransform(FRotator::ZeroRotator,
				FVector(BlockX, BlockY, 8.f), FVector(BlockSize * 0.94f / 100.f, BlockSize * 0.94f / 100.f, 0.14f)));
		}
		const int32 NumTrees = Rng.RandRange(6, 11);
		for (int32 t = 0; t < NumTrees; ++t)
		{
			const FVector P(BlockX + Rng.FRandRange(-Half * 0.8f, Half * 0.8f),
			                BlockY + Rng.FRandRange(-Half * 0.8f, Half * 0.8f), 0.f);
			AddTree(Rng, P);
		}
		const int32 NumBush = Rng.RandRange(5, 9);
		for (int32 b = 0; b < NumBush; ++b)
		{
			AddBush(Rng, FVector(BlockX + Rng.FRandRange(-Half * 0.85f, Half * 0.85f),
			                     BlockY + Rng.FRandRange(-Half * 0.85f, Half * 0.85f), 0.f));
		}
		AddBench(FVector(BlockX - Half * 0.3f, BlockY, 0.f), 0.f);
		AddBench(FVector(BlockX + Half * 0.3f, BlockY, 0.f), 180.f);
		AddTrashCan(FVector(BlockX, BlockY - Half * 0.5f, 0.f));
		return;
	}

	// Built-up block: height falls off from downtown core to the suburbs.
	float KindScale = 0.35f;
	switch (Kind)
	{
		case EStickmanBlockKind::Downtown: KindScale = 1.00f; break;
		case EStickmanBlockKind::Midtown:  KindScale = 0.60f; break;
		default:                           KindScale = 0.32f; break;
	}

	const float LotSpan = BlockSize * 0.5f;
	for (int32 lx = 0; lx < 2; ++lx)
	{
		for (int32 ly = 0; ly < 2; ++ly)
		{
			if (Rng.FRand() > 0.85f)
			{
				continue; // occasional gap (plaza / lot)
			}
			const float LotX = BlockX + (lx - 0.5f) * LotSpan;
			const float LotY = BlockY + (ly - 0.5f) * LotSpan;

			const float Roll = Rng.FRand() * Rng.FRand();
			const float Height = FMath::Lerp(MinBuildingHeight, MaxBuildingHeight * KindScale, Roll);
			const float FootW = LotSpan * Rng.FRandRange(0.58f, 0.86f);
			const float FootD = LotSpan * Rng.FRandRange(0.58f, 0.86f);
			AddBuilding(Rng, FVector(LotX, LotY, 0.f), FootW, FootD, Height, Kind);
		}
	}

	// Kerbside dressing: a couple of trees, a bench, a hydrant, a trash can, and parked cars.
	AddTree(Rng, FVector(BlockX - Half * 0.7f, BlockY - Half - StreetWidth * 0.18f, 0.f));
	AddTree(Rng, FVector(BlockX + Half * 0.2f, BlockY - Half - StreetWidth * 0.18f, 0.f));
	AddBench(FVector(BlockX - Half * 0.2f, BlockY - Half - StreetWidth * 0.12f, 0.f), 0.f);
	AddHydrant(FVector(BlockX + Half * 0.6f, BlockY - Half - StreetWidth * 0.12f, 0.f));
	AddTrashCan(FVector(BlockX - Half * 0.5f, BlockY - Half - StreetWidth * 0.12f, 0.f));

	const int32 NumCars = Rng.RandRange(1, 3);
	for (int32 c = 0; c < NumCars; ++c)
	{
		const float CarX = BlockX + Rng.FRandRange(-Half * 0.7f, Half * 0.7f);
		const float CarY = BlockY - Half - StreetWidth * 0.42f;
		AddCar(Rng, FVector(CarX, CarY, 0.f), 0.f);
	}
}

void AStickmanCityGenerator::AddBuilding(FRandomStream& Rng, const FVector& LotCentre,
	float FootW, float FootD, float Height, EStickmanBlockKind Kind)
{
	// Cube native = 100^3 centred, so bottom rests on the pavement at z = Height/2 (+ slab).
	const FVector Loc(LotCentre.X, LotCentre.Y, Height * 0.5f + 12.f);
	const FTransform T(FRotator(0.f, Rng.FRandRange(-3.f, 3.f), 0.f), Loc,
		FVector(FootW / 100.f, FootD / 100.f, Height / 100.f));

	int32 Tier = Rng.RandRange(0, BuildingTiers.Num() - 1);
	if (Kind == EStickmanBlockKind::Downtown && Rng.FRand() < 0.6f) { Tier = 1; } // glass-heavy core
	if (BuildingTiers.IsValidIndex(Tier) && BuildingTiers[Tier])
	{
		BuildingTiers[Tier]->AddInstance(T);
	}

	// Rooftop AC box on taller buildings.
	if (Rooftops && Height > 1200.f)
	{
		Rooftops->AddInstance(FTransform(FRotator::ZeroRotator,
			FVector(LotCentre.X, LotCentre.Y, Height + 12.f + 40.f),
			FVector(FootW * 0.35f / 100.f, FootD * 0.35f / 100.f, 0.8f)));
	}
}

void AStickmanCityGenerator::AddTree(FRandomStream& Rng, const FVector& Base)
{
	if (!TreeTrunks || !TreeCanopies) { return; }

	const float TrunkH = Rng.FRandRange(220.f, 340.f);
	const float CanopyR = Rng.FRandRange(130.f, 200.f);

	// Trunk: cylinder native height 100 -> scaleZ = TrunkH/100, centred at TrunkH/2.
	TreeTrunks->AddInstance(FTransform(FRotator::ZeroRotator,
		FVector(Base.X, Base.Y, TrunkH * 0.5f), FVector(0.28f, 0.28f, TrunkH / 100.f)));

	// Canopy: sphere native 100 -> scale = 2R/100, sitting above the trunk.
	const float CScale = (2.f * CanopyR) / 100.f;
	TreeCanopies->AddInstance(FTransform(FRotator::ZeroRotator,
		FVector(Base.X, Base.Y, TrunkH + CanopyR * 0.6f), FVector(CScale, CScale, CScale * 0.9f)));
}

void AStickmanCityGenerator::AddBush(FRandomStream& Rng, const FVector& Base)
{
	if (!Bushes) { return; }
	const float R = Rng.FRandRange(45.f, 80.f);
	const float S = (2.f * R) / 100.f;
	Bushes->AddInstance(FTransform(FRotator(0.f, Rng.FRandRange(0.f, 360.f), 0.f),
		FVector(Base.X, Base.Y, R * 0.55f), FVector(S, S, S * 0.7f)));
}

void AStickmanCityGenerator::AddCar(FRandomStream& Rng, const FVector& Base, float Yaw)
{
	const FTransform Car(FRotator(0.f, Yaw, 0.f), Base);

	// Body: ~430 x 180 x 110, lifted to sit on the wheels.
	if (CarBodies)
	{
		const FTransform Local(FRotator::ZeroRotator, FVector(0.f, 0.f, 95.f), FVector(4.3f, 1.8f, 1.0f));
		CarBodies->AddInstance(Local * Car);
	}
	// Cabin: smaller box set back and up.
	if (CarCabins)
	{
		const FTransform Local(FRotator::ZeroRotator, FVector(-20.f, 0.f, 175.f), FVector(2.1f, 1.55f, 0.85f));
		CarCabins->AddInstance(Local * Car);
	}
	// Four wheels: cylinders rolled 90 deg so their axis runs across the car (local Y).
	if (CarWheels)
	{
		const float Wx = 150.f, Wy = 92.f, Wr = 38.f;
		const FVector Offs[] = {
			FVector( Wx,  Wy, Wr), FVector( Wx, -Wy, Wr),
			FVector(-Wx,  Wy, Wr), FVector(-Wx, -Wy, Wr) };
		for (const FVector& O : Offs)
		{
			const FTransform Local(FRotator(0.f, 0.f, 90.f), O, FVector(0.76f, 0.76f, 0.24f));
			CarWheels->AddInstance(Local * Car);
		}
	}
	(void)Rng;
}

void AStickmanCityGenerator::AddBench(const FVector& Base, float Yaw)
{
	if (!Benches) { return; }
	const FTransform B(FRotator(0.f, Yaw, 0.f), Base);
	// Seat slab.
	Benches->AddInstance(FTransform(FRotator::ZeroRotator, FVector(0.f, 0.f, 45.f), FVector(1.2f, 0.42f, 0.12f)) * B);
	// Backrest.
	Benches->AddInstance(FTransform(FRotator::ZeroRotator, FVector(-18.f, 0.f, 78.f), FVector(1.2f, 0.10f, 0.42f)) * B);
}

void AStickmanCityGenerator::AddHydrant(const FVector& Base)
{
	if (!Hydrants) { return; }
	// Stubby fat cylinder; recognisable red kerb hydrant.
	Hydrants->AddInstance(FTransform(FRotator::ZeroRotator,
		FVector(Base.X, Base.Y, 32.f), FVector(0.36f, 0.36f, 0.64f)));
}

void AStickmanCityGenerator::AddTrashCan(const FVector& Base)
{
	if (!TrashCans) { return; }
	TrashCans->AddInstance(FTransform(FRotator::ZeroRotator,
		FVector(Base.X, Base.Y, 36.f), FVector(0.44f, 0.44f, 0.72f)));
}

void AStickmanCityGenerator::AddStreetLamp(const FVector& Base)
{
	if (LampPosts)
	{
		LampPosts->AddInstance(FTransform(FRotator::ZeroRotator,
			FVector(Base.X, Base.Y, 220.f), FVector(0.12f, 0.12f, 4.4f)));
	}
	if (LampHeads)
	{
		LampHeads->AddInstance(FTransform(FRotator::ZeroRotator,
			FVector(Base.X, Base.Y, 445.f), FVector(0.35f, 0.35f, 0.35f)));
	}
}

void AStickmanCityGenerator::AddTrafficLight(const FVector& Base, float Yaw)
{
	const FTransform B(FRotator(0.f, Yaw, 0.f), Base);
	if (TrafficPosts)
	{
		TrafficPosts->AddInstance(FTransform(FRotator::ZeroRotator, FVector(0.f, 0.f, 260.f), FVector(0.14f, 0.14f, 5.2f)) * B);
	}
	if (TrafficLights)
	{
		// Single emissive amber lens standing in for the signal head.
		TrafficLights->AddInstance(FTransform(FRotator::ZeroRotator, FVector(0.f, 0.f, 500.f), FVector(0.42f, 0.42f, 0.42f)) * B);
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
		Dyn->SetVectorParameterValue(TEXT("Color"), Color);
		if (bEmissive)
		{
			Dyn->SetVectorParameterValue(TEXT("EmissiveColor"), Color);
			Dyn->SetScalarParameterValue(TEXT("EmissiveStrength"), 5.f);
		}
	}
}
