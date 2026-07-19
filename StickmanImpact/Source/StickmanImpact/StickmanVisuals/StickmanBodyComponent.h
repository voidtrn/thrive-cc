// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/SceneComponent.h"
#include "StickmanBodyComponent.generated.h"

class UStaticMeshComponent;
class UMaterialInstanceDynamic;

/**
 * Procedural stickman silhouette assembled from /Engine/BasicShapes primitives
 * (sphere head + cylinder torso/limbs). Gives player and enemy pawns a readable,
 * clearly-visible body with ZERO authored art content — no skeletal mesh, no rig,
 * no imported assets. A single tint colour distinguishes factions at a glance
 * (blue player vs. red enemy by convention).
 *
 * Usage: create as a default subobject in an actor constructor and attach to the
 * capsule root. Optionally call SetBodyColor() before/after registration. The old
 * single-primitive dev placeholders (cube/cone) can be hidden once this is present.
 *
 * All part sizes are authored in centimetres and map onto the engine primitives'
 * native dimensions (Sphere = 100cm diameter, Cylinder = 100cm tall / 100cm wide),
 * so a scale of 0.5 on the sphere yields a 50cm-diameter head, etc.
 */
UCLASS(ClassGroup = (StickmanVisuals), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UStickmanBodyComponent : public USceneComponent
{
	GENERATED_BODY()

public:
	UStickmanBodyComponent();

	/** Tint applied to every body part via a dynamic instance of BasicShapeMaterial. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "StickmanVisuals")
	FLinearColor BodyColor = FLinearColor(0.15f, 0.45f, 0.95f); // default: player blue

	/** Update the tint at runtime; safe before or after the component registers. */
	UFUNCTION(BlueprintCallable, Category = "StickmanVisuals")
	void SetBodyColor(const FLinearColor& NewColor);

	/** Hide/show the whole silhouette (e.g. own body in first-person camera mode). */
	UFUNCTION(BlueprintCallable, Category = "StickmanVisuals")
	void SetBodyHidden(bool bHidden);

protected:
	virtual void OnRegister() override;

	// Body parts (attached to this component). Head is a sphere; the rest are cylinders.
	UPROPERTY(VisibleAnywhere, Category = "StickmanVisuals")
	TObjectPtr<UStaticMeshComponent> Head;

	UPROPERTY(VisibleAnywhere, Category = "StickmanVisuals")
	TObjectPtr<UStaticMeshComponent> Torso;

	UPROPERTY(VisibleAnywhere, Category = "StickmanVisuals")
	TObjectPtr<UStaticMeshComponent> LeftLeg;

	UPROPERTY(VisibleAnywhere, Category = "StickmanVisuals")
	TObjectPtr<UStaticMeshComponent> RightLeg;

	UPROPERTY(VisibleAnywhere, Category = "StickmanVisuals")
	TObjectPtr<UStaticMeshComponent> LeftArm;

	UPROPERTY(VisibleAnywhere, Category = "StickmanVisuals")
	TObjectPtr<UStaticMeshComponent> RightArm;

private:
	// Creates one part subobject, assigns the shared static mesh, and attaches it.
	UStaticMeshComponent* MakePart(FName Name, class UStaticMesh* Mesh,
		const FVector& RelLocation, const FRotator& RelRotation, const FVector& RelScale);

	// Recolours every part with a fresh dynamic material instance tinted BodyColor.
	void ApplyBodyColor();

	UPROPERTY(Transient)
	TArray<TObjectPtr<UMaterialInstanceDynamic>> DynMaterials;
};
