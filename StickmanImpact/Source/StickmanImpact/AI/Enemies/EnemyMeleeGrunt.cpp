// Copyright StickmanImpact Project.

#include "EnemyMeleeGrunt.h"
#include "GameFramework/CharacterMovementComponent.h"

AEnemyMeleeGrunt::AEnemyMeleeGrunt()
{
	Stats.MaxHealth = 300.f;
	Stats.Attack = 15.f;
	Stats.Defense = 5.f;

	OptimalCombatDistance = 150.f;
	RetreatHealthPercent = 0.1f; // Grunts barely retreat — they're meant to be aggressive.
	DodgeChance = 0.1f;
	GetCharacterMovement()->MaxWalkSpeed = 450.f; // Slightly faster than the player's base walk.
}
