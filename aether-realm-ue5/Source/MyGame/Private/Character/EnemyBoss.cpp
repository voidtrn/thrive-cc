#include "Character/EnemyBoss.h"
#include "TimerManager.h"
#include "MyGame.h"

AEnemyBoss::AEnemyBoss(const FObjectInitializer& ObjectInitializer)
	: Super(ObjectInitializer)
{
}

void AEnemyBoss::BeginPlay()
{
	Super::BeginPlay(); // AEnemyBase::BeginPlay sudah load stats → ATK = base

	BossBaseATK = ATK;
	OnHealthChanged.AddDynamic(this, &AEnemyBoss::HandleHealthChangedForPhase);
}

int32 AEnemyBoss::ComputePhaseIndex(float HPPercent, const TArray<float>& Thresholds)
{
	// Thresholds diasumsikan terurut menurun (0.7, 0.4, ...). Phase = jumlah
	// threshold yang sudah terlewati (HP% <= threshold).
	int32 Phase = 0;
	for (const float T : Thresholds)
	{
		if (HPPercent <= T)
		{
			++Phase;
		}
		else
		{
			break;
		}
	}
	return Phase;
}

void AEnemyBoss::HandleHealthChangedForPhase(float NewHP, float MaxHPValue)
{
	if (MaxHPValue <= 0.f)
	{
		return;
	}

	const float HPPercent = NewHP / MaxHPValue;
	const int32 TargetPhase = ComputePhaseIndex(HPPercent, PhaseHPThresholds);

	if (TargetPhase > CurrentPhase)
	{
		EnterPhase(TargetPhase);
	}
}

void AEnemyBoss::EnterPhase(int32 NewPhase)
{
	CurrentPhase = NewPhase;

	if (PhaseATKMultipliers.IsValidIndex(NewPhase))
	{
		ATK = BossBaseATK * PhaseATKMultipliers[NewPhase];
	}

	ResetPoise();

	// NOTE: bInvulnerable itu bool tunggal, bukan counter/ref-count. Kalau
	// nanti ada sumber invuln lain yang bisa overlap sama phase-transition ini
	// (mis. player-side i-frame sistem yang somehow nyentuh boss, atau ability
	// lain yang toggle invuln di actor yang sama), EndPhaseInvulnerability bisa
	// clobber invuln dari sumber lain. Saat ini cuma god-mode cheat (player-only)
	// yang share bool ini — risiko rendah, belum perlu di-ref-count.
	SetInvulnerable(true);
	if (GetWorld())
	{
		GetWorldTimerManager().SetTimer(PhaseInvulnTimer, this,
			&AEnemyBoss::EndPhaseInvulnerability, PhaseTransitionInvulnerability, false);
	}

	OnBossPhaseChanged.Broadcast(NewPhase);
}

void AEnemyBoss::EndPhaseInvulnerability()
{
	SetInvulnerable(false);
}
