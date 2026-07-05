#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "DomainChallenge.generated.h"

class AEnemyBase;
class UBoxComponent;

/** Satu gelombang musuh. */
USTRUCT(BlueprintType)
struct FEnemyWave
{
	GENERATED_BODY()

	/** Class musuh + jumlah yang di-spawn. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	TMap<TSubclassOf<AEnemyBase>, int32> Enemies;
};

UENUM(BlueprintType)
enum class EDomainState : uint8
{
	Idle,
	Active,
	Cleared,
	Failed
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnDomainStateChanged, EDomainState, NewState);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnWaveChanged, int32, WaveIndex, int32, TotalWaves);

/**
 * Arena tantangan (domain): gelombang musuh + batas waktu. Bersihkan semua
 * gelombang sebelum waktu habis → reward. Core loop endgame Genshin.
 * StartDomain dipanggil saat player masuk portal / interact.
 */
UCLASS()
class MYGAME_API ADomainChallenge : public AActor
{
	GENERATED_BODY()

public:
	ADomainChallenge();

	virtual void Tick(float DeltaSeconds) override;

	UFUNCTION(BlueprintCallable, Category = "Domain")
	void StartDomain();

	UFUNCTION(BlueprintPure, Category = "Domain")
	EDomainState GetState() const { return State; }

	UFUNCTION(BlueprintPure, Category = "Domain")
	float GetTimeRemaining() const { return TimeRemaining; }

	UFUNCTION(BlueprintPure, Category = "Domain")
	int32 GetCurrentWave() const { return CurrentWaveIndex; }

	UPROPERTY(BlueprintAssignable, Category = "Domain")
	FOnDomainStateChanged OnStateChanged;

	UPROPERTY(BlueprintAssignable, Category = "Domain")
	FOnWaveChanged OnWaveChanged;

	/** Diberikan saat clear. BP: buka chest / grant item. */
	UFUNCTION(BlueprintImplementableEvent, Category = "Domain")
	void OnDomainCleared();

protected:
	UPROPERTY(VisibleAnywhere, Category = "Components")
	TObjectPtr<UBoxComponent> SpawnArea;

	UPROPERTY(EditAnywhere, Category = "Domain")
	TArray<FEnemyWave> Waves;

	/** Batas waktu total (detik). */
	UPROPERTY(EditAnywhere, Category = "Domain")
	float TimeLimit = 180.f;

	/** Jeda antar gelombang. */
	UPROPERTY(EditAnywhere, Category = "Domain")
	float WaveDelay = 2.f;

private:
	EDomainState State = EDomainState::Idle;
	int32 CurrentWaveIndex = -1;
	float TimeRemaining = 0.f;

	UPROPERTY()
	TArray<TObjectPtr<AEnemyBase>> AliveEnemies;

	void SpawnWave(int32 WaveIndex);
	void CheckWaveClear();
	void SetState(EDomainState NewState);
	FVector RandomSpawnPoint() const;

	/** Handler OnDied (signature ACharacterBase*) — memicu cek wave. */
	UFUNCTION()
	void CheckWaveClearFromDeath(class ACharacterBase* DeadCharacter);
};
