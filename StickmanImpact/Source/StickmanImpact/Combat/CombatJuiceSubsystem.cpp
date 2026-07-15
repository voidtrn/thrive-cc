// Copyright StickmanImpact Project.

#include "CombatJuiceSubsystem.h"
#include "Audio/StickmanAudioManager.h"
#include "UI/Menus/SettingsScreenWidget.h"
#include "Kismet/GameplayStatics.h"
#include "NiagaraFunctionLibrary.h"
#include "GameFramework/PlayerController.h"
#include "TimerManager.h"

void UCombatJuiceSubsystem::NotifyHit(AActor* Target, float Damage, bool bIsCritical, EStickmanElement Element,
	FVector HitDirection, bool bKilled)
{
	if (!Target)
	{
		return;
	}
	DoHitStop(Damage, bIsCritical);
	DoShake(Target, Damage, Element, HitDirection);
	DoImpactVFX(Target, Damage, Element, HitDirection);
	DoHitAudio(Target, Element, bKilled);
}

void UCombatJuiceSubsystem::DoHitStop(float Damage, bool bIsCritical)
{
	UWorld* World = GetWorld();
	if (!World || !bHitStopEnabled)
	{
		return;
	}
	// Multi-hit guard: only the first hit in a flurry freezes.
	if (World->GetTimeSeconds() - LastHitStopTime < HitStopCooldown)
	{
		return;
	}
	LastHitStopTime = World->GetTimeSeconds();

	float Duration = FMath::Lerp(HitStopDurationRange.X, HitStopDurationRange.Y,
		FMath::Clamp(Damage / HeavyHitDamage, 0.f, 1.f));
	if (bIsCritical)
	{
		Duration = HitStopDurationRange.Y;
	}

	UGameplayStatics::SetGlobalTimeDilation(World, 0.02f);
	FTimerHandle RestoreHandle;
	World->GetTimerManager().SetTimer(RestoreHandle, FTimerDelegate::CreateWeakLambda(World, [World]()
	{
		UGameplayStatics::SetGlobalTimeDilation(World, 1.f);
	}), Duration * 0.02f, false); // Real-time duration under dilation.
}

void UCombatJuiceSubsystem::DoShake(AActor* Target, float Damage, EStickmanElement Element,
	const FVector& HitDirection)
{
	// GetScreenShakeScale folds the on/off toggle (0 when disabled) and the 0-100% slider.
	const float ShakeUserScale = USettingsScreenWidget::GetScreenShakeScale();
	if (ShakeUserScale <= 0.f)
	{
		return;
	}
	APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0);
	if (!PC || !PC->PlayerCameraManager)
	{
		return;
	}

	// Pattern: per-element if authored, else default. Author these with
	// UPerlinNoiseCameraShakePattern (perlin, not random jitter) per the design spec.
	TSubclassOf<UCameraShakeBase> Pattern = DefaultShakePattern;
	if (const FElementImpactFeedback* Feedback = ElementFeedback.Find(Element))
	{
		if (Feedback->ShakePattern)
		{
			Pattern = Feedback->ShakePattern;
		}
	}
	if (!Pattern)
	{
		return;
	}

	// Intensity by damage, falloff by camera distance.
	const float DistanceToCamera = FVector::Dist(PC->PlayerCameraManager->GetCameraLocation(), Target->GetActorLocation());
	const float Falloff = 1.f - FMath::Clamp(DistanceToCamera / ShakeFalloffDistance, 0.f, 1.f);
	const float Scale = FMath::Clamp(Damage / HeavyHitDamage, 0.2f, 1.5f) * Falloff * ShakeUserScale;
	if (Scale <= 0.05f)
	{
		return;
	}

	// Directional: world-space shake sourced from the hit direction (engine scales per pattern).
	PC->ClientStartCameraShake(Pattern, Scale, ECameraShakePlaySpace::World, HitDirection.Rotation());
}

void UCombatJuiceSubsystem::DoImpactVFX(AActor* Target, float Damage, EStickmanElement Element,
	const FVector& HitDirection)
{
	UWorld* World = GetWorld();
	if (!World)
	{
		return;
	}

	// Spark aligned against the hit direction (approximates surface normal at the contact).
	const FVector ImpactPoint = Target->GetActorLocation() - HitDirection * 40.f;
	const FRotator SparkRotation = (-HitDirection).Rotation();
	const float VFXScale = FMath::Clamp(Damage / HeavyHitDamage, 0.5f, 2.f);

	if (const FElementImpactFeedback* Feedback = ElementFeedback.Find(Element))
	{
		if (Feedback->ImpactVFX)
		{
			UNiagaraFunctionLibrary::SpawnSystemAtLocation(World, Feedback->ImpactVFX, ImpactPoint, SparkRotation,
				FVector(VFXScale));
		}
	}
	if (ImpactRingVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAtLocation(World, ImpactRingVFX, ImpactPoint, SparkRotation,
			FVector(VFXScale));
	}
	if (Damage >= GroundCrackMinDamage && GroundCrackDecal)
	{
		UGameplayStatics::SpawnDecalAtLocation(World, GroundCrackDecal, FVector(64.f, 128.f, 128.f) * VFXScale,
			Target->GetActorLocation() - FVector(0.f, 0.f, 80.f), FRotator(-90.f, 0.f, 0.f), 20.f);
	}
}

void UCombatJuiceSubsystem::DoHitAudio(AActor* Target, EStickmanElement Element, bool bKilled)
{
	UStickmanAudioManager* Audio = GetGameInstance()->GetSubsystem<UStickmanAudioManager>();
	if (!Audio)
	{
		return;
	}
	const FVector Location = Target->GetActorLocation();

	// Layering: physical base + element layer, both with ±10% pitch variation. Priority /
	// important-cuts-unimportant = the concurrency asset's resolution rule (already applied
	// by PlaySFX). Material layer: fold into BaseImpactSound as a SoundCue switch on surface.
	if (BaseImpactSound)
	{
		Audio->PlaySFX(BaseImpactSound, Location, 1.f, FMath::FRandRange(0.9f, 1.1f));
	}
	if (const FElementImpactFeedback* Feedback = ElementFeedback.Find(Element))
	{
		if (Feedback->ElementHitSound)
		{
			Audio->PlaySFX(Feedback->ElementHitSound, Location, 0.8f, FMath::FRandRange(0.9f, 1.1f));
		}
	}
	if (bKilled && KillSound)
	{
		Audio->PlaySFX(KillSound, Location, 1.2f);
	}
}
