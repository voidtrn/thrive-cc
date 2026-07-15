// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "StickmanLODComponent.generated.h"

class UMaterialBillboardComponent;
class USkeletalMeshComponent;
class UMaterialInterface;

/**
 * LOD2/LOD3 for background stickman characters. LOD0 (full mesh, <30m) and LOD1 (simplified
 * mesh/reduced bones, 30-80m) are standard SkeletalMesh LOD levels — configure those on the
 * mesh asset's LOD settings in the editor, the engine handles them automatically by screen
 * size. This component only handles what the engine's mesh LOD system can't: swapping to a
 * flat animated-flipbook billboard at LOD2 (80-200m) and fully culling at LOD3 (200m+).
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UStickmanLODComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UStickmanLODComponent();

	virtual void BeginPlay() override;
	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

	// LOD2 starts here (billboard replaces the skeletal mesh).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "LOD")
	float LOD2StartDistance = 8000.f;

	// LOD3 starts here (fully culled — hidden and tick-disabled).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "LOD")
	float LOD3StartDistance = 20000.f;

	// An animated flipbook material (e.g. built from a UPaperFlipbook-style sprite sheet, or
	// a material sampling a baked animation atlas) assigned to the billboard at LOD2.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "LOD")
	TObjectPtr<UMaterialInterface> BillboardFlipbookMaterial;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "LOD")
	float CheckInterval = 0.5f;

protected:
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "LOD", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UMaterialBillboardComponent> BillboardComponent;

private:
	enum class ELODState : uint8 { Mesh, Billboard, Culled };

	void ApplyLODState(ELODState NewState);

	ELODState CurrentState = ELODState::Mesh;
	float TimeSinceCheck = 0.f;
};
