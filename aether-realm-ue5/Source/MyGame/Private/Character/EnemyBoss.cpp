#include "Character/EnemyBoss.h"
#include "System/PacingDirectorSubsystem.h"
#include "System/SessionChronicleSubsystem.h"
#include "TimerManager.h"
#include "MyGame.h"

namespace
{
	USessionChronicleSubsystem* GetChronicle(const UWorld* World)
	{
		const UGameInstance* GI = World ? World->GetGameInstance() : nullptr;
		return GI ? GI->GetSubsystem<USessionChronicleSubsystem>() : nullptr;
	}
}

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

	// Pacing director: boss phase saat Peak = momen highlight (clip-worthy)
	if (UPacingDirectorSubsystem* Pacing = GetWorld()->GetSubsystem<UPacingDirectorSubsystem>())
	{
		Pacing->ReportBossPhaseChanged(NewPhase, GetActorLocation());
	}

	// Chronicle: boss sudah dilawan (phase pertama tercapai) tapi belum
	// tumbang = thread Zeigarnik terbuka. Kalau pemain kabur/mati, epilog
	// sesi menutup dengan cliffhanger boss ini (FOUNDATIONS §1b).
	if (HasAuthority() && NewPhase == 1)
	{
		if (USessionChronicleSubsystem* Chronicle = GetChronicle(GetWorld()))
		{
			const FName BossId = !StatsRowName.IsNone() ? StatsRowName : CharacterID;
			Chronicle->OpenThread(TEXT("BossUnfinished"), BossId, GetActorLocation());
		}
	}
}

void AEnemyBoss::HandleDeath()
{
	// Sebelum Super (yang lapor kill ke pacing director): tutup thread +
	// catat kemenangan sebagai momen intensitas penuh.
	if (HasAuthority())
	{
		if (USessionChronicleSubsystem* Chronicle = GetChronicle(GetWorld()))
		{
			const FName BossId = !StatsRowName.IsNone() ? StatsRowName : CharacterID;
			Chronicle->ResolveThread(BossId);
			Chronicle->RecordMoment(TEXT("BossSlain"), BossId, GetActorLocation(), 1.f);
		}
	}

	Super::HandleDeath();
}

void AEnemyBoss::EndPhaseInvulnerability()
{
	SetInvulnerable(false);
}
