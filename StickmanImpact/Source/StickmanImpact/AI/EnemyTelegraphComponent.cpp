// Copyright StickmanImpact Project.

#include "EnemyTelegraphComponent.h"
#include "Audio/StickmanAudioManager.h"
#include "Character/StickmanCharacter.h"
#include "Character/StickmanGameplayTags.h"
#include "VFX/GameFeelComponent.h"
#include "GameFramework/Character.h"
#include "Components/SkeletalMeshComponent.h"
#include "Kismet/GameplayStatics.h"

UEnemyTelegraphComponent::UEnemyTelegraphComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
}

void UEnemyTelegraphComponent::BeginTelegraph(float TellDuration, FOnTelegraphFinished OnFinished)
{
	bTelegraphing = true;
	bIsFeint = FMath::FRand() < FeintChance;
	TelegraphRemaining = TellDuration;
	TelegraphTotal = TellDuration;
	bPerfectDodgeConsumed = false;
	FinishedDelegate = OnFinished;

	OnTelegraphStarted.Broadcast(TellDuration);

	if (TellSound)
	{
		if (UStickmanAudioManager* Audio = GetWorld()->GetGameInstance()
				? GetWorld()->GetGameInstance()->GetSubsystem<UStickmanAudioManager>() : nullptr)
		{
			Audio->PlaySFX(TellSound, GetOwner()->GetActorLocation());
		}
	}
	if (GroundIndicatorDecal)
	{
		UGameplayStatics::SpawnDecalAtLocation(GetWorld(), GroundIndicatorDecal,
			FVector(GroundIndicatorRadius, GroundIndicatorRadius, 100.f),
			GetOwner()->GetActorLocation() - FVector(0.f, 0.f, 80.f), FRotator(-90.f, 0.f, 0.f), TellDuration);
	}
}

void UEnemyTelegraphComponent::SetMeshFlash(float Intensity)
{
	const ACharacter* OwnerCharacter = Cast<ACharacter>(GetOwner());
	USkeletalMeshComponent* Mesh = OwnerCharacter ? OwnerCharacter->GetMesh() : nullptr;
	if (!Mesh)
	{
		return;
	}
	// Author enemy materials with a "TellFlash" scalar (emissive lerp to white).
	for (int32 Index = 0; Index < Mesh->GetNumMaterials(); ++Index)
	{
		if (UMaterialInstanceDynamic* MID = Mesh->CreateDynamicMaterialInstance(Index))
		{
			MID->SetScalarParameterValue(TEXT("TellFlash"), Intensity);
		}
	}
}

void UEnemyTelegraphComponent::TickComponent(float DeltaTime, ELevelTick TickType,
	FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	if (!bTelegraphing)
	{
		return;
	}

	TelegraphRemaining -= DeltaTime;

	// Flash ramps up as the attack nears (consistent, learnable curve).
	SetMeshFlash(1.f - FMath::Clamp(TelegraphRemaining / FMath::Max(TelegraphTotal, 0.01f), 0.f, 1.f));

	// Perfect dodge: player dashing inside the final window.
	if (!bPerfectDodgeConsumed && TelegraphRemaining <= PerfectDodgeWindow)
	{
		if (AStickmanCharacter* Player = Cast<AStickmanCharacter>(UGameplayStatics::GetPlayerPawn(this, 0)))
		{
			const float DistanceToPlayer = FVector::Dist(Player->GetActorLocation(), GetOwner()->GetActorLocation());
			if (DistanceToPlayer < GroundIndicatorRadius * 2.f
				&& Player->GetCurrentMovementTag() == StickmanGameplayTags::State_Movement_Dashing)
			{
				bPerfectDodgeConsumed = true;
				if (UGameFeelComponent* GameFeel = Player->FindComponentByClass<UGameFeelComponent>())
				{
					GameFeel->NotifyPerfectDodge();
				}
			}
		}
	}

	if (TelegraphRemaining <= 0.f)
	{
		FinishTelegraph();
	}
}

void UEnemyTelegraphComponent::FinishTelegraph()
{
	bTelegraphing = false;
	SetMeshFlash(0.f);
	FinishedDelegate.ExecuteIfBound(!bIsFeint); // Feints report false — no attack follows.
}
