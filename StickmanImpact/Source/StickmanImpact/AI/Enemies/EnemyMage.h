// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "StickmanEnemyCharacter.h"
#include "EnemyMage.generated.h"

/**
 * Elemental caster that keeps range and relies on teleport-style skills (e.g. GA_ElectroSkill's
 * blink) instead of melee approach — WeightedAttacks should favor teleport/elemental abilities
 * over anything that requires closing distance.
 */
UCLASS()
class STICKMANIMPACT_API AEnemyMage : public AStickmanEnemyCharacter
{
	GENERATED_BODY()

public:
	AEnemyMage();
};
