// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Tickable.h"
#include "GameplayAbilitySpecHandle.h"
#include "AutomatedTestSubsystem.generated.h"

/** One recorded movement sample (20 Hz). */
USTRUCT()
struct FRecordedFrame
{
	GENERATED_BODY()

	UPROPERTY() float Time = 0.f;
	UPROPERTY() FVector Location = FVector::ZeroVector;
	UPROPERTY() FRotator Rotation = FRotator::ZeroRotator;
};

/**
 * Console-driven test harness (drive it via UDevConsoleSubsystem's test.* commands; all
 * results report into the console log).
 *
 * - Benchmark: samples frame times for N seconds -> avg/min FPS, 1%-low, hitch count
 *   (>50ms frames). Run it along a repeatable route for regression numbers.
 * - Combat scenario: spawns a wave around the player (TestEnemyClass, or the nearest
 *   spawner's pick if unset) and times the clear -> rough end-to-end damage-pipeline test.
 * - Save integrity: SaveToSlot -> LoadFromSlot (CRC verified inside the read path) ->
 *   re-save. Any stage failing = the save pipeline broke.
 * - All-skills: activates every ability granted to the player's ASC, 1.2s apart, and
 *   reports which activated vs. failed (cooldown/energy cheats help — run 'infenergy
 *   nocooldown' first).
 * - Record/playback: 20 Hz transform recording of the player, replayed by interpolated
 *   SetActorLocationAndRotation. Honest scope: this is TRANSFORM replay (camera routes,
 *   soak paths, screenshot runs) — true input-level replay needs Enhanced Input injection
 *   (IEnhancedInputSubsystemInterface::InjectInputForAction) or the engine's Gauntlet/
 *   functional-testing framework, which is the right tool once tests need button presses.
 */
UCLASS()
class STICKMANIMPACT_API UAutomatedTestSubsystem : public UGameInstanceSubsystem, public FTickableGameObject
{
	GENERATED_BODY()

public:
	// FTickableGameObject
	virtual void Tick(float DeltaTime) override;
	virtual TStatId GetStatId() const override { RETURN_QUICK_DECLARE_CYCLE_STAT(UAutomatedTestSubsystem, STATGROUP_Tickables); }
	virtual bool IsTickable() const override { return bBenchmarking || bRecording || bPlayingBack || bCombatRunning; }

	UFUNCTION(BlueprintCallable, Category = "Test")
	void StartBenchmark(float Seconds);

	UFUNCTION(BlueprintCallable, Category = "Test")
	void StartCombatScenario(int32 EnemyCount);

	UFUNCTION(BlueprintCallable, Category = "Test")
	void RunSaveIntegrityTest(int32 SlotIndex);

	UFUNCTION(BlueprintCallable, Category = "Test")
	void RunAllSkillsTest();

	// Applies every element to a dummy in sequence so each reaction fires (integration check).
	UFUNCTION(BlueprintCallable, Category = "Test")
	void RunAllReactionsTest();

	// Validates the quest DataTable: every quest's objectives resolve + rewards are set.
	UFUNCTION(BlueprintCallable, Category = "Test")
	void RunAllQuestsValidation();

	// Streams every level in TestMapNames and reports load success (set the list in defaults).
	UFUNCTION(BlueprintCallable, Category = "Test")
	void RunLoadAllMapsTest();

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Test")
	TArray<TSoftObjectPtr<UWorld>> TestMapNames;

	UFUNCTION(BlueprintCallable, Category = "Test")
	void ToggleRecording();

	UFUNCTION(BlueprintCallable, Category = "Test")
	void StartPlayback();

	// Enemy class for test.combat; falls back to the nearest spawner's weighted pick if unset.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Test")
	TSubclassOf<class AStickmanEnemyCharacter> TestEnemyClass;

private:
	void ReportToConsole(const FString& Text) const;
	class AStickmanCharacter* GetPlayerCharacter() const;
	void FinishBenchmark();
	void ActivateNextSkill();

	// Benchmark.
	bool bBenchmarking = false;
	float BenchmarkRemaining = 0.f;
	TArray<float> FrameTimes;

	// Combat scenario.
	bool bCombatRunning = false;
	double CombatStartTime = 0.0;
	TArray<TWeakObjectPtr<class AStickmanEnemyCharacter>> CombatEnemies;

	// All-skills.
	TArray<FGameplayAbilitySpecHandle> PendingSkillHandles;
	int32 SkillsActivated = 0;
	int32 SkillsFailed = 0;
	FTimerHandle SkillTestTimerHandle;

	// Record/playback.
	bool bRecording = false;
	bool bPlayingBack = false;
	float RecordClock = 0.f;
	float RecordSampleAccumulator = 0.f;
	float PlaybackClock = 0.f;
	int32 PlaybackIndex = 0;
	TArray<FRecordedFrame> Recording;
};
