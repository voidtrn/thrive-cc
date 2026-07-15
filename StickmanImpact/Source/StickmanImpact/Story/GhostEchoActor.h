// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "GameplayTagContainer.h"
#include "GhostEchoActor.generated.h"

class USphereComponent;
class USkeletalMesh;
class UAnimationAsset;
class USoundBase;

/** One beat of a ghost echo: a translucent figure acts + a line displays. */
USTRUCT(BlueprintType)
struct FGhostEchoBeat
{
	GENERATED_BODY()

	// Seconds after the echo starts.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Echo")
	float Time = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Echo")
	FText SpeakerName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Echo", meta = (MultiLine = "true"))
	FText Line;

	// Which spawned figure acts (index into GhostFigures; INDEX_NONE = narration only).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Echo")
	int32 FigureIndex = 0;

	// Single-node animation (sequence), played directly on the figure's mesh — ghost
	// figures have no AnimBP, so montages won't run here.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Echo")
	TObjectPtr<UAnimationAsset> Animation;
};

/** Where a ghost figure stands, relative to the actor. */
USTRUCT(BlueprintType)
struct FGhostFigureSpawn
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Echo")
	FTransform RelativeTransform;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Echo")
	TObjectPtr<USkeletalMesh> Mesh;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnEchoBeat, const FText&, SpeakerName, const FText&, Line);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnEchoFinished);

/**
 * Environmental storytelling: walk into the trigger and translucent stickman figures
 * replay a past event where it happened — the player is an observer, not a participant
 * (movement stays free; this is not a cutscene). Figures are plain skeletal-mesh
 * components using GhostMaterial (author a translucent additive material); beats fire on
 * one timeline, lines go to the subtitle widget via OnEchoBeat.
 *
 * Plays once: CompletedFlag is set through UDialogueManager when it ends, and a set flag
 * (or unmet RequiredStoryFlag) keeps the trigger inert. Register the echo location as a
 * Deep-layer ADiscoverySite alongside if it should count toward area discovery.
 */
UCLASS()
class STICKMANIMPACT_API AGhostEchoActor : public AActor
{
	GENERATED_BODY()

public:
	AGhostEchoActor();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Echo")
	TArray<FGhostFigureSpawn> GhostFigures;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Echo")
	TArray<FGhostEchoBeat> Beats;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Echo")
	TObjectPtr<UMaterialInterface> GhostMaterial;

	// Ambient drone/whisper while the echo plays.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Echo")
	TObjectPtr<USoundBase> EchoAmbience;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Echo")
	FGameplayTag RequiredStoryFlag;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Echo")
	FGameplayTag CompletedFlag;

	// Seconds after the last beat before figures fade and CompletedFlag sets.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Echo")
	float EndPadding = 3.f;

	UPROPERTY(BlueprintAssignable, Category = "Echo")
	FOnEchoBeat OnEchoBeat;

	UPROPERTY(BlueprintAssignable, Category = "Echo")
	FOnEchoFinished OnEchoFinished;

	// Visual flourish hooks (fade-in VFX, post-process shift) — C++ owns the timeline.
	UFUNCTION(BlueprintImplementableEvent, Category = "Echo")
	void OnEchoStarted();

protected:
	virtual void BeginPlay() override;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Echo", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<USphereComponent> TriggerSphere;

private:
	UFUNCTION()
	void HandleOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp,
		int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

	void StartEcho();
	void PlayBeat(int32 BeatIndex);
	void FinishEcho();

	bool bPlaying = false;

	UPROPERTY()
	TArray<TObjectPtr<class USkeletalMeshComponent>> SpawnedFigures;

	TArray<FTimerHandle> BeatTimerHandles;
	FTimerHandle FinishTimerHandle;
};
