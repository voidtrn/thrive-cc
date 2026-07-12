// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "GameplayTagContainer.h"
#include "AdaptiveDifficultySubsystem.generated.h"

/**
 * Performance-reactive difficulty knobs the AI reads each decision:
 * - GetAggressionMultiplier(): >1 when the player hasn't been hit for UnhitAggressionSeconds
 *   (enemies press harder), rises gradually.
 * - GetAttackCooldownMultiplier(): >1 mercy when the player's HP is low (slower attacks).
 * - Learning: every player hit records its skill tag; GetPlayerFavoriteSkill() lets enemy
 *   kits counter the most-spammed move (e.g. a BT branch that sidesteps when it telegraphs).
 * Global tuning: DifficultyScale (exposed for the GameInstance/settings to set).
 */
UCLASS()
class STICKMANIMPACT_API UAdaptiveDifficultySubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Difficulty")
	float DifficultyScale = 1.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Difficulty")
	float UnhitAggressionSeconds = 30.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Difficulty")
	float MaxAggressionMultiplier = 1.5f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Difficulty")
	float LowHPMercyThreshold = 0.25f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Difficulty")
	float MercyCooldownMultiplier = 1.4f;

	// Call when the player takes a hit (resets the unhit clock).
	UFUNCTION(BlueprintCallable, Category = "Difficulty")
	void NotifyPlayerWasHit() { LastPlayerHitTime = GetWorld() ? GetWorld()->GetTimeSeconds() : 0.f; }

	// Call per player attack (learning input) — wired from UComboMeterSubsystem::RegisterHit.
	UFUNCTION(BlueprintCallable, Category = "Difficulty")
	void RecordPlayerSkillUse(FGameplayTag SkillTag);

	UFUNCTION(BlueprintPure, Category = "Difficulty")
	float GetAggressionMultiplier() const;

	UFUNCTION(BlueprintPure, Category = "Difficulty")
	float GetAttackCooldownMultiplier() const;

	UFUNCTION(BlueprintPure, Category = "Difficulty")
	FGameplayTag GetPlayerFavoriteSkill() const;

private:
	float LastPlayerHitTime = 0.f;
	TMap<FGameplayTag, int32> SkillUseCounts;
};
