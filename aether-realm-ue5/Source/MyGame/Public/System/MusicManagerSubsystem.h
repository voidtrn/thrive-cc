#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "MusicManagerSubsystem.generated.h"

class UAudioComponent;
class USoundBase;

UENUM(BlueprintType)
enum class EMusicState : uint8
{
	Exploration,
	Combat,
	Boss,
	Menu,
	Cinematic
};

/**
 * Music state machine + crossfade (spec C3). Dual audio component:
 * track aktif fade out, track baru fade in (1-3s).
 *
 * Combat flow: enemy aggro → SetMusicState(Combat); enemy terakhir mati →
 * RequestExitCombat() (delay 5s, batal kalau aggro lagi).
 * Track per state di-set dari BP (SetStateTrack) — day/night variant:
 * ganti track Exploration saat OnDayPhaseChanged.
 * Intensity (RTPC-style): SetCombatIntensity(0-100) → volume multiplier
 * layer; untuk adaptive penuh pakai Wwise/MetaSounds (lihat ART_C_AUDIO.md).
 */
UCLASS()
class MYGAME_API UMusicManagerSubsystem : public UWorldSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Music")
	void SetStateTrack(EMusicState State, USoundBase* Track);

	UFUNCTION(BlueprintCallable, Category = "Music")
	void SetMusicState(EMusicState NewState, float CrossfadeSeconds = 2.f);

	/** Exit combat dengan delay 5s (batal otomatis kalau masuk combat lagi). */
	UFUNCTION(BlueprintCallable, Category = "Music")
	void RequestExitCombat(float DelaySeconds = 5.f);

	UFUNCTION(BlueprintCallable, Category = "Music")
	void SetCombatIntensity(float Intensity01);

	UFUNCTION(BlueprintPure, Category = "Music")
	EMusicState GetMusicState() const { return CurrentState; }

private:
	UPROPERTY()
	TMap<EMusicState, TObjectPtr<USoundBase>> StateTracks;

	UPROPERTY()
	TObjectPtr<UAudioComponent> ActiveTrack;

	UPROPERTY()
	TObjectPtr<UAudioComponent> FadingTrack;

	EMusicState CurrentState = EMusicState::Exploration;
	FTimerHandle ExitCombatTimer;

	UAudioComponent* CreateMusicComponent(USoundBase* Sound);
};
