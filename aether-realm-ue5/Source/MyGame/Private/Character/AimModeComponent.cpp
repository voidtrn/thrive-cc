#include "Character/AimModeComponent.h"
#include "Character/CharacterBase.h"
#include "Character/OpenWorldMovementComponent.h"
#include "Combat/AimedProjectile.h"
#include "Camera/CameraComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "Net/UnrealNetwork.h"
#include "MyGame.h"

UAimModeComponent::UAimModeComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
	SetIsReplicatedByDefault(true);
}

void UAimModeComponent::BeginPlay()
{
	Super::BeginPlay();
	OwnerChar = Cast<ACharacterBase>(GetOwner());
}

void UAimModeComponent::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);
	DOREPLIFETIME(UAimModeComponent, bAiming);
}

bool UAimModeComponent::EnterAimMode()
{
	if (bAiming || !OwnerChar || !OwnerChar->IsAlive())
	{
		return false;
	}

	// Aim tidak kompatibel dengan traversal custom
	if (const UOpenWorldMovementComponent* Move = OwnerChar->GetOpenWorldMovement())
	{
		if (Move->IsClimbing() || Move->IsGliding() || Move->IsSwimming())
		{
			return false;
		}
	}

	ApplyAimState(true);
	return true;
}

void UAimModeComponent::ExitAimMode()
{
	if (bAiming)
	{
		ApplyAimState(false);
	}
}

void UAimModeComponent::ApplyAimState(bool bNewAiming)
{
	bAiming = bNewAiming;
	OnAimModeChanged.Broadcast(bAiming);

	// FOV lerp lewat sistem kamera existing
	OwnerChar->SetAimMode(bAiming);

	// Simulated proxy cukup pose anim (via bAiming replicated); manipulasi
	// kamera & movement hanya relevan untuk pemain yang mengontrol + server.
	UOpenWorldMovementComponent* Move = OwnerChar->GetOpenWorldMovement();
	USpringArmComponent* Boom = OwnerChar->GetCameraBoom();
	if (!Move || !Boom)
	{
		return;
	}

	if (bAiming)
	{
		SavedArmLength = Boom->TargetArmLength;
		SavedSocketOffset = Boom->SocketOffset;
		SavedMaxWalkSpeed = Move->MaxWalkSpeed;
		bSavedOrientRotation = Move->bOrientRotationToMovement;
		bSavedControllerYaw = OwnerChar->bUseControllerRotationYaw;

		OwnerChar->SetCameraZoomTarget(AimArmLength);
		Move->SetSprinting(false); // sprint mengubah MaxWalkSpeed — matikan dulu
		Move->MaxWalkSpeed = AimWalkSpeed;
		Move->bOrientRotationToMovement = false;   // strafe
		OwnerChar->bUseControllerRotationYaw = true;
	}
	else
	{
		OwnerChar->SetCameraZoomTarget(SavedArmLength);
		Move->MaxWalkSpeed = SavedMaxWalkSpeed;
		Move->bOrientRotationToMovement = bSavedOrientRotation;
		OwnerChar->bUseControllerRotationYaw = bSavedControllerYaw;
	}
}

void UAimModeComponent::OnRep_Aiming()
{
	// Client remote: cukup broadcast buat anim/UI — jangan sentuh kamera.
	OnAimModeChanged.Broadcast(bAiming);
	if (OwnerChar)
	{
		OwnerChar->SetAimMode(bAiming);
	}
}

void UAimModeComponent::ToggleShoulder()
{
	bRightShoulder = !bRightShoulder;
}

void UAimModeComponent::TickComponent(float DeltaTime, ELevelTick TickType,
	FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	USpringArmComponent* Boom = OwnerChar ? OwnerChar->GetCameraBoom() : nullptr;
	if (!Boom)
	{
		return;
	}

	// Arm length di-lerp TickCamera (via zoom target); socket offset di sini.
	FVector Desired = SavedSocketOffset;
	if (bAiming)
	{
		Desired = AimSocketOffset;
		Desired.Y = bRightShoulder ? AimSocketOffset.Y : -AimSocketOffset.Y;
	}
	Boom->SocketOffset = FMath::VInterpTo(Boom->SocketOffset, Desired, DeltaTime, CameraInterpSpeed);
}

bool UAimModeComponent::GetAimPoint(FVector& OutPoint) const
{
	const UCameraComponent* Camera = OwnerChar ? OwnerChar->GetFollowCamera() : nullptr;
	if (!Camera)
	{
		OutPoint = FVector::ZeroVector;
		return false;
	}

	const FVector Start = Camera->GetComponentLocation();
	const FVector End = Start + Camera->GetForwardVector() * AimTraceDistance;

	FCollisionQueryParams Params;
	Params.AddIgnoredActor(OwnerChar);

	FHitResult Hit;
	if (GetWorld()->LineTraceSingleByChannel(Hit, Start, End, ECC_Visibility, Params))
	{
		OutPoint = Hit.ImpactPoint;
		return true;
	}
	OutPoint = End;
	return false;
}

FVector UAimModeComponent::ComputeSpreadDirection(
	const FVector& BaseDir, float HalfAngleDeg, float Rand01A, float Rand01B)
{
	const FVector Dir = BaseDir.GetSafeNormal();
	if (HalfAngleDeg <= 0.f || Dir.IsNearlyZero())
	{
		return Dir;
	}

	// Sudut acak dalam cone: sqrt untuk distribusi merata per luas
	const float ConeAngle = FMath::DegreesToRadians(HalfAngleDeg) *
		FMath::Sqrt(FMath::Clamp(Rand01A, 0.f, 1.f));
	const float Azimuth = 2.f * PI * FMath::Clamp(Rand01B, 0.f, 1.f);

	return Dir.RotateAngleAxisRad(ConeAngle, Dir.ToOrientationQuat().GetRightVector())
		.RotateAngleAxisRad(Azimuth, Dir);
}

bool UAimModeComponent::FireShot(TSubclassOf<AAimedProjectile> ProjectileClass,
	const FAttackParams& Params, float SpreadHalfAngleDeg)
{
	if (!bAiming || !ProjectileClass || !OwnerChar || !OwnerChar->IsAlive())
	{
		return false;
	}

	FVector AimPoint;
	GetAimPoint(AimPoint);

	const FVector Origin = OwnerChar->GetMesh() && OwnerChar->GetMesh()->DoesSocketExist(MuzzleSocket)
		? OwnerChar->GetMesh()->GetSocketLocation(MuzzleSocket)
		: OwnerChar->GetActorLocation() + FVector(0, 0, 50.f);

	FVector Direction = (AimPoint - Origin).GetSafeNormal();
	Direction = ComputeSpreadDirection(Direction, SpreadHalfAngleDeg, FMath::FRand(), FMath::FRand());

	ServerFireShot(ProjectileClass, Origin, Direction, Params);
	return true;
}

void UAimModeComponent::ServerFireShot_Implementation(
	TSubclassOf<AAimedProjectile> ProjectileClass,
	FVector_NetQuantize Origin, FVector_NetQuantizeNormal Direction, FAttackParams Params)
{
	if (!ProjectileClass || !OwnerChar)
	{
		return;
	}

	// Validasi ringan: origin harus dekat karakter (anti teleport-shot)
	if (FVector::DistSquared(Origin, OwnerChar->GetActorLocation()) > FMath::Square(300.f))
	{
		return;
	}

	FActorSpawnParameters SpawnParams;
	SpawnParams.Owner = OwnerChar;
	SpawnParams.Instigator = OwnerChar;
	SpawnParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

	AAimedProjectile* Projectile = GetWorld()->SpawnActor<AAimedProjectile>(
		ProjectileClass, Origin, Direction.Rotation(), SpawnParams);
	if (Projectile)
	{
		Projectile->InitShot(OwnerChar, Params);
	}
}
