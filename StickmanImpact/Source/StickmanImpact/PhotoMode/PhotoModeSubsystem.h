// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "PhotoModeSubsystem.generated.h"

class ACameraActor;

UENUM(BlueprintType)
enum class EPhotoFilter : uint8
{
	None,
	Cinematic,
	Vibrant,
	Vintage,
	Noir,
	Anime
};

/** All manual camera/scene parameters the photo UI edits. */
USTRUCT(BlueprintType)
struct FPhotoSettings
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Photo", meta = (ClampMin = "10", ClampMax = "300"))
	float FocalLengthMM = 35.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Photo", meta = (ClampMin = "1.4", ClampMax = "22"))
	float Aperture = 4.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Photo")
	float FocusDistance = 1000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Photo", meta = (ClampMin = "-3", ClampMax = "3"))
	float ExposureCompensation = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Photo", meta = (ClampMin = "-45", ClampMax = "45"))
	float CameraRoll = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Photo")
	EPhotoFilter Filter = EPhotoFilter::None;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Photo", meta = (ClampMin = "0", ClampMax = "1"))
	float Vignette = 0.2f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Photo", meta = (ClampMin = "0", ClampMax = "1"))
	float FilmGrain = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Photo")
	bool bHideUI = true;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Photo")
	bool bHideEnemies = false;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Photo")
	bool bHideNPCs = false;

	// Time-of-day override hour (-1 = leave world time).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Photo")
	float TimeOfDayOverride = -1.f;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnPhotoModeChanged, bool, bActive);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnPhotoCaptured, const FString&, FilePath);

/**
 * Photo mode: enter pauses the world (real pause — works mid-cutscene too), spawns a free
 * camera at the current view, and hands input to the photo UI. The subsystem owns:
 *
 * - **Camera**: free-fly (`MoveCamera`/`RotateCamera`, range-clamped to DroneRange around
 *   the pause point), orbit helper (`OrbitAround`), and the FPhotoSettings applied to the
 *   camera each change (focal length → FOV, aperture/focus → DoF post-process, exposure,
 *   roll, filter/vignette/grain post-process).
 * - **Scene**: hide UI/enemies/NPCs toggles, time-of-day override (drives the day/night
 *   manager's hour temporarily, restored on exit).
 * - **Capture**: `TakePhoto` = high-res screenshot (console `HighResShot` multiplier for
 *   up-to-8K), file lands in the platform screenshots dir; `OnPhotoCaptured` feeds the
 *   in-game gallery (a manifest of captured paths + metadata).
 *
 * Character posing (pose library, expressions, group placement, elemental-aura toggle) is
 * anim/BP content driven by the paused pawns' anim instances — the pose list is data the
 * photo UI applies; the subsystem exposes the pause + capture rails. Co-op posing rides
 * the co-op session. Photo challenges/sharing = backend scope.
 */
UCLASS()
class STICKMANIMPACT_API UPhotoModeSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Photo")
	bool EnterPhotoMode();

	UFUNCTION(BlueprintCallable, Category = "Photo")
	void ExitPhotoMode();

	UFUNCTION(BlueprintPure, Category = "Photo")
	bool IsActive() const { return bActive; }

	// --- Camera ---------------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Photo")
	void MoveCamera(FVector LocalDelta);

	UFUNCTION(BlueprintCallable, Category = "Photo")
	void RotateCamera(float DeltaYaw, float DeltaPitch);

	UFUNCTION(BlueprintCallable, Category = "Photo")
	void OrbitAround(FVector FocalPoint, float DeltaYaw);

	UFUNCTION(BlueprintCallable, Category = "Photo")
	void ApplySettings(const FPhotoSettings& Settings);

	UFUNCTION(BlueprintPure, Category = "Photo")
	const FPhotoSettings& GetSettings() const { return CurrentSettings; }

	// --- Capture --------------------------------------------------------------------------

	// ResolutionMultiplier 1-4 (4 ≈ 8K on a 1080p base).
	UFUNCTION(BlueprintCallable, Category = "Photo")
	void TakePhoto(int32 ResolutionMultiplier = 2);

	UFUNCTION(BlueprintPure, Category = "Photo")
	const TArray<FString>& GetGalleryPaths() const { return GalleryPaths; }

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Photo")
	float DroneRange = 5000.f;

	UPROPERTY(BlueprintAssignable, Category = "Photo")
	FOnPhotoModeChanged OnPhotoModeChanged;

	UPROPERTY(BlueprintAssignable, Category = "Photo")
	FOnPhotoCaptured OnPhotoCaptured;

private:
	void ApplyHideFlags();

	bool bActive = false;
	FPhotoSettings CurrentSettings;
	FVector PauseOrigin = FVector::ZeroVector;

	UPROPERTY()
	TObjectPtr<ACameraActor> PhotoCamera;

	TArray<FString> GalleryPaths;
	float SavedTimeOfDayHour = -1.f;
};
