// Copyright StickmanImpact Project.

#include "GA_PlungeAttack.h"
#include "GameFramework/Character.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "TimerManager.h"

UGA_PlungeAttack::UGA_PlungeAttack()
{
	SkillData.SkillType = EStickmanSkillType::NormalAttack;
	SkillData.SkillName = TEXT("Plunge Attack");
	SkillData.Cooldown = 0.f;
	SkillData.EnergyCost = 0.f;
	DamageMultiplier = 1.6f;
}

void UGA_PlungeAttack::OnAbilityActivated()
{
	ACharacter* Avatar = Cast<ACharacter>(GetAvatarActorFromActorInfo());
	if (!Avatar || Avatar->GetCharacterMovement()->IsMovingOnGround())
	{
		K2_EndAbility();
		return;
	}

	PlayCastAudioVisuals();
	if (MontageToPlay && Avatar->GetMesh() && Avatar->GetMesh()->GetAnimInstance())
	{
		Avatar->GetMesh()->GetAnimInstance()->Montage_Play(MontageToPlay);
	}

	// Straight-down slam, killing horizontal drift so it lands where aimed.
	Avatar->GetCharacterMovement()->Velocity = FVector(0.f, 0.f, -SlamVelocity);

	GetWorld()->GetTimerManager().SetTimer(LandCheckTimerHandle, this, &UGA_PlungeAttack::CheckLanded, 0.03f, true);
}

void UGA_PlungeAttack::CheckLanded()
{
	ACharacter* Avatar = Cast<ACharacter>(GetAvatarActorFromActorInfo());
	if (!Avatar)
	{
		K2_EndAbility();
		return;
	}
	if (!Avatar->GetCharacterMovement()->IsMovingOnGround())
	{
		return; // Still falling.
	}

	// Impact: radial damage scaled slightly by how fast the slam was going.
	const float ImpactSpeedBonus = SpeedDamageBonus * (SlamVelocity / 1000.f);
	TArray<AActor*> HitActors;
	ApplyRadialElementalDamage(Avatar->GetActorLocation(), Avatar->GetActorForwardVector(), ImpactRadius, 180.f,
		DamageMultiplier + ImpactSpeedBonus, ImpactStatusEffectClass, HitActors);

	if (HitActors.Num() > 0)
	{
		PlayImpactCameraShake(ImpactCameraShakeClass);
	}
	K2_EndAbility();
}

void UGA_PlungeAttack::OnAbilityEnded(bool bWasCancelled)
{
	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().ClearTimer(LandCheckTimerHandle);
	}
}
