// Copyright StickmanImpact Project.

#include "AerialMovementComponent.h"
#include "Character/StickmanCharacter.h"
#include "Combat/StyleSubsystem.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "TimerManager.h"

UAerialMovementComponent::UAerialMovementComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
}

void UAerialMovementComponent::BeginPlay()
{
	Super::BeginPlay();
}

void UAerialMovementComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	const ACharacter* Character = Cast<ACharacter>(GetOwner());
	if (!Character)
	{
		return;
	}
	const bool bFalling = Character->GetCharacterMovement()->IsFalling();

	// Landed this frame — refill the air move budget.
	if (bWasFalling && !bFalling)
	{
		JumpsUsed = 0;
		AirDashesUsed = 0;
	}
	bWasFalling = bFalling;
}

int32 UAerialMovementComponent::MaxExtraJumps() const
{
	if (!bDoubleJumpUnlocked)
	{
		return 0;
	}
	int32 Extra = BaseExtraJumps;
	if (const UGameInstance* GI = GetOwner()->GetGameInstance())
	{
		if (const UStyleSubsystem* Style = GI->GetSubsystem<UStyleSubsystem>())
		{
			Extra += Style->GetExtraAirDashes() > 0 ? 1 : 0; // Trickster grants an extra jump too
		}
	}
	return Extra;
}

int32 UAerialMovementComponent::MaxAirDashes() const
{
	int32 Max = BaseAirDashes;
	if (const UGameInstance* GI = GetOwner()->GetGameInstance())
	{
		if (const UStyleSubsystem* Style = GI->GetSubsystem<UStyleSubsystem>())
		{
			Max += Style->GetExtraAirDashes();
		}
	}
	return Max;
}

bool UAerialMovementComponent::TryDoubleJump()
{
	ACharacter* Character = Cast<ACharacter>(GetOwner());
	if (!Character || !Character->GetCharacterMovement()->IsFalling() || JumpsUsed >= MaxExtraJumps())
	{
		return false;
	}

	++JumpsUsed;
	FVector Velocity = Character->GetCharacterMovement()->Velocity;
	Velocity.Z = DoubleJumpZVelocity;
	Character->GetCharacterMovement()->Velocity = Velocity;
	OnDoubleJump.Broadcast();
	return true;
}

bool UAerialMovementComponent::TryAirDash(const FVector& WorldDirection)
{
	AStickmanCharacter* Character = Cast<AStickmanCharacter>(GetOwner());
	if (!Character || !Character->GetCharacterMovement()->IsFalling() || AirDashesUsed >= MaxAirDashes())
	{
		return false;
	}
	if (Character->GetStaminaPercent() <= 0.f)
	{
		return false;
	}

	++AirDashesUsed;
	Character->DrainStamina(AirDashStamina);

	FVector Dir = WorldDirection.GetSafeNormal();
	if (Dir.IsNearlyZero())
	{
		Dir = Character->GetActorForwardVector();
	}
	Character->GetCharacterMovement()->Velocity = Dir * AirDashSpeed;
	OnAirDash.Broadcast();
	return true;
}

bool UAerialMovementComponent::TryHover()
{
	ACharacter* Character = Cast<ACharacter>(GetOwner());
	if (!Character || !Character->GetCharacterMovement()->IsFalling() || bHovering)
	{
		return false;
	}

	bHovering = true;
	UCharacterMovementComponent* Movement = Character->GetCharacterMovement();
	const float SavedGravity = Movement->GravityScale;
	Movement->GravityScale = 0.f;
	Movement->Velocity.Z = 0.f;

	FTimerDelegate Restore = FTimerDelegate::CreateWeakLambda(this, [this, Movement, SavedGravity]()
	{
		Movement->GravityScale = SavedGravity;
		bHovering = false;
	});
	GetWorld()->GetTimerManager().SetTimer(HoverTimerHandle, Restore, HoverDuration, false);
	return true;
}

void UAerialMovementComponent::EndHover()
{
	bHovering = false;
}

bool UAerialMovementComponent::TryDiveBomb()
{
	const AStickmanCharacter* Character = Cast<AStickmanCharacter>(GetOwner());
	if (!Character || !Character->GetCharacterMovement()->IsFalling())
	{
		return false;
	}

	// Slam straight down; the combat side (OnDiveBomb) plays the plunge ability + shockwave on
	// landing (reuses the existing plunge-attack routing).
	AStickmanCharacter* Mutable = const_cast<AStickmanCharacter*>(Character);
	Mutable->GetCharacterMovement()->Velocity = FVector(0.f, 0.f, -2500.f);
	OnDiveBomb.Broadcast();
	return true;
}
