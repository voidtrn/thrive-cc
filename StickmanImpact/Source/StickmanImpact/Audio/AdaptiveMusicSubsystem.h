// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Tickable.h"
#include "AdaptiveMusicSubsystem.generated.h"

class USoundBase;
class UAudioComponent;

/** The 8 music layers per the spec, low → high intensity. */
UENUM(BlueprintType)
enum class EMusicLayer : uint8
{
	Ambient,        // 0: no combat
	LightPercussion,// 1: enemies nearby
	FullRhythm,     // 2: combat started
	Intense,        // 3: elite/boss enemy
	Epic,           // 4: boss phase transition
	Desperate,      // 5: low HP
	Triumphant,     // 6: victory near
	Climax          // 7: Awakening active
};

/** One layered track: up to 8 stems that loop in sync and fade in/out by state. */
USTRUCT(BlueprintType)
struct FLayeredMusicTrack
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Music")
	FName TrackID;

	// Index = EMusicLayer. Unset layers are simply skipped.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Music")
	TArray<TObjectPtr<USoundBase>> Layers;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Music")
	float BPM = 120.f;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnMusicLayerChanged, EMusicLayer, Layer, bool, bActive);

/**
 * Nier/DOOM-style layered adaptive music over UStickmanAudioManager's plain BGM. A track's
 * stems all start together (sample-synced loops authored at the same length/BPM); this
 * subsystem only moves per-layer volumes, so transitions are seamless by construction.
 *
 * Game state flows in through the Notify* methods (combat systems call them — enemy count,
 * elite present, boss phase, low HP, awakening); Tick eases each layer's volume toward its
 * target (LayerFadeSpeed). Stingers (`PlayStinger`) fire one-shots on kill/perfect-dodge/
 * reaction over the bed. Region/time/weather track *selection* stays with the audio
 * manager's region BGM map — call `PlayLayeredTrack` from the same place `SetCurrentRegion`
 * is called, passing the region's layered variant (time-of-day/weather variants are just
 * different FLayeredMusicTrack rows chosen by the caller). Character leitmotifs = stingers
 * or the Climax layer per character. Music memory: `PauseTrack`/`ResumeTrack` keep position
 * by leaving components alive at zero volume. Jukebox mode = `PlayLayeredTrack` from a UI
 * with all layers forced on. MetaSound-native crossfade/BPM-sync graphs can replace this
 * volume-only mixer per-track without touching callers.
 */
UCLASS()
class STICKMANIMPACT_API UAdaptiveMusicSubsystem : public UGameInstanceSubsystem, public FTickableGameObject
{
	GENERATED_BODY()

public:
	virtual void Deinitialize() override;

	// FTickableGameObject
	virtual void Tick(float DeltaTime) override;
	virtual TStatId GetStatId() const override { RETURN_QUICK_DECLARE_CYCLE_STAT(UAdaptiveMusicSubsystem, STATGROUP_Tickables); }
	virtual bool IsTickable() const override { return LayerComponents.Num() > 0; }

	// Start a layered track: all stems spawn at once, only the Ambient layer audible.
	UFUNCTION(BlueprintCallable, Category = "Music")
	void PlayLayeredTrack(const FLayeredMusicTrack& Track);

	UFUNCTION(BlueprintCallable, Category = "Music")
	void StopLayeredTrack(float FadeOut = 2.f);

	// --- Game-state inputs ----------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Music")
	void NotifyCombatState(int32 EnemyCount, bool bEliteOrBossPresent);

	UFUNCTION(BlueprintCallable, Category = "Music")
	void NotifyBossPhaseTransition();

	UFUNCTION(BlueprintCallable, Category = "Music")
	void NotifyPlayerHealthFraction(float Fraction);

	UFUNCTION(BlueprintCallable, Category = "Music")
	void NotifyAwakening(bool bActive);

	UFUNCTION(BlueprintCallable, Category = "Music")
	void NotifyVictoryNear(bool bNear);

	// One-shot musical hits over the bed (kill sting, perfect-dodge fill, reaction motif,
	// character leitmotif on switch).
	UFUNCTION(BlueprintCallable, Category = "Music")
	void PlayStinger(USoundBase* Stinger);

	// Duck the whole bed for dialogue/cutscenes.
	UFUNCTION(BlueprintCallable, Category = "Music")
	void SetDucked(bool bDucked);

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Music")
	float LayerFadeSpeed = 1.5f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Music")
	float DuckVolume = 0.3f;

	UPROPERTY(BlueprintAssignable, Category = "Music")
	FOnMusicLayerChanged OnMusicLayerChanged;

private:
	void RecomputeTargets();
	void SetLayerTarget(EMusicLayer Layer, bool bActive);

	UPROPERTY()
	TArray<TObjectPtr<UAudioComponent>> LayerComponents; // index = EMusicLayer

	TArray<float> LayerTargets;   // 0/1 per layer
	TArray<float> LayerVolumes;   // eased current volumes

	// State inputs.
	int32 CurrentEnemyCount = 0;
	bool bElitePresent = false;
	bool bBossTransition = false;
	float PlayerHealthFraction = 1.f;
	bool bAwakeningActive = false;
	bool bVictoryNear = false;
	bool bDuckedState = false;
	FTimerHandle BossTransitionResetHandle;
};
