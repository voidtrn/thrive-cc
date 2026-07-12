// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "CombatJuiceSubsystem.generated.h"

class UNiagaraSystem;
class USoundBase;
class UCameraShakeBase;
class UMaterialInterface;

/** Per-element impact feedback bundle. */
USTRUCT(BlueprintType)
struct FElementImpactFeedback
{
	GENERATED_BODY()

	// Spark/impact VFX, spawned oriented to the hit surface normal.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Juice")
	TObjectPtr<UNiagaraSystem> ImpactVFX;

	// Element layer of the hit sound (played on top of the physical base impact).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Juice")
	TObjectPtr<USoundBase> ElementHitSound;

	// Per-element shake pattern (author with UPerlinNoiseCameraShakePattern — perlin, not random).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Juice")
	TSubclassOf<UCameraShakeBase> ShakePattern;
};

/**
 * Central hit-feedback dispatcher. UStickmanGameplayAbility::ApplyDamageToTarget calls
 * NotifyHit() with full context; this fans out: hit stop, damage-scaled directional camera
 * shake with distance falloff, surface-normal-aligned impact VFX, ground-crack decal on heavy
 * hits, and layered hit audio (physical base + element layer, ±10% pitch). Hit stop and shake
 * both honor the settings screen's screen-shake toggle (hit stop has its own toggle too).
 */
UCLASS()
class STICKMANIMPACT_API UCombatJuiceSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// --- Hit stop -----------------------------------------------------------
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Juice|HitStop")
	bool bHitStopEnabled = true;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Juice|HitStop")
	FVector2D HitStopDurationRange = FVector2D(0.05f, 0.15f);

	// Damage at/above this gets the max hit stop duration.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Juice|HitStop")
	float HeavyHitDamage = 200.f;

	// Multi-hit guard: no second freeze inside this window (freeze first hit only).
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Juice|HitStop")
	float HitStopCooldown = 0.25f;

	// --- Shake -----------------------------------------------------------------
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Juice|Shake")
	TSubclassOf<UCameraShakeBase> DefaultShakePattern;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Juice|Shake")
	float ShakeFalloffDistance = 2000.f;

	// --- VFX / decals ------------------------------------------------------------
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Juice|VFX")
	TMap<EStickmanElement, FElementImpactFeedback> ElementFeedback;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Juice|VFX")
	TObjectPtr<UNiagaraSystem> ImpactRingVFX;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Juice|VFX")
	TObjectPtr<UMaterialInterface> GroundCrackDecal;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Juice|VFX")
	float GroundCrackMinDamage = 150.f;

	// --- Audio ----------------------------------------------------------------------
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Juice|Audio")
	TObjectPtr<USoundBase> BaseImpactSound;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Juice|Audio")
	TObjectPtr<USoundBase> KillSound;

	// Full-context hit entry point.
	UFUNCTION(BlueprintCallable, Category = "Juice")
	void NotifyHit(AActor* Target, float Damage, bool bIsCritical, EStickmanElement Element,
		FVector HitDirection, bool bKilled);

private:
	void DoHitStop(float Damage, bool bIsCritical);
	void DoShake(AActor* Target, float Damage, EStickmanElement Element, const FVector& HitDirection);
	void DoImpactVFX(AActor* Target, float Damage, EStickmanElement Element, const FVector& HitDirection);
	void DoHitAudio(AActor* Target, EStickmanElement Element, bool bKilled);

	float LastHitStopTime = -999.f;
};
