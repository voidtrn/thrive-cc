// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "StickmanAudioManager.generated.h"

class USoundClass;
class USoundMix;
class USoundBase;
class UAudioComponent;
class USoundConcurrency;

/**
 * Central audio routing. Volume categories are engine SoundClasses (Master/BGM/SFX/Voice/UI —
 * author the assets + a SoundMix in-editor, assign here); SetCategoryVolume pushes a mix
 * override so every sound already routed to that class follows. SFX concurrency: assign a
 * USoundConcurrency asset (MaxCount 10, per the design spec) to DefaultSFXConcurrency and
 * PlaySFX applies it. Occlusion: PlaySFX line-traces listener->source and pipes a lowpass
 * cutoff onto the spawned component when blocked ("muffle behind walls").
 */
UCLASS()
class STICKMANIMPACT_API UStickmanAudioManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// --- Category volumes -------------------------------------------------
	// Category names: Master, BGM, SFX, Voice, UI.
	UFUNCTION(BlueprintCallable, Category = "Audio")
	void SetCategoryVolume(FName Category, float Volume);

	UFUNCTION(BlueprintPure, Category = "Audio")
	float GetCategoryVolume(FName Category) const;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Audio|Routing")
	TMap<FName, TObjectPtr<USoundClass>> CategorySoundClasses;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Audio|Routing")
	TObjectPtr<USoundMix> VolumeControlMix;

	// --- SFX ----------------------------------------------------------------
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Audio|SFX")
	TObjectPtr<USoundConcurrency> DefaultSFXConcurrency;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Audio|SFX")
	bool bEnableOcclusion = true;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Audio|SFX")
	float OccludedLowpassFrequency = 800.f;

	UFUNCTION(BlueprintCallable, Category = "Audio")
	UAudioComponent* PlaySFX(USoundBase* Sound, FVector Location, float VolumeMultiplier = 1.f, float PitchMultiplier = 1.f);

	UFUNCTION(BlueprintCallable, Category = "Audio")
	void PlayUISound(USoundBase* Sound);

	// --- BGM -----------------------------------------------------------------
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Audio|BGM")
	float CrossfadeDuration = 2.f;

	// Region name -> ambient BGM. SetCurrentRegion crossfades if the region's track differs.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Audio|BGM")
	TMap<FName, TObjectPtr<USoundBase>> RegionBGM;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Audio|BGM")
	TObjectPtr<USoundBase> CombatBGM;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Audio|BGM")
	TObjectPtr<USoundBase> BossBGM;

	// Freeform playlist used when no region track is set; PlayNextInPlaylist shuffles.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Audio|BGM")
	TArray<TObjectPtr<USoundBase>> Playlist;

	UFUNCTION(BlueprintCallable, Category = "Audio|BGM")
	void SetCurrentRegion(FName Region);

	// Combat intensity 0-1: 0 = exploration BGM, >0 crossfades to CombatBGM (or BossBGM when
	// bBossFight). Call from spawner/AI code when enemies aggro/de-aggro.
	UFUNCTION(BlueprintCallable, Category = "Audio|BGM")
	void SetCombatIntensity(float Intensity, bool bBossFight = false);

	UFUNCTION(BlueprintCallable, Category = "Audio|BGM")
	void PlayNextInPlaylist();

	UFUNCTION(BlueprintCallable, Category = "Audio|BGM")
	void CrossfadeTo(USoundBase* NewTrack);

private:
	void TickCrossfade();

	UPROPERTY()
	TObjectPtr<UAudioComponent> ActiveBGMComponent;

	UPROPERTY()
	TObjectPtr<UAudioComponent> FadingOutBGMComponent;

	UPROPERTY()
	TObjectPtr<USoundBase> CurrentBGMTrack;

	TMap<FName, float> CategoryVolumes;
	FName CurrentRegion;
	float CurrentCombatIntensity = 0.f;
	float CrossfadeElapsed = 0.f;
	FTimerHandle CrossfadeTimerHandle;
	int32 PlaylistIndex = -1;
};
