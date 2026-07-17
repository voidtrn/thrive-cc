// Copyright StickmanImpact Project.

#include "StickmanBossCharacter.h"
#include "BossEncounterSubsystem.h"
#include "Combat/StickmanAttributeSet.h"
#include "Combat/StickmanGameplayAbility.h"
#include "AI/AdaptiveDifficultySubsystem.h"
#include "AbilitySystemComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "NiagaraFunctionLibrary.h"
#include "Kismet/GameplayStatics.h"
#include "TimerManager.h"

AStickmanBossCharacter::AStickmanBossCharacter()
{
	// Bosses don't get juggled/launched like fodder.
	JuggleWeight = 1.f;
}

void AStickmanBossCharacter::BeginPlay()
{
	Super::BeginPlay();

	if (UStickmanAttributeSet* Attributes = const_cast<UStickmanAttributeSet*>(
			GetAbilitySystemComponent() ? GetAbilitySystemComponent()->GetSet<UStickmanAttributeSet>() : nullptr))
	{
		Attributes->OnHealthChanged.AddDynamic(this, &AStickmanBossCharacter::HandleHealthChanged);
	}

	// Enter the opening phase immediately.
	if (Phases.Num() > 0)
	{
		EnterPhase(0);
	}

	if (WeakPoints.Num() > 0)
	{
		GetWorldTimerManager().SetTimer(WeakPointRotateTimerHandle, this,
			&AStickmanBossCharacter::RotateWeakPoint, WeakPointRotateInterval, true);
	}

	GetWorldTimerManager().SetTimer(StaggerDecayTimerHandle, this,
		&AStickmanBossCharacter::TickStaggerDecay, 0.5f, true);
}

// ---------------------------------------------------------------- phases --------------

void AStickmanBossCharacter::HandleHealthChanged(float NewHealth, float MaxHealth)
{
	if (MaxHealth <= 0.f || bPhaseTransitioning)
	{
		return;
	}

	const float Percent = NewHealth / MaxHealth;

	// Advance to the deepest phase whose threshold we've now crossed.
	int32 TargetPhase = CurrentPhaseIndex;
	for (int32 Index = CurrentPhaseIndex + 1; Index < Phases.Num(); ++Index)
	{
		if (Percent <= Phases[Index].HPThreshold)
		{
			TargetPhase = Index;
		}
	}
	if (TargetPhase > CurrentPhaseIndex)
	{
		EnterPhase(TargetPhase);
	}

	if (NewHealth <= 0.f)
	{
		HandleDeathRewards();
	}
}

void AStickmanBossCharacter::EnterPhase(int32 PhaseIndex)
{
	if (!Phases.IsValidIndex(PhaseIndex))
	{
		return;
	}

	CurrentPhaseIndex = PhaseIndex;
	const FBossPhase& Phase = Phases[PhaseIndex];

	// Reset the pattern rotation pool to this phase's set.
	UnusedPatternsThisCycle = Phase.AvailablePatterns;

	// Transition: invulnerable while the set-piece plays.
	bPhaseTransitioning = true;
	SetCombatState(EEnemyCombatState::Staggered); // stop attacking during the transition

	if (Phase.PhaseTransitionAnimation)
	{
		if (UAnimInstance* AnimInstance = GetMesh() ? GetMesh()->GetAnimInstance() : nullptr)
		{
			AnimInstance->Montage_Play(Phase.PhaseTransitionAnimation);
		}
	}
	if (Phase.TransitionVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAttached(Phase.TransitionVFX, GetMesh(), NAME_None,
			FVector::ZeroVector, FRotator::ZeroRotator, EAttachLocation::SnapToTarget, true);
	}
	if (Phase.PhaseTransitionSFX)
	{
		UGameplayStatics::PlaySoundAtLocation(this, Phase.PhaseTransitionSFX, GetActorLocation());
	}

	GrantAbilities(Phase.NewAbilities);
	bElementalShieldActive = true; // shield refreshes each phase

	OnPhaseTransitionBegin(PhaseIndex);
	OnBossPhaseChanged.Broadcast(PhaseIndex, Phase.PhaseName);
	if (!Phase.PhaseTaunt.IsEmpty())
	{
		OnBossTaunt.Broadcast(Phase.PhaseTaunt);
	}

	// Transition length rides the montage if any, else a short beat.
	const float TransitionTime = Phase.PhaseTransitionAnimation
		? Phase.PhaseTransitionAnimation->GetPlayLength() : 2.f;
	GetWorldTimerManager().SetTimer(PhaseTransitionTimerHandle, this,
		&AStickmanBossCharacter::FinishPhaseTransition, TransitionTime, false);
}

void AStickmanBossCharacter::FinishPhaseTransition()
{
	bPhaseTransitioning = false;
	SetCombatState(EEnemyCombatState::Combat);
}

void AStickmanBossCharacter::GrantAbilities(const TArray<TSubclassOf<UGameplayAbility>>& Abilities)
{
	UAbilitySystemComponent* ASC = GetAbilitySystemComponent();
	if (!ASC || !HasAuthority())
	{
		return;
	}
	for (const TSubclassOf<UGameplayAbility>& Ability : Abilities)
	{
		if (Ability)
		{
			ASC->GiveAbility(FGameplayAbilitySpec(Ability, 1, INDEX_NONE, this));
		}
	}
}

// ---------------------------------------------------------------- patterns ------------

EBossAttackPattern AStickmanBossCharacter::PickNextPattern()
{
	if (!Phases.IsValidIndex(CurrentPhaseIndex) || Phases[CurrentPhaseIndex].AvailablePatterns.Num() == 0)
	{
		return EBossAttackPattern::Combo;
	}

	if (UnusedPatternsThisCycle.Num() == 0)
	{
		UnusedPatternsThisCycle = Phases[CurrentPhaseIndex].AvailablePatterns; // refill, no repeats until then
	}

	// Adaptive nudge: if the player has been dodging a lot, prefer a Grab (unblockable) to
	// punish over-reliance on dodge; otherwise pick randomly from the unused pool.
	int32 PickIndex = FMath::RandRange(0, UnusedPatternsThisCycle.Num() - 1);
	if (const UGameInstance* GI = GetGameInstance())
	{
		if (const UAdaptiveDifficultySubsystem* Difficulty = GI->GetSubsystem<UAdaptiveDifficultySubsystem>())
		{
			if (Difficulty->GetAggressionMultiplier() > 1.2f && UnusedPatternsThisCycle.Contains(EBossAttackPattern::Grab))
			{
				PickIndex = UnusedPatternsThisCycle.IndexOfByKey(EBossAttackPattern::Grab);
			}
		}
	}

	const EBossAttackPattern Pattern = UnusedPatternsThisCycle[PickIndex];
	UnusedPatternsThisCycle.RemoveAt(PickIndex);
	return Pattern;
}

// ---------------------------------------------------------------- stagger -------------

void AStickmanBossCharacter::AddStagger(float Amount)
{
	if (bStaggerDowned || bPhaseTransitioning || Amount <= 0.f)
	{
		return;
	}

	CurrentStagger = FMath::Min(CurrentStagger + Amount, MaxStagger);
	OnBossStaggerChanged.Broadcast(CurrentStagger, MaxStagger);

	if (CurrentStagger >= MaxStagger)
	{
		bStaggerDowned = true;
		CurrentStagger = 0.f;
		SetCombatState(EEnemyCombatState::Staggered);
		ForceStagger(StaggerDownDuration);
		OnBossStaggered.Broadcast();
		GetWorldTimerManager().SetTimer(StaggerRecoverTimerHandle, this,
			&AStickmanBossCharacter::RecoverFromStaggerDown, StaggerDownDuration, false);
	}
}

void AStickmanBossCharacter::TickStaggerDecay()
{
	if (!bStaggerDowned && CurrentStagger > 0.f)
	{
		CurrentStagger = FMath::Max(CurrentStagger - StaggerDecayPerSecond * 0.5f, 0.f);
		OnBossStaggerChanged.Broadcast(CurrentStagger, MaxStagger);
	}
}

void AStickmanBossCharacter::RecoverFromStaggerDown()
{
	bStaggerDowned = false;
	SetCombatState(EEnemyCombatState::Combat);
}

// ---------------------------------------------------------------- weak points ---------

void AStickmanBossCharacter::RotateWeakPoint()
{
	if (WeakPoints.Num() > 1)
	{
		ActiveWeakPointIndex = (ActiveWeakPointIndex + 1) % WeakPoints.Num();
	}
}

float AStickmanBossCharacter::GetIncomingDamageMultiplier(FName BoneName, EStickmanElement Element)
{
	float Multiplier = 1.f;

	// Mercy (AI director): 3+ player deaths eases incoming... wait, mercy should ease OUTGOING
	// boss damage; here we slightly BUFF the player's incoming-to-boss damage to shorten a
	// fight the player is struggling with.
	if (bMercyActive)
	{
		Multiplier *= 1.15f;
	}

	// Weak points: active or already-broken bone takes bonus damage.
	for (int32 Index = 0; Index < WeakPoints.Num(); ++Index)
	{
		if (WeakPoints[Index].BoneName != BoneName)
		{
			continue;
		}

		// Elemental shield gate: until broken with the right element, non-matching hits chip 0.
		if (bElementalShieldActive && WeakPoints[Index].ShieldElement != EStickmanElement::None)
		{
			if (Element == WeakPoints[Index].ShieldElement)
			{
				bElementalShieldActive = false; // shield broken by the counter element
			}
			else
			{
				return 0.f;
			}
		}

		const bool bBroken = BrokenWeakPoints.Contains(Index);
		if (bBroken || Index == ActiveWeakPointIndex)
		{
			Multiplier *= WeakPoints[Index].DamageMultiplier;
		}

		// Accumulate toward breaking the (not-yet-broken) weak point.
		if (!bBroken)
		{
			float& Accumulated = WeakPointDamageTaken.FindOrAdd(Index);
			Accumulated += 1.f; // caller adds real damage via AddWeakPointDamage if it wants exactness
			if (Accumulated >= WeakPoints[Index].BreakThreshold)
			{
				BrokenWeakPoints.Add(Index);
			}
		}
		break;
	}

	return Multiplier;
}

// ---------------------------------------------------------------- AI director ---------

void AStickmanBossCharacter::NotifyPlayerDied()
{
	++PlayerDeathCount;
	if (PlayerDeathCount >= 3 && !bMercyActive)
	{
		bMercyActive = true; // ease the fight after repeated wipes
	}
}

// ---------------------------------------------------------------- rewards -------------

void AStickmanBossCharacter::HandleDeathRewards()
{
	if (bDeathRewardsGranted)
	{
		return;
	}
	bDeathRewardsGranted = true;

	if (UGameInstance* GI = GetGameInstance())
	{
		if (UBossEncounterSubsystem* Encounters = GI->GetSubsystem<UBossEncounterSubsystem>())
		{
			Encounters->NotifyBossDefeated(BossID, Variant, FirstClearReward, FarmReward);
		}
	}
}
