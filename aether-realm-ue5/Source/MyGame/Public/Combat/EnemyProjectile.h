#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Combat/CombatTypes.h"
#include "EnemyProjectile.generated.h"

class USphereComponent;
class UProjectileMovementComponent;
class AEnemyBase;
class ACharacterBase;

/**
 * Proyektil generic dipakai enemy ranged (HilichurlArcher, AbyssMage).
 * Spawn dari `AEnemyBase::FireProjectileAt`. Sengaja tidak menghitung damage
 * sendiri — begitu overlap character valid, panggil balik
 * `AEnemyBase::AttackTarget` punya instigator, jadi formula damage & reaksi
 * elemental tetap satu jalur (tak duplikat DamageCalculator).
 *
 * Assign `ProjectileClass` di BP enemy ranged (mesh/VFX/collision profile
 * "Projectile" di-set di editor — belum ada asset di repo ini).
 */
UCLASS()
class MYGAME_API AEnemyProjectile : public AActor
{
	GENERATED_BODY()

public:
	AEnemyProjectile();

	/** Set instigator + parameter serangan sebelum `LaunchAt`. */
	void InitProjectile(AEnemyBase* InInstigator, float InDamageMultiplier,
		float InGaugeUnits, EHitReaction InReaction, float InSpeed = 1800.f);

	/** Arahkan + luncurkan lurus ke lokasi target saat ini. */
	void LaunchAt(const FVector& TargetLocation);

protected:
	virtual void BeginPlay() override;

	UFUNCTION()
	void OnOverlap(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
		UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep,
		const FHitResult& SweepResult);

	UPROPERTY(VisibleAnywhere, Category = "Projectile")
	TObjectPtr<USphereComponent> CollisionComp;

	UPROPERTY(VisibleAnywhere, Category = "Projectile")
	TObjectPtr<UProjectileMovementComponent> MovementComp;

	/** Self-destruct kalau tak kena apa-apa dalam durasi ini (detik). */
	UPROPERTY(EditDefaultsOnly, Category = "Projectile")
	float MaxLifetime = 5.f;

private:
	TWeakObjectPtr<AEnemyBase> InstigatorEnemy;
	float DamageMultiplier = 1.f;
	float GaugeUnits = 1.f;
	EHitReaction Reaction = EHitReaction::Light;

	/** Guard — overlap bisa fire lebih dari sekali per frame kalau sweep besar. */
	bool bConsumed = false;
};
