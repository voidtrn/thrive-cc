// Copyright StickmanImpact Project.

#include "PingComponent.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "World/StickmanCollectible.h"
#include "GameFramework/Pawn.h"
#include "GameFramework/PlayerController.h"
#include "NiagaraFunctionLibrary.h"
#include "Kismet/GameplayStatics.h"

void UPingComponent::PingFromCamera()
{
	const APawn* Pawn = Cast<APawn>(GetOwner());
	const APlayerController* PC = Pawn ? Cast<APlayerController>(Pawn->GetController()) : nullptr;
	if (!PC)
	{
		return;
	}

	FVector ViewLocation;
	FRotator ViewRotation;
	PC->GetPlayerViewPoint(ViewLocation, ViewRotation);

	FHitResult Hit;
	FCollisionQueryParams Params;
	Params.AddIgnoredActor(GetOwner());
	const FVector TraceEnd = ViewLocation + ViewRotation.Vector() * PingTraceRange;
	if (!GetWorld()->LineTraceSingleByChannel(Hit, ViewLocation, TraceEnd, ECC_Visibility, Params))
	{
		return; // Nothing in range — no floating ping in the sky.
	}

	EPingType Type = EPingType::Location;
	if (Cast<AStickmanEnemyCharacter>(Hit.GetActor()))
	{
		Type = EPingType::Enemy;
	}
	else if (Cast<AStickmanCollectible>(Hit.GetActor()))
	{
		Type = EPingType::Item;
	}

	PingLocation(Type, Hit.ImpactPoint, Hit.GetActor());
}

void UPingComponent::PingDanger()
{
	PingLocation(EPingType::Danger, GetOwner()->GetActorLocation(), nullptr);
}

void UPingComponent::PingLocation(EPingType PingType, FVector WorldLocation, AActor* PingedActor)
{
	const double Now = GetWorld()->GetTimeSeconds();
	if (Now - LastPingTime < PingCooldown)
	{
		return;
	}
	LastPingTime = Now;

	if (const TObjectPtr<UNiagaraSystem>* VFX = PingVFX.Find(PingType))
	{
		if (*VFX)
		{
			UNiagaraFunctionLibrary::SpawnSystemAtLocation(this, *VFX, WorldLocation);
		}
	}
	if (PingSound)
	{
		UGameplayStatics::PlaySound2D(this, PingSound);
	}

	OnPingIssued.Broadcast(PingType, WorldLocation, PingedActor);
}
