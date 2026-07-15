// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Tickable.h"
#include "PerformanceManager.generated.h"

/**
 * FPS tracking + dynamic quality scaling + debug console commands.
 *
 * Dynamic quality: when average FPS stays below TargetFPS for DowngradeGraceSeconds, drops
 * one overall scalability level (and VFX quality with it); recovers one level after sustained
 * headroom. Clamped so it never fights a user-chosen quality more than MaxAutoStepsDown below
 * their setting.
 *
 * Budgets (CPU 33ms / GPU 33ms = 30 FPS floor): monitored via the frame/game/RHI thread times
 * the engine already tracks; exceeding logs a category breakdown hint. Real per-category
 * profiling = `stat unit`, `stat game`, `stat gpu`, Unreal Insights — this subsystem points at
 * them rather than reimplementing profilers.
 *
 * Console commands:
 *   Stickman.ShowFPS        — on-screen FPS + frame-time readout toggle
 *   Stickman.ShowMemory     — on-screen memory readout toggle
 *   Stickman.ProfileCombat  — logs a combat-relevant snapshot (active enemies, VFX pools,
 *                             reaction-manager tracked actors) + reminds which stat commands
 *                             to use for deep profiling
 *   Stickman.ToggleLOD      — forces all UStickmanLODComponents to max detail / back to auto
 */
UCLASS()
class STICKMANIMPACT_API UPerformanceManager : public UGameInstanceSubsystem, public FTickableGameObject
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;
	virtual void Deinitialize() override;

	// FTickableGameObject
	virtual void Tick(float DeltaTime) override;
	virtual TStatId GetStatId() const override { RETURN_QUICK_DECLARE_CYCLE_STAT(UPerformanceManager, STATGROUP_Tickables); }
	virtual bool IsTickableWhenPaused() const override { return true; }

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Performance")
	float TargetFPS = 30.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Performance")
	bool bDynamicQualityEnabled = true;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Performance")
	float DowngradeGraceSeconds = 5.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Performance")
	float UpgradeGraceSeconds = 30.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Performance")
	int32 MaxAutoStepsDown = 2;

	UFUNCTION(BlueprintPure, Category = "Performance")
	float GetAverageFPS() const { return SmoothedFPS; }

private:
	void UpdateDynamicQuality(float DeltaTime);
	void DrawDebugReadouts() const;

	void ToggleShowFPS();
	void ToggleShowMemory();
	void ProfileCombat();
	void ToggleForceLOD();

	float SmoothedFPS = 60.f;
	float BelowTargetSeconds = 0.f;
	float AboveTargetSeconds = 0.f;
	int32 AutoStepsDown = 0;
	int32 UserBaseQualityLevel = 3;

	bool bShowFPS = false;
	bool bShowMemory = false;
	bool bForceMaxLOD = false;

	TArray<struct IConsoleCommand*> RegisteredCommands;
};
