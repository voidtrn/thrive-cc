// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "StickmanEnemyCharacter.h"
#include "EnemyShieldGuard.generated.h"

/** Blocks frontal hits (big damage reduction while an attacker is within its facing arc), slow but tanky. */
UCLASS()
class STICKMANIMPACT_API AEnemyShieldGuard : public AStickmanEnemyCharacter
{
	GENERATED_BODY()

public:
	AEnemyShieldGuard();

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combat")
	bool bHasFrontalBlock = true;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combat")
	float BlockDamageMultiplier = 0.2f; // 80% reduction while blocking.

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Combat")
	float BlockArcHalfAngleDegrees = 75.f;

	// Read by UStickmanGameplayAbility::ApplyDamageToTarget before applying a hit.
	UFUNCTION(BlueprintPure, Category = "Combat")
	float GetIncomingDamageMultiplier(const FVector& AttackerLocation) const;
};
