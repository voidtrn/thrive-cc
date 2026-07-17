// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ChronoComponent.h"
#include "ChronoClone.generated.h"

class USkeletalMeshComponent;

/**
 * A time-delayed echo of the player: replays a recorded transform track CloneDelay later,
 * so it "repeats the player's actions 1s later". Translucent skeletal mesh (author a ghost
 * material). Attack echoes are BP content on OnCloneAttackBeat — the clone re-emits the
 * player's attacks as it reaches the recorded moments; C++ owns the transform replay +
 * lifetime.
 */
UCLASS()
class STICKMANIMPACT_API AChronoClone : public AActor
{
	GENERATED_BODY()

public:
	AChronoClone();

	virtual void Tick(float DeltaSeconds) override;

	// Seed the replay track + how long to wait before starting (the delay).
	void InitReplay(const TArray<FChronoSnapshot>& Track, float Delay);

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Chrono")
	TObjectPtr<UMaterialInterface> GhostMaterial;

	// Fired as the clone reaches each recorded beat — BP re-emits the attack here.
	UFUNCTION(BlueprintImplementableEvent, Category = "Chrono")
	void OnCloneBeat(int32 BeatIndex);

protected:
	virtual void BeginPlay() override;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Chrono")
	TObjectPtr<USkeletalMeshComponent> Mesh;

private:
	TArray<FChronoSnapshot> ReplayTrack;
	float StartDelay = 0.f;
	float Elapsed = 0.f;
	int32 TrackIndex = 0;
};
