#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Combat/CombatTypes.h"
#include "AimedProjectile.generated.h"

class ACharacterBase;
class USphereComponent;
class UProjectileMovementComponent;

/**
 * Projectile mode TPS (panah / bolt catalyst). Di-spawn server oleh
 * UAimModeComponent::ServerFireShot; damage masuk pipeline
 * UCombatComponent::DealDamage penuh (talent, crit, elemental reaction).
 *
 * BP child: assign mesh/trail Niagara + implement OnImpact untuk VFX hit.
 * Gravity default 0.05 (nyaris lurus, sedikit arc) — panah fisik set 1.0.
 */
UCLASS(Abstract, Blueprintable)
class MYGAME_API AAimedProjectile : public AActor
{
	GENERATED_BODY()

public:
	AAimedProjectile();

	/** Dipanggil server setelah spawn. */
	void InitShot(ACharacterBase* InShooter, const FAttackParams& InParams);

protected:
	virtual void BeginPlay() override;

	UFUNCTION()
	void OnSphereOverlap(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
		UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep,
		const FHitResult& SweepResult);

	UFUNCTION()
	void OnBlocked(UPrimitiveComponent* HitComp, AActor* OtherActor,
		UPrimitiveComponent* OtherComp, FVector NormalImpulse, const FHitResult& Hit);

	/** VFX/SFX impact — implement di BP. */
	UFUNCTION(BlueprintImplementableEvent, Category = "Projectile")
	void OnImpact(const FVector& Location, bool bHitEnemy);

	void Impact(const FVector& Location, ACharacterBase* Victim);

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	TObjectPtr<USphereComponent> Collision;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	TObjectPtr<UProjectileMovementComponent> Movement;

	UPROPERTY(EditDefaultsOnly, Category = "Projectile")
	float ProjectileSpeed = 3000.f;

	UPROPERTY(EditDefaultsOnly, Category = "Projectile")
	float MaxLifeSeconds = 5.f;

	UPROPERTY()
	TObjectPtr<ACharacterBase> Shooter;

	FAttackParams AttackParams;
	bool bImpacted = false;
};
