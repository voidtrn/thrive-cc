#include "System/PacingDirectorSubsystem.h"
#include "System/MusicManagerSubsystem.h"
#include "System/SessionChronicleSubsystem.h"
#include "Character/CharacterBase.h"
#include "GameFramework/PlayerController.h"
#include "TimerManager.h"
#include "MyGame.h"

void UPacingDirectorSubsystem::OnWorldBeginPlay(UWorld& InWorld)
{
	Super::OnWorldBeginPlay(InWorld);

	InWorld.GetTimerManager().SetTimer(UpdateTimer, this,
		&UPacingDirectorSubsystem::Update, UpdateInterval, /*bLoop=*/true);
}

float UPacingDirectorSubsystem::ComputeStress(float HPFraction, float RecentDamage01,
	float RecentKills01, int32 AggroCount)
{
	// Bobot: HP rendah paling menentukan, lalu damage baru, lalu jumlah aggro.
	// Kill rate mengurangi — pemain yang membantai cepat tidak sedang stress,
	// walau HP sempat turun.
	const float HPTerm = 0.45f * (1.f - FMath::Clamp(HPFraction, 0.f, 1.f));
	const float DamageTerm = 0.35f * FMath::Clamp(RecentDamage01, 0.f, 1.f);
	const float AggroTerm = 0.20f * FMath::Clamp(AggroCount / 5.f, 0.f, 1.f);
	const float KillRelief = 0.25f * FMath::Clamp(RecentKills01, 0.f, 1.f);

	return FMath::Clamp(HPTerm + DamageTerm + AggroTerm - KillRelief, 0.f, 1.f);
}

float UPacingDirectorSubsystem::GetPlayerHPFraction() const
{
	// HP terendah di antara semua pemain — co-op: satu anggota party sekarat
	// harus terhitung stress walau host masih sehat (mercy loot & relax buat
	// yang paling kesulitan, bukan cuma player 0).
	float Lowest = 1.f;
	for (FConstPlayerControllerIterator It = GetWorld()->GetPlayerControllerIterator(); It; ++It)
	{
		const APlayerController* PC = It->Get();
		const ACharacterBase* Character = PC ? Cast<ACharacterBase>(PC->GetPawn()) : nullptr;
		if (Character && Character->MaxHP > 0.f)
		{
			Lowest = FMath::Min(Lowest, Character->CurrentHP / Character->MaxHP);
		}
	}
	return Lowest;
}

void UPacingDirectorSubsystem::Update()
{
	// Decay moving window
	RecentDamage = FMath::Max(0.f, RecentDamage - DamageDecayPerSecond * UpdateInterval);
	RecentKills = FMath::Max(0.f, RecentKills - KillDecayPerSecond * UpdateInterval);

	CurrentStress = ComputeStress(GetPlayerHPFraction(), RecentDamage,
		FMath::Clamp(RecentKills / 3.f, 0.f, 1.f), AggroCount);

	// Akumulasi kesulitan buat mercy loot (naik saat stress tinggi, decay saat aman)
	if (CurrentStress > 0.7f)
	{
		StressedSeconds += UpdateInterval;
	}
	else if (CurrentStress < 0.4f)
	{
		StressedSeconds = FMath::Max(0.f, StressedSeconds - UpdateInterval * 2.f);
	}

	// State machine (ritme build-up → peak → relax)
	StateTimer += UpdateInterval;
	switch (State)
	{
	case EPacingState::BuildUp:
		HighStressHold = CurrentStress > PeakEntryThreshold ? HighStressHold + UpdateInterval : 0.f;
		if (HighStressHold >= PeakEntryHoldSeconds)
		{
			SetState(EPacingState::Peak);
		}
		break;

	case EPacingState::Peak:
		if (StateTimer >= PeakDurationSeconds || CurrentStress < PeakEarlyExitStress)
		{
			SetState(EPacingState::Relax);
		}
		break;

	case EPacingState::Relax:
		if (StateTimer >= RelaxDurationSeconds)
		{
			SetState(EPacingState::BuildUp);
		}
		break;
	}

	// Musik ikut kurva stress otomatis
	if (UMusicManagerSubsystem* Music = GetWorld()->GetSubsystem<UMusicManagerSubsystem>())
	{
		Music->SetCombatIntensity(CurrentStress);
	}
}

void UPacingDirectorSubsystem::SetState(EPacingState NewState)
{
	if (State == NewState)
	{
		return;
	}
	State = NewState;
	StateTimer = 0.f;
	HighStressHold = 0.f;
	OnPacingStateChanged.Broadcast(NewState);
}

// ---------- Input ----------

void UPacingDirectorSubsystem::ReportPlayerDamaged(float DamageFraction)
{
	RecentDamage = FMath::Min(1.f, RecentDamage + FMath::Max(0.f, DamageFraction));
}

void UPacingDirectorSubsystem::ReportEnemyKilled(const FVector& Location)
{
	RecentKills += 1.f;

	// Clutch kill: bunuh musuh saat HP sendiri kritis = momen clip-worthy.
	if (GetPlayerHPFraction() < ClutchHPThreshold)
	{
		EmitHighlight(TEXT("ClutchKill"), Location, 0.9f);
	}
}

void UPacingDirectorSubsystem::ReportEnemyAggro(int32 Delta)
{
	AggroCount = FMath::Max(0, AggroCount + Delta);
}

void UPacingDirectorSubsystem::ReportChainReaction(int32 ChainLength, const FVector& Location)
{
	if (ChainLength >= 3 && State == EPacingState::Peak)
	{
		EmitHighlight(TEXT("ChainReaction"), Location, 0.7f);
	}
}

void UPacingDirectorSubsystem::ReportBossPhaseChanged(int32 NewPhase, const FVector& Location)
{
	if (State == EPacingState::Peak)
	{
		EmitHighlight(TEXT("BossPhase"), Location, 0.8f);
	}
}

void UPacingDirectorSubsystem::EmitHighlight(FName Reason, const FVector& Location, float Intensity)
{
	// Broadcast presentasi (slow-mo/sting BP) boleh di semua mesin...
	OnHighlightMoment.Broadcast(Reason, Location);

	// ...tapi penulisan memoar hanya di server/host — konsisten dengan gate
	// HasAuthority di penulis chronicle lain (BossUnfinished/BossSlain/Fallen).
	// Tanpa ini, ReportChainReaction dari BP client (atau EnterPhase yang
	// memang jalan di client via OnRep) bisa mem-persist entri dari state
	// pacing lokal non-authoritative.
	if (GetWorld()->GetNetMode() == NM_Client)
	{
		return;
	}

	if (const UGameInstance* GI = GetWorld()->GetGameInstance())
	{
		if (USessionChronicleSubsystem* Chronicle = GI->GetSubsystem<USessionChronicleSubsystem>())
		{
			Chronicle->RecordMoment(Reason, NAME_None, Location, Intensity);
		}
	}
}

// ---------- Output ----------

float UPacingDirectorSubsystem::GetSpawnBudgetMultiplier() const
{
	switch (State)
	{
	case EPacingState::Relax: return 0.5f;
	case EPacingState::Peak:  return 1.5f;
	default:                  return 1.f;
	}
}

float UPacingDirectorSubsystem::GetLootBonusMultiplier() const
{
	// 60 detik kesulitan beruntun = +50% loot (cap). Rubber-band L4D2:
	// pemain yang babak belur dapat bantuan, bukan hukuman.
	return 1.f + FMath::Min(StressedSeconds / 60.f, 0.5f);
}

float UPacingDirectorSubsystem::GetEnemyAggressionMultiplier() const
{
	switch (State)
	{
	case EPacingState::Relax: return 0.7f;
	case EPacingState::Peak:  return 1.3f;
	default:                  return 1.f;
	}
}
