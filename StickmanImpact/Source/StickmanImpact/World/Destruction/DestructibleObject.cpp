// Copyright StickmanImpact Project.

#include "DestructibleObject.h"
#include "DestructionManagerSubsystem.h"
#include "Components/StaticMeshComponent.h"
#include "NiagaraFunctionLibrary.h"
#include "Kismet/GameplayStatics.h"
#include "EngineUtils.h"
#include "TimerManager.h"

ADestructibleObject::ADestructibleObject()
{
	PrimaryActorTick.bCanEverTick = false;

	Mesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Mesh"));
	RootComponent = Mesh;
	Mesh->SetCollisionObjectType(ECC_WorldDynamic); // radial elemental damage reaches us
}

void ADestructibleObject::BeginPlay()
{
	Super::BeginPlay();
	Integrity = MaxIntegrity;
}

void ADestructibleObject::TakeDestructionDamage(EStickmanElement Element, float Amount, AActor* DamageInstigator)
{
	if (bBroken || Amount <= 0.f)
	{
		return;
	}

	float Multiplier = 1.f;
	if (const float* Found = ElementMultipliers.Find(Element))
	{
		Multiplier = *Found;
	}

	// Pyro on a flammable object ignites it (spread starts) regardless of break state.
	if (Element == EStickmanElement::Pyro && bFlammable && !bBurning)
	{
		bBurning = true;
		GetWorldTimerManager().SetTimer(FireSpreadTimerHandle, this, &ADestructibleObject::SpreadFire,
			FireSpreadDelay, false);
	}

	Integrity = FMath::Max(Integrity - Amount * Multiplier, 0.f);
	UpdateProgressMaterial();

	if (Integrity <= 0.f)
	{
		Break(DamageInstigator);
	}
}

void ADestructibleObject::UpdateProgressMaterial()
{
	// Progressive char/melt/rust: materials read a 0-1 "Progress" scalar.
	const float Progress = 1.f - GetIntegrityFraction();
	for (int32 Index = 0; Index < Mesh->GetNumMaterials(); ++Index)
	{
		if (UMaterialInstanceDynamic* MID = Mesh->CreateDynamicMaterialInstance(Index))
		{
			MID->SetScalarParameterValue(TEXT("Progress"), Progress);
		}
	}
}

void ADestructibleObject::SpreadFire()
{
	if (bBroken)
	{
		return;
	}
	// Ignite flammable neighbors — chain destruction.
	for (TActorIterator<ADestructibleObject> It(GetWorld()); It; ++It)
	{
		if (*It != this && It->bFlammable && !It->bBurning && !It->bBroken
			&& FVector::Dist(It->GetActorLocation(), GetActorLocation()) <= FireSpreadRadius)
		{
			It->TakeDestructionDamage(EStickmanElement::Pyro, 30.f, this);
		}
	}
	// Burning keeps eating this object too.
	TakeDestructionDamage(EStickmanElement::Pyro, 25.f, this);
	if (!bBroken)
	{
		GetWorldTimerManager().SetTimer(FireSpreadTimerHandle, this, &ADestructibleObject::SpreadFire,
			FireSpreadDelay, false);
	}
}

void ADestructibleObject::Break(AActor* Destroyer)
{
	if (bBroken)
	{
		return;
	}
	bBroken = true;
	GetWorldTimerManager().ClearTimer(FireSpreadTimerHandle);

	if (BreakVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAtLocation(this, BreakVFX, GetActorLocation());
	}
	if (BreakSound)
	{
		UGameplayStatics::PlaySoundAtLocation(this, BreakSound, GetActorLocation());
	}

	// Explosive: radius damage + chain-trigger nearby destructibles.
	if (bExplosive)
	{
		for (TActorIterator<ADestructibleObject> It(GetWorld()); It; ++It)
		{
			if (*It != this && FVector::Dist(It->GetActorLocation(), GetActorLocation()) <= ExplosionRadius)
			{
				It->TakeDestructionDamage(EStickmanElement::Pyro, ExplosionDamage, Destroyer);
			}
		}
		// Pawn damage from the blast goes through the normal radial path — the BP break
		// event calls the explosion ability so the funnel handles enemies/player uniformly.
	}

	// Debris budget: register with the manager (cleans up / despawns oldest at the cap).
	if (UDestructionManagerSubsystem* Manager = GetGameInstance()->GetSubsystem<UDestructionManagerSubsystem>())
	{
		Manager->NotifyObjectBroken(this, bMinorDestruction);
	}

	OnBroken(DestructionType, Destroyer); // Chaos GC swap / debris / decal per type (BP)
	OnDestroyed.Broadcast(Destroyer);

	// Base actor hides + drops collision; the GC/debris the BP spawned carries the visuals.
	SetActorHiddenInGame(true);
	SetActorEnableCollision(false);
}
