// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "HousingTypes.generated.h"

UENUM(BlueprintType)
enum class EFurnitureCategory : uint8
{
	Structure,   // houses, walls, floors, stairs, roofs
	Furniture,   // chairs, tables, beds, shelves
	Decoration,  // plants, paintings, rugs, lights
	Outdoor,     // trees, rocks, ponds, paths, fences
	Functional   // crafting stations, dummies, planting plots
};

UENUM(BlueprintType)
enum class ERealmLayout : uint8
{
	FloatingIslands,
	EmeraldForest,
	CrystalCave,
	Beachfront,
	MountainPeak
};

/** One craftable/placeable furniture definition (DataTable row). */
USTRUCT(BlueprintType)
struct FFurnitureDef : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Housing")
	FName FurnitureID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Housing")
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Housing")
	EFurnitureCategory Category = EFurnitureCategory::Furniture;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Housing")
	TObjectPtr<class UStaticMesh> Mesh;

	// Crafting materials: ItemID -> quantity.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Housing")
	TMap<FName, int32> CraftMaterials;

	// Realm energy this piece contributes when placed.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Housing")
	int32 RealmEnergy = 10;

	// Furniture-set membership (a full set placed gives a bonus).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Housing")
	FName SetID = NAME_None;

	// Functional furniture: what it does (a tag the world reads — "CraftingStation", etc.).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Housing")
	FName FunctionalTag = NAME_None;
};

/** A placed piece in the realm (serialized). */
USTRUCT(BlueprintType)
struct FPlacedFurniture
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Housing")
	FName FurnitureID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Housing")
	FTransform Transform = FTransform::Identity;

	// Dye index into the 16-color palette (-1 = default).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Housing")
	int32 DyeColorIndex = -1;
};

/** A gardening plot (part of the realm state). */
USTRUCT(BlueprintType)
struct FGardenPlot
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Housing")
	FVector Location = FVector::ZeroVector;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Housing")
	FName SeedID = NAME_None;

	// 0..1 growth; harvest at 1. Advanced by time (or elemental infusion).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Housing")
	float Growth = 0.f;

	// For cross-breeding: color/trait tag adjacent plots can blend.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Housing")
	FName TraitTag = NAME_None;
};
