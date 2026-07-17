// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "FactionTypes.generated.h"

UENUM(BlueprintType)
enum class EFaction : uint8
{
	KnightsOfFavonius,   // order, protection, law
	AdventurersGuild,    // exploration, freedom
	AbyssOrder,          // chaos, corruption
	TreasureHoarders,    // wealth, black market
	FatuiDiplomaticCorps,// politics, tech, manipulation
	WildAlliance         // nature, balance
};

/** 7 reputation tiers from Hated to Exalted (score range -100..+100). */
UENUM(BlueprintType)
enum class EFactionRepTier : uint8
{
	Hated,     // -100..-50: attacked on sight, bounty
	Hostile,   // -49..-10: aggressive if approached
	Neutral,   // -9..+9
	Friendly,  // +10..+49: discounts, quests
	Honored,   // +50..+79: unique items, safe houses
	Revered,   // +80..+99: companions join
	Exalted    // +100: leader allies, legendary line
};

/** Procedurally-generated nemesis captain traits. */
USTRUCT(BlueprintType)
struct FNemesisCaptain
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "Nemesis")
	FGuid CaptainID;

	UPROPERTY(BlueprintReadOnly, Category = "Nemesis")
	FString Name;

	UPROPERTY(BlueprintReadOnly, Category = "Nemesis")
	EFaction Faction = EFaction::AbyssOrder;

	UPROPERTY(BlueprintReadOnly, Category = "Nemesis")
	FName Territory = NAME_None;

	// 0 = grunt-officer, rises on promotion (each promotion adds HP + an ability).
	UPROPERTY(BlueprintReadOnly, Category = "Nemesis")
	int32 Rank = 0;

	// Trait tags (e.g. "FearsFire", "ImmuneToStagger", "Ambusher") — drive strengths/weaknesses.
	UPROPERTY(BlueprintReadOnly, Category = "Nemesis")
	TArray<FName> StrengthTraits;

	UPROPERTY(BlueprintReadOnly, Category = "Nemesis")
	TArray<FName> WeaknessTraits;

	// Times this captain has defeated the player (drives taunts + promotion).
	UPROPERTY(BlueprintReadOnly, Category = "Nemesis")
	int32 TimesDefeatedPlayer = 0;

	UPROPERTY(BlueprintReadOnly, Category = "Nemesis")
	bool bAlive = true;
};
