// Copyright StickmanImpact Project.

#include "VFXManager.h"
#include "NiagaraComponent.h"
#include "NiagaraSystem.h"
#include "Kismet/GameplayStatics.h"
#include "Engine/World.h"

EVFXQuality UVFXManager::GlobalQuality = EVFXQuality::High;

bool UVFXManager::ShouldCull(const FVector& Location, float& OutDistanceToCamera) const
{
	OutDistanceToCamera = 0.f;

	const APlayerController* PC = UGameplayStatics::GetPlayerController(GetWorld(), 0);
	if (!PC || !PC->PlayerCameraManager)
	{
		return false;
	}

	const FVector CameraLocation = PC->PlayerCameraManager->GetCameraLocation();
	const FVector CameraForward = PC->PlayerCameraManager->GetCameraRotation().Vector();
	const FVector ToTarget = Location - CameraLocation;
	OutDistanceToCamera = ToTarget.Size();

	if (OutDistanceToCamera > CullDistance)
	{
		return true;
	}
	// Behind the camera (beyond a small keep-alive radius so close explosions still play).
	if (OutDistanceToCamera > 500.f && FVector::DotProduct(CameraForward, ToTarget.GetSafeNormal()) < 0.f)
	{
		return true;
	}
	return false;
}

float UVFXManager::GetQualitySpawnRateScale()
{
	switch (GlobalQuality)
	{
		case EVFXQuality::Low: return 0.4f;
		case EVFXQuality::Medium: return 0.7f;
		default: return 1.f;
	}
}

UNiagaraComponent* UVFXManager::AcquireComponent(UNiagaraSystem* System)
{
	for (int32 Index = InactivePool.Num() - 1; Index >= 0; --Index)
	{
		UNiagaraComponent* Pooled = InactivePool[Index];
		if (!Pooled)
		{
			InactivePool.RemoveAt(Index);
			continue;
		}
		InactivePool.RemoveAt(Index);
		Pooled->SetAsset(System);
		return Pooled;
	}

	AActor* Owner = GetOwner();
	if (!Owner)
	{
		return nullptr;
	}

	UNiagaraComponent* NewComponent = NewObject<UNiagaraComponent>(Owner);
	NewComponent->SetAsset(System);
	NewComponent->SetAutoDestroy(false); // Pool-managed, never self-destroys.
	NewComponent->RegisterComponent();
	NewComponent->OnSystemFinished.AddDynamic(this, &UVFXManager::HandleSystemFinished);
	return NewComponent;
}

UNiagaraComponent* UVFXManager::SpawnVFX(UNiagaraSystem* System, FVector Location, FRotator Rotation)
{
	float DistanceToCamera = 0.f;
	if (!System || ShouldCull(Location, DistanceToCamera))
	{
		return nullptr;
	}

	UNiagaraComponent* Component = AcquireComponent(System);
	if (!Component)
	{
		return nullptr;
	}

	Component->DetachFromComponent(FDetachmentTransformRules::KeepWorldTransform);
	Component->SetWorldLocationAndRotation(Location, Rotation);

	float SpawnRateScale = GetQualitySpawnRateScale();
	if (DistanceToCamera > LODDistance)
	{
		SpawnRateScale *= LODSpawnRateScale;
	}
	// Only affects systems authored with a "SpawnRateScale" float User parameter.
	Component->SetFloatParameter(TEXT("SpawnRateScale"), SpawnRateScale);

	Component->Activate(true);
	return Component;
}

UNiagaraComponent* UVFXManager::SpawnVFXAttached(UNiagaraSystem* System, USceneComponent* AttachTo, FName SocketName)
{
	if (!System || !AttachTo)
	{
		return nullptr;
	}

	float DistanceToCamera = 0.f;
	if (ShouldCull(AttachTo->GetComponentLocation(), DistanceToCamera))
	{
		return nullptr;
	}

	UNiagaraComponent* Component = AcquireComponent(System);
	if (!Component)
	{
		return nullptr;
	}

	Component->AttachToComponent(AttachTo, FAttachmentTransformRules::SnapToTargetNotIncludingScale, SocketName);
	Component->SetFloatParameter(TEXT("SpawnRateScale"), GetQualitySpawnRateScale());
	Component->Activate(true);
	return Component;
}

void UVFXManager::HandleSystemFinished(UNiagaraComponent* FinishedComponent)
{
	if (!FinishedComponent)
	{
		return;
	}
	FinishedComponent->Deactivate();

	if (InactivePool.Num() < MaxPoolSize)
	{
		InactivePool.Add(FinishedComponent);
	}
	else
	{
		FinishedComponent->DestroyComponent();
	}
}

void UVFXManager::SetVFXQuality(EVFXQuality Quality)
{
	GlobalQuality = Quality;

	// Engine-side Niagara scalability: quality level CVar matches Low/Medium/High/Epic buckets.
	if (GEngine)
	{
		GEngine->Exec(nullptr, *FString::Printf(TEXT("fx.Niagara.QualityLevel %d"), static_cast<int32>(Quality)));
	}
}
