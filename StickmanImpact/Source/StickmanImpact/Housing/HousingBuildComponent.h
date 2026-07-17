// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "HousingTypes.h"
#include "HousingBuildComponent.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnPlacementChanged, int32, PieceCount);

/**
 * The build-mode editor for the realm (on the player/HUD controller). Drives a ghost preview
 * of the selected furniture, snaps to a grid (toggle free placement), rotates in 45° steps
 * (or free), scales 0.5-1.5, and raises/lowers on Z; `ConfirmPlacement` commits to
 * URealmSubsystem (which owns the authoritative list + spawns the actor). Collision is
 * checked against existing placements before commit. Undo/redo keeps the last HistoryLimit
 * actions; blueprint save/load serializes the whole placed set for share/reuse.
 *
 * This is the UX layer; the model + realm energy live in URealmSubsystem.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UHousingBuildComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UHousingBuildComponent();

	// --- Selection + ghost transform ------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Build")
	void SelectFurniture(FName FurnitureID);

	UFUNCTION(BlueprintCallable, Category = "Build")
	void SetGhostLocation(FVector WorldLocation);

	UFUNCTION(BlueprintCallable, Category = "Build")
	void RotateGhost(float DeltaYaw);

	UFUNCTION(BlueprintCallable, Category = "Build")
	void ScaleGhost(float DeltaScale);

	UFUNCTION(BlueprintCallable, Category = "Build")
	void ElevateGhost(float DeltaZ);

	UFUNCTION(BlueprintPure, Category = "Build")
	FTransform GetGhostTransform() const { return GhostTransform; }

	// --- Commit / edit --------------------------------------------------------------------

	// Places the ghost into the realm (collision-checked). Returns the placed index or -1.
	UFUNCTION(BlueprintCallable, Category = "Build")
	int32 ConfirmPlacement();

	UFUNCTION(BlueprintCallable, Category = "Build")
	bool Undo();

	UFUNCTION(BlueprintCallable, Category = "Build")
	bool Redo();

	// --- Modes ----------------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Build")
	void SetGridSnap(bool bEnabled) { bGridSnap = bEnabled; }

	UFUNCTION(BlueprintPure, Category = "Build")
	bool IsGridSnapEnabled() const { return bGridSnap; }

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Build")
	float GridSize = 100.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Build")
	float RotationStep = 45.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Build")
	float MinScale = 0.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Build")
	float MaxScale = 1.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Build")
	float CollisionCheckRadius = 60.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Build")
	int32 HistoryLimit = 20;

	UPROPERTY(BlueprintAssignable, Category = "Build")
	FOnPlacementChanged OnPlacementChanged;

private:
	class URealmSubsystem* GetRealm() const;
	FVector SnapToGrid(const FVector& Location) const;
	bool OverlapsExisting(const FTransform& Transform) const;

	struct FBuildAction
	{
		bool bWasAdd = true;       // true = placed, false = removed
		FPlacedFurniture Piece;
	};

	FName SelectedFurnitureID;
	FTransform GhostTransform = FTransform::Identity;
	bool bGridSnap = true;

	TArray<FBuildAction> UndoStack;
	TArray<FBuildAction> RedoStack;
};
