// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "DetectiveModeComponent.generated.h"

class UNiagaraSystem;
class USoundBase;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnDetectiveModeChanged, bool, bActive);

/**
 * "Elemental sight" — a timed investigation pulse on the player. While active:
 * - the world desaturates slightly (camera post-process, same pattern as exhaustion in
 *   UGameFeelComponent),
 * - every AClueActor and ADiscoverySite within PulseRadius gets a custom-depth outline
 *   (stencil 1 = clue, 2 = secret site — the outline itself is a post-process material
 *   reading CustomDepth, standard UE setup, see Docs/DISCOVERY_DESIGN.md),
 * - detective-only clues (footprints, elemental residue, hidden messages) become visible.
 *
 * Duration-limited with a cooldown so it's a deliberate investigation beat, not a
 * permanent wallhack. Toggle off early is free.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UDetectiveModeComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UDetectiveModeComponent();

	UFUNCTION(BlueprintCallable, Category = "Detective")
	void ToggleDetectiveMode();

	UFUNCTION(BlueprintPure, Category = "Detective")
	bool IsDetectiveModeActive() const { return bActive; }

	UFUNCTION(BlueprintPure, Category = "Detective")
	bool IsOnCooldown() const;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Detective")
	float Duration = 8.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Detective")
	float Cooldown = 12.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Detective")
	float PulseRadius = 2500.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Detective")
	float Desaturation = 0.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Detective")
	TObjectPtr<UNiagaraSystem> PulseVFX;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Detective")
	TObjectPtr<USoundBase> ActivateSound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Detective")
	TObjectPtr<USoundBase> DeactivateSound;

	UPROPERTY(BlueprintAssignable, Category = "Detective")
	FOnDetectiveModeChanged OnDetectiveModeChanged;

private:
	void Activate();
	void Deactivate();
	void HighlightNearbyInvestigables();
	void ClearHighlights();
	void ApplyPostProcess(bool bEnable);

	bool bActive = false;
	double LastDeactivateTime = -1000.0;
	FTimerHandle DurationTimerHandle;

	UPROPERTY()
	TArray<TWeakObjectPtr<AActor>> HighlightedActors;
};
