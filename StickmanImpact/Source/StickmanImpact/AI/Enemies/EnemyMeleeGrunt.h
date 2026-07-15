// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "StickmanEnemyCharacter.h"
#include "EnemyMeleeGrunt.generated.h"

/** Rushes the player down and leans on its basic combo — short OptimalCombatDistance, no ranged options. */
UCLASS()
class STICKMANIMPACT_API AEnemyMeleeGrunt : public AStickmanEnemyCharacter
{
	GENERATED_BODY()

public:
	AEnemyMeleeGrunt();
};
