// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameplayTagContainer.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "StickmanEquipmentTypes.generated.h"

class UTexture2D;
class UGameplayEffect;

UENUM(BlueprintType)
enum class EArtifactSlot : uint8
{
	Flower,
	Plume,
	Sands,
	Goblet,
	Circlet
};

UENUM(BlueprintType)
enum class EArtifactStat : uint8
{
	HP,
	HPPercent,
	ATK,
	ATKPercent,
	DEF,
	DEFPercent,
	ElementalMastery,
	EnergyRecharge,
	CRITRate,
	CRITDMG,
	PhysicalDMG,
	ElementalDMG,
	HealingBonus
};

/** One stat roll — used for both artifact sub-stats and weapon sub-stats. Note: the design
 * spec asked for TArray<TPair<EArtifactStat, float>>, but TPair isn't UPROPERTY/UHT-compatible
 * (Blueprint/DataTable can't reflect it), so this struct stands in for it. */
USTRUCT(BlueprintType)
struct FArtifactSubStat
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stat")
	EArtifactStat Stat = EArtifactStat::ATK;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stat")
	float Value = 0.f;
};

/** One artifact instance. MainStat is a single roll (spec said "one main stat" — a
 * TMap<EArtifactStat,float> for exactly one entry is more awkward than useful, so this is a
 * single FArtifactSubStat instead). */
USTRUCT(BlueprintType)
struct FArtifactData
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Artifact")
	FString ArtifactID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Artifact")
	FText ArtifactName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Artifact")
	EArtifactSlot Slot = EArtifactSlot::Flower;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Artifact")
	FArtifactSubStat MainStat;

	// Max 4, enforced by UEquipmentManager/roll logic rather than the array type itself.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Artifact")
	TArray<FArtifactSubStat> SubStats;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Artifact", meta = (ClampMin = "0", ClampMax = "20"))
	int32 Level = 0;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Artifact", meta = (ClampMin = "1", ClampMax = "5"))
	int32 Rarity = 5;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Artifact")
	FName SetName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Artifact")
	TObjectPtr<UTexture2D> ArtifactIcon;
};

/** A set's 2pc/4pc bonuses. Simple flat/percent stat bonuses apply generically; a set whose
 * 4pc is conditional/reactive (e.g. "+40% CRIT DMG against Frozen enemies") is expressed as a
 * gameplay tag + magnitude for combat code to interpret, since there's no way to generalize
 * arbitrary conditional logic into pure data. */
USTRUCT(BlueprintType)
struct FArtifactSetBonus : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Set")
	FName SetName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Set")
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Set")
	FText TwoPieceDescription;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Set")
	FText FourPieceDescription;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Set")
	TArray<FArtifactSubStat> TwoPieceStatBonuses;

	// Only for sets whose 4pc bonus is a plain stat bonus (e.g. flat DMG% for an element).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Set")
	TArray<FArtifactSubStat> FourPieceStatBonuses;

	// For conditional 4pc bonuses (reaction DMG, crit vs. a status, ...) — combat code checks
	// for this tag on the equipping character and applies FourPieceConditionalMagnitude itself.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Set")
	FGameplayTag FourPieceConditionalTag;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Set")
	float FourPieceConditionalMagnitude = 0.f;
};

/** One weapon instance. */
USTRUCT(BlueprintType)
struct FWeaponData
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	FString WeaponID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	FText WeaponName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	EWeaponType WeaponType = EWeaponType::Sword;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon", meta = (ClampMin = "1", ClampMax = "5"))
	int32 Rarity = 4;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	float BaseATK = 40.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	EArtifactStat SubStatType = EArtifactStat::CRITRate;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	float SubStatValue = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon", meta = (ClampMin = "1", ClampMax = "5"))
	int32 RefinementLevel = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	FText PassiveDescription;

	// A passive that only matters in specific conditions (e.g. "+20% ATK for 6s after hitting
	// with an Elemental Skill") — applied/removed by combat code, not automatically.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	TSubclassOf<UGameplayEffect> PassiveEffectClass;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon", meta = (ClampMin = "1", ClampMax = "90"))
	int32 Level = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	float CurrentEXP = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	int32 Ascension = 0;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	TObjectPtr<UTexture2D> WeaponIcon;
};

/** Aggregated bonus stats from a weapon + 5 artifacts + set bonuses — everything
 * UStickmanAttributeSet doesn't already track natively (crit, DMG%, healing bonus, ...). */
USTRUCT(BlueprintType)
struct FEquipmentStatTotals
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly) float FlatHP = 0.f;
	UPROPERTY(BlueprintReadOnly) float PercentHP = 0.f;
	UPROPERTY(BlueprintReadOnly) float FlatATK = 0.f;
	UPROPERTY(BlueprintReadOnly) float PercentATK = 0.f;
	UPROPERTY(BlueprintReadOnly) float FlatDEF = 0.f;
	UPROPERTY(BlueprintReadOnly) float PercentDEF = 0.f;
	UPROPERTY(BlueprintReadOnly) float ElementalMastery = 0.f;
	UPROPERTY(BlueprintReadOnly) float EnergyRechargePercent = 0.f;
	UPROPERTY(BlueprintReadOnly) float CritRatePercent = 5.f;
	UPROPERTY(BlueprintReadOnly) float CritDMGPercent = 50.f;
	UPROPERTY(BlueprintReadOnly) float PhysicalDMGPercent = 0.f;
	UPROPERTY(BlueprintReadOnly) float ElementalDMGPercent = 0.f;
	UPROPERTY(BlueprintReadOnly) float HealingBonusPercent = 0.f;

	void AddStat(EArtifactStat Stat, float Value);
};
