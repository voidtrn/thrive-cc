// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "CharacterPreviewStage.generated.h"

class USkeletalMeshComponent;
class USceneCaptureComponent2D;
class USkeletalMesh;
class UTextureRenderTarget2D;

/**
 * Off-screen stage for the character screen's rotatable 3D preview: a skeletal mesh + a
 * SceneCapture2D pointed at it, rendering into a render target the UI displays. Spawned
 * far below the playable map (default -100000 Z) so it never appears in the real world;
 * UCharacterScreenWidget spawns/destroys one per screen open.
 */
UCLASS()
class STICKMANIMPACT_API ACharacterPreviewStage : public AActor
{
	GENERATED_BODY()

public:
	ACharacterPreviewStage();

	UFUNCTION(BlueprintCallable, Category = "Preview")
	void SetPreviewMesh(USkeletalMesh* Mesh);

	UFUNCTION(BlueprintCallable, Category = "Preview")
	void AddYaw(float DeltaDegrees);

	UFUNCTION(BlueprintPure, Category = "Preview")
	UTextureRenderTarget2D* GetPreviewRenderTarget() const { return PreviewRenderTarget; }

protected:
	virtual void BeginPlay() override;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Preview", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<USkeletalMeshComponent> PreviewMesh;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Preview", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<USceneCaptureComponent2D> PreviewCapture;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Preview")
	int32 RenderTargetSize = 512;

private:
	UPROPERTY()
	TObjectPtr<UTextureRenderTarget2D> PreviewRenderTarget;
};
