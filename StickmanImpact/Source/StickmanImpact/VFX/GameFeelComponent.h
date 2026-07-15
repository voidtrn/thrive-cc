// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "GameFeelComponent.generated.h"

class UAudioComponent;
class USoundBase;
class UCameraShakeBase;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnExhaustionChanged, bool, bExhausted);

/**
 * Movement "game feel" layer on the player character: velocity-scaled motion blur + wind
 * audio pitch, tiered whoosh SFX, low-stamina feedback (heavy breathing loop, controller
 * vibration, desaturation + red vignette via delegate to a HUD widget/post-process), and a
 * perfect-dodge micro slow-mo entry point (call NotifyPerfectDodge() from the enemy
 * telegraph system when a dash beats an attack's active window).
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UGameFeelComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UGameFeelComponent();

	virtual void BeginPlay() override;
	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

	// --- Velocity feedback -----------------------------------------------
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Feel|Velocity")
	TObjectPtr<USoundBase> WindLoopSound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Feel|Velocity")
	FVector2D WindPitchRange = FVector2D(0.8f, 1.5f);

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Feel|Velocity")
	float MaxMotionBlurAmount = 0.6f;

	// Whoosh tiers: crossed threshold index upward = play WhooshSounds[tier].
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Feel|Velocity")
	TArray<float> WhooshSpeedThresholds = { 700.f, 1200.f, 2000.f };

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Feel|Velocity")
	TArray<TObjectPtr<USoundBase>> WhooshSounds;

	// --- Stamina feedback ----------------------------------------------------
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Feel|Stamina")
	float LowStaminaThreshold = 0.2f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Feel|Stamina")
	TObjectPtr<USoundBase> HeavyBreathingLoop;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Feel|Stamina")
	float ExhaustedDesaturation = 0.35f;

	// HUD vignette widget binds here (red edge vignette on true).
	UPROPERTY(BlueprintAssignable, Category = "Feel|Stamina")
	FOnExhaustionChanged OnExhaustionChanged;

	// --- Footstep micro shake ----------------------------------------------
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Feel|Footstep")
	TSubclassOf<UCameraShakeBase> FootstepMicroShakeClass;

	UFUNCTION(BlueprintCallable, Category = "Feel|Footstep")
	void PlayFootstepMicroShake();

	// --- Perfect dodge -----------------------------------------------------
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Feel|Dodge")
	float PerfectDodgeDilation = 0.05f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Feel|Dodge")
	float PerfectDodgeRealSeconds = 0.25f;

	UFUNCTION(BlueprintCallable, Category = "Feel|Dodge")
	void NotifyPerfectDodge();

private:
	void UpdateVelocityFeedback(float DeltaTime);
	void UpdateStaminaFeedback();

	UPROPERTY()
	TObjectPtr<UAudioComponent> WindAudioComponent;

	UPROPERTY()
	TObjectPtr<UAudioComponent> BreathingAudioComponent;

	int32 CurrentWhooshTier = -1;
	bool bWasExhausted = false;
};
