#include "Character/OpenWorldMovementComponent.h"

UOpenWorldMovementComponent::UOpenWorldMovementComponent()
{
	MaxWalkSpeed = RunSpeed;
	MaxAcceleration = 1500.f;
	BrakingDecelerationWalking = 2000.f;
	AirControl = DefaultAirControl;
	JumpZVelocity = 620.f;
	GravityScale = 1.4f;
	bOrientRotationToMovement = true;
	RotationRate = FRotator(0.f, 540.f, 0.f);
}

void UOpenWorldMovementComponent::SetSprinting(bool bNewSprinting)
{
	if (bWantsToSprint == bNewSprinting)
	{
		return;
	}
	bWantsToSprint = bNewSprinting;
	RefreshMaxWalkSpeed();
}

void UOpenWorldMovementComponent::RefreshMaxWalkSpeed()
{
	MaxWalkSpeed = bWantsToSprint ? SprintSpeed : RunSpeed;
}

void UOpenWorldMovementComponent::StartGliding()
{
	if (bIsGliding || !IsFalling())
	{
		return;
	}
	bIsGliding = true;
	AirControl = GlideAirControl;

	// Potong momentum jatuh supaya transisi ke glide terasa "menangkap angin".
	FVector Vel = Velocity;
	Vel.Z = FMath::Max(Vel.Z, GlideVerticalSpeed);
	Velocity = Vel;
}

void UOpenWorldMovementComponent::StopGliding()
{
	if (!bIsGliding)
	{
		return;
	}
	bIsGliding = false;
	AirControl = DefaultAirControl;
}

void UOpenWorldMovementComponent::PhysFalling(float deltaTime, int32 Iterations)
{
	Super::PhysFalling(deltaTime, Iterations);

	if (bIsGliding)
	{
		if (!IsFalling())
		{
			// Mendarat — keluar dari glide otomatis.
			StopGliding();
			return;
		}

		FVector Vel = Velocity;
		// Kunci kecepatan turun konstan.
		Vel.Z = GlideVerticalSpeed;
		// Batasi kecepatan horizontal glide.
		const FVector Horizontal = FVector(Vel.X, Vel.Y, 0.f).GetClampedToMaxSize(GlideMaxHorizontalSpeed);
		Velocity = FVector(Horizontal.X, Horizontal.Y, Vel.Z);
	}
}
