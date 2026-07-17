// Copyright StickmanImpact Project.

#include "GrapplingHookComponent.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "GameFramework/Character.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/PlayerController.h"
#include "GameFramework/Pawn.h"
#include "NiagaraFunctionLibrary.h"
#include "Kismet/GameplayStatics.h"
#include "TimerManager.h"

UGrapplingHookComponent::UGrapplingHookComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
	PrimaryComponentTick.bStartWithTickEnabled = false;
}

void UGrapplingHookComponent::BeginPlay()
{
	Super::BeginPlay();
	Charges = MaxCharges;
	GetWorld()->GetTimerManager().SetTimer(RechargeTimerHandle, this, &UGrapplingHookComponent::Recharge,
		RechargeInterval, true);
}

void UGrapplingHookComponent::Recharge()
{
	if (Charges < MaxCharges)
	{
		++Charges;
	}
}

bool UGrapplingHookComponent::FireGrapple()
{
	if (!bUnlocked || Charges <= 0 || State != EGrappleState::Idle)
	{
		return false;
	}
	if (GetWorld()->GetTimeSeconds() - LastFireTime < FireCooldown)
	{
		return false;
	}

	const APawn* Pawn = Cast<APawn>(GetOwner());
	const APlayerController* PC = Pawn ? Cast<APlayerController>(Pawn->GetController()) : nullptr;
	if (!PC)
	{
		return false;
	}

	FVector ViewLocation;
	FRotator ViewRotation;
	PC->GetPlayerViewPoint(ViewLocation, ViewRotation);

	FHitResult Hit;
	FCollisionQueryParams Params;
	Params.AddIgnoredActor(GetOwner());
	if (!GetWorld()->LineTraceSingleByChannel(Hit, ViewLocation,
			ViewLocation + ViewRotation.Vector() * GrappleRange, ECC_Visibility, Params))
	{
		return false; // Nothing to grab.
	}

	AnchorPoint = Hit.ImpactPoint;
	GrabbedEnemy = nullptr;

	// Mode selection: enemy hit = Enemy; anchor above the player = Swing; else Pull.
	if (AStickmanEnemyCharacter* Enemy = Cast<AStickmanEnemyCharacter>(Hit.GetActor()))
	{
		Mode = EGrappleMode::Enemy;
		GrabbedEnemy = Enemy;
	}
	else if (AnchorPoint.Z > GetOwner()->GetActorLocation().Z + 150.f)
	{
		Mode = EGrappleMode::Swing;
		RopeLength = FVector::Dist(AnchorPoint, GetOwner()->GetActorLocation());
	}
	else
	{
		Mode = EGrappleMode::Pull;
	}

	--Charges;
	LastFireTime = GetWorld()->GetTimeSeconds();
	State = EGrappleState::Attached;
	SetComponentTickEnabled(true);

	if (WhooshVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAtLocation(this, WhooshVFX, AnchorPoint);
	}
	if (FireSound)
	{
		UGameplayStatics::PlaySoundAtLocation(this, FireSound, GetOwner()->GetActorLocation());
	}
	OnGrappleFired.Broadcast(AnchorPoint);
	return true;
}

void UGrapplingHookComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	switch (Mode)
	{
		case EGrappleMode::Pull:
		case EGrappleMode::Enemy:
			TickPull(DeltaTime);
			break;
		case EGrappleMode::Swing:
			TickSwing(DeltaTime);
			break;
	}
}

void UGrapplingHookComponent::TickPull(float DeltaTime)
{
	ACharacter* Character = Cast<ACharacter>(GetOwner());
	if (!Character)
	{
		ReleaseGrapple();
		return;
	}

	// Enemy grapple: small enemy comes to us, large enemy pulls us in.
	if (Mode == EGrappleMode::Enemy)
	{
		AStickmanEnemyCharacter* Enemy = Cast<AStickmanEnemyCharacter>(GrabbedEnemy.Get());
		if (!Enemy)
		{
			ReleaseGrapple();
			return;
		}
		const bool bLarge = Enemy->Stats.MaxHealth > 3000.f;
		if (bLarge)
		{
			const FVector Dir = (Enemy->GetActorLocation() - Character->GetActorLocation()).GetSafeNormal();
			Character->GetCharacterMovement()->Velocity = Dir * PullSpeed;
		}
		else
		{
			const FVector Dir = (Character->GetActorLocation() - Enemy->GetActorLocation()).GetSafeNormal();
			Enemy->LaunchCharacter(Dir * PullSpeed, true, true);
		}
		ReleaseGrapple();
		return;
	}

	const FVector ToAnchor = AnchorPoint - Character->GetActorLocation();
	if (ToAnchor.Size() < 150.f)
	{
		ReleaseGrapple();
		return;
	}
	Character->GetCharacterMovement()->Velocity = ToAnchor.GetSafeNormal() * PullSpeed;
}

void UGrapplingHookComponent::TickSwing(float DeltaTime)
{
	ACharacter* Character = Cast<ACharacter>(GetOwner());
	UCharacterMovementComponent* Movement = Character ? Character->GetCharacterMovement() : nullptr;
	if (!Movement)
	{
		ReleaseGrapple();
		return;
	}

	// Analytic pendulum: if the player is at/over rope length, remove the outward radial
	// velocity component (rope is taut) so motion stays tangential — an arc, not a fall.
	const FVector ToAnchor = AnchorPoint - Character->GetActorLocation();
	const float Distance = ToAnchor.Size();
	if (Distance >= RopeLength)
	{
		const FVector RadialDir = ToAnchor.GetSafeNormal();
		const float OutwardSpeed = FVector::DotProduct(Movement->Velocity, -RadialDir);
		if (OutwardSpeed > 0.f)
		{
			Movement->Velocity += RadialDir * OutwardSpeed; // cancel the outward component
		}
		// Gentle reel toward the anchor for control.
		Movement->Velocity += RadialDir * 200.f * DeltaTime * 60.f * DeltaTime;
	}
}

void UGrapplingHookComponent::ReleaseGrapple()
{
	if (State == EGrappleState::Idle)
	{
		return;
	}
	State = EGrappleState::Idle;
	SetComponentTickEnabled(false);

	// Preserve (and slightly boost) momentum on release — the chain-move payoff.
	if (ACharacter* Character = Cast<ACharacter>(GetOwner()))
	{
		Character->GetCharacterMovement()->Velocity *= ReleaseBoost;
	}
	GrabbedEnemy = nullptr;
	OnGrappleReleased.Broadcast();
}
