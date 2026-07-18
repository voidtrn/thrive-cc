// Copyright StickmanImpact Project.

#include "PhotoModeSubsystem.h"
#include "World/DayNightManager.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "Camera/CameraActor.h"
#include "Camera/CameraComponent.h"
#include "GameFramework/PlayerController.h"
#include "Kismet/GameplayStatics.h"
#include "EngineUtils.h"

bool UPhotoModeSubsystem::EnterPhotoMode()
{
	if (bActive)
	{
		return false;
	}

	UWorld* World = GetGameInstance()->GetWorld();
	APlayerController* PC = UGameplayStatics::GetPlayerController(World, 0);
	if (!World || !PC)
	{
		return false;
	}

	bActive = true;

	// Real pause: works mid-gameplay and mid-cutscene alike.
	UGameplayStatics::SetGamePaused(World, true);

	// Free camera spawned at the current view.
	FVector ViewLocation;
	FRotator ViewRotation;
	PC->GetPlayerViewPoint(ViewLocation, ViewRotation);
	PauseOrigin = ViewLocation;

	FActorSpawnParameters Params;
	Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
	PhotoCamera = World->SpawnActor<ACameraActor>(ViewLocation, ViewRotation, Params);
	if (PhotoCamera)
	{
		PhotoCamera->SetTickableWhenPaused(true);
		PC->SetViewTargetWithBlend(PhotoCamera, 0.f);
	}

	// Remember world time for the override restore.
	if (const ADayNightManager* DayNight = Cast<ADayNightManager>(
			UGameplayStatics::GetActorOfClass(World, ADayNightManager::StaticClass())))
	{
		SavedTimeOfDayHour = DayNight->GetCurrentHour();
	}

	OnPhotoModeChanged.Broadcast(true);
	return true;
}

void UPhotoModeSubsystem::ExitPhotoMode()
{
	if (!bActive)
	{
		return;
	}
	bActive = false;

	UWorld* World = GetGameInstance()->GetWorld();
	APlayerController* PC = UGameplayStatics::GetPlayerController(World, 0);

	// Restore time-of-day override.
	if (SavedTimeOfDayHour >= 0.f && CurrentSettings.TimeOfDayOverride >= 0.f)
	{
		if (ADayNightManager* DayNight = Cast<ADayNightManager>(
				UGameplayStatics::GetActorOfClass(World, ADayNightManager::StaticClass())))
		{
			DayNight->SetCurrentHour(SavedTimeOfDayHour);
		}
	}

	// Un-hide everything.
	FPhotoSettings Restore;
	Restore.bHideEnemies = false;
	Restore.bHideNPCs = false;
	CurrentSettings = Restore;
	ApplyHideFlags();

	if (PC)
	{
		if (APawn* Pawn = PC->GetPawn())
		{
			PC->SetViewTargetWithBlend(Pawn, 0.f);
		}
	}
	if (PhotoCamera)
	{
		PhotoCamera->Destroy();
		PhotoCamera = nullptr;
	}

	UGameplayStatics::SetGamePaused(World, false);
	OnPhotoModeChanged.Broadcast(false);
}

// ---------------------------------------------------------------- camera --------------

void UPhotoModeSubsystem::MoveCamera(FVector LocalDelta)
{
	if (!PhotoCamera)
	{
		return;
	}
	const FVector NewLocation = PhotoCamera->GetActorLocation()
		+ PhotoCamera->GetActorRotation().RotateVector(LocalDelta);
	// Drone range: clamp to a sphere around the pause point.
	if (FVector::Dist(NewLocation, PauseOrigin) <= DroneRange)
	{
		PhotoCamera->SetActorLocation(NewLocation);
	}
}

void UPhotoModeSubsystem::RotateCamera(float DeltaYaw, float DeltaPitch)
{
	if (!PhotoCamera)
	{
		return;
	}
	FRotator Rotation = PhotoCamera->GetActorRotation();
	Rotation.Yaw += DeltaYaw;
	Rotation.Pitch = FMath::Clamp(Rotation.Pitch + DeltaPitch, -89.f, 89.f);
	Rotation.Roll = CurrentSettings.CameraRoll;
	PhotoCamera->SetActorRotation(Rotation);
}

void UPhotoModeSubsystem::OrbitAround(FVector FocalPoint, float DeltaYaw)
{
	if (!PhotoCamera)
	{
		return;
	}
	const FVector Offset = PhotoCamera->GetActorLocation() - FocalPoint;
	const FVector Rotated = Offset.RotateAngleAxis(DeltaYaw, FVector::UpVector);
	PhotoCamera->SetActorLocation(FocalPoint + Rotated);
	PhotoCamera->SetActorRotation((FocalPoint - PhotoCamera->GetActorLocation()).Rotation());
}

void UPhotoModeSubsystem::ApplySettings(const FPhotoSettings& Settings)
{
	CurrentSettings = Settings;
	if (!PhotoCamera)
	{
		return;
	}

	if (UCameraComponent* Camera = PhotoCamera->GetCameraComponent())
	{
		// Focal length → horizontal FOV on a 36mm-equivalent sensor.
		Camera->SetFieldOfView(FMath::RadiansToDegrees(2.f * FMath::Atan(36.f / (2.f * Settings.FocalLengthMM))));

		FPostProcessSettings& PP = Camera->PostProcessSettings;
		PP.bOverride_DepthOfFieldFstop = true;
		PP.DepthOfFieldFstop = Settings.Aperture;
		PP.bOverride_DepthOfFieldFocalDistance = true;
		PP.DepthOfFieldFocalDistance = Settings.FocusDistance;
		PP.bOverride_AutoExposureBias = true;
		PP.AutoExposureBias = Settings.ExposureCompensation;
		PP.bOverride_VignetteIntensity = true;
		PP.VignetteIntensity = Settings.Vignette;
		PP.bOverride_FilmGrainIntensity = true;
		PP.FilmGrainIntensity = Settings.FilmGrain;

		// Filters: quick saturation/contrast grades (LUT-quality filters are asset-side).
		PP.bOverride_ColorSaturation = true;
		PP.bOverride_ColorContrast = true;
		switch (Settings.Filter)
		{
			case EPhotoFilter::Noir:      PP.ColorSaturation = FVector4(0, 0, 0, 1); PP.ColorContrast = FVector4(1.2f, 1.2f, 1.2f, 1); break;
			case EPhotoFilter::Vibrant:   PP.ColorSaturation = FVector4(1.3f, 1.3f, 1.3f, 1); PP.ColorContrast = FVector4(1.1f, 1.1f, 1.1f, 1); break;
			case EPhotoFilter::Vintage:   PP.ColorSaturation = FVector4(0.7f, 0.7f, 0.7f, 1); PP.ColorContrast = FVector4(0.9f, 0.9f, 0.9f, 1); break;
			case EPhotoFilter::Cinematic: PP.ColorSaturation = FVector4(0.95f, 0.95f, 0.95f, 1); PP.ColorContrast = FVector4(1.15f, 1.15f, 1.15f, 1); break;
			default:                      PP.ColorSaturation = FVector4(1, 1, 1, 1); PP.ColorContrast = FVector4(1, 1, 1, 1); break;
		}
	}

	PhotoCamera->SetActorRotation(FRotator(PhotoCamera->GetActorRotation().Pitch,
		PhotoCamera->GetActorRotation().Yaw, Settings.CameraRoll));

	// Time-of-day override.
	if (Settings.TimeOfDayOverride >= 0.f)
	{
		if (ADayNightManager* DayNight = Cast<ADayNightManager>(
				UGameplayStatics::GetActorOfClass(GetGameInstance()->GetWorld(), ADayNightManager::StaticClass())))
		{
			DayNight->SetCurrentHour(Settings.TimeOfDayOverride);
		}
	}

	ApplyHideFlags();
}

void UPhotoModeSubsystem::ApplyHideFlags()
{
	UWorld* World = GetGameInstance()->GetWorld();
	if (!World)
	{
		return;
	}
	for (TActorIterator<AStickmanEnemyCharacter> It(World); It; ++It)
	{
		It->SetActorHiddenInGame(CurrentSettings.bHideEnemies);
	}
	// NPC hiding rides the dialogue-trigger component's owner set — content applies the
	// same pattern; UI hiding is the HUD listening to OnPhotoModeChanged + bHideUI.
}

// ---------------------------------------------------------------- capture -------------

void UPhotoModeSubsystem::TakePhoto(int32 ResolutionMultiplier)
{
	APlayerController* PC = UGameplayStatics::GetPlayerController(GetGameInstance()->GetWorld(), 0);
	if (!PC)
	{
		return;
	}

	const int32 Multiplier = FMath::Clamp(ResolutionMultiplier, 1, 4);
	PC->ConsoleCommand(FString::Printf(TEXT("HighResShot %d"), Multiplier));

	// The engine writes into the platform screenshot dir; record the folder for the gallery
	// (exact filename is engine-timestamped — the gallery UI lists the directory).
	const FString Dir = FPaths::ScreenShotDir();
	GalleryPaths.Add(Dir);
	OnPhotoCaptured.Broadcast(Dir);
}
