// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "DiscoveryManager.h"
#include "StickmanWorldTypes.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "Quest/StickmanQuestTypes.h"
#include "DiscoverySite.generated.h"

class USphereComponent;
class UNiagaraSystem;
class USoundBase;

/**
 * A placeable secret. Registers itself with UDiscoveryManager at BeginPlay (so area totals
 * and "N secrets remaining" are right before anything is found) and fires the discovery +
 * tiered reward when the player walks into the trigger.
 *
 * Gating:
 * - Time-locked: bOnlyAtNight / bRequireWeather + RequiredWeather — the trigger simply
 *   doesn't fire outside the window (site stays undiscovered, player can come back).
 * - Ability-gated: bStartSealed hides the actor + disables collision until Unseal() is
 *   called. Wire Unseal to whatever opens it — a breakable wall's death, an
 *   AElementalTerrainZone overlap, a puzzle's completion. NotifyElementApplied(Element)
 *   is a convenience: call it from the gate mechanism and it unseals when Element matches
 *   RequiredElement (e.g. melting an ice wall with Pyro).
 *
 * Detective mode: sites within pulse range get their custom-depth stencil enabled by
 * UDetectiveModeComponent — no code needed here beyond having a mesh/trigger.
 */
UCLASS()
class STICKMANIMPACT_API ADiscoverySite : public AActor
{
	GENERATED_BODY()

public:
	ADiscoverySite();

	// Unique across the game — reused IDs silently merge into one discovery.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery")
	FString DiscoveryID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery")
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery")
	FName Area = NAME_None;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery")
	EDiscoveryLayer Layer = EDiscoveryLayer::Surface;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery")
	EDiscoveryTier Tier = EDiscoveryTier::Tier1;

	// Granted through UCollectibleManager::GrantReward on discovery.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery")
	FRewardData Reward;

	// --- Time/weather lock ---------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery|Gate")
	bool bOnlyAtNight = false;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery|Gate")
	bool bRequireWeather = false;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery|Gate", meta = (EditCondition = "bRequireWeather"))
	EStickmanWeatherType RequiredWeather = EStickmanWeatherType::Rain;

	// --- Ability gate ---------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery|Gate")
	bool bStartSealed = false;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery|Gate", meta = (EditCondition = "bStartSealed"))
	EStickmanElement RequiredElement = EStickmanElement::None;

	UFUNCTION(BlueprintCallable, Category = "Discovery")
	void Unseal();

	// Unseals if Element matches RequiredElement. Call from the gating mechanism.
	UFUNCTION(BlueprintCallable, Category = "Discovery")
	void NotifyElementApplied(EStickmanElement Element);

	// --- Feedback -------------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery|Feedback")
	TObjectPtr<UNiagaraSystem> DiscoveryVFX;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Discovery|Feedback")
	TObjectPtr<USoundBase> DiscoverySound;

	// Fires after the reward lands — spawn per-site flourish (chest opening, boss intro) here.
	UFUNCTION(BlueprintImplementableEvent, Category = "Discovery")
	void OnDiscovered(AActor* Discoverer);

protected:
	virtual void BeginPlay() override;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Discovery", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<USphereComponent> TriggerSphere;

private:
	UFUNCTION()
	void HandleOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp,
		int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

	bool PassesTimeWeatherGate() const;
};
