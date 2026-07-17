// Copyright StickmanImpact Project.

#include "ChronoComponent.h"
#include "ChronoClone.h"
#include "Character/StickmanCharacter.h"
#include "Combat/StickmanAttributeSet.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "AbilitySystemComponent.h"
#include "EngineUtils.h"
#include "TimerManager.h"

UChronoComponent::UChronoComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
}

void UChronoComponent::BeginPlay()
{
	Super::BeginPlay();
}

AStickmanCharacter* UChronoComponent::GetOwnerCharacter() const
{
	return Cast<AStickmanCharacter>(GetOwner());
}

void UChronoComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	const AActor* Owner = GetOwner();
	if (!Owner)
	{
		return;
	}

	// Rewind buffer + clone-movement recording at 20 Hz.
	SnapshotAccumulator += DeltaTime;
	if (SnapshotAccumulator >= 0.05f)
	{
		SnapshotAccumulator = 0.f;

		FChronoSnapshot Snap;
		Snap.Time = GetWorld()->GetTimeSeconds();
		Snap.Location = Owner->GetActorLocation();
		Snap.Rotation = Owner->GetActorRotation();
		if (const AStickmanCharacter* Character = GetOwnerCharacter())
		{
			if (const UStickmanAttributeSet* Attributes = Character->GetStickmanAttributeSet())
			{
				Snap.Health = Attributes->GetHealth();
			}
		}
		Snapshots.Add(Snap);
		RecentMovement.Add(Snap);

		// Keep only what rewind/clone need.
		const float KeepWindow = FMath::Max(RewindSeconds, CloneDelay) + 1.f;
		while (Snapshots.Num() > 0 && Snap.Time - Snapshots[0].Time > KeepWindow)
		{
			Snapshots.RemoveAt(0);
		}
		while (RecentMovement.Num() > 0 && Snap.Time - RecentMovement[0].Time > CloneDelay + 2.f)
		{
			RecentMovement.RemoveAt(0);
		}
	}
}

// ---------------------------------------------------------------- time slow ----------

void UChronoComponent::TimeSlow()
{
	const FVector Origin = GetOwner()->GetActorLocation();
	TArray<TWeakObjectPtr<AActor>> Affected;

	for (TActorIterator<AStickmanEnemyCharacter> It(GetWorld()); It; ++It)
	{
		if (FVector::Dist(It->GetActorLocation(), Origin) <= SlowRadius)
		{
			It->CustomTimeDilation = SlowFactor;
			Affected.Add(*It);
		}
	}

	// Restore after the duration (real seconds — a weak-lambda timer on the world).
	FTimerDelegate Restore = FTimerDelegate::CreateWeakLambda(this, [Affected]()
	{
		for (const TWeakObjectPtr<AActor>& Weak : Affected)
		{
			if (AActor* Actor = Weak.Get())
			{
				Actor->CustomTimeDilation = 1.f;
			}
		}
	});
	GetWorld()->GetTimerManager().SetTimer(SlowTimerHandle, Restore, SlowDuration, false);
}

// ---------------------------------------------------------------- time stop ----------

void UChronoComponent::TimeStop()
{
	if (bTimeStopActive)
	{
		return;
	}
	bTimeStopActive = true;
	StoppedActors.Empty();
	AccumulatedDamage.Empty();

	for (TActorIterator<AStickmanEnemyCharacter> It(GetWorld()); It; ++It)
	{
		It->CustomTimeDilation = KINDA_SMALL_NUMBER; // effectively frozen
		StoppedActors.Add(*It);
	}
	for (const TWeakObjectPtr<AActor>& Weak : TrackedProjectiles)
	{
		if (AActor* Projectile = Weak.Get())
		{
			Projectile->CustomTimeDilation = KINDA_SMALL_NUMBER;
			StoppedActors.Add(Projectile);
		}
	}

	OnTimeStopChanged.Broadcast(true);
	GetWorld()->GetTimerManager().SetTimer(StopTimerHandle, this, &UChronoComponent::EndTimeStop, StopDuration, false);
}

void UChronoComponent::EndTimeStop()
{
	bTimeStopActive = false;

	for (const TWeakObjectPtr<AActor>& Weak : StoppedActors)
	{
		AActor* Actor = Weak.Get();
		if (!Actor)
		{
			continue;
		}
		Actor->CustomTimeDilation = 1.f;

		// Apply accumulated damage now that time resumes.
		if (const float* Damage = AccumulatedDamage.Find(Actor))
		{
			if (AStickmanEnemyCharacter* Enemy = Cast<AStickmanEnemyCharacter>(Actor))
			{
				if (UStickmanAttributeSet* Attributes = const_cast<UStickmanAttributeSet*>(
						Enemy->GetAbilitySystemComponent() ? Enemy->GetAbilitySystemComponent()->GetSet<UStickmanAttributeSet>() : nullptr))
				{
					const float NewHealth = FMath::Max(Attributes->GetHealth() - *Damage, 0.f);
					Attributes->SetHealth(NewHealth);
					Attributes->OnHealthChanged.Broadcast(NewHealth, Attributes->GetMaxHealth());
				}
			}
		}
	}

	StoppedActors.Empty();
	AccumulatedDamage.Empty();
	TrackedProjectiles.Empty();
	OnTimeStopChanged.Broadcast(false);
}

// ---------------------------------------------------------------- rewind --------------

bool UChronoComponent::TryRewind()
{
	if (bRewindUsed)
	{
		return false;
	}

	const float TargetTime = GetWorld()->GetTimeSeconds() - RewindSeconds;
	const FChronoSnapshot* Best = nullptr;
	for (const FChronoSnapshot& Snap : Snapshots)
	{
		if (Snap.Time <= TargetTime)
		{
			Best = &Snap;
		}
	}
	if (!Best)
	{
		return false;
	}

	bRewindUsed = true;
	if (AStickmanCharacter* Character = GetOwnerCharacter())
	{
		Character->SetActorLocationAndRotation(Best->Location, Best->Rotation);
		if (UStickmanAttributeSet* Attributes = Character->GetStickmanAttributeSet())
		{
			Attributes->SetHealth(Best->Health);
			Attributes->OnHealthChanged.Broadcast(Best->Health, Attributes->GetMaxHealth());
		}
	}
	OnTimeRewound.Broadcast();
	return true;
}

// ---------------------------------------------------------------- clone ---------------

AChronoClone* UChronoComponent::SpawnTimeClone()
{
	if (!CloneClass || RecentMovement.Num() == 0)
	{
		return nullptr;
	}

	const FChronoSnapshot& Start = RecentMovement[0];
	AChronoClone* Clone = GetWorld()->SpawnActor<AChronoClone>(CloneClass, Start.Location, Start.Rotation);
	if (Clone)
	{
		Clone->InitReplay(RecentMovement, CloneDelay);
	}
	return Clone;
}

// ---------------------------------------------------------------- time skip -----------

void UChronoComponent::BeginTimeSkip()
{
	SkipChargeStart = GetWorld()->GetTimeSeconds();
}

void UChronoComponent::ReleaseTimeSkip(AActor* Target)
{
	if (SkipChargeStart < 0.f || !Target)
	{
		SkipChargeStart = -1.f;
		return;
	}

	const float Charge = GetWorld()->GetTimeSeconds() - SkipChargeStart;
	SkipChargeStart = -1.f;

	// Teleport next to the target; the number of "skipped" hits scales with charge (the
	// combat side reads GetLastSkipHits to deliver them at once).
	if (AStickmanCharacter* Character = GetOwnerCharacter())
	{
		const FVector Behind = Target->GetActorLocation() - Target->GetActorForwardVector() * 150.f;
		Character->SetActorLocation(Behind);
	}
	LastSkipHits = FMath::Clamp(FMath::FloorToInt(Charge * 3.f), 1, 8);
}
