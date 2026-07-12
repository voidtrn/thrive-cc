// Copyright StickmanImpact Project.

#include "PerformanceManager.h"
#include "VFX/VFXManager.h"
#include "World/StickmanLODComponent.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "GameFramework/GameUserSettings.h"
#include "HAL/IConsoleManager.h"
#include "HAL/PlatformMemory.h"
#include "Engine/Engine.h"
#include "EngineUtils.h"

void UPerformanceManager::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);

	if (const UGameUserSettings* Settings = GEngine ? GEngine->GetGameUserSettings() : nullptr)
	{
		UserBaseQualityLevel = Settings->GetOverallScalabilityLevel();
	}

	IConsoleManager& ConsoleManager = IConsoleManager::Get();
	RegisteredCommands.Add(ConsoleManager.RegisterConsoleCommand(TEXT("Stickman.ShowFPS"),
		TEXT("Toggle on-screen FPS/frame-time readout."),
		FConsoleCommandDelegate::CreateUObject(this, &UPerformanceManager::ToggleShowFPS), ECVF_Default));
	RegisteredCommands.Add(ConsoleManager.RegisterConsoleCommand(TEXT("Stickman.ShowMemory"),
		TEXT("Toggle on-screen memory readout."),
		FConsoleCommandDelegate::CreateUObject(this, &UPerformanceManager::ToggleShowMemory), ECVF_Default));
	RegisteredCommands.Add(ConsoleManager.RegisterConsoleCommand(TEXT("Stickman.ProfileCombat"),
		TEXT("Log a combat performance snapshot."),
		FConsoleCommandDelegate::CreateUObject(this, &UPerformanceManager::ProfileCombat), ECVF_Default));
	RegisteredCommands.Add(ConsoleManager.RegisterConsoleCommand(TEXT("Stickman.ToggleLOD"),
		TEXT("Force stickman LOD components to max detail / back to automatic."),
		FConsoleCommandDelegate::CreateUObject(this, &UPerformanceManager::ToggleForceLOD), ECVF_Default));
}

void UPerformanceManager::Deinitialize()
{
	for (IConsoleCommand* Command : RegisteredCommands)
	{
		if (Command)
		{
			IConsoleManager::Get().UnregisterConsoleObject(Command);
		}
	}
	RegisteredCommands.Reset();
	Super::Deinitialize();
}

void UPerformanceManager::Tick(float DeltaTime)
{
	if (DeltaTime <= 0.f)
	{
		return;
	}

	// Exponential smoothing keeps the readout/decisions stable across frame spikes.
	const float InstantFPS = 1.f / DeltaTime;
	SmoothedFPS = FMath::FInterpTo(SmoothedFPS, InstantFPS, DeltaTime, 2.f);

	if (bDynamicQualityEnabled)
	{
		UpdateDynamicQuality(DeltaTime);
	}
	if (bShowFPS || bShowMemory)
	{
		DrawDebugReadouts();
	}
}

void UPerformanceManager::UpdateDynamicQuality(float DeltaTime)
{
	UGameUserSettings* Settings = GEngine ? GEngine->GetGameUserSettings() : nullptr;
	if (!Settings)
	{
		return;
	}

	if (SmoothedFPS < TargetFPS)
	{
		BelowTargetSeconds += DeltaTime;
		AboveTargetSeconds = 0.f;
	}
	else if (SmoothedFPS > TargetFPS * 1.25f) // Recovery needs real headroom, not 31 FPS.
	{
		AboveTargetSeconds += DeltaTime;
		BelowTargetSeconds = 0.f;
	}

	if (BelowTargetSeconds >= DowngradeGraceSeconds && AutoStepsDown < MaxAutoStepsDown)
	{
		++AutoStepsDown;
		BelowTargetSeconds = 0.f;
		const int32 NewLevel = FMath::Max(UserBaseQualityLevel - AutoStepsDown, 0);
		Settings->SetOverallScalabilityLevel(NewLevel);
		Settings->ApplySettings(false);
		UVFXManager::SetVFXQuality(static_cast<EVFXQuality>(FMath::Clamp(NewLevel, 0, 3)));
		UE_LOG(LogTemp, Warning, TEXT("[Performance] FPS %.0f < target %.0f — quality auto-stepped down to %d."),
			SmoothedFPS, TargetFPS, NewLevel);
	}
	else if (AboveTargetSeconds >= UpgradeGraceSeconds && AutoStepsDown > 0)
	{
		--AutoStepsDown;
		AboveTargetSeconds = 0.f;
		const int32 NewLevel = FMath::Max(UserBaseQualityLevel - AutoStepsDown, 0);
		Settings->SetOverallScalabilityLevel(NewLevel);
		Settings->ApplySettings(false);
		UVFXManager::SetVFXQuality(static_cast<EVFXQuality>(FMath::Clamp(NewLevel, 0, 3)));
		UE_LOG(LogTemp, Log, TEXT("[Performance] Sustained headroom — quality recovered to %d."), NewLevel);
	}
}

void UPerformanceManager::DrawDebugReadouts() const
{
	if (!GEngine)
	{
		return;
	}

	if (bShowFPS)
	{
		const float FrameMs = SmoothedFPS > 0.f ? 1000.f / SmoothedFPS : 0.f;
		const FColor Color = SmoothedFPS >= TargetFPS ? FColor::Green : FColor::Red;
		GEngine->AddOnScreenDebugMessage(9001, 0.f, Color,
			FString::Printf(TEXT("FPS: %.0f (%.1f ms) | target %.0f | auto quality -%d"),
				SmoothedFPS, FrameMs, TargetFPS, AutoStepsDown));
	}
	if (bShowMemory)
	{
		const FPlatformMemoryStats MemoryStats = FPlatformMemory::GetStats();
		GEngine->AddOnScreenDebugMessage(9002, 0.f, FColor::Cyan,
			FString::Printf(TEXT("Mem: %.0f MB used / %.0f MB peak / %.0f MB available"),
				MemoryStats.UsedPhysical / (1024.f * 1024.f),
				MemoryStats.PeakUsedPhysical / (1024.f * 1024.f),
				MemoryStats.AvailablePhysical / (1024.f * 1024.f)));
	}
}

void UPerformanceManager::ToggleShowFPS()
{
	bShowFPS = !bShowFPS;
}

void UPerformanceManager::ToggleShowMemory()
{
	bShowMemory = !bShowMemory;
}

void UPerformanceManager::ProfileCombat()
{
	UWorld* World = GetWorld();
	if (!World)
	{
		return;
	}

	int32 EnemyCount = 0, EnemiesInCombat = 0;
	for (TActorIterator<AStickmanEnemyCharacter> It(World); It; ++It)
	{
		++EnemyCount;
		if (It->GetCombatState() == EEnemyCombatState::Combat)
		{
			++EnemiesInCombat;
		}
	}

	UE_LOG(LogTemp, Display, TEXT("[ProfileCombat] FPS %.0f | enemies %d (in combat %d)"),
		SmoothedFPS, EnemyCount, EnemiesInCombat);
	UE_LOG(LogTemp, Display, TEXT("[ProfileCombat] Deep profiling: `stat unit` (thread times), `stat game` (tick"
		" breakdown), `stat gpu`, `stat Niagara`, or capture with Unreal Insights (-trace=cpu,gpu,frame)."));
}

void UPerformanceManager::ToggleForceLOD()
{
	bForceMaxLOD = !bForceMaxLOD;
	UWorld* World = GetWorld();
	if (!World)
	{
		return;
	}

	int32 Affected = 0;
	for (TActorIterator<AActor> It(World); It; ++It)
	{
		if (UStickmanLODComponent* LODComponent = It->FindComponentByClass<UStickmanLODComponent>())
		{
			// Forcing max detail = pushing the LOD thresholds out of reach; restoring uses defaults.
			LODComponent->LOD2StartDistance = bForceMaxLOD ? FLT_MAX : 8000.f;
			LODComponent->LOD3StartDistance = bForceMaxLOD ? FLT_MAX : 20000.f;
			++Affected;
		}
	}
	UE_LOG(LogTemp, Display, TEXT("[ToggleLOD] %s max detail on %d stickman LOD component(s)."),
		bForceMaxLOD ? TEXT("Forced") : TEXT("Restored automatic"), Affected);
}
