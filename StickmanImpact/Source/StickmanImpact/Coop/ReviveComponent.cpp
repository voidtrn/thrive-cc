// Copyright StickmanImpact Project.

#include "ReviveComponent.h"
#include "Character/StickmanCharacter.h"
#include "Combat/StickmanAttributeSet.h"
#include "GameFramework/Character.h"
#include "GameFramework/CharacterMovementComponent.h"

UReviveComponent::UReviveComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
	PrimaryComponentTick.bStartWithTickEnabled = false;
}

void UReviveComponent::EnterDownedState()
{
	if (bDowned)
	{
		return;
	}

	bDowned = true;
	DownedElapsed = 0.f;
	ReviveHeld = 0.f;
	SetComponentTickEnabled(true);

	// Crawl, don't fight: movement slows hard; abilities/attack input gate on IsDowned()
	// at their entry points.
	if (const ACharacter* Character = Cast<ACharacter>(GetOwner()))
	{
		Character->GetCharacterMovement()->MaxWalkSpeed = 80.f;
	}

	OnDowned.Broadcast();
}

void UReviveComponent::StartRevive(AActor* Reviver)
{
	if (bDowned && Reviver && Reviver != GetOwner())
	{
		CurrentReviver = Reviver;
	}
}

void UReviveComponent::CancelRevive()
{
	CurrentReviver = nullptr;
	ReviveHeld = 0.f;
	OnReviveProgress.Broadcast(0.f);
}

void UReviveComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	if (!bDowned)
	{
		SetComponentTickEnabled(false);
		return;
	}

	DownedElapsed += DeltaTime;

	// Ally revive: hold within range.
	if (AActor* Reviver = CurrentReviver.Get())
	{
		if (FVector::Dist(Reviver->GetActorLocation(), GetOwner()->GetActorLocation()) > ReviveRange)
		{
			CancelRevive();
		}
		else
		{
			ReviveHeld += DeltaTime;
			OnReviveProgress.Broadcast(FMath::Clamp(ReviveHeld / ReviveHoldTime, 0.f, 1.f));
			if (ReviveHeld >= ReviveHoldTime)
			{
				CompleteRevive();
				return;
			}
		}
	}
	// Solo second wind: slower, only if enabled.
	else if (SoloSelfReviveTime > 0.f && DownedElapsed >= SoloSelfReviveTime)
	{
		CompleteRevive();
		return;
	}

	if (DownedElapsed >= BleedOutTime)
	{
		bDowned = false;
		SetComponentTickEnabled(false);
		OnBledOut.Broadcast();
	}
}

void UReviveComponent::CompleteRevive()
{
	bDowned = false;
	CurrentReviver = nullptr;
	SetComponentTickEnabled(false);

	if (const AStickmanCharacter* Stickman = Cast<AStickmanCharacter>(GetOwner()))
	{
		if (UStickmanAttributeSet* Attributes = Stickman->GetStickmanAttributeSet())
		{
			Attributes->SetHealth(Attributes->GetMaxHealth() * ReviveHealthFraction);
		}
		Stickman->GetCharacterMovement()->MaxWalkSpeed = Stickman->WalkSpeed;
	}

	OnRevived.Broadcast();
}
