#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "Combat/CombatTypes.h"
#include "UI/InventoryTypes.h"
#include "WeaponTypes.generated.h"

class UTexture2D;
class UStaticMesh;

/**
 * Definisi senjata (DT_Weapons row). Stat dasar + substat sekunder +
 * pasif (refinement). Base ATK naik per level; substat naik per ascension.
 */
USTRUCT(BlueprintType)
struct FWeaponDefRow : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	EWeaponType WeaponType = EWeaponType::Sword;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, meta = (ClampMin = 1, ClampMax = 5))
	int32 Rarity = 3;

	/** Base ATK di level 1. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	float BaseATKLevel1 = 40.f;

	/** Kenaikan Base ATK per level (linear approx). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	float ATKPerLevel = 7.f;

	/** Substat sekunder (mis. CritRate, EnergyRecharge). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	EArtifactStat SubStat = EArtifactStat::CritRate;

	/** Nilai substat di level 1 (persen dalam 0-1 untuk stat %). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	float SubStatBase = 0.06f;

	/** Kenaikan substat per level. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	float SubStatPerLevel = 0.003f;

	/** ID pasif senjata (dibaca gameplay untuk efek refinement). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FName PassiveId;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TSoftObjectPtr<UStaticMesh> WeaponMesh;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TSoftObjectPtr<UTexture2D> Icon;
};

/** Level talent (Normal/Skill/Burst). Dibaca AbilityBase untuk skala damage. */
USTRUCT(BlueprintType)
struct FTalentLevels
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, meta = (ClampMin = 1, ClampMax = 10))
	int32 NormalAttack = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, meta = (ClampMin = 1, ClampMax = 10))
	int32 ElementalSkill = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, meta = (ClampMin = 1, ClampMax = 10))
	int32 ElementalBurst = 1;
};

/** Senjata yang dimiliki pemain (instance — punya level/ascension/refine). */
USTRUCT(BlueprintType)
struct FWeaponInstance
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FGuid InstanceId;

	/** Row name di DT_Weapons. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FName WeaponId;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, meta = (ClampMin = 1, ClampMax = 90))
	int32 Level = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, meta = (ClampMin = 0, ClampMax = 6))
	int32 Ascension = 0;

	/** Refinement rank 1-5 (dari duplikat senjata). */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, meta = (ClampMin = 1, ClampMax = 5))
	int32 Refinement = 1;

	/** Karakter pemakai. NAME_None = di inventory. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FName EquippedCharacter;
};
