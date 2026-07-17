// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameplayTagContainer.h"
#include "StickmanSkillTypes.generated.h"

class UAnimMontage;
class UTexture2D;
class USoundBase;
class UNiagaraSystem;
class UGameplayAbility;

UENUM(BlueprintType)
enum class EStickmanElement : uint8
{
	None,
	Pyro,
	Cryo,
	Hydro,
	Electro,
	Anemo,
	Geo,
	Dendro
};

UENUM(BlueprintType)
enum class EStickmanSkillType : uint8
{
	NormalAttack,
	ElementalSkill,
	ElementalBurst,
	Passive,
	Dodge
};

UENUM(BlueprintType)
enum class EWeaponType : uint8
{
	Sword,
	Claymore,
	Polearm,
	Bow,
	Catalyst
};

/**
 * Weapon sub-types — each parent EWeaponType has three flavors with a distinct heavy attack
 * and passive (data on FWeaponSubTypeData). WeaponType is derivable from this via
 * WeaponTypeForSubType().
 */
UENUM(BlueprintType)
enum class EWeaponSubType : uint8
{
	// Sword
	Katana, Longsword, Twinblades,
	// Claymore
	Greatsword, WarAxe, Hammer,
	// Polearm
	Spear, Halberd, Scythe,
	// Bow
	Shortbow, Longbow, Crossbow,
	// Catalyst
	Orb, Tome, Wand
};

/**
 * A normal-attack combo chain: N montages played back to back, each with its own damage
 * multiplier, as long as the player keeps attacking inside ComboWindowTime of the last hit.
 */
USTRUCT(BlueprintType)
struct FNormalAttackChain
{
	GENERATED_BODY()

	// Up to 5 hits. Index 0 = first hit of the combo.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combo")
	TArray<TObjectPtr<UAnimMontage>> AttackMontages;

	// Parallel array to AttackMontages: DamageMultipliers[i] applies to AttackMontages[i].
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combo")
	TArray<float> DamageMultipliers;

	// Seconds after a hit lands during which pressing attack again continues the combo
	// instead of resetting to hit 0.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combo")
	float ComboWindowTime = 0.6f;
};

/**
 * One talent/level entry for a skill. SkillData.UpgradeLevels[Level - 1] holds the values
 * for that level (1-15), so upgrading a skill is just picking a different array index.
 */
USTRUCT(BlueprintType)
struct FSkillUpgradeInfo
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Upgrade", meta = (ClampMin = "1", ClampMax = "15"))
	int32 Level = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Upgrade")
	float DamageMultiplier = 1.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Upgrade")
	float CooldownReduction = 0.f;

	// Overrides FSkillData::Description for this level when non-empty (e.g. to call out a
	// new effect unlocked at this rank).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Upgrade")
	FString DescriptionOverride;
};

/**
 * Full definition of a single skill (normal attack chain excluded — that's its own struct).
 * Meant to live as a row in a DataTable keyed by SkillTag, or embedded in a
 * UStickmanSkillDataAsset for a specific character.
 */
USTRUCT(BlueprintType)
struct FSkillData
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skill")
	FGameplayTag SkillTag;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skill")
	FString SkillName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skill")
	FString Description;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skill")
	EStickmanElement Element = EStickmanElement::None;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skill")
	EStickmanSkillType SkillType = EStickmanSkillType::ElementalSkill;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skill")
	TObjectPtr<UTexture2D> SkillIcon;

	// 0 = no cooldown (e.g. normal attacks / passives).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skill")
	float Cooldown = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skill")
	float EnergyCost = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skill")
	float BaseDamage = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skill")
	TArray<FSkillUpgradeInfo> UpgradeLevels;

	// Soft reference so the GameplayAbility class only loads when the skill is actually granted.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skill")
	TSoftClassPtr<UGameplayAbility> AbilityClass;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skill")
	TObjectPtr<UAnimMontage> CastAnimation;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skill")
	TObjectPtr<USoundBase> CastSound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skill")
	TObjectPtr<UNiagaraSystem> CastVFX;
};
