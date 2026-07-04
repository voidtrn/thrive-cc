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

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Stats")
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

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Stats")
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

	/** Jeda regen setelah stamina terpakai (detik). */
	UPROPERTY(EditDefaultsOnly, Category = "Stats|Stamina")
	float StaminaRegenDelay = 1.f;

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
	float LastStaminaUseTime = -999.f;

	void TickCamera(float DeltaSeconds);
	void TickStamina(float DeltaSeconds);
	void PlayShake(TSubclassOf<UCameraShakeBase> ShakeClass) const;
};
