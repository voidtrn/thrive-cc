#include "System/SessionChronicleSubsystem.h"
#include "System/OpenWorldSaveGame.h"
#include "HAL/PlatformTime.h"
#include "MyGame.h"

void USessionChronicleSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);
	SessionStartSeconds = FPlatformTime::Seconds();
}

float USessionChronicleSubsystem::NowSessionSeconds() const
{
	return static_cast<float>(FPlatformTime::Seconds() - SessionStartSeconds);
}

// ---------- Rekam ----------

void USessionChronicleSubsystem::RecordMoment(FName Type, FName ContextId,
	const FVector& Location, float Intensity)
{
	if (Type.IsNone())
	{
		return;
	}

	FChronicleEntry Entry;
	Entry.Type = Type;
	Entry.ContextId = ContextId;
	Entry.Location = Location;
	Entry.SessionSeconds = NowSessionSeconds();
	Entry.Intensity = FMath::Clamp(Intensity, 0.f, 1.f);
	Entry.RealTime = FDateTime::Now();

	SessionMoments.Add(Entry);
	LifetimeChronicle.Add(Entry);
	PruneLifetime();

	OnMomentRecorded.Broadcast(Entry);
}

void USessionChronicleSubsystem::OpenThread(FName Type, FName ContextId, const FVector& Location)
{
	if (Type.IsNone() || ContextId.IsNone())
	{
		return;
	}

	FChronicleEntry* Existing = OpenThreads.FindByPredicate(
		[&](const FChronicleEntry& T) { return T.ContextId == ContextId; });

	if (Existing)
	{
		// Idempotent: update lokasi + waktu, jangan duplikat thread.
		Existing->Type = Type;
		Existing->Location = Location;
		Existing->SessionSeconds = NowSessionSeconds();
		Existing->RealTime = FDateTime::Now();
		return;
	}

	FChronicleEntry Thread;
	Thread.Type = Type;
	Thread.ContextId = ContextId;
	Thread.Location = Location;
	Thread.SessionSeconds = NowSessionSeconds();
	Thread.Intensity = 0.f; // thread bukan peak — nilai naratifnya di "belum selesai"
	Thread.RealTime = FDateTime::Now();
	OpenThreads.Add(Thread);
}

void USessionChronicleSubsystem::ResolveThread(FName ContextId)
{
	OpenThreads.RemoveAll([&](const FChronicleEntry& T) { return T.ContextId == ContextId; });
}

// ---------- Baca ----------

TArray<FChronicleEntry> USessionChronicleSubsystem::SelectTopMoments(
	const TArray<FChronicleEntry>& Moments, int32 MaxCount)
{
	TArray<FChronicleEntry> Sorted = Moments;
	Sorted.Sort([](const FChronicleEntry& A, const FChronicleEntry& B)
	{
		if (A.Intensity != B.Intensity)
		{
			return A.Intensity > B.Intensity;
		}
		// Seri intensitas → yang lebih baru menang (peak-end bias recency)
		return A.SessionSeconds > B.SessionSeconds;
	});

	if (MaxCount >= 0 && Sorted.Num() > MaxCount)
	{
		Sorted.SetNum(MaxCount);
	}
	return Sorted;
}

FSessionEpilogue USessionChronicleSubsystem::BuildSessionEpilogue() const
{
	FSessionEpilogue Epilogue;
	Epilogue.SessionSeconds = NowSessionSeconds();
	Epilogue.TotalMomentsThisSession = SessionMoments.Num();

	// Peak: top-3 momen paling intens (peak-end rule — FOUNDATIONS §1c)
	Epilogue.PeakMoments = SelectTopMoments(SessionMoments, 3);

	// End: momen terakhir yang tercatat
	if (SessionMoments.Num() > 0)
	{
		Epilogue.FinalMoment = SessionMoments.Last();
	}

	// Cliffhanger: thread terbuka terbaru (Zeigarnik — FOUNDATIONS §1b)
	if (OpenThreads.Num() > 0)
	{
		Epilogue.Cliffhanger = OpenThreads.Last();
		Epilogue.bHasCliffhanger = true;
	}

	return Epilogue;
}

// ---------- Persistence ----------

void USessionChronicleSubsystem::ExportToSave(UOpenWorldSaveGame* Save) const
{
	if (!Save)
	{
		return;
	}
	Save->ChronicleEntries = LifetimeChronicle;
	Save->ChronicleOpenThreads = OpenThreads;
}

void USessionChronicleSubsystem::ImportFromSave(const UOpenWorldSaveGame* Save)
{
	if (!Save)
	{
		return;
	}
	LifetimeChronicle = Save->ChronicleEntries;
	OpenThreads = Save->ChronicleOpenThreads;

	// Save bisa over-cap (cap diturunkan di update, atau file hasil edit) —
	// RecordMoment cuma prune 1 entri per panggilan, jadi trim penuh di sini.
	while (LifetimeChronicle.Num() > MaxLifetimeEntries)
	{
		PruneLifetime();
	}

	// SessionMoments sengaja TIDAK di-restore — epilog selalu tentang sesi
	// berjalan; memoar lama tetap terbaca via GetLifetimeChronicle.
}

void USessionChronicleSubsystem::PruneLifetime()
{
	if (LifetimeChronicle.Num() <= MaxLifetimeEntries)
	{
		return;
	}

	// Buang entri intensitas terendah dulu — memoar menyimpan puncak,
	// bukan filler. Stable terhadap urutan kronologis sisanya.
	int32 LowestIdx = 0;
	for (int32 i = 1; i < LifetimeChronicle.Num(); ++i)
	{
		if (LifetimeChronicle[i].Intensity < LifetimeChronicle[LowestIdx].Intensity)
		{
			LowestIdx = i;
		}
	}
	LifetimeChronicle.RemoveAt(LowestIdx);
}
