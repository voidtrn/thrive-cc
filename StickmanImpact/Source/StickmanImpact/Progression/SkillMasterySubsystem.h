// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "GameplayTagContainer.h"
#include "SkillMasterySubsystem.generated.h"

/** Runtime mastery state for one skill. */
USTRUCT(BlueprintType)
struct FSkillMasteryState
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "Mastery")
	int32 Level = 1;

	UPROPERTY(BlueprintReadOnly, Category = "Mastery")
	int32 UsesThisLevel = 0;

	// Set once a mastery challenge gates the next level and hasn't been cleared.
	UPROPERTY(BlueprintReadOnly, Category = "Mastery")
	bool bAwaitingChallenge = false;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnMasteryLevelUp, FGameplayTag, SkillTag, int32, NewLevel);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnSkillAwakened, FGameplayTag, SkillTag);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnMasteryChallengeIssued, FGameplayTag, SkillTag, int32, GatedLevel);

/**
 * Use a skill -> it levels (1-10). Each mastery level past 1 adds +3% damage to that skill
 * (applied in the central damage funnel). Level 10 = "Awakened" — OnSkillAwakened fires and
 * IsAwakened() flips; the ability reads it to swap in its awakened behavior (e.g.
 * GA_PyroSlash Lv10 = double slash + fire trail; the branch lives in the ability, the flag
 * lives here).
 *
 * Mastery challenges: levels listed in ChallengeGatedLevels (default 4, 7, 10) don't grant
 * automatically — hitting the use quota issues OnMasteryChallengeIssued (UI shows the
 * objective; objectives are authored as quests/achievements) and the level lands when
 * CompleteMasteryChallenge is called.
 */
UCLASS()
class STICKMANIMPACT_API USkillMasterySubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// Called from the damage funnel on every player skill hit.
	void RegisterSkillUse(FGameplayTag SkillTag);

	UFUNCTION(BlueprintPure, Category = "Mastery")
	int32 GetMasteryLevel(FGameplayTag SkillTag) const;

	// 1.0 at level 1, +3% per level above 1 (1.27 at 10).
	UFUNCTION(BlueprintPure, Category = "Mastery")
	float GetMasteryDamageMultiplier(FGameplayTag SkillTag) const;

	UFUNCTION(BlueprintPure, Category = "Mastery")
	bool IsAwakened(FGameplayTag SkillTag) const { return GetMasteryLevel(SkillTag) >= MaxLevel; }

	UFUNCTION(BlueprintCallable, Category = "Mastery")
	void CompleteMasteryChallenge(FGameplayTag SkillTag);

	UFUNCTION(BlueprintPure, Category = "Mastery")
	FSkillMasteryState GetMasteryState(FGameplayTag SkillTag) const;

	// Uses needed to clear each level (index 0 = level 1 -> 2). Flat-ish curve, front-loaded.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Mastery")
	TArray<int32> UsesPerLevel = { 20, 35, 50, 70, 95, 125, 160, 200, 250 };

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Mastery")
	TArray<int32> ChallengeGatedLevels = { 4, 7, 10 };

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Mastery")
	float DamagePerLevel = 0.03f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Mastery")
	int32 MaxLevel = 10;

	UPROPERTY(BlueprintAssignable, Category = "Mastery")
	FOnMasteryLevelUp OnMasteryLevelUp;

	UPROPERTY(BlueprintAssignable, Category = "Mastery")
	FOnSkillAwakened OnSkillAwakened;

	UPROPERTY(BlueprintAssignable, Category = "Mastery")
	FOnMasteryChallengeIssued OnMasteryChallengeIssued;

	// Save hooks (not yet in UStickmanSaveManager's format — versioned change, see README).
	void ExportSaveState(TMap<FGameplayTag, FSkillMasteryState>& Out) const { Out = MasteryStates; }
	void ImportSaveState(const TMap<FGameplayTag, FSkillMasteryState>& In) { MasteryStates = In; }

private:
	void GrantLevel(FGameplayTag SkillTag, FSkillMasteryState& State);

	TMap<FGameplayTag, FSkillMasteryState> MasteryStates;
};
