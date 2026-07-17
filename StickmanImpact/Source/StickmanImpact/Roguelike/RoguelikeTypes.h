// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "GameplayTagContainer.h"
#include "RoguelikeTypes.generated.h"

UENUM(BlueprintType)
enum class ERoomType : uint8
{
	Combat,
	Boss,
	Treasure,
	Shop,
	Rest,
	Mystery,
	Trap,
	Puzzle
};

UENUM(BlueprintType)
enum class EBoonRarity : uint8
{
	Common,   // white
	Rare,     // blue
	Epic,     // purple
	Legendary // gold
};

UENUM(BlueprintType)
enum class EBoonCategory : uint8
{
	Combat,
	Defense,
	Utility,
	Elemental,
	Special
};

/** Enemy affixes rolled from floor 4+. */
UENUM(BlueprintType)
enum class EEnemyAffix : uint8
{
	None,
	Frenzied,     // +30% attack speed
	Thorned,      // reflect 10% damage
	Vampiric,     // heal 5% of damage dealt
	Explosive,    // explodes on death
	Regenerating, // heals over time
	Shielded,     // starts with elemental shield
	Mirror,       // clones on first hit
	Giant         // +50% size, +100% HP, +50% damage
};

/** One boon definition (DataTable row). Effects apply via GameplayTag/GE keyed off EffectTag. */
USTRUCT(BlueprintType)
struct FBoonDef : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boon")
	FName BoonID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boon")
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boon", meta = (MultiLine = "true"))
	FText Description;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boon")
	EBoonCategory Category = EBoonCategory::Combat;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boon")
	EBoonRarity Rarity = EBoonRarity::Common;

	// Applied by the run subsystem (grants a loose tag / GE); systems read the tag.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boon")
	FGameplayTag EffectTag;

	// Simple scalar payload (e.g. +ATK%), summed across the boon's stacked levels.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boon")
	float MagnitudePerLevel = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boon")
	int32 MaxLevel = 3;

	// Boons this one synergizes with — owning both grants SynergyBoonID.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boon")
	TArray<FName> SynergyPartners;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boon")
	FName SynergyBoonID;
};

/** One placeable dungeon room piece (level actor authored with entry/exit doors). */
USTRUCT(BlueprintType)
struct FRoomPiece
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dungeon")
	ERoomType RoomType = ERoomType::Combat;

	// Sub-level / streaming-level to load for this room, or a room-actor class BP-side.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dungeon")
	TSoftObjectPtr<UWorld> RoomLevel;

	// Biome tag (Pyro Dungeon, Cryo Cavern, …) for theming.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dungeon")
	FName BiomeTag = NAME_None;
};

/** A generated room slot in a floor layout. */
USTRUCT(BlueprintType)
struct FGeneratedRoom
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "Dungeon")
	ERoomType RoomType = ERoomType::Combat;

	UPROPERTY(BlueprintReadOnly, Category = "Dungeon")
	int32 RoomIndex = 0;

	UPROPERTY(BlueprintReadOnly, Category = "Dungeon")
	FName BiomeTag = NAME_None;
};
