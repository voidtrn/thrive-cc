// Copyright StickmanImpact Project.

#include "SummonerComponent.h"
#include "AI/Bestiary/EnemyFactory.h"
#include "TimerManager.h"

USummonerComponent::USummonerComponent()
{
	PrimaryComponentTick.bCanEverTick = false;
}

void USummonerComponent::BeginPlay()
{
	Super::BeginPlay();
	GetWorld()->GetTimerManager().SetTimer(SummonTimerHandle, this, &USummonerComponent::SummonWave,
		SummonInterval, true);
}

void USummonerComponent::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
	if (GetWorld())
	{
		GetWorld()->GetTimerManager().ClearTimer(SummonTimerHandle);
	}
	Super::EndPlay(EndPlayReason);
}

void USummonerComponent::SummonWave()
{
	if (SummonArchetypeIDs.Num() == 0)
	{
		return;
	}

	// Prune dead summons before checking the cap.
	ActiveSummons.RemoveAll([](const TWeakObjectPtr<AActor>& Weak) { return !Weak.IsValid(); });
	if (ActiveSummons.Num() >= MaxActiveSummons)
	{
		return;
	}

	UEnemyFactory* Factory = GetOwner()->GetGameInstance()
		? GetOwner()->GetGameInstance()->GetSubsystem<UEnemyFactory>() : nullptr;
	if (!Factory)
	{
		return;
	}

	const int32 Count = FMath::Min(SummonsPerWave, MaxActiveSummons - ActiveSummons.Num());
	for (int32 Index = 0; Index < Count; ++Index)
	{
		const FName ArchetypeID = SummonArchetypeIDs[FMath::RandRange(0, SummonArchetypeIDs.Num() - 1)];
		const float Angle = FMath::FRandRange(0.f, 2.f * PI);
		const FVector Location = GetOwner()->GetActorLocation() +
			FVector(FMath::Cos(Angle), FMath::Sin(Angle), 0.f) * SummonRadius;

		if (AActor* Summon = Factory->SpawnArchetype(ArchetypeID, FTransform(Location), LevelForSummons))
		{
			ActiveSummons.Add(Summon);
		}
	}
}
