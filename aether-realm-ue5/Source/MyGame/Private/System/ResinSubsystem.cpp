#include "System/ResinSubsystem.h"
#include "System/AchievementSubsystem.h"
#include "System/OpenWorldGameInstance.h"

UOpenWorldGameInstance* UResinSubsystem::GetOWGameInstance() const
{
	return Cast<UOpenWorldGameInstance>(GetGameInstance());
}

void UResinSubsystem::ComputeRegen(int32 CurrentResin, const FDateTime& LastUpdate, const FDateTime& Now,
	int32& OutResin, FDateTime& OutTimestamp)
{
	// Sudah cap (atau overflow): regen mati, timer pinned ke Now supaya
	// begitu turun di bawah cap hitungan mulai dari nol.
	if (CurrentResin >= ResinCap)
	{
		OutResin = CurrentResin;
		OutTimestamp = Now;
		return;
	}

	// Clock mundur (ubah jam sistem) — jangan kasih resin, pin ulang.
	if (Now <= LastUpdate)
	{
		OutResin = CurrentResin;
		OutTimestamp = (Now < LastUpdate) ? Now : LastUpdate;
		return;
	}

	const int64 ElapsedSeconds = (Now - LastUpdate).GetTotalSeconds();
	const int64 WholeTicks = ElapsedSeconds / RegenSecondsPerResin;
	const int32 Gained = static_cast<int32>(
		FMath::Min<int64>(WholeTicks, ResinCap - CurrentResin));

	OutResin = CurrentResin + Gained;

	if (OutResin >= ResinCap)
	{
		// Baru saja penuh — sisa detik hangus, timer pinned.
		OutTimestamp = Now;
	}
	else
	{
		// Maju hanya sebesar interval utuh — sisa detik tetap dihitung.
		OutTimestamp = LastUpdate + FTimespan::FromSeconds(
			static_cast<double>(WholeTicks * RegenSecondsPerResin));
	}
}

int32 UResinSubsystem::RefreshFromClock()
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI)
	{
		return 0;
	}

	// Save lama tanpa field ini: timestamp 0 → treat sebagai penuh sekarang.
	if (GI->LastResinUpdate.GetTicks() == 0)
	{
		GI->Resin = ResinCap;
		GI->LastResinUpdate = FDateTime::UtcNow();
		return GI->Resin;
	}

	int32 NewResin;
	FDateTime NewStamp;
	ComputeRegen(GI->Resin, GI->LastResinUpdate, FDateTime::UtcNow(), NewResin, NewStamp);

	if (NewResin != GI->Resin)
	{
		GI->Resin = NewResin;
		OnResinChanged.Broadcast(NewResin);
	}
	GI->LastResinUpdate = NewStamp;
	return GI->Resin;
}

int32 UResinSubsystem::GetResin()
{
	return RefreshFromClock();
}

bool UResinSubsystem::SpendResin(int32 Amount)
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI || Amount <= 0)
	{
		return false;
	}

	const int32 Current = RefreshFromClock();
	if (Current < Amount)
	{
		return false;
	}

	// Turun dari cap → regen mulai sekarang (timestamp sudah pinned Now
	// oleh ComputeRegen selama berada di cap).
	GI->Resin = Current - Amount;
	OnResinChanged.Broadcast(GI->Resin);

	if (UAchievementSubsystem* Achievements = GI->GetSubsystem<UAchievementSubsystem>())
	{
		Achievements->ReportStat(TEXT("Stat_ResinSpent"), Amount);
	}

	GI->AutoSave();
	return true;
}

void UResinSubsystem::AddResin(int32 Amount)
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI || Amount <= 0)
	{
		return;
	}

	const int32 Current = RefreshFromClock();
	GI->Resin = FMath::Min(Current + Amount, HardOverflowCap);
	OnResinChanged.Broadcast(GI->Resin);
}

int32 UResinSubsystem::SecondsUntilNextResin()
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	if (!GI || RefreshFromClock() >= ResinCap)
	{
		return 0;
	}

	const int64 Elapsed = (FDateTime::UtcNow() - GI->LastResinUpdate).GetTotalSeconds();
	return static_cast<int32>(FMath::Max<int64>(0, RegenSecondsPerResin - Elapsed));
}

int32 UResinSubsystem::SecondsUntilFull()
{
	UOpenWorldGameInstance* GI = GetOWGameInstance();
	const int32 Current = RefreshFromClock();
	if (!GI || Current >= ResinCap)
	{
		return 0;
	}

	const int32 Missing = ResinCap - Current;
	return (Missing - 1) * RegenSecondsPerResin + SecondsUntilNextResin();
}
