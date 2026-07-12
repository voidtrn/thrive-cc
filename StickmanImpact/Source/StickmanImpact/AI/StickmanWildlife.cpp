// Copyright StickmanImpact Project.

#include "StickmanWildlife.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Enemies/StickmanEnemyCharacter.h"
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
	bool bShouldFlee = DistanceToPlayer <= FleeTriggerDistance;

	// Predator-prey: wildlife also flees nearby monsters, not just the player (throttled scan).
	if (!bShouldFlee)
	{
		PredatorCheckTimer += DeltaSeconds;
		if (PredatorCheckTimer >= 1.f)
		{
			PredatorCheckTimer = 0.f;
			for (TActorIterator<AStickmanEnemyCharacter> It(GetWorld()); It; ++It)
			{
				if (FVector::Dist(GetActorLocation(), It->GetActorLocation()) <= FleeTriggerDistance)
				{
					bShouldFlee = true;
					break;
				}
			}
		}
	}

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
