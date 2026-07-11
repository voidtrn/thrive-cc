// Copyright StickmanImpact Project.

#include "EnemyShieldGuard.h"
#include "GameFramework/CharacterMovementComponent.h"

AEnemyShieldGuard::AEnemyShieldGuard()
{
	Stats.MaxHealth = 600.f;
	Stats.Attack = 12.f;
	Stats.Defense = 20.f;

	OptimalCombatDistance = 120.f;
	RetreatHealthPercent = 0.05f; // Guards hold the line; they don't really retreat.
	DodgeChance = 0.05f;
	GetCharacterMovement()->MaxWalkSpeed = 250.f; // Slow but tanky.
}

float AEnemyShieldGuard::GetIncomingDamageMultiplier(const FVector& AttackerLocation) const
{
	if (!bHasFrontalBlock)
	{
		return 1.f;
	}

	const FVector ToAttacker = (AttackerLocation - GetActorLocation()).GetSafeNormal();
	const float CosHalfAngle = FMath::Cos(FMath::DegreesToRadians(BlockArcHalfAngleDegrees));
	const bool bAttackerInFront = FVector::DotProduct(GetActorForwardVector(), ToAttacker) >= CosHalfAngle;

	return bAttackerInFront ? BlockDamageMultiplier : 1.f;
}
