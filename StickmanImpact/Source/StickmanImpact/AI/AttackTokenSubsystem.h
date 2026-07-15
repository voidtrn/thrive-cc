// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "AttackTokenSubsystem.generated.h"

/**
 * Group-AI attack rotation: only MaxConcurrentAttackers enemies may hold an attack token at
 * once — the rest circle/reposition instead of dogpiling. BTTask_SelectWeightedAttack
 * requests a token before telegraphing and releases it after the swing; a denied request
 * fails the BT branch so the Selector falls through to repositioning. Tokens auto-expire
 * (TokenTimeout) so a killed/staggered holder can't deadlock the rotation. "Combo attack"
 * moments: briefly raise MaxConcurrentAttackers to let 2 enemies swing together.
 */
UCLASS()
class STICKMANIMPACT_API UAttackTokenSubsystem : public UWorldSubsystem
{
	GENERATED_BODY()

public:
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Tokens")
	int32 MaxConcurrentAttackers = 2;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Tokens")
	float TokenTimeout = 5.f;

	UFUNCTION(BlueprintCallable, Category = "Tokens")
	bool RequestAttackToken(AActor* Requester);

	UFUNCTION(BlueprintCallable, Category = "Tokens")
	void ReleaseAttackToken(AActor* Holder);

	UFUNCTION(BlueprintPure, Category = "Tokens")
	int32 GetActiveAttackerCount() const;

	// Temporary window where an extra attacker may join (tighter dodge for the player).
	UFUNCTION(BlueprintCallable, Category = "Tokens")
	void OpenComboAttackWindow(float Duration);

private:
	struct FToken { TWeakObjectPtr<AActor> Holder; double GrantTime = 0.0; };
	mutable TArray<FToken> Tokens;
	int32 BonusSlots = 0;
	FTimerHandle ComboWindowTimerHandle;

	void PruneExpired() const;
};
