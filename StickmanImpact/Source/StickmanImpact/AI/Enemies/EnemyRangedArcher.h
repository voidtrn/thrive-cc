// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "StickmanEnemyCharacter.h"
#include "EnemyRangedArcher.generated.h"

/** Keeps its distance and leans on a charged ranged shot — large OptimalCombatDistance. */
UCLASS()
class STICKMANIMPACT_API AEnemyRangedArcher : public AStickmanEnemyCharacter
{
	GENERATED_BODY()

public:
	AEnemyRangedArcher();

	// How long the archer holds its charged-shot ability before releasing — read by the
	// charged-shot UGameplayAbility itself, not by the BT.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combat")
	float ChargeTime = 1.2f;
};
