// Copyright StickmanImpact Project.

#include "GA_AirAttack.h"
#include "GameFramework/Character.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "TimerManager.h"

UGA_AirAttack::UGA_AirAttack()
{
	SkillData.SkillType = EStickmanSkillType::NormalAttack;
	SkillData.SkillName = TEXT("Air Attack");
	SkillData.Cooldown = 0.f;
	SkillData.EnergyCost = 0.f;
}

void UGA_AirAttack::OnAbilityActivated()
{
	ACharacter* Avatar = Cast<ACharacter>(GetAvatarActorFromActorInfo());
	if (!Avatar || Avatar->GetCharacterMovement()->IsMovingOnGround())
	{
		K2_EndAbility();
		return;
	}

	AirHitIndex = 0;
	DoAirHit();
	GetWorld()->GetTimerManager().SetTimer(AirHitTimerHandle, this, &UGA_AirAttack::DoAirHit, HitInterval, true);
}

void UGA_AirAttack::DoAirHit()
{
	ACharacter* Avatar = Cast<ACharacter>(GetAvatarActorFromActorInfo());
	const int32 MaxHits = FMath::Max(AirMontages.Num(), AirDamageMultipliers.Num());
	if (!Avatar || AirHitIndex >= FMath::Max(MaxHits, 3) || Avatar->GetCharacterMovement()->IsMovingOnGround())
	{
		K2_EndAbility();
		return;
	}

	// Float: reset fall so the string completes airborne.
	Avatar->GetCharacterMovement()->Velocity =
		FVector(Avatar->GetVelocity().X * 0.3f, Avatar->GetVelocity().Y * 0.3f, FloatVelocity);

	if (AirMontages.IsValidIndex(AirHitIndex) && Avatar->GetMesh() && Avatar->GetMesh()->GetAnimInstance())
	{
		Avatar->GetMesh()->GetAnimInstance()->Montage_Play(AirMontages[AirHitIndex]);
	}

	const float Multiplier = AirDamageMultipliers.IsValidIndex(AirHitIndex) ? AirDamageMultipliers[AirHitIndex] : 1.f;
	TArray<AActor*> HitActors;
	ApplyRadialElementalDamage(Avatar->GetActorLocation() + Avatar->GetActorForwardVector() * (HitCheckRadius * 0.5f),
		Avatar->GetActorForwardVector(), HitCheckRadius, 100.f, Multiplier, nullptr, HitActors);

	++AirHitIndex;
}

void UGA_AirAttack::OnAbilityEnded(bool bWasCancelled)
{
	AirHitIndex = 0;
	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().ClearTimer(AirHitTimerHandle);
	}
}
