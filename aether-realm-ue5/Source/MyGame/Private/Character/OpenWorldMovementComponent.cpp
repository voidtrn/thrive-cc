#include "Character/OpenWorldMovementComponent.h"
#include "GameFramework/Character.h"
#include "PhysicalMaterials/PhysicalMaterial.h"

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

	// Swimming (spec 4A): surface speed 200
	MaxSwimSpeed = 200.f;
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

		// Auto-fold saat dekat ground
		FHitResult GroundHit;
		FCollisionQueryParams Params;
		Params.AddIgnoredActor(GetOwner());
		const FVector Start = GetOwner()->GetActorLocation();
		if (GetWorld()->LineTraceSingleByChannel(GroundHit, Start,
			Start - FVector(0, 0, 150.f), ECC_Visibility, Params))
		{
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

// ---------- Climbing ----------

bool UOpenWorldMovementComponent::TraceClimbSurface(FHitResult& OutHit) const
{
	const AActor* Owner = GetOwner();
	FCollisionQueryParams Params;
	Params.AddIgnoredActor(Owner);
	Params.bReturnPhysicalMaterial = true;

	const FVector Start = Owner->GetActorLocation();
	const FVector End = Start + Owner->GetActorForwardVector() * ClimbTraceDistance;
	return GetWorld()->LineTraceSingleByChannel(OutHit, Start, End, ECC_Visibility, Params);
}

bool UOpenWorldMovementComponent::TryStartClimbing()
{
	if (IsClimbing() || IsSwimming())
	{
		return false;
	}

	FHitResult Hit;
	if (!TraceClimbSurface(Hit))
	{
		return false;
	}

	// Sudut permukaan vs horizontal: > MinClimbAngle = climbable wall
	const float SurfaceAngle = FMath::RadiansToDegrees(
		FMath::Acos(FVector::DotProduct(Hit.ImpactNormal, FVector::UpVector)));
	if (SurfaceAngle < MinClimbAngle)
	{
		return false;
	}

	ClimbSurfaceNormal = Hit.ImpactNormal;

	// Cost multiplier dari material dinding
	CurrentClimbCostMultiplier = 1.f;
	if (Hit.PhysMaterial.IsValid())
	{
		if (const float* Mult = ClimbCostMultiplierPerSurface.Find(Hit.PhysMaterial->SurfaceType))
		{
			CurrentClimbCostMultiplier = *Mult;
		}
	}

	StopGliding();
	SetMovementMode(MOVE_Custom, static_cast<uint8>(ECustomMovementMode::CMOVE_Climb));
	Velocity = FVector::ZeroVector;
	bOrientRotationToMovement = false;

	// Hadapkan karakter ke dinding
	GetOwner()->SetActorRotation((-ClimbSurfaceNormal).Rotation());
	return true;
}

void UOpenWorldMovementComponent::StopClimbing()
{
	if (!IsClimbing())
	{
		return;
	}
	SetMovementMode(MOVE_Falling);
	bOrientRotationToMovement = true;
}

void UOpenWorldMovementComponent::JumpClimb()
{
	if (!IsClimbing())
	{
		return;
	}
	Velocity = FVector(0, 0, JumpClimbBoost * 2.f); // impulse ke atas sepanjang dinding
}

void UOpenWorldMovementComponent::PhysCustom(float deltaTime, int32 Iterations)
{
	if (CustomMovementMode == static_cast<uint8>(ECustomMovementMode::CMOVE_Climb))
	{
		PhysClimb(deltaTime, Iterations);
		return;
	}
	Super::PhysCustom(deltaTime, Iterations);
}

void UOpenWorldMovementComponent::PhysClimb(float deltaTime, int32 Iterations)
{
	// Cek dinding masih ada
	FHitResult Hit;
	if (!TraceClimbSurface(Hit))
	{
		// Sampai puncak — dorong ke atas-depan lalu keluar climb
		Velocity = FVector::UpVector * 300.f + GetOwner()->GetActorForwardVector() * 200.f;
		StopClimbing();
		return;
	}
	ClimbSurfaceNormal = Hit.ImpactNormal;

	// Input: proyeksikan ke bidang dinding (kanan = sepanjang wall, atas = naik)
	const FVector Input = ConsumeInputVector();
	const FVector WallRight = FVector::CrossProduct(FVector::UpVector, ClimbSurfaceNormal).GetSafeNormal();
	const FVector WallUp = FVector::CrossProduct(ClimbSurfaceNormal, WallRight).GetSafeNormal();

	const float Speed = bWantsToSprint ? ClimbSpeed * 1.7f : ClimbSpeed;
	FVector Move = (WallRight * FVector::DotProduct(Input, WallRight)
		+ WallUp * FVector::DotProduct(Input, FVector::UpVector)) * Speed;

	// Nempel ke dinding
	Move += -ClimbSurfaceNormal * 50.f;

	Velocity = Move + (JumpClimbBoost > 0.f && Velocity.Z > Speed ? FVector(0, 0, Velocity.Z * 0.85f) : FVector::ZeroVector);

	const FVector Delta = Velocity * deltaTime;
	FHitResult MoveHit;
	SafeMoveUpdatedComponent(Delta, UpdatedComponent->GetComponentQuat(), true, MoveHit);
	if (MoveHit.IsValidBlockingHit())
	{
		SlideAlongSurface(Delta, 1.f - MoveHit.Time, MoveHit.Normal, MoveHit, true);
	}
}
