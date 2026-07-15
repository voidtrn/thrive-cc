// Copyright StickmanImpact Project.

#include "StickmanFootstepComponent.h"
#include "StickmanAudioManager.h"
#include "VFX/GameFeelComponent.h"
#include "PhysicalMaterials/PhysicalMaterial.h"
#include "GameFramework/Actor.h"
#include "GameFramework/Character.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Kismet/GameplayStatics.h"
#include "NiagaraFunctionLibrary.h"
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

	// Weight by speed: sprinting steps land heavier and slightly lower-pitched. The walk vs
	// sprint step *pattern* itself comes from which anim (and its notify spacing) is playing.
	float Volume = 1.f;
	float PitchBase = 1.f;
	if (const ACharacter* OwnerCharacter = Cast<ACharacter>(Owner))
	{
		const float Speed = OwnerCharacter->GetVelocity().Size2D();
		if (Speed > 550.f)
		{
			Volume = SprintVolumeMultiplier;
			PitchBase = 0.95f;
		}
	}

	if (UStickmanAudioManager* AudioManager = World->GetGameInstance()
			? World->GetGameInstance()->GetSubsystem<UStickmanAudioManager>() : nullptr)
	{
		// Slight pitch jitter so repeated steps don't sound machine-gunned.
		AudioManager->PlaySFX(Sound, Hit.ImpactPoint, Volume, PitchBase * FMath::FRandRange(0.92f, 1.08f));
	}

	// Footprint decal on mapped surfaces, oriented to the ground normal + facing.
	if (const TObjectPtr<UMaterialInterface>* DecalMaterial = FootprintDecals.Find(Surface))
	{
		if (*DecalMaterial)
		{
			const FRotator DecalRotation = FRotationMatrix::MakeFromZX(Hit.ImpactNormal, Owner->GetActorForwardVector()).Rotator();
			UGameplayStatics::SpawnDecalAtLocation(World, *DecalMaterial, FVector(8.f, 16.f, 8.f),
				Hit.ImpactPoint, DecalRotation, DecalLifetime);
		}
	}

	// Shallow-water ripple.
	if (Surface == SurfaceType4 /* Water per README surface table */ && WaterRippleVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAtLocation(World, WaterRippleVFX, Hit.ImpactPoint);
	}

	// Footstep micro camera shake (player only — enemies/NPCs have no GameFeelComponent).
	if (UGameFeelComponent* GameFeel = Owner->FindComponentByClass<UGameFeelComponent>())
	{
		GameFeel->PlayFootstepMicroShake();
	}
}
