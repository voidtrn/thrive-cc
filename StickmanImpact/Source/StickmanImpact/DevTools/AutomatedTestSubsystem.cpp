// Copyright StickmanImpact Project.

#include "AutomatedTestSubsystem.h"
#include "DevConsoleSubsystem.h"
#include "Character/StickmanCharacter.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "World/EnemySpawner.h"
#include "SaveSystem/SaveManager.h"
#include "AbilitySystemComponent.h"
#include "Kismet/GameplayStatics.h"
#include "EngineUtils.h"
#include "TimerManager.h"

void UAutomatedTestSubsystem::ReportToConsole(const FString& Text) const
{
	if (UDevConsoleSubsystem* Console = GetGameInstance()->GetSubsystem<UDevConsoleSubsystem>())
	{
		Console->Log(Text, EDevCommandCategory::Test);
	}
	UE_LOG(LogTemp, Display, TEXT("[Test] %s"), *Text);
}

AStickmanCharacter* UAutomatedTestSubsystem::GetPlayerCharacter() const
{
	return Cast<AStickmanCharacter>(UGameplayStatics::GetPlayerPawn(GetGameInstance(), 0));
}

// ------------------------------------------------------------------- tick fan-out -----

void UAutomatedTestSubsystem::Tick(float DeltaTime)
{
	// --- Benchmark sampling ---
	if (bBenchmarking)
	{
		FrameTimes.Add(DeltaTime);
		BenchmarkRemaining -= DeltaTime;
		if (BenchmarkRemaining <= 0.f)
		{
			FinishBenchmark();
		}
	}

	// --- Combat scenario watch ---
	if (bCombatRunning)
	{
		bool bAnyAlive = false;
		for (const TWeakObjectPtr<AStickmanEnemyCharacter>& Enemy : CombatEnemies)
		{
			if (Enemy.IsValid())
			{
				bAnyAlive = true;
				break;
			}
		}
		if (!bAnyAlive)
		{
			bCombatRunning = false;
			const double Elapsed = FPlatformTime::Seconds() - CombatStartTime;
			ReportToConsole(FString::Printf(TEXT("Combat scenario CLEARED: %d enemies in %.1fs (%.1fs/enemy)."),
				CombatEnemies.Num(), Elapsed, Elapsed / FMath::Max(CombatEnemies.Num(), 1)));
			CombatEnemies.Empty();
		}
	}

	// --- Recording (20 Hz) ---
	if (bRecording)
	{
		RecordClock += DeltaTime;
		RecordSampleAccumulator += DeltaTime;
		if (RecordSampleAccumulator >= 0.05f)
		{
			RecordSampleAccumulator = 0.f;
			if (const AStickmanCharacter* Player = GetPlayerCharacter())
			{
				FRecordedFrame Frame;
				Frame.Time = RecordClock;
				Frame.Location = Player->GetActorLocation();
				Frame.Rotation = Player->GetActorRotation();
				Recording.Add(Frame);
			}
		}
	}

	// --- Playback (interpolated transform replay) ---
	if (bPlayingBack)
	{
		AStickmanCharacter* Player = GetPlayerCharacter();
		if (!Player || Recording.Num() == 0)
		{
			bPlayingBack = false;
			return;
		}

		PlaybackClock += DeltaTime;
		while (PlaybackIndex + 1 < Recording.Num() && Recording[PlaybackIndex + 1].Time <= PlaybackClock)
		{
			++PlaybackIndex;
		}

		if (PlaybackIndex + 1 >= Recording.Num())
		{
			Player->SetActorLocationAndRotation(Recording.Last().Location, Recording.Last().Rotation);
			bPlayingBack = false;
			ReportToConsole(TEXT("Playback finished."));
			return;
		}

		const FRecordedFrame& A = Recording[PlaybackIndex];
		const FRecordedFrame& B = Recording[PlaybackIndex + 1];
		const float SegmentAlpha = FMath::Clamp((PlaybackClock - A.Time) / FMath::Max(B.Time - A.Time, KINDA_SMALL_NUMBER), 0.f, 1.f);
		Player->SetActorLocationAndRotation(FMath::Lerp(A.Location, B.Location, SegmentAlpha),
			FMath::Lerp(A.Rotation, B.Rotation, SegmentAlpha));
	}
}

// ------------------------------------------------------------------- benchmark --------

void UAutomatedTestSubsystem::StartBenchmark(float Seconds)
{
	if (bBenchmarking)
	{
		return;
	}
	bBenchmarking = true;
	BenchmarkRemaining = FMath::Clamp(Seconds, 5.f, 300.f);
	FrameTimes.Empty(int32(BenchmarkRemaining * 120.f));
	ReportToConsole(FString::Printf(TEXT("Benchmark started (%.0fs)..."), BenchmarkRemaining));
}

void UAutomatedTestSubsystem::FinishBenchmark()
{
	bBenchmarking = false;
	if (FrameTimes.Num() == 0)
	{
		return;
	}

	float Total = 0.f;
	int32 Hitches = 0;
	for (float FrameTime : FrameTimes)
	{
		Total += FrameTime;
		if (FrameTime > 0.05f) { ++Hitches; }
	}

	TArray<float> Sorted = FrameTimes;
	Sorted.Sort(); // Ascending frame time; the tail is the slow 1%.
	const float AvgFPS = FrameTimes.Num() / Total;
	const float WorstFrame = Sorted.Last();
	const float OnePercentLowFPS = 1.f / Sorted[FMath::Min(int32(Sorted.Num() * 0.99f), Sorted.Num() - 1)];

	ReportToConsole(FString::Printf(
		TEXT("Benchmark: %d frames | avg %.1f FPS | 1%%-low %.1f FPS | worst %.1fms | hitches(>50ms) %d"),
		FrameTimes.Num(), AvgFPS, OnePercentLowFPS, WorstFrame * 1000.f, Hitches));
	FrameTimes.Empty();
}

// ------------------------------------------------------------------- combat scenario --

void UAutomatedTestSubsystem::StartCombatScenario(int32 EnemyCount)
{
	AStickmanCharacter* Player = GetPlayerCharacter();
	UWorld* World = GetGameInstance()->GetWorld();
	if (!Player || !World || bCombatRunning)
	{
		return;
	}

	TSubclassOf<AStickmanEnemyCharacter> EnemyClass = TestEnemyClass;
	if (!EnemyClass)
	{
		// Borrow the nearest spawner's pool so the test uses real, level-appropriate enemies.
		for (TActorIterator<AEnemySpawner> It(World); It; ++It)
		{
			if (It->SpawnPool.Num() > 0)
			{
				EnemyClass = It->SpawnPool[0].EnemyClass;
				break;
			}
		}
	}
	if (!EnemyClass)
	{
		ReportToConsole(TEXT("No TestEnemyClass set and no spawner pool found — aborting."));
		return;
	}

	CombatEnemies.Empty();
	EnemyCount = FMath::Clamp(EnemyCount, 1, 20);
	for (int32 Index = 0; Index < EnemyCount; ++Index)
	{
		const float Angle = (2.f * PI / EnemyCount) * Index;
		const FVector SpawnAt = Player->GetActorLocation() +
			FVector(FMath::Cos(Angle), FMath::Sin(Angle), 0.f) * 600.f + FVector(0, 0, 50.f);
		FActorSpawnParameters Params;
		Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AdjustIfPossibleButAlwaysSpawn;
		if (AStickmanEnemyCharacter* Enemy = World->SpawnActor<AStickmanEnemyCharacter>(EnemyClass, SpawnAt, FRotator::ZeroRotator, Params))
		{
			CombatEnemies.Add(Enemy);
		}
	}

	bCombatRunning = CombatEnemies.Num() > 0;
	CombatStartTime = FPlatformTime::Seconds();
	ReportToConsole(FString::Printf(TEXT("Combat scenario: %d enemies spawned. Clear them — timer running."),
		CombatEnemies.Num()));
}

// ------------------------------------------------------------------- save integrity ---

void UAutomatedTestSubsystem::RunSaveIntegrityTest(int32 SlotIndex)
{
	USaveManager* Saves = GetGameInstance()->GetSubsystem<USaveManager>();
	if (!Saves)
	{
		return;
	}

	SlotIndex = FMath::Clamp(SlotIndex, 0, USaveManager::NumSlots - 1);
	ReportToConsole(FString::Printf(TEXT("Save integrity test on slot %d..."), SlotIndex));

	const bool bSaved = Saves->SaveToSlot(SlotIndex);
	// LoadFromSlot re-reads the file through the CRC32 + version + zlib pipeline — a pass
	// here proves the bytes we just wrote survive the full decode path.
	const bool bLoaded = bSaved && Saves->LoadFromSlot(SlotIndex);
	const bool bResaved = bLoaded && Saves->SaveToSlot(SlotIndex);

	if (bSaved && bLoaded && bResaved)
	{
		ReportToConsole(TEXT("Save integrity PASS (write -> CRC-verified read -> re-write)."));
	}
	else
	{
		ReportToConsole(FString::Printf(TEXT("Save integrity FAIL: save=%d load=%d resave=%d"),
			bSaved, bLoaded, bResaved));
	}
}

// ------------------------------------------------------------------- all skills -------

void UAutomatedTestSubsystem::RunAllSkillsTest()
{
	const AStickmanCharacter* Player = GetPlayerCharacter();
	UAbilitySystemComponent* ASC = Player ? Player->GetStickmanAbilitySystemComponent() : nullptr;
	if (!ASC)
	{
		ReportToConsole(TEXT("No player ASC — aborting."));
		return;
	}

	PendingSkillHandles.Empty();
	for (const FGameplayAbilitySpec& Spec : ASC->GetActivatableAbilities())
	{
		PendingSkillHandles.Add(Spec.Handle);
	}
	SkillsActivated = 0;
	SkillsFailed = 0;

	ReportToConsole(FString::Printf(TEXT("All-skills test: %d abilities queued (tip: run infenergy + nocooldown first)."),
		PendingSkillHandles.Num()));
	ActivateNextSkill();
}

void UAutomatedTestSubsystem::ActivateNextSkill()
{
	const AStickmanCharacter* Player = GetPlayerCharacter();
	UAbilitySystemComponent* ASC = Player ? Player->GetStickmanAbilitySystemComponent() : nullptr;

	if (!ASC || PendingSkillHandles.Num() == 0)
	{
		ReportToConsole(FString::Printf(TEXT("All-skills test done: %d activated, %d failed."),
			SkillsActivated, SkillsFailed));
		return;
	}

	const FGameplayAbilitySpecHandle Handle = PendingSkillHandles.Pop();
	if (ASC->TryActivateAbility(Handle))
	{
		++SkillsActivated;
	}
	else
	{
		++SkillsFailed;
		if (const FGameplayAbilitySpec* Spec = ASC->FindAbilitySpecFromHandle(Handle))
		{
			ReportToConsole(FString::Printf(TEXT("  FAILED: %s"), *GetNameSafe(Spec->Ability)));
		}
	}

	GetGameInstance()->GetWorld()->GetTimerManager().SetTimer(SkillTestTimerHandle, this,
		&UAutomatedTestSubsystem::ActivateNextSkill, 1.2f, false);
}

// ------------------------------------------------------------------- record/playback --

void UAutomatedTestSubsystem::ToggleRecording()
{
	if (bPlayingBack)
	{
		ReportToConsole(TEXT("Can't record during playback."));
		return;
	}

	bRecording = !bRecording;
	if (bRecording)
	{
		Recording.Empty();
		RecordClock = 0.f;
		RecordSampleAccumulator = 0.f;
		ReportToConsole(TEXT("Recording... ('test.record' again to stop)"));
	}
	else
	{
		ReportToConsole(FString::Printf(TEXT("Recording stopped: %d samples over %.1fs."),
			Recording.Num(), RecordClock));
	}
}

void UAutomatedTestSubsystem::StartPlayback()
{
	if (bRecording || Recording.Num() == 0)
	{
		ReportToConsole(bRecording ? TEXT("Stop recording first.") : TEXT("Nothing recorded."));
		return;
	}

	if (AStickmanCharacter* Player = GetPlayerCharacter())
	{
		Player->SetActorLocationAndRotation(Recording[0].Location, Recording[0].Rotation);
	}
	PlaybackClock = 0.f;
	PlaybackIndex = 0;
	bPlayingBack = true;
	ReportToConsole(FString::Printf(TEXT("Playing back %d samples (transform replay)."), Recording.Num()));
}
