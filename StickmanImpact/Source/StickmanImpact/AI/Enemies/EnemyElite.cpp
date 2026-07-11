// Copyright StickmanImpact Project.

#include "EnemyElite.h"
#include "Combat/StickmanAttributeSet.h"
#include "GameFramework/CharacterMovementComponent.h"

AEnemyElite::AEnemyElite()
{
	Stats.MaxHealth = 5000.f;
	Stats.Attack = 30.f;
	Stats.Defense = 15.f;
	Stats.ElementalMastery = 40.f;

	OptimalCombatDistance = 300.f;
	RetreatHealthPercent = 0.f; // Bosses don't retreat.
	DodgeChance = 0.15f;

	PhaseHealthThresholds = { 0.66f, 0.33f };
}

void AEnemyElite::BeginPlay()
{
	Super::BeginPlay();

	if (AttributeSet)
	{
		AttributeSet->OnHealthChanged.AddDynamic(this, &AEnemyElite::HandleHealthChanged);
	}
}

void AEnemyElite::HandleHealthChanged(float NewHealth, float MaxHealth)
{
	CheckPhaseTransition();
}

void AEnemyElite::CheckPhaseTransition()
{
	const float HealthPercent = GetHealthPercent();

	int32 TargetPhase = 0;
	for (const float Threshold : PhaseHealthThresholds)
	{
		if (HealthPercent <= Threshold)
		{
			++TargetPhase;
		}
	}

	if (TargetPhase == CurrentPhaseIndex)
	{
		return;
	}
	CurrentPhaseIndex = TargetPhase;

	if (PhaseAttackOverrides.IsValidIndex(CurrentPhaseIndex - 1))
	{
		WeightedAttacks = { PhaseAttackOverrides[CurrentPhaseIndex - 1] };
	}

	OnPhaseChanged.Broadcast(CurrentPhaseIndex);
}
