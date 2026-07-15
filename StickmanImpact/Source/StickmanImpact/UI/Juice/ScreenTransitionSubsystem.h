// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "ScreenTransitionSubsystem.generated.h"

class UUserWidget;

UENUM(BlueprintType)
enum class EScreenTransition : uint8
{
	Fade,          // Plain fade to/from black.
	IrisWipe,      // Shrinking/expanding shape mask (shape is a widget/material param).
	Death,         // Slow-mo -> grayscale -> fade to black.
	Respawn,       // Reverse of Death + particle burst cue.
	TeleportOut,   // Character dissolve cue + fade.
	TeleportIn     // Fade + reappear cue.
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnTransitionPhase, EScreenTransition, Transition, float, Alpha);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnTransitionMidpoint, EScreenTransition, Transition);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnTransitionComplete);

/**
 * One-stop screen-transition driver. C++ owns the timeline (in/hold/out), the alpha the
 * overlay widget reads (OnTransitionPhase — 0 clear ... 1 fully covered), the slow-mo +
 * grayscale for the death sequence, and the midpoint callback (fully-covered instant) where
 * you swap level / move the player / respawn. The overlay widget (TransitionWidgetClass —
 * set on the GameInstance) draws the actual iris/fade/dissolve from the alpha + transition
 * type; particle/dissolve VFX are cued off the same delegates.
 *
 * PlayTransition returns immediately; OnTransitionMidpoint fires when covered,
 * OnTransitionComplete when fully clear again. Reduce-motion (accessibility) collapses
 * iris/dissolve to a plain fast fade — read at play time.
 */
UCLASS()
class STICKMANIMPACT_API UScreenTransitionSubsystem : public UGameInstanceSubsystem, public FTickableGameObject
{
	GENERATED_BODY()

public:
	virtual void Deinitialize() override;

	// FTickableGameObject
	virtual void Tick(float DeltaTime) override;
	virtual TStatId GetStatId() const override { RETURN_QUICK_DECLARE_CYCLE_STAT(UScreenTransitionSubsystem, STATGROUP_Tickables); }
	virtual bool IsTickable() const override { return bPlaying; }
	virtual bool IsTickableWhenPaused() const override { return true; }

	// Overlay widget class (root canvas that reads OnTransitionPhase). Set once at startup.
	UFUNCTION(BlueprintCallable, Category = "Transition")
	void SetTransitionWidgetClass(TSubclassOf<UUserWidget> WidgetClass) { TransitionWidgetClass = WidgetClass; }

	// Cover the screen, fire OnTransitionMidpoint, then uncover. Durations per phase.
	UFUNCTION(BlueprintCallable, Category = "Transition")
	void PlayTransition(EScreenTransition Transition, float InDuration = 0.4f, float HoldDuration = 0.1f, float OutDuration = 0.4f);

	// The death cinematic: slow-mo ramp + grayscale, then fade. Fires OnTransitionMidpoint
	// at full black (do the respawn/reload there), then Respawn uncovers.
	UFUNCTION(BlueprintCallable, Category = "Transition")
	void PlayDeathSequence();

	UFUNCTION(BlueprintPure, Category = "Transition")
	bool IsTransitioning() const { return bPlaying; }

	UPROPERTY(BlueprintAssignable, Category = "Transition")
	FOnTransitionPhase OnTransitionPhase;

	UPROPERTY(BlueprintAssignable, Category = "Transition")
	FOnTransitionMidpoint OnTransitionMidpoint;

	UPROPERTY(BlueprintAssignable, Category = "Transition")
	FOnTransitionComplete OnTransitionComplete;

private:
	enum class EPhase : uint8 { In, Hold, Out };

	void EnsureWidget();
	void ApplyDeathPostProcess(float Alpha);
	void ClearDeathPostProcess();

	UPROPERTY()
	TSubclassOf<UUserWidget> TransitionWidgetClass;

	UPROPERTY()
	TObjectPtr<UUserWidget> ActiveWidget;

	bool bPlaying = false;
	bool bIsDeath = false;
	EScreenTransition CurrentTransition = EScreenTransition::Fade;
	EPhase Phase = EPhase::In;
	float PhaseElapsed = 0.f;
	float InDur = 0.4f;
	float HoldDur = 0.1f;
	float OutDur = 0.4f;
};
