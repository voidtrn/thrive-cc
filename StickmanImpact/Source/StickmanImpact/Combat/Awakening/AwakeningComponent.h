// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "GameplayTagContainer.h"
#include "AwakeningComponent.generated.h"

class UNiagaraSystem;
class USkeletalMesh;
class USoundBase;

/** Per-character awakened form data (element theme, look, awakening-only skill). */
USTRUCT(BlueprintType)
struct FAwakeningForm
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Awakening")
	FString CharacterID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Awakening")
	EStickmanElement Element = EStickmanElement::Pyro;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Awakening")
	FText FormName; // "Inferno Form", "Absolute Zero", …

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Awakening")
	TObjectPtr<USkeletalMesh> TransformedMesh;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Awakening")
	TObjectPtr<UNiagaraSystem> AuraVFX;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Awakening")
	TObjectPtr<USoundBase> ActivationVoiceLine;

	// The awakening-only skill granted for the duration.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Awakening")
	FGameplayTag AwakeningSkillTag;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnAwakeningGaugeChanged, float, Fraction);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnAwakeningStateChanged, bool, bAwakened);

/**
 * "Devil Trigger"-style temporary transformation, separate from the Elemental Burst. A gauge
 * fills from taking damage, perfect dodges, style-rank increases, kills, and faster at low HP
 * (desperation). Full = `Activate` (once per battle, or `MaxActivationsPerBattle` with
 * upgrades): the character transforms (mesh/aura/voice), all stats +StatBonus, skill
 * cooldowns are skipped (the ability checks `IsSkillCooldownWaived`), HP regens, and the
 * awakening-only skill is available. After `Duration`, an exhaustion window (`ExhaustStats`
 * penalty for `ExhaustDuration`, no gauge gain for `GaugeLockAfter`).
 *
 * Wired into the damage funnel: `GetStatMultiplier` scales player damage; the player-hit
 * path calls `AddGauge` (damage taken) and kills call it too. Upgrades bump duration / stat
 * bonus / activations / gauge rate; the awakening finisher fires `OnAwakeningEnd`.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UAwakeningComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UAwakeningComponent();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

	// Active character's form (set on party switch).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Awakening")
	FAwakeningForm Form;

	// Add gauge from an event (damage taken / dodge / kill / style). Scaled up at low HP.
	UFUNCTION(BlueprintCallable, Category = "Awakening")
	void AddGauge(float Amount);

	UFUNCTION(BlueprintCallable, Category = "Awakening")
	bool Activate();

	UFUNCTION(BlueprintPure, Category = "Awakening")
	bool IsAwakened() const { return bAwakened; }

	UFUNCTION(BlueprintPure, Category = "Awakening")
	bool IsFull() const { return Gauge >= MaxGauge; }

	UFUNCTION(BlueprintPure, Category = "Awakening")
	float GetGaugeFraction() const { return MaxGauge > 0.f ? Gauge / MaxGauge : 0.f; }

	// Damage-funnel hook: player outgoing damage multiplier while awakened.
	UFUNCTION(BlueprintPure, Category = "Awakening")
	float GetStatMultiplier() const;

	// Ability hook: cooldowns are waived while awakened.
	UFUNCTION(BlueprintPure, Category = "Awakening")
	bool IsSkillCooldownWaived() const { return bAwakened; }

	UFUNCTION(BlueprintCallable, Category = "Awakening")
	void ResetBattleState() { ActivationsUsed = 0; }

	// --- Tunables + upgrades --------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Awakening")
	float MaxGauge = 100.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Awakening")
	float Duration = 15.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Awakening")
	float StatBonus = 1.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Awakening")
	float LowHPGaugeMultiplier = 2.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Awakening")
	float HealPerSecond = 30.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Awakening")
	float ExhaustStats = 0.7f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Awakening")
	float ExhaustDuration = 10.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Awakening")
	float GaugeLockAfter = 60.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Awakening")
	int32 MaxActivationsPerBattle = 1;

	UPROPERTY(BlueprintAssignable, Category = "Awakening")
	FOnAwakeningGaugeChanged OnAwakeningGaugeChanged;

	UPROPERTY(BlueprintAssignable, Category = "Awakening")
	FOnAwakeningStateChanged OnAwakeningStateChanged;

	// Transformation set-piece (1.5s skippable cutscene, model swap) — BP realizes the
	// spectacle; C++ owns gauge/duration/stat/heal.
	UFUNCTION(BlueprintImplementableEvent, Category = "Awakening")
	void OnAwakeningBegin();

	UFUNCTION(BlueprintImplementableEvent, Category = "Awakening")
	void OnAwakeningEnd();

private:
	void EndAwakening();
	class AStickmanCharacter* GetOwnerCharacter() const;

	float Gauge = 0.f;
	bool bAwakened = false;
	int32 ActivationsUsed = 0;
	double GaugeLockedUntil = -1000.0;
	double ExhaustUntil = -1000.0;

	FTimerHandle DurationTimerHandle;
};
