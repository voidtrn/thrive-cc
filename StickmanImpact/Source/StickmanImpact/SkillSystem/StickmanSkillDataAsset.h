// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "StickmanSkillTypes.h"
#include "StickmanSkillDataAsset.generated.h"

/**
 * Per-character skill kit. Create one instance per playable stickman (e.g.
 * DA_Skills_Hero01) and assign it on the character so designers can author full move sets
 * without touching C++.
 */
UCLASS(BlueprintType)
class STICKMANIMPACT_API UStickmanSkillDataAsset : public UPrimaryDataAsset
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skills")
	FNormalAttackChain NormalAttackCombo;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skills")
	FSkillData ElementalSkill;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skills")
	FSkillData ElementalBurst;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skills")
	TArray<FSkillData> PassiveSkills;
};
