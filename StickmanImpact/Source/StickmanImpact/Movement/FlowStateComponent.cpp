// Copyright StickmanImpact Project.

#include "FlowStateComponent.h"
#include "GameFramework/Character.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "NiagaraFunctionLibrary.h"
#include "NiagaraComponent.h"

UFlowStateComponent::UFlowStateComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
}

void UFlowStateComponent::NotifyTech(EMovementTech Tech)
{
	// A repeat of the last tech doesn't extend the chain (variety is the point).
	if (bHasLastTech && Tech == LastTech)
	{
		return;
	}
	bHasLastTech = true;
	LastTech = Tech;

	++ChainLength;
	StylePoints += ChainLength; // longer chains score more per link
	OnFlowChainChanged.Broadcast(ChainLength);

	if (!bFlowActive && ChainLength >= FlowStateThreshold)
	{
		SetFlowActive(true);
	}

	GroundedTime = 0.f; // any tech resets the grounded timer
}

void UFlowStateComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	const ACharacter* Character = Cast<ACharacter>(GetOwner());
	if (!Character)
	{
		return;
	}

	// Track distance covered while a chain is live.
	const FVector Position = Character->GetActorLocation();
	if (ChainLength > 0 && !LastPosition.IsZero())
	{
		CurrentFlowDistance += FVector::Dist2D(Position, LastPosition);
	}
	LastPosition = Position;

	// Grounded + not moving fast = the chain decays.
	const bool bGroundedIdle = !Character->GetCharacterMovement()->IsFalling()
		&& Character->GetVelocity().Size2D() < 200.f;
	if (bGroundedIdle && ChainLength > 0)
	{
		GroundedTime += DeltaTime;
		if (GroundedTime >= GroundResetTime)
		{
			BreakChain();
		}
	}
	else if (!bGroundedIdle)
	{
		GroundedTime = 0.f;
	}
}

void UFlowStateComponent::BreakChain()
{
	LongestFlowDistance = FMath::Max(LongestFlowDistance, CurrentFlowDistance);
	CurrentFlowDistance = 0.f;
	ChainLength = 0;
	bHasLastTech = false;
	OnFlowChainChanged.Broadcast(0);
	SetFlowActive(false);
}

void UFlowStateComponent::SetFlowActive(bool bActive)
{
	if (bActive == bFlowActive)
	{
		return;
	}
	bFlowActive = bActive;

	if (bActive && FlowTrailVFX)
	{
		if (const ACharacter* Character = Cast<ACharacter>(GetOwner()))
		{
			ActiveTrail = UNiagaraFunctionLibrary::SpawnSystemAttached(FlowTrailVFX, Character->GetMesh(),
				NAME_None, FVector::ZeroVector, FRotator::ZeroRotator, EAttachLocation::SnapToTarget, false);
		}
	}
	else if (!bActive && ActiveTrail)
	{
		ActiveTrail->DestroyComponent();
		ActiveTrail = nullptr;
	}

	OnFlowStateChanged.Broadcast(bActive);
}
