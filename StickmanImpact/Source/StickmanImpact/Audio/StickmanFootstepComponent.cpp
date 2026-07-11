// Copyright StickmanImpact Project.

#include "StickmanFootstepComponent.h"
#include "StickmanAudioManager.h"
#include "PhysicalMaterials/PhysicalMaterial.h"
#include "GameFramework/Actor.h"
#include "Engine/World.h"

void UStickmanFootstepComponent::PlayFootstep()
{
	const AActor* Owner = GetOwner();
	UWorld* World = GetWorld();
	if (!Owner || !World)
	{
		return;
	}

	const FVector Start = Owner->GetActorLocation();
	const FVector End = Start - FVector(0.f, 0.f, TraceDistance);

	FHitResult Hit;
	FCollisionQueryParams QueryParams;
	QueryParams.AddIgnoredActor(Owner);
	QueryParams.bReturnPhysicalMaterial = true; // Without this the hit's PhysMaterial is null.

	if (!World->LineTraceSingleByChannel(Hit, Start, End, ECC_Visibility, QueryParams))
	{
		return; // Airborne — no footstep.
	}

	const EPhysicalSurface Surface = Hit.PhysMaterial.IsValid()
		? UPhysicalMaterial::DetermineSurfaceType(Hit.PhysMaterial.Get())
		: SurfaceType_Default;

	USoundBase* Sound = DefaultFootstepSound;
	if (const TObjectPtr<USoundBase>* Found = FootstepSounds.Find(Surface))
	{
		Sound = *Found;
	}
	if (!Sound)
	{
		return;
	}

	if (UStickmanAudioManager* AudioManager = World->GetGameInstance()
			? World->GetGameInstance()->GetSubsystem<UStickmanAudioManager>() : nullptr)
	{
		// Slight pitch jitter so repeated steps don't sound machine-gunned.
		AudioManager->PlaySFX(Sound, Hit.ImpactPoint, 1.f, FMath::FRandRange(0.92f, 1.08f));
	}
}
