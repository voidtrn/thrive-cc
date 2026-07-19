// Copyright StickmanImpact Project.

#include "DetectiveModeComponent.h"
#include "World/ClueActor.h"
#include "World/DiscoverySite.h"
#include "Camera/CameraComponent.h"
#include "Components/PrimitiveComponent.h"
#include "GameFramework/Character.h"
#include "NiagaraFunctionLibrary.h"
#include "Kismet/GameplayStatics.h"
#include "EngineUtils.h"
#include "TimerManager.h"

UDetectiveModeComponent::UDetectiveModeComponent()
{
	PrimaryComponentTick.bCanEverTick = false;
}

bool UDetectiveModeComponent::IsOnCooldown() const
{
	return GetWorld() && (GetWorld()->GetTimeSeconds() - LastDeactivateTime) < Cooldown;
}

void UDetectiveModeComponent::ToggleDetectiveMode()
{
	if (bActive)
	{
		Deactivate();
	}
	else if (!IsOnCooldown())
	{
		ActivateDetectiveMode();
	}
}

void UDetectiveModeComponent::ActivateDetectiveMode()
{
	bActive = true;

	if (PulseVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAtLocation(this, PulseVFX, GetOwner()->GetActorLocation());
	}
	if (ActivateSound)
	{
		UGameplayStatics::PlaySoundAtLocation(this, ActivateSound, GetOwner()->GetActorLocation());
	}

	HighlightNearbyInvestigables();
	ApplyPostProcess(true);

	GetWorld()->GetTimerManager().SetTimer(DurationTimerHandle, this, &UDetectiveModeComponent::Deactivate, Duration, false);
	OnDetectiveModeChanged.Broadcast(true);
}

void UDetectiveModeComponent::Deactivate()
{
	if (!bActive)
	{
		return;
	}
	bActive = false;
	LastDeactivateTime = GetWorld()->GetTimeSeconds();
	GetWorld()->GetTimerManager().ClearTimer(DurationTimerHandle);

	ClearHighlights();
	ApplyPostProcess(false);

	if (DeactivateSound)
	{
		UGameplayStatics::PlaySoundAtLocation(this, DeactivateSound, GetOwner()->GetActorLocation());
	}
	OnDetectiveModeChanged.Broadcast(false);
}

void UDetectiveModeComponent::HighlightNearbyInvestigables()
{
	const FVector Origin = GetOwner()->GetActorLocation();
	const float RadiusSq = PulseRadius * PulseRadius;

	for (TActorIterator<AClueActor> It(GetWorld()); It; ++It)
	{
		if (FVector::DistSquared(Origin, It->GetActorLocation()) <= RadiusSq)
		{
			It->RevealByDetectiveMode();
			HighlightedActors.Add(*It);
		}
	}

	for (TActorIterator<ADiscoverySite> It(GetWorld()); It; ++It)
	{
		// Sealed sites stay secret — detective mode hints at findable things, it doesn't
		// bypass ability gates.
		if (It->IsHidden() || FVector::DistSquared(Origin, It->GetActorLocation()) > RadiusSq)
		{
			continue;
		}
		TArray<UPrimitiveComponent*> Primitives;
		It->GetComponents<UPrimitiveComponent>(Primitives);
		for (UPrimitiveComponent* Primitive : Primitives)
		{
			Primitive->SetRenderCustomDepth(true);
			Primitive->SetCustomDepthStencilValue(2);
		}
		HighlightedActors.Add(*It);
	}
}

void UDetectiveModeComponent::ClearHighlights()
{
	for (const TWeakObjectPtr<AActor>& Weak : HighlightedActors)
	{
		if (AActor* Actor = Weak.Get())
		{
			TArray<UPrimitiveComponent*> Primitives;
			Actor->GetComponents<UPrimitiveComponent>(Primitives);
			for (UPrimitiveComponent* Primitive : Primitives)
			{
				Primitive->SetRenderCustomDepth(false);
			}
		}
	}
	HighlightedActors.Empty();
}

void UDetectiveModeComponent::ApplyPostProcess(bool bEnable)
{
	const ACharacter* Character = Cast<ACharacter>(GetOwner());
	if (!Character)
	{
		return;
	}
	if (UCameraComponent* Camera = Character->FindComponentByClass<UCameraComponent>())
	{
		// Shares ColorSaturation with UGameFeelComponent's exhaustion desaturate — last
		// writer wins; both fully restore on end, so a brief overlap only mixes intensity.
		Camera->PostProcessSettings.bOverride_ColorSaturation = bEnable;
		Camera->PostProcessSettings.ColorSaturation = FVector4(FVector(1.f - (bEnable ? Desaturation : 0.f)), 1.f);
	}
}
