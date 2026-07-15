// Copyright StickmanImpact Project.

#include "EnemyMage.h"
#include "GameFramework/CharacterMovementComponent.h"

AEnemyMage::AEnemyMage()
{
	Stats.MaxHealth = 220.f;
	Stats.Attack = 18.f;
	Stats.ElementalMastery = 60.f;

	OptimalCombatDistance = 700.f;
	RetreatHealthPercent = 0.4f;
	DodgeChance = 0.2f;
	GetCharacterMovement()->MaxWalkSpeed = 350.f;
}
