#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "LevelingTypes.generated.h"

/** Satu biaya material (item + jumlah). */
USTRUCT(BlueprintType)
struct FMaterialCost
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FName ItemId;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, meta = (ClampMin = 1))
	int32 Count = 1;
};

/**
 * Biaya ascension (karakter & senjata pakai tabel ini).
 * Row key konvensi: "<Id>_<Phase>" — mis. "Hero_Sword_0" (phase 0→1).
 */
USTRUCT(BlueprintType)
struct FAscensionCostRow : public FTableRowBase
{
	GENERATED_BODY()

	/** Phase yang sedang di-unlock (0 = ascension pertama 20→40). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, meta = (ClampMin = 0, ClampMax = 5))
	int32 Phase = 0;

	/** Level minimum sebelum boleh ascend (biasanya = cap phase sekarang). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int32 RequiredLevel = 20;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int32 MoraCost = 20000;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TArray<FMaterialCost> Materials;
};

/**
 * Biaya level-up satu talent.
 * Row key konvensi: "<CharacterId>_<Talent>_<TargetLevel>" —
 * mis. "Hero_Sword_ElementalSkill_2" (naik ke level 2).
 */
USTRUCT(BlueprintType)
struct FTalentCostRow : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly, meta = (ClampMin = 2, ClampMax = 10))
	int32 TargetLevel = 2;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int32 MoraCost = 5000;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TArray<FMaterialCost> Materials;
};
