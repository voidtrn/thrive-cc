// Copyright StickmanImpact Project.

#include "GameFeelComponent.h"
#include "Character/StickmanCharacter.h"
#include "Audio/StickmanAudioManager.h"
#include "UI/Menus/SettingsScreenWidget.h"
#include "Camera/CameraComponent.h"
#include "Components/AudioComponent.h"
#include "GameFramework/PlayerController.h"
#include "Kismet/GameplayStatics.h"
#include "TimerManager.h"

UGameFeelComponent::UGameFeelComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
}

void UGameFeelComponent::BeginPlay()
{
	Super::BeginPlay();

	if (WindLoopSound)
	{
		WindAudioComponent = UGameplayStatics::SpawnSoundAttached(WindLoopSound, GetOwner()->GetRootComponent());
		if (WindAudioComponent)
		{
			WindAudioComponent->SetVolumeMultiplier(0.f);
		}
	}
}

void UGameFeelComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);
	UpdateVelocityFeedback(DeltaTime);
	UpdateStaminaFeedback();
}

void UGameFeelComponent::UpdateVelocityFeedback(float DeltaTime)
{
	AStickmanCharacter* Character = Cast<AStickmanCharacter>(GetOwner());
	if (!Character)
	{
		return;
	}

	const float Speed = Character->GetVelocity().Size();
	const float SpeedAlpha = FMath::Clamp(Speed / 1500.f, 0.f, 1.f);

	// Wind loop: volume + pitch ride velocity.
	if (WindAudioComponent)
	{
		WindAudioComponent->SetVolumeMultiplier(SpeedAlpha);
		WindAudioComponent->SetPitchMultiplier(FMath::Lerp(WindPitchRange.X, WindPitchRange.Y, SpeedAlpha));
	}

	// Motion blur scales with velocity via the follow camera's post-process settings.
	// Respects the accessibility motion-reduction toggle — forced to zero when enabled.
	const bool bReduceMotion = USettingsScreenWidget::IsReduceMotionEnabled();
	if (UCameraComponent* Camera = Character->FindComponentByClass<UCameraComponent>())
	{
		Camera->PostProcessSettings.bOverride_MotionBlurAmount = true;
		Camera->PostProcessSettings.MotionBlurAmount = bReduceMotion ? 0.f : MaxMotionBlurAmount * SpeedAlpha;
	}

	// Whoosh tiers: play once per upward threshold crossing, reset when speed falls back.
	int32 NewTier = -1;
	for (int32 Index = 0; Index < WhooshSpeedThresholds.Num(); ++Index)
	{
		if (Speed >= WhooshSpeedThresholds[Index])
		{
			NewTier = Index;
		}
	}
	if (NewTier > CurrentWhooshTier && WhooshSounds.IsValidIndex(NewTier) && WhooshSounds[NewTier])
	{
		if (UStickmanAudioManager* Audio = GetWorld()->GetGameInstance()
				? GetWorld()->GetGameInstance()->GetSubsystem<UStickmanAudioManager>() : nullptr)
		{
			Audio->PlaySFX(WhooshSounds[NewTier], Character->GetActorLocation());
		}
	}
	CurrentWhooshTier = NewTier;
}

void UGameFeelComponent::UpdateStaminaFeedback()
{
	AStickmanCharacter* Character = Cast<AStickmanCharacter>(GetOwner());
	if (!Character)
	{
		return;
	}

	const bool bExhausted = Character->GetStaminaPercent() < LowStaminaThreshold;
	if (bExhausted == bWasExhausted)
	{
		return;
	}
	bWasExhausted = bExhausted;

	OnExhaustionChanged.Broadcast(bExhausted); // HUD red vignette + stamina bar shake bind here.

	// Heavy breathing loop.
	if (bExhausted && HeavyBreathingLoop && !BreathingAudioComponent)
	{
		BreathingAudioComponent = UGameplayStatics::SpawnSoundAttached(HeavyBreathingLoop, Character->GetRootComponent());
	}
	else if (!bExhausted && BreathingAudioComponent)
	{
		BreathingAudioComponent->FadeOut(1.f, 0.f);
		BreathingAudioComponent = nullptr;
	}

	// Controller vibration pulse on entering exhaustion.
	if (bExhausted)
	{
		if (APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0))
		{
			PC->PlayDynamicForceFeedback(0.5f, 0.6f, true, true, true, true);
		}
	}

	// Post-process desaturation while exhausted.
	if (UCameraComponent* Camera = Character->FindComponentByClass<UCameraComponent>())
	{
		Camera->PostProcessSettings.bOverride_ColorSaturation = bExhausted;
		Camera->PostProcessSettings.ColorSaturation = FVector4(
			FVector(1.f - (bExhausted ? ExhaustedDesaturation : 0.f)), 1.f);
	}
}

void UGameFeelComponent::PlayFootstepMicroShake()
{
	if (!FootstepMicroShakeClass || !USettingsScreenWidget::IsScreenShakeEnabled())
	{
		return;
	}
	if (APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0))
	{
		PC->ClientStartCameraShake(FootstepMicroShakeClass, 0.3f); // Micro scale.
	}
}

void UGameFeelComponent::NotifyPerfectDodge()
{
	UWorld* World = GetWorld();
	if (!World)
	{
		return;
	}

	UGameplayStatics::SetGlobalTimeDilation(World, PerfectDodgeDilation);

	FTimerHandle RestoreHandle;
	World->GetTimerManager().SetTimer(RestoreHandle, FTimerDelegate::CreateWeakLambda(World, [World]()
	{
		UGameplayStatics::SetGlobalTimeDilation(World, 1.f);
	}), PerfectDodgeRealSeconds * PerfectDodgeDilation, false);
}
