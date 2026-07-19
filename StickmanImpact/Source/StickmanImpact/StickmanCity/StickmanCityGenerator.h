// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "StickmanCityGenerator.generated.h"

class UStaticMeshComponent;
class UInstancedStaticMeshComponent;
class UMeshComponent;
class UStaticMesh;

/** Per-block flavour picked during layout so props/buildings match the district. */
UENUM()
enum class EStickmanBlockKind : uint8
{
	Downtown,   // dense high-rise
	Midtown,    // mixed mid-rise
	Suburb,     // low buildings, more greenery
	Park        // no buildings, trees + benches
};

/**
 * Procedurally builds a dense, open-world-style urban scene from /Engine/BasicShapes
 * primitives, requiring ZERO authored art. On BeginPlay it stamps:
 *   - an asphalt road grid with dashed lane markings + zebra crossings,
 *   - a seeded grid of city blocks whose height falls off from a downtown core to the
 *     suburbs, in three material palettes, with rooftop AC boxes,
 *   - parks (grass patches, trees, bushes) replacing some blocks,
 *   - street furniture: lamps, traffic lights, benches, hydrants, trash cans, signs,
 *   - parked cars (multi-part: body + cabin + four wheels) along the kerbs.
 *
 * Everything is instanced (one component per asset/palette) so thousands of props stay cheap,
 * and the whole layout is deterministic from Seed.
 */
UCLASS()
class STICKMANIMPACT_API AStickmanCityGenerator : public AActor
{
	GENERATED_BODY()

public:
	AStickmanCityGenerator();

	virtual void OnConstruction(const FTransform& Transform) override;
	virtual void BeginPlay() override;

	// ---- Layout tuning (centimetres) ----

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "City")
	int32 GridSize = 8;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "City")
	float BlockSize = 2200.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "City")
	float StreetWidth = 800.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "City")
	float MinBuildingHeight = 450.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "City")
	float MaxBuildingHeight = 6000.f;

	/** 0..1 fraction of blocks turned into parks. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "City", meta = (ClampMin = "0.0", ClampMax = "1.0"))
	float ParkChance = 0.16f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "City")
	int32 Seed = 1337;

private:
	// ---- Build pipeline ----
	void Generate();
	void ClearInstances();
	void BuildRoads();
	void BuildBlock(int32 i, int32 j, struct FRandomStream& Rng);

	// ---- Prop stampers (add one instanced asset at a world-relative transform) ----
	void AddBuilding(struct FRandomStream& Rng, const FVector& LotCentre, float FootW, float FootD, float Height, EStickmanBlockKind Kind);
	void AddTree(struct FRandomStream& Rng, const FVector& Base);
	void AddBush(struct FRandomStream& Rng, const FVector& Base);
	void AddCar(struct FRandomStream& Rng, const FVector& Base, float Yaw);
	void AddBench(const FVector& Base, float Yaw);
	void AddHydrant(const FVector& Base);
	void AddTrashCan(const FVector& Base);
	void AddStreetLamp(const FVector& Base);
	void AddTrafficLight(const FVector& Base, float Yaw);

	EStickmanBlockKind ClassifyBlock(int32 i, int32 j, struct FRandomStream& Rng) const;

	float CellSpan() const { return BlockSize + StreetWidth; }

	// Creates + registers one instanced component, assigns mesh, and stores the tint to apply.
	UInstancedStaticMeshComponent* MakeISM(FName Name, UStaticMesh* Mesh, bool bCollide);
	void TintComponent(UMeshComponent* Comp, const FLinearColor& Color, bool bEmissive = false);

	UPROPERTY(VisibleAnywhere, Category = "City")
	TObjectPtr<USceneComponent> SceneRoot;

	UPROPERTY(VisibleAnywhere, Category = "City")
	TObjectPtr<UStaticMeshComponent> Ground;

	// Roads / markings
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> Roads;
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> LaneMarks;
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> Crosswalks;
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> Sidewalks;

	// Buildings (three palettes) + rooftop detail
	UPROPERTY() TArray<TObjectPtr<UInstancedStaticMeshComponent>> BuildingTiers;
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> Rooftops;

	// Vegetation
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> GrassPatches;
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> TreeTrunks;
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> TreeCanopies;
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> Bushes;

	// Vehicles (parked)
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> CarBodies;
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> CarCabins;
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> CarWheels;

	// Street furniture
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> LampPosts;
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> LampHeads;
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> Benches;
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> Hydrants;
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> TrashCans;
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> TrafficPosts;
	UPROPERTY() TObjectPtr<UInstancedStaticMeshComponent> TrafficLights; // emissive lenses

	// Cached engine primitives
	UPROPERTY(Transient) TObjectPtr<UStaticMesh> CubeMesh;
	UPROPERTY(Transient) TObjectPtr<UStaticMesh> PlaneMesh;
	UPROPERTY(Transient) TObjectPtr<UStaticMesh> CylinderMesh;
	UPROPERTY(Transient) TObjectPtr<UStaticMesh> SphereMesh;
	UPROPERTY(Transient) TObjectPtr<UStaticMesh> ConeMesh;
};
