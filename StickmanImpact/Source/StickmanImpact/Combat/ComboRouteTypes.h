// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameplayTagContainer.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "ComboRouteTypes.generated.h"

/** One step in a saved combo route (an action + which weapon it's performed on). */
USTRUCT(BlueprintType)
struct FComboRouteStep
{
	GENERATED_BODY()

	// The action performed: a skill tag (normal/heavy/skill) or a special token like
	// "Swap"/"Dash" the training room interprets.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combo")
	FGameplayTag ActionTag;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combo")
	EWeaponType Weapon = EWeaponType::Sword;

	// Seconds to wait after this step before the next (0 = as soon as cancelable).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combo")
	float DelayAfter = 0.f;
};

/**
 * A player-authored combo route: an ordered list of steps
 * (e.g. Sword×2 → Swap Claymore → Slam → Swap Bow → Charged Shot). Saved as data; the
 * training room plays them back for practice, and export/import is just serializing this
 * struct to a share code. Combo-recording captures the player's inputs into one of these
 * (the recorder is a thin input-tap layer, deferred like the automated-test input replay —
 * see README).
 */
USTRUCT(BlueprintType)
struct FComboRoute
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combo")
	FString RouteName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combo")
	TArray<FComboRouteStep> Steps;
};
