#pragma once

#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "Combat/CombatTypes.h"
#include "AbilityBase.generated.h"

class ACharacterBase;

UENUM(BlueprintType)
enum class EAbilitySlot : uint8
{
	ElementalSkill,
	ElementalBurst
};

/**
 * Base ability (E / Q). EditInlineNew + Instanced di CombatComponent —
 * tiap karakter bikin subclass BP dengan OnActivate sendiri
 * (projectile, AOE, buff, deployable, shield, heal).
 */
UCLASS(Abstract, Blueprintable, BlueprintType, EditInlineNew, DefaultToInstanced)
class MYGAME_API UAbilityBase : public UObject
{
	GENERATED_BODY()

public:
	UPROPERTY(EditDefaultsOnly, Category = "Ability")
	EAbilitySlot Slot = EAbilitySlot::ElementalSkill;

	/** Skill: 6-15s. Burst: 12-20s. */
	UPROPERTY(EditDefaultsOnly, Category = "Ability")
	float Cooldown = 8.f;

	/** Burst only. Skill = 0. Range balance: 40-80. */
	UPROPERTY(EditDefaultsOnly, Category = "Ability", meta = (EditCondition = "Slot == EAbilitySlot::ElementalBurst"))
	float EnergyCost = 60.f;

	/** Skill: 200-400%. Burst: 500-900%. */
	UPROPERTY(EditDefaultsOnly, Category = "Ability")
	float DamageMultiplier = 3.f;

	/** Particle energy yang di-spawn saat skill hit (2-4). */
	UPROPERTY(EditDefaultsOnly, Category = "Ability")
	int32 EnergyParticlesOnHit = 3;

	/** Gauge apply (1-2U). */
	UPROPERTY(EditDefaultsOnly, Category = "Ability")
	float GaugeUnits = 1.f;

	UPROPERTY(EditDefaultsOnly, Category = "Ability")
	TObjectPtr<UAnimMontage> Montage;

	// --- Burst cinematic ---
	/** Slow motion 0.2s saat burst mulai. */
	UPROPERTY(EditDefaultsOnly, Category = "Ability|Burst")
	float SlowMotionDuration = 0.2f;

	UPROPERTY(EditDefaultsOnly, Category = "Ability|Burst")
	float SlowMotionDilation = 0.2f;

	/** i-frame selama animasi burst (1-2s). */
	UPROPERTY(EditDefaultsOnly, Category = "Ability|Burst")
	float BurstIFrameDuration = 1.5f;

	/** Instanced UObject: resolve world via outer (component → actor) supaya
	 *  GetWorld()/timer/GetTimeSeconds reliable (default UObject bisa null). */
	virtual UWorld* GetWorld() const override;

	// --- Runtime ---
	UFUNCTION(BlueprintPure, Category = "Ability")
	bool IsOnCooldown() const;

	UFUNCTION(BlueprintPure, Category = "Ability")
	float GetCooldownRemaining() const;

	/** Cek cooldown + energy. */
	bool CanActivate(const ACharacterBase* Owner) const;

	/** Jalankan: bayar cost, mulai cooldown, play montage, cinematic (burst), lalu OnActivate. */
	bool Activate(ACharacterBase* Owner);

	/** Implementasi per karakter di BP subclass (spawn projectile/AOE/buff/dst). */
	UFUNCTION(BlueprintImplementableEvent, Category = "Ability")
	void OnActivate(ACharacterBase* Owner);

private:
	double CooldownEndTime = 0.0;
};
