#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "Combat/CombatTypes.h"
#include "CombatComponent.generated.h"

class ACharacterBase;
class UAnimMontage;
class UAbilityBase;

/** Konfigurasi satu hit dalam combo chain. */
USTRUCT(BlueprintType)
struct FComboHitConfig
{
	GENERATED_BODY()

	/** Persen ATK (0.4 / 0.5 / 0.6 / 1.0 sesuai spec). */
	UPROPERTY(EditDefaultsOnly)
	float DamageMultiplier = 0.4f;

	UPROPERTY(EditDefaultsOnly)
	EHitTraceShape TraceShape = EHitTraceShape::Sphere;

	UPROPERTY(EditDefaultsOnly)
	float Range = 200.f;

	/** Radius sphere / half-extent box. */
	UPROPERTY(EditDefaultsOnly)
	float Radius = 80.f;

	UPROPERTY(EditDefaultsOnly)
	TObjectPtr<UAnimMontage> Montage;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnDamageDealt, AActor*, Victim, FDamageResult, Result);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnPerfectDodge);
/** Skill/Burst dipakai — hook untuk set 4-piece & constellation (BP subscribe). */
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnElementalSkillUsed);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnElementalBurstUsed);

/**
 * Combat per karakter: combo, charged, plunge, dodge, energy.
 * Anim Notify memanggil PerformComboHit / OnComboWindowOpen dari montage.
 */
UCLASS(ClassGroup = (Combat), meta = (BlueprintSpawnableComponent))
class MYGAME_API UCombatComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UCombatComponent();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType,
		FActorComponentTickFunction* ThisTickFunction) override;

	// ---------- Light attack combo ----------
	/** Dipanggil input IA_NormalAttack. Handle buffer & chain otomatis. */
	UFUNCTION(BlueprintCallable, Category = "Combat|Combo")
	void TryNormalAttack();

	/** Anim Notify: frame hit aktif — lakukan trace & damage. */
	UFUNCTION(BlueprintCallable, Category = "Combat|Combo")
	void PerformComboHit();

	/** Anim Notify: buka window input hit berikutnya (0.3s buffer). */
	UFUNCTION(BlueprintCallable, Category = "Combat|Combo")
	void OnComboWindowOpen();

	/** Anim Notify: montage selesai — reset chain kalau tidak ada buffer. */
	UFUNCTION(BlueprintCallable, Category = "Combat|Combo")
	void OnComboEnd();

	// ---------- Charged attack ----------
	UFUNCTION(BlueprintCallable, Category = "Combat|Charged")
	void StartCharging();

	UFUNCTION(BlueprintCallable, Category = "Combat|Charged")
	void ReleaseCharged();

	// ---------- Plunge ----------
	/** Dipanggil IA_NormalAttack saat airborne. True kalau plunge dimulai. */
	UFUNCTION(BlueprintCallable, Category = "Combat|Plunge")
	bool TryPlungeAttack();

	/** Anim Notify / Landed event: AOE landing. */
	UFUNCTION(BlueprintCallable, Category = "Combat|Plunge")
	void OnPlungeLand();

	UFUNCTION(BlueprintPure, Category = "Combat|Plunge")
	bool IsPlunging() const { return bPlunging; }

	// ---------- Dodge ----------
	UFUNCTION(BlueprintCallable, Category = "Combat|Dodge")
	void TryDodge();

	UFUNCTION(BlueprintPure, Category = "Combat|Dodge")
	bool IsInIFrame() const;

	/** Dipanggil dari ApplyDamage flow: kalau i-frame awal → perfect dodge. */
	bool CheckPerfectDodge();

	// ---------- Abilities ----------
	UFUNCTION(BlueprintCallable, Category = "Combat|Ability")
	bool TryElementalSkill();

	UFUNCTION(BlueprintCallable, Category = "Combat|Ability")
	bool TryElementalBurst();

	UFUNCTION(BlueprintPure, Category = "Combat|Ability")
	UAbilityBase* GetElementalSkillAbility() const { return ElementalSkill; }

	UFUNCTION(BlueprintPure, Category = "Combat|Ability")
	UAbilityBase* GetElementalBurstAbility() const { return ElementalBurst; }

	// ---------- Energy ----------
	/** Particle masuk: on-field penuh, off-field 60% (via party system Phase 4). */
	UFUNCTION(BlueprintCallable, Category = "Combat|Energy")
	void GainEnergyParticles(int32 Particles);

	// ---------- Damage pipeline ----------
	/** Semua damage keluar lewat sini: ICD → reaction → formula → apply → damage number. */
	UFUNCTION(BlueprintCallable, Category = "Combat|Damage")
	FDamageResult DealDamage(ACharacterBase* Victim, const FAttackParams& Params);

	UPROPERTY(BlueprintAssignable, Category = "Combat")
	FOnDamageDealt OnDamageDealt;

	UPROPERTY(BlueprintAssignable, Category = "Combat")
	FOnPerfectDodge OnPerfectDodge;

	/** Broadcast saat skill sukses aktif — set 4pc (mis. Noblesse) & constellation. */
	UPROPERTY(BlueprintAssignable, Category = "Combat")
	FOnElementalSkillUsed OnElementalSkillUsed;

	/** Broadcast saat burst sukses aktif. */
	UPROPERTY(BlueprintAssignable, Category = "Combat")
	FOnElementalBurstUsed OnElementalBurstUsed;

protected:
	virtual void BeginPlay() override;

	// ---------- Config: combo (default sesuai spec 3A) ----------
	UPROPERTY(EditDefaultsOnly, Category = "Config|Combo")
	TArray<FComboHitConfig> ComboChain;

	UPROPERTY(EditDefaultsOnly, Category = "Config|Combo")
	float ComboBufferWindow = 0.3f;

	// ---------- Config: charged ----------
	UPROPERTY(EditDefaultsOnly, Category = "Config|Charged")
	float ChargedHoldThreshold = 0.5f;

	UPROPERTY(EditDefaultsOnly, Category = "Config|Charged")
	float ChargedStaminaPerSecond = 25.f;

	UPROPERTY(EditDefaultsOnly, Category = "Config|Charged")
	float ChargedDamageMultiplier = 1.5f;

	UPROPERTY(EditDefaultsOnly, Category = "Config|Charged")
	TObjectPtr<UAnimMontage> ChargedMontage;

	// ---------- Config: plunge ----------
	UPROPERTY(EditDefaultsOnly, Category = "Config|Plunge")
	float PlungeMinAirTime = 0.5f;

	UPROPERTY(EditDefaultsOnly, Category = "Config|Plunge")
	float PlungeMinMultiplier = 1.0f;

	UPROPERTY(EditDefaultsOnly, Category = "Config|Plunge")
	float PlungeMaxMultiplier = 3.0f;

	/** Ketinggian jatuh (cm) untuk multiplier maksimal. */
	UPROPERTY(EditDefaultsOnly, Category = "Config|Plunge")
	float PlungeMaxHeight = 1500.f;

	UPROPERTY(EditDefaultsOnly, Category = "Config|Plunge")
	float PlungeAOERadius = 300.f;

	UPROPERTY(EditDefaultsOnly, Category = "Config|Plunge")
	TObjectPtr<UAnimMontage> PlungeMontage;

	// ---------- Config: dodge ----------
	UPROPERTY(EditDefaultsOnly, Category = "Config|Dodge")
	float DodgeIFrameDuration = 0.3f;

	UPROPERTY(EditDefaultsOnly, Category = "Config|Dodge")
	float DodgeStaminaCost = 20.f;

	/** Perfect dodge: dodge dimulai < window ini sebelum hit masuk. */
	UPROPERTY(EditDefaultsOnly, Category = "Config|Dodge")
	float PerfectDodgeWindow = 0.15f;

	UPROPERTY(EditDefaultsOnly, Category = "Config|Dodge")
	float PerfectDodgeEnergyBonus = 5.f;

	/** Animasi dash — beda per karakter, assign di BP child. */
	UPROPERTY(EditDefaultsOnly, Category = "Config|Dodge")
	TObjectPtr<UAnimMontage> DodgeMontage;

	// ---------- Config: abilities ----------
	UPROPERTY(EditDefaultsOnly, Instanced, Category = "Config|Ability")
	TObjectPtr<UAbilityBase> ElementalSkill;

	UPROPERTY(EditDefaultsOnly, Instanced, Category = "Config|Ability")
	TObjectPtr<UAbilityBase> ElementalBurst;

	// ---------- Config: damage numbers ----------
	UPROPERTY(EditDefaultsOnly, Category = "Config|UI")
	TSubclassOf<class UDamageNumberWidget> DamageNumberWidgetClass;

	// ---------- Config: polish ----------
	/** Hit stop: game freeze singkat saat hit connect (0 = off). */
	UPROPERTY(EditDefaultsOnly, Category = "Config|Polish")
	float HitStopSeconds = 0.05f;

	UPROPERTY(EditDefaultsOnly, Category = "Config|Polish")
	float HitStopDilation = 0.1f;

private:
	UPROPERTY()
	TObjectPtr<ACharacterBase> OwnerChar;

	// Combo state
	int32 ComboIndex = 0;
	bool bAttacking = false;
	bool bComboWindowOpen = false;
	bool bBufferedAttack = false;

	// Charged state
	bool bCharging = false;
	float ChargeTime = 0.f;

	// Plunge state
	bool bPlunging = false;
	float PlungeStartZ = 0.f;

	// Dodge state
	double DodgeStartTime = -999.0;

	void StartComboAttack(int32 Index);
	void SpawnDamageNumber(const FVector& Location, const FDamageResult& Result);
	void ApplyHitStop();
	TArray<FHitResult> DoHitTrace(const FComboHitConfig& Config) const;
};
