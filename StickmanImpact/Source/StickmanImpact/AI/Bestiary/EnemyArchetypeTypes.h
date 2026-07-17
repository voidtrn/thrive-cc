// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "Character/StickmanStatTypes.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "Combat/StickmanReactionTypes.h"
#include "AI/StickmanAITypes.h"
#include "EnemyArchetypeTypes.generated.h"

class AStickmanEnemyCharacter;
class UGameplayAbility;
class UActorComponent;

/** Which faction an archetype belongs to — drives spawn tables, faction rep, and journal grouping. */
UENUM(BlueprintType)
enum class EEnemyFaction : uint8
{
	HilichurlTribe,
	AbyssOrder,
	ElementalEntity,
	Humanoid,      // Treasure Hoarders, Fatui, …
	Wildlife,
	Special        // Mimic, Doppelganger, Time Wraith, …
};

/** One weighted loot drop. */
USTRUCT(BlueprintType)
struct FEnemyLootEntry
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Loot")
	FName ItemID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Loot")
	int32 MinQuantity = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Loot")
	int32 MaxQuantity = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Loot", meta = (ClampMin = "0", ClampMax = "1"))
	float DropChance = 1.f;
};

/**
 * One bestiary entry (DataTable row). The whole 50+ roster is data — this struct is the
 * schema the UEnemyFactory reads to configure a base AStickmanEnemyCharacter (stats,
 * element, personality, weighted attacks, resistances, loot), plus a
 * `MechanicComponentClass` for the archetype's unique behavior. Common mechanics ship as
 * reusable components (UEnrageComponent, USummonerComponent, UCloneOnHitComponent, …);
 * bespoke ones are BP components on this same hook. `EnemyClass` overrides the base pawn
 * when an archetype needs a native subclass (bosses use AStickmanBossCharacter).
 */
USTRUCT(BlueprintType)
struct FEnemyArchetype : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bestiary")
	FName ArchetypeID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bestiary")
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bestiary")
	EEnemyFaction Faction = EEnemyFaction::HilichurlTribe;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bestiary")
	EStickmanElement Element = EStickmanElement::None;

	// Base pawn class (or a native subclass — AStickmanBossCharacter for mini-bosses).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bestiary")
	TSubclassOf<AStickmanEnemyCharacter> EnemyClass;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bestiary")
	FStickmanStats BaseStats;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bestiary")
	EEnemyPersonality Personality = EEnemyPersonality::Aggressive;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bestiary")
	TArray<FStickmanWeightedAttack> WeightedAttacks;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bestiary")
	TArray<TSubclassOf<UGameplayAbility>> Abilities;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bestiary")
	TMap<EStickmanElement, float> ElementResistances;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bestiary")
	float OptimalCombatDistance = 200.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bestiary")
	bool bIsLeader = false;

	// The archetype's signature mechanic (enrage, clone, energy-drain, summon, …). Added to
	// the pawn on spawn. Null = plain archetype.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bestiary")
	TSubclassOf<UActorComponent> MechanicComponentClass;

	// One-line description of the unique mechanic (journal text).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bestiary", meta = (MultiLine = "true"))
	FText MechanicDescription;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bestiary")
	int32 RecommendedLevelMin = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bestiary")
	int32 RecommendedLevelMax = 10;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bestiary")
	TArray<FEnemyLootEntry> LootTable;
};
