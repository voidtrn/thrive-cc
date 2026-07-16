// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "DefenseComponent.generated.h"

class USoundBase;
class AStickmanEnemyCharacter;

UENUM(BlueprintType)
enum class EDefenseResult : uint8
{
	None,          // No defensive state — full damage.
	IFrame,        // Dashing i-frames (no witch-time bonus) — damage negated.
	PerfectDodge,  // Dash inside the perfect window — negated + witch time + counter.
	PerfectParry,  // Parry inside the window — negated + stagger + riposte + energy.
	PartialParry,  // Parry slightly off — 50% damage, spark, no stagger.
	GuardBreak     // Parry failed (mistimed / unparryable) — full damage + can't act.
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnPerfectDodge, FLinearColor, ElementColor);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnParryResolved, EDefenseResult, Result);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnCounterArmed, float, DamageMultiplier);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnGuardBroken);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnNearMiss, FLinearColor, ElementColor);

/**
 * Timing-based defense on the player (created by AStickmanCharacter). Two skill-expressive
 * defenses funnel through here, sized by UDefenseSkillSubsystem levels:
 *
 * PERFECT DODGE — Dash() calls NotifyDodgeStarted(). A dash whose i-frame window overlaps an
 * incoming hit negates it; if that hit lands inside the *perfect* front slice
 * (PerfectDodgeWindow) it triggers Witch Time (global dilation drops, the player's own
 * CustomTimeDilation compensates so they stay full speed), element-tinted screen glow, a
 * sound, and arms a 150% counter. A dash just after the window = Near Miss (mild slow).
 * Spamming (>= DodgeSpamCount within DodgeSpamWindow) disables the perfect window for
 * DodgeSpamPenalty seconds — i-frames still work, the bonus doesn't.
 *
 * PARRY — a parry input calls BeginParry(), opening the parry window. An incoming attack
 * resolved inside it = Perfect Parry (negate, ForceStagger the attacker, refund 20% energy,
 * arm a 200% riposte). Off by up to PartialGrace = Partial Parry (50% damage, spark, no
 * stagger). Otherwise, or against an unparryable (red) attack = Guard Break (full damage,
 * can't act for GuardBreakLockout). Higher parry levels widen the window and add projectile
 * reflect / AoE blast (broadcast for the projectile / VFX systems to realize).
 *
 * The damage funnel (UStickmanGameplayAbility::ApplyDamageToTarget) calls
 * ResolveIncomingAttack on the player-target branch and scales damage by the result; it
 * calls ConsumeCounterMultiplier on the player-attacker branch to spend the armed counter.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UDefenseComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UDefenseComponent();

	// --- Input entry points (called by AStickmanCharacter) --------------------------------
	void NotifyDodgeStarted();

	UFUNCTION(BlueprintCallable, Category = "Defense")
	void BeginParry();

	// --- Damage-funnel entry points -------------------------------------------------------

	// Resolve an incoming hit against current defensive state; applies effects and returns the
	// classification. The caller maps it to a damage multiplier via GetDamageMultiplier().
	EDefenseResult ResolveIncomingAttack(AActor* Attacker, bool bAttackParryable);

	// Damage multiplier for a result: negated (0) for dodge/iframe/perfect-parry, 0.5 partial,
	// 1 otherwise.
	static float GetDamageMultiplier(EDefenseResult Result);

	// Spend the armed counter/riposte bonus (1.0 if none). One-shot within the counter window.
	float ConsumeCounterMultiplier();

	UFUNCTION(BlueprintPure, Category = "Defense")
	bool IsGuardBroken() const;

	UFUNCTION(BlueprintPure, Category = "Defense")
	bool IsInWitchTime() const { return bWitchTimeActive; }

	// --- Tunables -------------------------------------------------------------------------

	// Front slice of a dash that counts as a "perfect" dodge (rest of the dash = plain i-frames).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Dodge")
	float PerfectDodgeWindow = 0.2f;

	// Whole-dash i-frame duration (matches DashDuration by default).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Dodge")
	float IFrameWindow = 0.2f;

	// Grace after the perfect window where a hit still gives a weak Near Miss slow.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Dodge")
	float NearMissGrace = 0.12f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Dodge")
	float WitchTimeDilation = 0.2f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Dodge")
	float NearMissDilation = 0.8f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Dodge")
	float NearMissRealSeconds = 0.35f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Dodge")
	float CounterDamageMultiplier = 1.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Dodge")
	int32 DodgeSpamCount = 3;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Dodge")
	float DodgeSpamWindow = 2.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Dodge")
	float DodgeSpamPenalty = 1.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Dodge")
	float WitchTimeSpreadRadius = 700.f;

	// Parry.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Parry")
	float PartialParryGrace = 0.1f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Parry")
	float RiposteDamageMultiplier = 2.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Parry")
	float ParryEnergyRefundFraction = 0.2f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Parry")
	float ParryStaggerDuration = 1.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Parry")
	float GuardBreakLockout = 0.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Parry")
	float ParryBlastRadius = 400.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Parry")
	float ParryBlastDamage = 80.f;

	// Element colors for the screen-glow feedback (indexed by EStickmanElement).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Feedback")
	TMap<EStickmanElement, FLinearColor> ElementColors;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Feedback")
	TObjectPtr<USoundBase> PerfectDodgeSound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Feedback")
	TObjectPtr<USoundBase> ParrySound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Defense|Feedback")
	TObjectPtr<class UNiagaraSystem> ParrySparkVFX;

	// --- Delegates (UI popups, VFX, controller vibration) ---------------------------------

	UPROPERTY(BlueprintAssignable, Category = "Defense")
	FOnPerfectDodge OnPerfectDodge;

	UPROPERTY(BlueprintAssignable, Category = "Defense")
	FOnNearMiss OnNearMiss;

	UPROPERTY(BlueprintAssignable, Category = "Defense")
	FOnParryResolved OnParryResolved;

	UPROPERTY(BlueprintAssignable, Category = "Defense")
	FOnCounterArmed OnCounterArmed;

	UPROPERTY(BlueprintAssignable, Category = "Defense")
	FOnGuardBroken OnGuardBroken;

	// Fired when a level-4 parry should emit its AoE blast / projectile is reflected — the
	// VFX + (future) projectile systems realize these.
	UPROPERTY(BlueprintAssignable, Category = "Defense")
	FOnGuardBroken OnParryBlast; // reuse zero-param signature

protected:
	virtual void BeginPlay() override;

private:
	class UDefenseSkillSubsystem* GetSkills() const;
	FLinearColor ColorForElement(EStickmanElement Element) const;
	void TriggerWitchTime(EStickmanElement Element, AActor* Attacker);
	void EndWitchTime();
	void ArmCounter(float Multiplier);
	void PlaySound(USoundBase* Sound) const;

	// Dodge state.
	double DodgeStartTime = -100.0;
	double DodgeSpamPenaltyUntil = -100.0;
	TArray<double> RecentDodgeTimes;

	// Parry state.
	double ParryStartTime = -100.0;
	double GuardBreakUntil = -100.0;

	// Counter.
	float ArmedCounterMultiplier = 1.f;
	double CounterExpiryTime = -100.0;

	// Witch time.
	bool bWitchTimeActive = false;
	FTimerHandle WitchTimeTimerHandle;
	FTimerHandle NearMissTimerHandle;
};
