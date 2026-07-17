// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "Quest/StickmanQuestTypes.h"
#include "StickmanBossTypes.generated.h"

class UGameplayAbility;
class UAnimMontage;
class UNiagaraSystem;
class USoundBase;

/** Which encounter flavor a boss is — drives respawn, scaling, and reward rules. */
UENUM(BlueprintType)
enum class EBossVariant : uint8
{
	Story,      // Fixed level, hand-tuned, one-time.
	World,      // Open-world, respawns, farmable mats.
	Weekly,     // Limited rewards, highest difficulty.
	Abyss,      // Timed challenge, leaderboard.
	Corrupted   // Post-game harder variant with extra mechanics.
};

/** Broad attack-pattern category for the rotation picker + telegraph styling. */
UENUM(BlueprintType)
enum class EBossAttackPattern : uint8
{
	Combo,       // 2-5 hit tracking string.
	AoE,         // Expanding circle/cone/full arena.
	Charge,      // Linear rush with wall impact.
	Projectile,  // Pattern-based (spiral/wave/rain).
	Grab,        // Unblockable — must dodge.
	Summon,      // Calls minions.
	Ultimate     // Arena-wide; hide-behind-cover mechanic.
};

/** One boss phase, gated by a HP% threshold. */
USTRUCT(BlueprintType)
struct FBossPhase
{
	GENERATED_BODY()

	// Enter this phase when HP falls to/below this fraction (1..0). Author descending.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss", meta = (ClampMin = "0", ClampMax = "1"))
	float HPThreshold = 0.75f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss")
	FString PhaseName;

	// Abilities granted to the boss's ASC on entering the phase (added to whatever it has).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss")
	TArray<TSubclassOf<UGameplayAbility>> NewAbilities;

	// Which patterns become available this phase (rotation draws from this set).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss")
	TArray<EBossAttackPattern> AvailablePatterns;

	// Aggression scalar for this phase (attack-speed / cooldown compression). Final phase =
	// "desperation": faster but more predictable (smaller AvailablePatterns set).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss")
	float AggressionMultiplier = 1.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss")
	TObjectPtr<UAnimMontage> PhaseTransitionAnimation;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss")
	TObjectPtr<UNiagaraSystem> TransitionVFX;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss")
	TObjectPtr<USoundBase> PhaseTransitionSFX;

	// Optional mid-fight taunt line shown on entering the phase.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss")
	FText PhaseTaunt;
};

/** A rotating weak point (bone) that takes bonus damage; breaking it makes the bonus permanent. */
USTRUCT(BlueprintType)
struct FBossWeakPoint
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss")
	FName BoneName = NAME_None;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss")
	float DamageMultiplier = 1.75f;

	// Damage into this weak point to "break" it (then the bonus applies permanently).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss")
	float BreakThreshold = 2000.f;

	// Element that must be used to break the boss's elemental shield (None = no shield gate).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss")
	EStickmanElement ShieldElement = EStickmanElement::None;
};
