// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameplayTagContainer.h"
#include "StickmanAITypes.generated.h"

UENUM(BlueprintType)
enum class EEnemyCombatState : uint8
{
	Patrol,
	Alert,
	Combat,
	Retreat
};

/** One entry in an enemy's weighted random attack table (see AStickmanEnemyCharacter::WeightedAttacks). */
USTRUCT(BlueprintType)
struct FStickmanWeightedAttack
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
	FGameplayTag SkillTag;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
	float Weight = 1.f;
};

/** Blackboard key names shared by BT_StickmanEnemy's custom C++ tasks/decorators/services and AStickmanAIController. */
namespace StickmanBlackboardKeys
{
	static const FName TargetActor(TEXT("TargetActor"));
	static const FName TargetLocation(TEXT("TargetLocation"));
	static const FName CurrentState(TEXT("CurrentState"));
	static const FName AlertLevel(TEXT("AlertLevel"));
}
