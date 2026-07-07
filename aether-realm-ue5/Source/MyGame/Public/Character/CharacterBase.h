#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "AbilitySystemInterface.h"
#include "Combat/CombatTypes.h"
#include "CharacterBase.generated.h"

class USpringArmComponent;
class UCameraComponent;
class UAbilitySystemComponent;
class UOpenWorldMovementComponent;
class ULockOnComponent;
class UCameraShakeBase;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnHealthChanged, float, NewHP, float, MaxHP);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnCharacterDied, ACharacterBase*, DeadCharacter);

/**
 * Base semua karakter playable & enemy humanoid.
 * Stats masih plain float — Phase 3 dipindah ke GAS AttributeSet;
 * ASC sudah terpasang dari sekarang supaya migrasi mulus.
 */
UCLASS(Abstract)
class MYGAME_API ACharacterBase : public ACharacter, public IAbilitySystemInterface
{
	GENERATED_BODY()

public:
	ACharacterBase(const FObjectInitializer& ObjectInitializer);

	virtual void Tick(float DeltaSeconds) override;
	virtual UAbilitySystemComponent* GetAbilitySystemComponent() const override;
	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

	// ---------- Identity ----------
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Identity")
	FName CharacterID;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Identity")
	EElement Element = EElement::None;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Identity")
	EWeaponType WeaponType = EWeaponType::Sword;

	// ---------- Stats ----------
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Stats", meta = (ClampMin = 1))
	float MaxHP = 1000.f;

	/** Replicated — co-op: guest melihat HP enemy/host character sinkron. */
	UPROPERTY(Replicated, VisibleAnywhere, BlueprintReadOnly, Category = "Stats")
	float CurrentHP = 1000.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Stats")
	float MaxStamina = 100.f;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Stats")
	float CurrentStamina = 100.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Stats")
	float ATK = 100.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Stats")
	float DEF = 50.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Stats")
	float ElementalMastery = 0.f;

	/** 0-1. Default 5%. */
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Stats", meta = (ClampMin = 0, ClampMax = 1))
	float CritRate = 0.05f;

	/** Multiplier saat crit. Default 50%. */
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Stats")
	float CritDMG = 0.5f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Stats")
	float EnergyRecharge = 1.f;

	/** Bonus DMG% (dari artifact/weapon via progression). 0.15 = +15%. */
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Stats")
	float ElementalDMGBonus = 0.f;

	/** Bonus outgoing healing (0.2 = +20%). */
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Stats")
	float HealingBonus = 0.f;

	UPROPERTY(Replicated, VisibleAnywhere, BlueprintReadOnly, Category = "Stats")
	float CurrentEnergy = 0.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Stats")
	float MaxEnergy = 60.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Stats", meta = (ClampMin = 1, ClampMax = 90))
	int32 Level = 1;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Stats", meta = (ClampMin = 0, ClampMax = 6))
	int32 Ascension = 0;

	// ---------- Health & damage ----------
	UFUNCTION(BlueprintCallable, Category = "Stats")
	void ApplyDamage(float Amount, EElement DamageElement, EHitReaction Reaction);

	UFUNCTION(BlueprintCallable, Category = "Stats")
	void Heal(float Amount);

	UFUNCTION(BlueprintPure, Category = "Stats")
	bool IsAlive() const { return CurrentHP > 0.f; }

	/** RES terhadap elemen. Enemy override dari DataTable. Default 10%. */
	UFUNCTION(BlueprintPure, Category = "Stats")
	virtual float GetResistance(EElement DamageElement) const { return 0.1f; }

	/** Frozen state — di-set ElementalReactionSubsystem. */
	UFUNCTION(BlueprintPure, Category = "Combat")
	bool IsFrozen() const { return bFrozen; }

	void SetFrozen(bool bNewFrozen);

	/** Kebal damage (cheat/i-frame burst). */
	UFUNCTION(BlueprintCallable, Category = "Combat")
	void SetInvulnerable(bool bNew) { bInvulnerable = bNew; }

	UFUNCTION(BlueprintPure, Category = "Combat")
	bool IsInvulnerable() const { return bInvulnerable; }

	UPROPERTY(BlueprintAssignable, Category = "Stats")
	FOnHealthChanged OnHealthChanged;

	UPROPERTY(BlueprintAssignable, Category = "Stats")
	FOnCharacterDied OnDied;

	// ---------- Stamina ----------
	/** Coba pakai stamina. False kalau tidak cukup. */
	UFUNCTION(BlueprintCallable, Category = "Stats|Stamina")
	bool ConsumeStamina(float Amount);

	UPROPERTY(EditDefaultsOnly, Category = "Stats|Stamina")
	float StaminaRegenPerSecond = 25.f;

	/** Jeda regen setelah stamina terpakai (detik). Spec: 0.5. */
	UPROPERTY(EditDefaultsOnly, Category = "Stats|Stamina")
	float StaminaRegenDelay = 0.5f;

	// --- Drain kontinu per detik (spec 4A) ---
	UPROPERTY(EditDefaultsOnly, Category = "Stats|Stamina")
	float SprintStaminaPerSecond = 15.f;

	UPROPERTY(EditDefaultsOnly, Category = "Stats|Stamina")
	float ClimbStaminaPerSecond = 15.f;

	UPROPERTY(EditDefaultsOnly, Category = "Stats|Stamina")
	float SprintClimbStaminaPerSecond = 25.f;

	UPROPERTY(EditDefaultsOnly, Category = "Stats|Stamina")
	float GlideStaminaPerSecond = 5.f;

	UPROPERTY(EditDefaultsOnly, Category = "Stats|Stamina")
	float SwimStaminaPerSecond = 15.f;

	UPROPERTY(EditDefaultsOnly, Category = "Stats|Stamina")
	float JumpClimbStaminaCost = 25.f;

	/** HP drain per detik saat drowning (persen MaxHP). Spec: 10%. */
	UPROPERTY(EditDefaultsOnly, Category = "Stats|Stamina")
	float DrowningHPPercentPerSecond = 0.1f;

	/** Jump climb: 25 stamina instant + boost 200. */
	UFUNCTION(BlueprintCallable, Category = "Movement|Climb")
	bool TryJumpClimb();

	/** Wind current aktif — glide naik tanpa stamina (di-set AWindCurrent). */
	void SetInWindCurrent(bool bInWind) { bInWindCurrent = bInWind; }

	UFUNCTION(BlueprintPure, Category = "Movement|Glide")
	bool IsInWindCurrent() const { return bInWindCurrent; }

	// ---------- Camera (2C) ----------
	/** Scroll wheel zoom. Positive = zoom in. */
	UFUNCTION(BlueprintCallable, Category = "Camera")
	void ZoomCamera(float AxisValue);

	/** Aim mode: FOV sempit + kamera geser bahu saat aiming skill/charged bow. */
	UFUNCTION(BlueprintCallable, Category = "Camera")
	void SetAimMode(bool bEnabled);

	UFUNCTION(BlueprintCallable, Category = "Camera")
	void PlayHitShake();

	UFUNCTION(BlueprintCallable, Category = "Camera")
	void PlayBurstShake();

	UFUNCTION(BlueprintPure, Category = "Camera")
	ULockOnComponent* GetLockOn() const { return LockOn; }

	UFUNCTION(BlueprintPure, Category = "Movement")
	UOpenWorldMovementComponent* GetOpenWorldMovement() const;

protected:
	virtual void BeginPlay() override;

	// ---------- Components ----------
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	TObjectPtr<USpringArmComponent> CameraBoom;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	TObjectPtr<UCameraComponent> FollowCamera;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	TObjectPtr<UAbilitySystemComponent> AbilitySystem;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	TObjectPtr<ULockOnComponent> LockOn;

	// ---------- Camera tuning (nilai sesuai spec 2C) ----------
	UPROPERTY(EditDefaultsOnly, Category = "Camera|Zoom")
	float MinZoom = 150.f;

	UPROPERTY(EditDefaultsOnly, Category = "Camera|Zoom")
	float MaxZoom = 600.f;

	UPROPERTY(EditDefaultsOnly, Category = "Camera|Zoom")
	float ZoomStep = 40.f;

	UPROPERTY(EditDefaultsOnly, Category = "Camera|Zoom")
	float ZoomInterpSpeed = 8.f;

	UPROPERTY(EditDefaultsOnly, Category = "Camera|FOV")
	float DefaultFOV = 80.f;

	UPROPERTY(EditDefaultsOnly, Category = "Camera|FOV")
	float AimFOV = 65.f;

	UPROPERTY(EditDefaultsOnly, Category = "Camera|FOV")
	float FOVInterpSpeed = 10.f;

	UPROPERTY(EditDefaultsOnly, Category = "Camera|Shake")
	TSubclassOf<UCameraShakeBase> HitShakeClass;

	UPROPERTY(EditDefaultsOnly, Category = "Camera|Shake")
	TSubclassOf<UCameraShakeBase> BurstShakeClass;

	// ---------- Hit reaction ----------
	/** Montage per reaction — assign di BP child. */
	UPROPERTY(EditDefaultsOnly, Category = "Combat|Reactions")
	TMap<EHitReaction, TObjectPtr<UAnimMontage>> HitReactionMontages;

	virtual void HandleDeath();

private:
	float TargetZoom = 400.f;
	bool bAimMode = false;
	bool bFrozen = false;
	bool bInvulnerable = false;
	bool bInWindCurrent = false;
	float LastStaminaUseTime = -999.f;

	void TickCamera(float DeltaSeconds);
	void TickStamina(float DeltaSeconds);
	void PlayShake(TSubclassOf<UCameraShakeBase> ShakeClass) const;
};
