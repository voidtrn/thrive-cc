#include "Character/FootstepComponent.h"
#include "GameFramework/Character.h"
#include "Components/SkeletalMeshComponent.h"
#include "PhysicalMaterials/PhysicalMaterial.h"
#include "Kismet/GameplayStatics.h"

void UFootstepComponent::PlayFootstep(FName SocketName)
{
	const ACharacter* Character = Cast<ACharacter>(GetOwner());
	if (!Character)
	{
		return;
	}

	// Posisi kaki (socket) atau root
	FVector Start = Character->GetActorLocation();
	if (!SocketName.IsNone() && Character->GetMesh())
	{
		Start = Character->GetMesh()->GetSocketLocation(SocketName);
	}

	// Trace ke bawah — deteksi surface
	FHitResult Hit;
	FCollisionQueryParams Params;
	Params.AddIgnoredActor(GetOwner());
	Params.bReturnPhysicalMaterial = true;

	if (!GetWorld()->LineTraceSingleByChannel(Hit, Start,
		Start - FVector(0, 0, TraceDistance), ECC_Visibility, Params))
	{
		return; // di udara
	}

	// Pilih sound dari surface type
	USoundBase* Sound = DefaultSound;
	if (Hit.PhysMaterial.IsValid())
	{
		if (const TObjectPtr<USoundBase>* Found = SurfaceSounds.Find(Hit.PhysMaterial->SurfaceType))
		{
			Sound = *Found;
		}
	}
	if (!Sound)
	{
		return;
	}

	// Volume by speed: lerp walk→sprint (250→800 range dari movement)
	const float Speed = Character->GetVelocity().Size2D();
	const float Alpha = FMath::Clamp((Speed - 250.f) / (800.f - 250.f), 0.f, 1.f);
	const float Volume = FMath::Lerp(WalkVolume, SprintVolume, Alpha);

	// Pitch random ±5% anti repetitive
	const float Pitch = 1.f + FMath::FRandRange(-PitchVariation, PitchVariation);

	UGameplayStatics::PlaySoundAtLocation(this, Sound, Hit.ImpactPoint, Volume, Pitch);
}
