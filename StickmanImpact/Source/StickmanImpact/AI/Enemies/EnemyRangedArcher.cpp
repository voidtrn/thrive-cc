// Copyright StickmanImpact Project.

#include "EnemyRangedArcher.h"
#include "GameFramework/CharacterMovementComponent.h"

AEnemyRangedArcher::AEnemyRangedArcher()
{
	Stats.MaxHealth = 200.f;
	Stats.Attack = 20.f;
	Stats.Defense = 3.f;

	OptimalCombatDistance = 800.f;
	RetreatHealthPercent = 0.35f;
	DodgeChance = 0.3f;
	GetCharacterMovement()->MaxWalkSpeed = 380.f;
}
