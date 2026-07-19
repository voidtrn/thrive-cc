// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "StickmanCityGenerator.generated.h"

class UStaticMeshComponent;
class UInstancedStaticMeshComponent;

/**
 * Procedurally builds an urban "situasi perkotaan" scene from /Engine/BasicShapes primitives,
 * requiring ZERO authored art. On BeginPlay it lays down an asphalt ground plane, a grid of
 * city blocks separated by streets, buildings of varied height/palette (instanced cubes), and
 * street lamps (instanced cylinders + emissive tops). Deterministic via a seed so the same
 * layout regenerates every run.
 *
 * Instanced static mesh components keep hundreds of buildings cheap; one component per palette
 * tier lets us tint whole material groups without per-instance custom-data shaders.
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

	/** Number of city blocks per side (GridSize x GridSize blocks). */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "City")
	int32 GridSize = 6;

	/** Footprint of one block (building lot), before the surrounding street. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "City")
	float BlockSize = 2200.f;

	/** Width of the streets between blocks. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "City")
	float StreetWidth = 700.f;

	/** Min/max building height range. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "City")
	float MinBuildingHeight = 500.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "City")
	float MaxBuildingHeight = 4500.f;

	/** Seed for the deterministic layout RNG. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "City")
	int32 Seed = 1337;

private:
	void Generate();
	void ClearInstances();

	// Spacing between block centres (block + one street).
	float CellSpan() const { return BlockSize + StreetWidth; }

	UPROPERTY(VisibleAnywhere, Category = "City")
	TObjectPtr<USceneComponent> SceneRoot;

	// Flat asphalt ground under the whole city.
	UPROPERTY(VisibleAnywhere, Category = "City")
	TObjectPtr<UStaticMeshComponent> Ground;

	// Three building palettes (concrete / glass / brick) as separate instanced components.
	UPROPERTY(VisibleAnywhere, Category = "City")
	TArray<TObjectPtr<UInstancedStaticMeshComponent>> BuildingTiers;

	// Light-grey sidewalk slabs ringing each block.
	UPROPERTY(VisibleAnywhere, Category = "City")
	TObjectPtr<UInstancedStaticMeshComponent> Sidewalks;

	// Street-lamp posts (cylinders) and their emissive lamp heads (spheres).
	UPROPERTY(VisibleAnywhere, Category = "City")
	TObjectPtr<UInstancedStaticMeshComponent> LampPosts;

	UPROPERTY(VisibleAnywhere, Category = "City")
	TObjectPtr<UInstancedStaticMeshComponent> LampHeads;

	// Cached engine primitive meshes (resolved in the constructor).
	UPROPERTY(Transient)
	TObjectPtr<UStaticMesh> CubeMesh;

	UPROPERTY(Transient)
	TObjectPtr<UStaticMesh> PlaneMesh;

	UPROPERTY(Transient)
	TObjectPtr<UStaticMesh> CylinderMesh;

	UPROPERTY(Transient)
	TObjectPtr<UStaticMesh> SphereMesh;

	// Tints a component's slot-0 material via a dynamic BasicShapeMaterial instance.
	void TintComponent(class UMeshComponent* Comp, const FLinearColor& Color, bool bEmissive = false);
};
