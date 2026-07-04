#pragma once

#include "CoreMinimal.h"
#include "CombatTypes.generated.h"

/** Elemen — dasar reaction system (Phase 3). */
UENUM(BlueprintType)
enum class EElement : uint8
{
	None,
	Pyro,
	Hydro,
	Cryo,
	Electro,
	Anemo,
	Geo,
	Dendro
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

/** Tingkat reaksi kena hit — menentukan state Reaction di AnimBP. */
UENUM(BlueprintType)
enum class EHitReaction : uint8
{
	Light,
	Medium,
	Heavy,
	Stagger,
	Knockback,
	Launch,
	KnockedDown
};

/** Semua elemental reaction. */
UENUM(BlueprintType)
enum class EReactionType : uint8
{
	None,
	Vaporize,        // Pyro+Hydro (amp)
	Melt,            // Pyro+Cryo (amp)
	Freeze,          // Hydro+Cryo
	Shatter,         // hit blunt/Geo ke frozen
	Superconduct,    // Cryo+Electro
	Overload,        // Pyro+Electro
	ElectroCharged,  // Hydro+Electro (DOT)
	Swirl,           // Anemo+any
	Crystallize,     // Geo+any
	Burning,         // Dendro+Pyro (DOT)
	Bloom,           // Dendro+Hydro (core)
	Hyperbloom,      // core+Electro
	Burgeon,         // core+Pyro
	Quicken,         // Dendro+Electro (aura)
	Spread,          // Dendro saat Quicken
	Aggravate        // Electro saat Quicken
};

/** Bentuk trace hitbox per hit combo. */
UENUM(BlueprintType)
enum class EHitTraceShape : uint8
{
	Line,
	Sphere,
	Box
};

/** Parameter satu serangan — dikirim ke CombatComponent::DealDamage. */
USTRUCT(BlueprintType)
struct FAttackParams
{
	GENERATED_BODY()

	/** Persen ATK. 0.4 = 40%. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	float SkillMultiplier = 1.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	float FlatDamage = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	EElement Element = EElement::None;

	/** Gauge unit elemen (1U / 2U / 4U). */
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	float GaugeUnits = 1.f;

	/** ICD group — hit dengan tag sama share cooldown apply elemen. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FName ICDTag = TEXT("Default");

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	EHitReaction HitReaction = EHitReaction::Light;

	/** True untuk claymore/plunge — memicu Shatter di target frozen. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	bool bBluntHit = false;

	/** Energy particle yang di-generate saat hit. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	int32 EnergyParticles = 0;
};

/** Hasil kalkulasi damage. */
USTRUCT(BlueprintType)
struct FDamageResult
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly)
	float FinalDamage = 0.f;

	UPROPERTY(BlueprintReadOnly)
	bool bCrit = false;

	UPROPERTY(BlueprintReadOnly)
	EReactionType Reaction = EReactionType::None;

	UPROPERTY(BlueprintReadOnly)
	EElement Element = EElement::None;
};
