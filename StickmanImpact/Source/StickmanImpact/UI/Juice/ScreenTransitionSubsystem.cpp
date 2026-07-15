// Copyright StickmanImpact Project.

#include "ScreenTransitionSubsystem.h"
#include "UI/Menus/SettingsScreenWidget.h"
#include "Blueprint/UserWidget.h"
#include "Camera/CameraComponent.h"
#include "GameFramework/Pawn.h"
#include "Kismet/GameplayStatics.h"
#include "GameFramework/PlayerController.h"

void UScreenTransitionSubsystem::Deinitialize()
{
	ClearDeathPostProcess();
	if (ActiveWidget)
	{
		ActiveWidget->RemoveFromParent();
		ActiveWidget = nullptr;
	}
	Super::Deinitialize();
}

void UScreenTransitionSubsystem::EnsureWidget()
{
	if (ActiveWidget || !TransitionWidgetClass)
	{
		return;
	}
	if (APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0))
	{
		ActiveWidget = CreateWidget<UUserWidget>(PC, TransitionWidgetClass);
		if (ActiveWidget)
		{
			ActiveWidget->AddToViewport(1000); // Above HUD.
		}
	}
}

void UScreenTransitionSubsystem::PlayTransition(EScreenTransition Transition, float InDuration, float HoldDuration, float OutDuration)
{
	if (bPlaying)
	{
		return; // Don't stack transitions.
	}

	// Accessibility: reduce-motion collapses fancy wipes/dissolves to a fast plain fade.
	if (USettingsScreenWidget::IsReduceMotionEnabled() && Transition != EScreenTransition::Death)
	{
		Transition = EScreenTransition::Fade;
		InDuration = FMath::Min(InDuration, 0.2f);
		OutDuration = FMath::Min(OutDuration, 0.2f);
	}

	CurrentTransition = Transition;
	bIsDeath = (Transition == EScreenTransition::Death);
	InDur = FMath::Max(InDuration, 0.01f);
	HoldDur = FMath::Max(HoldDuration, 0.f);
	OutDur = FMath::Max(OutDuration, 0.01f);
	Phase = EPhase::In;
	PhaseElapsed = 0.f;
	bPlaying = true;

	EnsureWidget();
	OnTransitionPhase.Broadcast(CurrentTransition, 0.f);
}

void UScreenTransitionSubsystem::PlayDeathSequence()
{
	// Longer, dramatic in-phase; the midpoint is where the game reloads/respawns.
	PlayTransition(EScreenTransition::Death, 2.0f, 0.3f, 0.8f);
}

void UScreenTransitionSubsystem::Tick(float DeltaTime)
{
	if (!bPlaying)
	{
		return;
	}

	// Death slow-mo uses undilated real time so the ramp doesn't slow itself down.
	const float RealDelta = bIsDeath
		? DeltaTime / FMath::Max(UGameplayStatics::GetGlobalTimeDilation(this), KINDA_SMALL_NUMBER)
		: DeltaTime;
	PhaseElapsed += RealDelta;

	switch (Phase)
	{
	case EPhase::In:
	{
		const float Alpha = FMath::Clamp(PhaseElapsed / InDur, 0.f, 1.f);
		OnTransitionPhase.Broadcast(CurrentTransition, Alpha);

		if (bIsDeath)
		{
			// Ramp time dilation 1 -> 0.2 and grayscale in over the in-phase.
			UGameplayStatics::SetGlobalTimeDilation(this, FMath::Lerp(1.f, 0.2f, Alpha));
			ApplyDeathPostProcess(Alpha);
		}

		if (Alpha >= 1.f)
		{
			Phase = EPhase::Hold;
			PhaseElapsed = 0.f;
			OnTransitionMidpoint.Broadcast(CurrentTransition); // Fully covered — swap here.
		}
		break;
	}

	case EPhase::Hold:
		OnTransitionPhase.Broadcast(CurrentTransition, 1.f);
		if (PhaseElapsed >= HoldDur)
		{
			Phase = EPhase::Out;
			PhaseElapsed = 0.f;
			if (bIsDeath)
			{
				// Restore normal time before uncovering into the respawned world.
				UGameplayStatics::SetGlobalTimeDilation(this, 1.f);
				ClearDeathPostProcess();
			}
		}
		break;

	case EPhase::Out:
	{
		const float Alpha = 1.f - FMath::Clamp(PhaseElapsed / OutDur, 0.f, 1.f);
		OnTransitionPhase.Broadcast(CurrentTransition, Alpha);
		if (Alpha <= 0.f)
		{
			bPlaying = false;
			OnTransitionComplete.Broadcast();
		}
		break;
	}
	}
}

void UScreenTransitionSubsystem::ApplyDeathPostProcess(float Alpha)
{
	// Desaturate on the player's camera component (same pattern as GameFeel/DetectiveMode —
	// survives per-frame camera updates, unlike the POV cache).
	const APawn* Pawn = UGameplayStatics::GetPlayerPawn(this, 0);
	if (UCameraComponent* Camera = Pawn ? Pawn->FindComponentByClass<UCameraComponent>() : nullptr)
	{
		Camera->PostProcessSettings.bOverride_ColorSaturation = true;
		Camera->PostProcessSettings.ColorSaturation = FVector4(FVector(1.f - Alpha), 1.f); // -> grayscale
	}
}

void UScreenTransitionSubsystem::ClearDeathPostProcess()
{
	const APawn* Pawn = UGameplayStatics::GetPlayerPawn(this, 0);
	if (UCameraComponent* Camera = Pawn ? Pawn->FindComponentByClass<UCameraComponent>() : nullptr)
	{
		Camera->PostProcessSettings.bOverride_ColorSaturation = true;
		Camera->PostProcessSettings.ColorSaturation = FVector4(1.f, 1.f, 1.f, 1.f);
	}
}
