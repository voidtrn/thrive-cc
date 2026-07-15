// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ReviveComponent.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnDowned);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnReviveProgress, float, Progress);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnRevived);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnBledOut);

/**
 * Down-but-not-out for co-op (and solo second-wind, if SoloSelfReviveTime > 0). Lethal
 * damage calls EnterDownedState() instead of killing (wire at the death branch of the
 * health application site): BleedOutTime starts counting; a nearby ally holds
 * StartRevive/CancelRevive to fill the revive bar (ReviveHoldTime, faster than
 * SoloSelfReviveTime by design — being helped beats waiting); success restores
 * ReviveHealthFraction of max HP.
 *
 * Replicated-play note: all state here is local. Under real networking the downed/revive
 * state must be server-authoritative (bDowned as a replicated var, Start/CancelRevive as
 * server RPCs) — listed in Docs/COOP_REPLICATION.md.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UReviveComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UReviveComponent();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

	UFUNCTION(BlueprintCallable, Category = "Revive")
	void EnterDownedState();

	UFUNCTION(BlueprintCallable, Category = "Revive")
	void StartRevive(AActor* Reviver);

	UFUNCTION(BlueprintCallable, Category = "Revive")
	void CancelRevive();

	UFUNCTION(BlueprintPure, Category = "Revive")
	bool IsDowned() const { return bDowned; }

	UFUNCTION(BlueprintPure, Category = "Revive")
	float GetBleedOutRemaining() const { return bDowned ? FMath::Max(BleedOutTime - DownedElapsed, 0.f) : 0.f; }

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Revive")
	float BleedOutTime = 30.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Revive")
	float ReviveHoldTime = 4.f;

	// 0 = no solo self-revive; downed alone = bleed out.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Revive")
	float SoloSelfReviveTime = 0.f;

	// Reviver must stay within this range or the hold cancels.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Revive")
	float ReviveRange = 250.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Revive")
	float ReviveHealthFraction = 0.4f;

	UPROPERTY(BlueprintAssignable, Category = "Revive")
	FOnDowned OnDowned;

	UPROPERTY(BlueprintAssignable, Category = "Revive")
	FOnReviveProgress OnReviveProgress;

	UPROPERTY(BlueprintAssignable, Category = "Revive")
	FOnRevived OnRevived;

	// Bleed-out reached zero — the owner dies for real; the death flow listens here.
	UPROPERTY(BlueprintAssignable, Category = "Revive")
	FOnBledOut OnBledOut;

private:
	void CompleteRevive();

	bool bDowned = false;
	float DownedElapsed = 0.f;
	float ReviveHeld = 0.f;

	TWeakObjectPtr<AActor> CurrentReviver;
};
