// Copyright StickmanImpact Project.

#include "ChronoClone.h"
#include "Components/SkeletalMeshComponent.h"

AChronoClone::AChronoClone()
{
	PrimaryActorTick.bCanEverTick = true;

	Mesh = CreateDefaultSubobject<USkeletalMeshComponent>(TEXT("Mesh"));
	RootComponent = Mesh;
	Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
}

void AChronoClone::BeginPlay()
{
	Super::BeginPlay();

	if (GhostMaterial)
	{
		for (int32 Slot = 0; Slot < Mesh->GetNumMaterials(); ++Slot)
		{
			Mesh->SetMaterial(Slot, GhostMaterial);
		}
	}

	// Auto-clean once the replay finishes (+ the delay).
	const float Lifetime = StartDelay + (ReplayTrack.Num() > 0
		? (ReplayTrack.Last().Time - ReplayTrack[0].Time) : 0.f) + 0.5f;
	SetLifeSpan(FMath::Max(Lifetime, 1.f));
}

void AChronoClone::InitReplay(const TArray<FChronoSnapshot>& Track, float Delay)
{
	ReplayTrack = Track;
	StartDelay = Delay;
}

void AChronoClone::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	Elapsed += DeltaSeconds;
	if (Elapsed < StartDelay || ReplayTrack.Num() == 0)
	{
		return;
	}

	const float PlayTime = ReplayTrack[0].Time + (Elapsed - StartDelay);
	while (TrackIndex + 1 < ReplayTrack.Num() && ReplayTrack[TrackIndex + 1].Time <= PlayTime)
	{
		++TrackIndex;
		OnCloneBeat(TrackIndex);
	}

	if (TrackIndex + 1 < ReplayTrack.Num())
	{
		const FChronoSnapshot& A = ReplayTrack[TrackIndex];
		const FChronoSnapshot& B = ReplayTrack[TrackIndex + 1];
		const float Alpha = FMath::Clamp((PlayTime - A.Time) / FMath::Max(B.Time - A.Time, KINDA_SMALL_NUMBER), 0.f, 1.f);
		SetActorLocationAndRotation(FMath::Lerp(A.Location, B.Location, Alpha), FMath::Lerp(A.Rotation, B.Rotation, Alpha));
	}
}
