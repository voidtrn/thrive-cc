// Copyright StickmanImpact Project.

#include "StickmanWildlife.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Kismet/GameplayStatics.h"
#include "EngineUtils.h"

AStickmanWildlife::AStickmanWildlife()
{
	PrimaryActorTick.bCanEverTick = true;
	GetCharacterMovement()->MaxWalkSpeed = GrazeSpeed;
}

void AStickmanWildlife::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	UpdateFleeState(DeltaSeconds);
	if (!bIsFleeing)
	{
		TryPlayGraze(DeltaSeconds);
	}
}

void AStickmanWildlife::UpdateFleeState(float DeltaSeconds)
{
	const APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	if (!PlayerPawn)
	{
		return;
	}

	const float DistanceToPlayer = FVector::Dist(GetActorLocation(), PlayerPawn->GetActorLocation());
	const bool bShouldFlee = DistanceToPlayer <= FleeTriggerDistance;

	if (bShouldFlee && !bIsFleeing)
	{
		bIsFleeing = true;
		GetCharacterMovement()->MaxWalkSpeed = FleeSpeed;
		AlertHerd();
	}
	else if (!bShouldFlee && bIsFleeing && DistanceToPlayer > FleeTriggerDistance * 1.5f)
	{
		bIsFleeing = false;
		GetCharacterMovement()->MaxWalkSpeed = GrazeSpeed;
	}

	if (bIsFleeing)
	{
		const FVector AwayFromPlayer = (GetActorLocation() - PlayerPawn->GetActorLocation()).GetSafeNormal();
		AddMovementInput(AwayFromPlayer, 1.f);
	}
}

void AStickmanWildlife::TryPlayGraze(float DeltaSeconds)
{
	TimeSinceLastGraze += DeltaSeconds;
	if (TimeSinceLastGraze < GrazeIntervalSeconds || !GrazeMontage)
	{
		return;
	}
	TimeSinceLastGraze = 0.f;

	if (UAnimInstance* AnimInstance = GetMesh() ? GetMesh()->GetAnimInstance() : nullptr)
	{
		AnimInstance->Montage_Play(GrazeMontage);
	}
}

void AStickmanWildlife::AlertHerd()
{
	if (HerdTag.IsNone())
	{
		return;
	}

	for (TActorIterator<AStickmanWildlife> It(GetWorld()); It; ++It)
	{
		AStickmanWildlife* Other = *It;
		if (Other == this || Other->HerdTag != HerdTag || Other->bIsFleeing)
		{
			continue;
		}
		if (FVector::Dist(GetActorLocation(), Other->GetActorLocation()) <= HerdAlertRadius)
		{
			Other->bIsFleeing = true;
			Other->GetCharacterMovement()->MaxWalkSpeed = Other->FleeSpeed;
		}
	}
}

void AStickmanWildlife::OnDefeated()
{
	if (ResourceDropClass)
	{
		GetWorld()->SpawnActor<AActor>(ResourceDropClass, GetActorLocation(), GetActorRotation());
	}
	Destroy();
}
