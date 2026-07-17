// Copyright StickmanImpact Project.

#include "MountBase.h"
#include "MountManagerSubsystem.h"
#include "Character/StickmanCharacter.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/Controller.h"
#include "Components/CapsuleComponent.h"
#include "NiagaraFunctionLibrary.h"

AMountBase::AMountBase()
{
	PrimaryActorTick.bCanEverTick = false;
	AutoPossessAI = EAutoPossessAI::Disabled;
}

void AMountBase::BeginPlay()
{
	Super::BeginPlay();
	MountHealth = Stats.MaxHealth;
	ApplyTypeMovement();
}

void AMountBase::ApplyTypeMovement()
{
	UCharacterMovementComponent* Movement = GetCharacterMovement();
	if (!Movement)
	{
		return;
	}
	Movement->MaxWalkSpeed = Stats.MaxSpeed;
	Movement->MaxAcceleration = Stats.Acceleration;
	Movement->JumpZVelocity = Stats.JumpZVelocity;
	Movement->RotationRate = FRotator(0.f, 360.f * Stats.Handling, 0.f);

	switch (MountType)
	{
		case EMountType::Flying:
			Movement->SetMovementMode(MOVE_Flying);
			Movement->MaxFlySpeed = Stats.MaxSpeed;
			break;
		case EMountType::Aquatic:
			Movement->SetMovementMode(MOVE_Swimming);
			Movement->MaxSwimSpeed = Stats.MaxSpeed;
			break;
		default:
			break; // Ground/Climbing use walking (climbing toggles in tagged zones, BP-driven).
	}
}

// ---------------------------------------------------------------- riding --------------

void AMountBase::Mount(AStickmanCharacter* InRider)
{
	if (!InRider || Rider || bDowned)
	{
		return;
	}

	Rider = InRider;
	RiderController = InRider->GetController();

	// Seat the rider and hand movement control to the mount.
	InRider->AttachToComponent(GetMesh(), FAttachmentTransformRules::SnapToTargetNotIncludingScale, SeatSocket);
	InRider->GetCharacterMovement()->DisableMovement();
	InRider->SetActorEnableCollision(false);

	if (RiderController)
	{
		RiderController->Possess(this);
	}
	OnMountRidingChanged.Broadcast(true);
}

void AMountBase::Dismount()
{
	if (!Rider)
	{
		return;
	}

	AStickmanCharacter* OldRider = Rider;
	AController* Controller = RiderController;
	Rider = nullptr;
	RiderController = nullptr;

	OldRider->DetachFromActor(FDetachmentTransformRules::KeepWorldTransform);
	OldRider->SetActorEnableCollision(true);
	OldRider->GetCharacterMovement()->SetMovementMode(MOVE_Walking);
	OldRider->SetActorLocation(GetActorLocation() + GetActorForwardVector() * 150.f + FVector(0, 0, 50.f));

	if (Controller)
	{
		Controller->Possess(OldRider);
	}

	// Mount call cooldown starts on dismount.
	if (const UGameInstance* GI = GetGameInstance())
	{
		if (UMountManagerSubsystem* Mounts = GI->GetSubsystem<UMountManagerSubsystem>())
		{
			Mounts->NotifyDismounted(MountID);
		}
	}
	OnMountRidingChanged.Broadcast(false);
}

void AMountBase::DismountAttack()
{
	AStickmanCharacter* OldRider = Rider;
	Dismount();
	if (OldRider)
	{
		OldRider->LaunchCharacter(FVector(0.f, 0.f, 900.f) + GetActorForwardVector() * 300.f, true, true);
		// The airborne rider's next attack routes to the plunge/dive-bomb path (already wired).
	}
}

// ---------------------------------------------------------------- combat --------------

void AMountBase::MountCharge()
{
	if (!Rider || bDowned)
	{
		return;
	}
	bCharging = true;
	GetCharacterMovement()->Velocity = GetActorForwardVector() * (Stats.MaxSpeed * 1.6f);
}

void AMountBase::NotifyHit(UPrimitiveComponent* MyComp, AActor* Other, UPrimitiveComponent* OtherComp,
	bool bSelfMoved, FVector HitLocation, FVector HitNormal, FVector NormalImpulse, const FHitResult& Hit)
{
	Super::NotifyHit(MyComp, Other, OtherComp, bSelfMoved, HitLocation, HitNormal, NormalImpulse, Hit);

	if (bCharging)
	{
		bCharging = false;
		if (AStickmanEnemyCharacter* Enemy = Cast<AStickmanEnemyCharacter>(Other))
		{
			const float ImpactDamage = GetVelocity().Size() * 0.1f;
			Enemy->ReceiveHitFeedback(GetActorForwardVector(), ImpactDamage, false);
		}
	}
}

void AMountBase::UseMountAbility()
{
	if (!Rider || bDowned)
	{
		return;
	}
	if (AbilityVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAtLocation(this, AbilityVFX, GetActorLocation());
	}
	OnMountAbility(MountType); // BP realizes stomp/dive/tail-whip; C++ owns the hook.
}

void AMountBase::TakeMountDamage(float Amount)
{
	if (bDowned)
	{
		return;
	}
	MountHealth = FMath::Max(MountHealth - Amount, 0.f);
	if (MountHealth <= 0.f)
	{
		bDowned = true;
		Dismount();
		OnMountDowned.Broadcast();
	}
}
