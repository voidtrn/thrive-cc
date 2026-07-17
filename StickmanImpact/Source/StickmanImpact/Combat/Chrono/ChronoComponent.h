// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ChronoComponent.generated.h"

class AStickmanCharacter;
class AChronoClone;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnTimeStopChanged, bool, bActive);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnTimeRewound);

/** One recorded frame for the rewind ring buffer. */
USTRUCT()
struct FChronoSnapshot
{
	GENERATED_BODY()

	UPROPERTY() float Time = 0.f;
	UPROPERTY() FVector Location = FVector::ZeroVector;
	UPROPERTY() FRotator Rotation = FRotator::ZeroRotator;
	UPROPERTY() float Health = 0.f;
};

/**
 * The Chrono character's time powers, on per-actor CustomTimeDilation (the same primitive as
 * witch time — global stays 1, individual actors slow/freeze). Abilities:
 *
 * - **Time Slow** (skill): a bubble that sets nearby enemies' CustomTimeDilation to
 *   SlowFactor for SlowDuration; the player is untouched.
 * - **Time Stop** (burst): freezes all enemies + registered projectiles (dilation ~0) for
 *   StopDuration; the player moves/attacks freely. Damage dealt to a frozen actor is
 *   *accumulated* (the funnel routes it via AccumulateStoppedDamage) and applied when time
 *   resumes.
 * - **Time Rewind** (passive): a ring buffer records loc/rot/HP; on death, `TryRewind`
 *   restores the snapshot RewindSeconds ago (once per battle).
 * - **Time Clone** (dash): `SpawnTimeClone` drops an AChronoClone that replays the player's
 *   recent movement CloneDelay later, echoing attacks.
 * - **Time Skip** (hold): `BeginTimeSkip`/`ReleaseTimeSkip` charges, teleports to the target,
 *   and delivers all "skipped" hits at once (count scales with charge).
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UChronoComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UChronoComponent();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

	// --- Abilities ------------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Chrono")
	void TimeSlow();

	UFUNCTION(BlueprintCallable, Category = "Chrono")
	void TimeStop();

	// Restore a snapshot from RewindSeconds ago (once per battle). Returns false if unavailable.
	UFUNCTION(BlueprintCallable, Category = "Chrono")
	bool TryRewind();

	UFUNCTION(BlueprintCallable, Category = "Chrono")
	AChronoClone* SpawnTimeClone();

	UFUNCTION(BlueprintCallable, Category = "Chrono")
	void BeginTimeSkip();

	UFUNCTION(BlueprintCallable, Category = "Chrono")
	void ReleaseTimeSkip(AActor* Target);

	// Hits queued by the last time-skip release (charge-scaled) for the combat side to deliver.
	UFUNCTION(BlueprintPure, Category = "Chrono")
	int32 GetLastSkipHits() const { return LastSkipHits; }

	// Reset the once-per-battle rewind (call on entering a new fight).
	UFUNCTION(BlueprintCallable, Category = "Chrono")
	void ResetBattleState() { bRewindUsed = false; }

	// --- Funnel hooks (time-stop damage accumulation) -------------------------------------

	UFUNCTION(BlueprintPure, Category = "Chrono")
	bool IsActorTimeStopped(AActor* Actor) const { return StoppedActors.Contains(Actor); }

	UFUNCTION(BlueprintCallable, Category = "Chrono")
	void AccumulateStoppedDamage(AActor* Actor, float Damage) { AccumulatedDamage.FindOrAdd(Actor) += Damage; }

	UFUNCTION(BlueprintPure, Category = "Chrono")
	bool IsTimeStopActive() const { return bTimeStopActive; }

	// Projectiles register so they freeze with the enemies during time stop.
	UFUNCTION(BlueprintCallable, Category = "Chrono")
	void RegisterProjectile(AActor* Projectile) { TrackedProjectiles.Add(Projectile); }

	// --- Tunables -------------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Chrono")
	float SlowRadius = 800.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Chrono")
	float SlowFactor = 0.3f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Chrono")
	float SlowDuration = 4.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Chrono")
	float StopDuration = 3.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Chrono")
	float RewindSeconds = 3.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Chrono")
	float CloneDelay = 1.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Chrono")
	TSubclassOf<AChronoClone> CloneClass;

	UPROPERTY(BlueprintAssignable, Category = "Chrono")
	FOnTimeStopChanged OnTimeStopChanged;

	UPROPERTY(BlueprintAssignable, Category = "Chrono")
	FOnTimeRewound OnTimeRewound;

protected:
	virtual void BeginPlay() override;

private:
	void EndTimeSlow();
	void EndTimeStop();
	AStickmanCharacter* GetOwnerCharacter() const;

	// Rewind ring buffer (20 Hz).
	TArray<FChronoSnapshot> Snapshots;
	float SnapshotAccumulator = 0.f;
	bool bRewindUsed = false;

	// Time stop.
	bool bTimeStopActive = false;
	UPROPERTY()
	TArray<TWeakObjectPtr<AActor>> StoppedActors;
	UPROPERTY()
	TArray<TWeakObjectPtr<AActor>> TrackedProjectiles;
	TMap<TWeakObjectPtr<AActor>, float> AccumulatedDamage;

	// Time clone recording (feeds the spawned clone).
	TArray<FChronoSnapshot> RecentMovement;

	// Time skip.
	float SkipChargeStart = -1.f;
	int32 LastSkipHits = 0;

	FTimerHandle SlowTimerHandle;
	FTimerHandle StopTimerHandle;
};
