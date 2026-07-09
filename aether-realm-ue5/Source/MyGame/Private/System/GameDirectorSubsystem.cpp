#include "System/GameDirectorSubsystem.h"
#include "MyGame.h"

// ---------- Math inti (pure static) ----------

float UGameDirectorSubsystem::DecayedIntensity(float Current, float DeltaTime)
{
	return FMath::Max(0.f, Current - DecayPerSecond * FMath::Max(0.f, DeltaTime));
}

EDirectorPhase UGameDirectorSubsystem::ComputePhaseTransition(
	EDirectorPhase Current, float Intensity, float SecondsInPhase)
{
	switch (Current)
	{
	case EDirectorPhase::BuildUp:
		return Intensity >= PeakEnterThreshold ? EDirectorPhase::Peak : EDirectorPhase::BuildUp;

	case EDirectorPhase::Peak:
		// Hysteresis: keluar Peak baru saat tensi turun jauh (bukan di 70)
		return Intensity <= PeakExitThreshold ? EDirectorPhase::Relax : EDirectorPhase::Peak;

	case EDirectorPhase::Relax:
		// Combat besar bisa memotong jeda; kalau tidak, kembali normal
		if (Intensity >= PeakEnterThreshold)
		{
			return EDirectorPhase::Peak;
		}
		return SecondsInPhase >= RelaxDuration ? EDirectorPhase::BuildUp : EDirectorPhase::Relax;
	}
	return Current;
}

bool UGameDirectorSubsystem::IsAmbushWindowAt(
	EDirectorPhase Phase, float Intensity,
	float SecondsSinceCombat, float SecondsSinceAmbush)
{
	return Phase == EDirectorPhase::BuildUp
		&& Intensity < AmbushMaxIntensity
		&& SecondsSinceCombat >= AmbushQuietSeconds
		&& SecondsSinceAmbush >= AmbushCooldownSeconds;
}

// ---------- Runtime ----------

void UGameDirectorSubsystem::Tick(float DeltaTime)
{
	Intensity = DecayedIntensity(Intensity, DeltaTime);

	const float SecondsInPhase = GetWorld()->GetTimeSeconds() - PhaseStartTime;
	const EDirectorPhase NewPhase = ComputePhaseTransition(Phase, Intensity, SecondsInPhase);
	if (NewPhase != Phase)
	{
		SetPhase(NewPhase);
	}
}

void UGameDirectorSubsystem::AddIntensity(float Delta)
{
	Intensity = FMath::Clamp(Intensity + Delta, 0.f, 100.f);
	LastCombatTime = GetWorld()->GetTimeSeconds();
}

void UGameDirectorSubsystem::SetPhase(EDirectorPhase NewPhase)
{
	const EDirectorPhase OldPhase = Phase;
	Phase = NewPhase;
	PhaseStartTime = GetWorld()->GetTimeSeconds();
	UE_LOG(LogAetherRealm, Verbose, TEXT("Director phase: %d -> %d (intensity %.0f)"),
		(int32)OldPhase, (int32)NewPhase, Intensity);
	OnPhaseChanged.Broadcast(OldPhase, NewPhase);
}

void UGameDirectorSubsystem::ReportPlayerDamage(float NormalizedDamage)
{
	AddIntensity(IntensityPerFullHPDamage * FMath::Clamp(NormalizedDamage, 0.f, 1.f));
}

void UGameDirectorSubsystem::ReportEnemyKilled()
{
	AddIntensity(IntensityPerKill);
}

void UGameDirectorSubsystem::NotifyAmbushSpawned()
{
	LastAmbushTime = GetWorld()->GetTimeSeconds();
}

bool UGameDirectorSubsystem::IsAmbushWindow() const
{
	const double Now = GetWorld()->GetTimeSeconds();
	return IsAmbushWindowAt(Phase, Intensity,
		static_cast<float>(Now - LastCombatTime),
		static_cast<float>(Now - LastAmbushTime));
}
