// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "CombatFeedbackSubsystem.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FOnHitLanded, AActor*, Target, float, Damage, bool, bIsCritical);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnKillConfirmed, AActor*, Target);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnComboCountChanged, int32, ComboCount);

/**
 * Decouples "something in combat happened" from "the HUD should flash/shake/count it" —
 * combat code (UStickmanGameplayAbility, GA_NormalAttack, ...) calls Notify*() without needing
 * a reference chain back to whatever widget is currently on screen; UHUDWidget just listens.
 */
UCLASS()
class STICKMANIMPACT_API UCombatFeedbackSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Combat Feedback")
	void NotifyHitLanded(AActor* Target, float Damage, bool bIsCritical) { OnHitLanded.Broadcast(Target, Damage, bIsCritical); }

	UFUNCTION(BlueprintCallable, Category = "Combat Feedback")
	void NotifyKillConfirmed(AActor* Target) { OnKillConfirmed.Broadcast(Target); }

	UFUNCTION(BlueprintCallable, Category = "Combat Feedback")
	void NotifyComboCountChanged(int32 ComboCount) { OnComboCountChanged.Broadcast(ComboCount); }

	UPROPERTY(BlueprintAssignable, Category = "Combat Feedback")
	FOnHitLanded OnHitLanded;

	UPROPERTY(BlueprintAssignable, Category = "Combat Feedback")
	FOnKillConfirmed OnKillConfirmed;

	UPROPERTY(BlueprintAssignable, Category = "Combat Feedback")
	FOnComboCountChanged OnComboCountChanged;
};
