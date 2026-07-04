#include "Character/CharacterAnimInstance.h"
#include "Character/CharacterBase.h"
#include "Character/OpenWorldMovementComponent.h"
#include "Character/LockOnComponent.h"
#include "KismetAnimationLibrary.h"

void UCharacterAnimInstance::NativeInitializeAnimation()
{
	Super::NativeInitializeAnimation();
	OwnerCharacter = Cast<ACharacterBase>(TryGetPawnOwner());
	MoveComp = OwnerCharacter ? OwnerCharacter->GetOpenWorldMovement() : nullptr;
}

void UCharacterAnimInstance::NativeUpdateAnimation(float DeltaSeconds)
{
	Super::NativeUpdateAnimation(DeltaSeconds);

	if (!OwnerCharacter || !MoveComp)
	{
		return;
	}

	const FVector Velocity = OwnerCharacter->GetVelocity();

	Speed = Velocity.Size2D();
	Direction = UKismetAnimationLibrary::CalculateDirection(Velocity, OwnerCharacter->GetActorRotation());
	bIsAccelerating = MoveComp->GetCurrentAcceleration().SizeSquared() > 1.f;
	bIsSprinting = MoveComp->IsSprinting();

	const bool bWasInAir = bIsInAir;
	bIsInAir = MoveComp->IsFalling();
	VerticalVelocity = Velocity.Z;

	// Deteksi hard landing: baru mendarat + kecepatan jatuh frame sebelumnya tinggi.
	if (bWasInAir && !bIsInAir)
	{
		bHardLanding = PrevVerticalVelocity < HardLandingThreshold;
	}
	PrevVerticalVelocity = VerticalVelocity;

	bIsGliding = MoveComp->IsGliding();
	bIsSwimming = MoveComp->IsSwimming();
	bIsClimbing = MoveComp->IsClimbing();

	// Head tracking ke target lock-on
	if (const ULockOnComponent* LockOn = OwnerCharacter->GetLockOn())
	{
		bHasLookAtTarget = LockOn->IsLocked();
		if (bHasLookAtTarget)
		{
			LookAtTarget = LockOn->GetTarget()->GetActorLocation();
		}
	}
}
