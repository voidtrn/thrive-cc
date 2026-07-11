// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "Character/StickmanStatTypes.h"
#include "StickmanPartyTypes.generated.h"

class USkeletalMesh;
class UTexture2D;
class UStickmanSkillDataAsset;

/** One ascension breakpoint (0-6): stat bonus unlocked at RequiredCharacterLevel, gated by materials. */
USTRUCT(BlueprintType)
struct FCharacterAscension
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ascension")
	int32 AscensionLevel = 0;

	// Genshin-style breakpoints: 20/40/50/60/70/80.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ascension")
	int32 RequiredCharacterLevel = 20;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ascension")
	FStickmanStats StatBonus;

	// Material ID -> quantity required. No inventory system exists yet — checked against
	// UInventoryManager once that lands; UPartyManager::TryAscend logs-only today.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ascension")
	TMap<FName, int32> RequiredMaterials;
};

USTRUCT(BlueprintType)
struct FConstellationLevel
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Constellation")
	FText Name;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Constellation")
	FText Description;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Constellation")
	TObjectPtr<UTexture2D> Icon;
};

USTRUCT(BlueprintType)
struct FConstellationData
{
	GENERATED_BODY()

	// Exactly 6 levels per the design spec (C1-C6); shorter/longer arrays are tolerated but
	// UPartyManager::GetUnlockedConstellationCount clamps to Levels.Num().
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Constellation")
	TArray<FConstellationLevel> Levels;
};

/** One playable character's static design data — a DataTable row (RowStruct = this). */
USTRUCT(BlueprintType)
struct FStickmanCharacterData : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
	FString CharacterID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
	FText CharacterName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
	EStickmanElement Element = EStickmanElement::None;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
	EWeaponType WeaponType = EWeaponType::Sword;

	// Soft: a SkeletalMesh is heavy, only load the character actually being played/previewed.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
	TSoftObjectPtr<USkeletalMesh> CharacterMesh;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
	TObjectPtr<UTexture2D> CharacterIcon;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
	TObjectPtr<UTexture2D> CharacterSplash;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
	FStickmanStats BaseStats;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
	TObjectPtr<UStickmanSkillDataAsset> SkillData;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
	TArray<FCharacterAscension> AscensionLevels;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
	FConstellationData Constellations;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
	FText CharacterStory;
};

/** Runtime progress for one party member — the DataTable row is the immutable template. */
USTRUCT(BlueprintType)
struct FPartyMemberState
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "Party")
	FStickmanCharacterData CharacterData;

	UPROPERTY(BlueprintReadWrite, Category = "Party")
	int32 CurrentLevel = 1;

	UPROPERTY(BlueprintReadWrite, Category = "Party")
	float CurrentEXP = 0.f;

	UPROPERTY(BlueprintReadWrite, Category = "Party")
	int32 CurrentAscension = 0;

	UPROPERTY(BlueprintReadWrite, Category = "Party")
	int32 UnlockedConstellationLevel = 0;

	UPROPERTY(BlueprintReadWrite, Category = "Party")
	FString EquippedWeaponID;

	UPROPERTY(BlueprintReadWrite, Category = "Party")
	TArray<FString> EquippedArtifactIDs;
};
