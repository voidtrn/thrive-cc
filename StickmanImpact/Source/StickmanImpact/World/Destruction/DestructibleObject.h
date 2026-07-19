// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "DestructibleObject.generated.h"

class UStaticMeshComponent;
class UNiagaraSystem;
class USoundBase;

/** How this object comes apart. */
UENUM(BlueprintType)
enum class EDestructionType : uint8
{
	Fracture,   // stone/pillars: swap to a Geometry Collection (Chaos) on break
	Burn,       // wood: progressive char material -> ash + fire spread
	Melt,       // ice: progressive scale-down -> water puddle decal
	Corrode,    // metal: material param animation, weakens
	Shatter     // glass/crystal: instant break + shard VFX
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnDestroyed, AActor*, Destroyer);

/**
 * A breakable world object with elemental destruction paths. Damage funnels in through
 * `TakeDestructionDamage(element, amount, instigator)` (wired from the radial-damage path —
 * WorldDynamic overlaps already reach it):
 *
 * - Matching element accelerates its type (Pyro×2 on Burn, Cryo melts nothing but freezes,
 *   Geo×2 on Fracture, element table below), progressive visual = the "Progress" scalar on
 *   the object's materials (char/melt/rust ramps — see VISUAL_STYLE.md pattern).
 * - On break: `OnBroken` BP event swaps in the Chaos Geometry Collection (Fracture) or
 *   spawns debris/VFX/decal per type; chunks damaging enemies is the GC's own collision +
 *   a damage-on-hit BP. Explosive variants (barrels) set bExplosive — radius damage + chain
 *   trigger of nearby destructibles (propagation).
 * - Fire spread: a burning object ignites flammable neighbors within FireSpreadRadius after
 *   FireSpreadDelay (same pattern as interactive foliage).
 * - Persistence: bMinorDestruction regrows/resets on level reload; major pieces stay broken
 *   for the session (world-actor save persistence remains the known deferral).
 *
 * Registers with UDestructionManagerSubsystem for the debris budget/cleanup.
 */
UCLASS()
class STICKMANIMPACT_API ADestructibleObject : public AActor
{
	GENERATED_BODY()

public:
	ADestructibleObject();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Destruction")
	EDestructionType DestructionType = EDestructionType::Fracture;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Destruction")
	float MaxIntegrity = 200.f;

	// Damage multiplier per element (unset = 1). Author: Pyro 2x on Burn types, etc.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Destruction")
	TMap<EStickmanElement, float> ElementMultipliers;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Destruction")
	bool bExplosive = false;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Destruction")
	float ExplosionRadius = 400.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Destruction")
	float ExplosionDamage = 150.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Destruction")
	bool bFlammable = false;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Destruction")
	float FireSpreadRadius = 300.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Destruction")
	float FireSpreadDelay = 2.f;

	// Minor pieces reset on reload; major stay broken this session.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Destruction")
	bool bMinorDestruction = true;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Destruction")
	TObjectPtr<UNiagaraSystem> BreakVFX;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Destruction")
	TObjectPtr<USoundBase> BreakSound;

	UFUNCTION(BlueprintCallable, Category = "Destruction")
	void TakeDestructionDamage(EStickmanElement Element, float Amount, AActor* DamageInstigator);

	UFUNCTION(BlueprintPure, Category = "Destruction")
	float GetIntegrityFraction() const { return MaxIntegrity > 0.f ? Integrity / MaxIntegrity : 0.f; }

	UFUNCTION(BlueprintPure, Category = "Destruction")
	bool IsBroken() const { return bBroken; }

	UPROPERTY(BlueprintAssignable, Category = "Destruction")
	FOnDestroyed OnDestructibleDestroyed;

	// Type-specific break realization (Chaos GC swap, debris, decal) — BP content.
	UFUNCTION(BlueprintImplementableEvent, Category = "Destruction")
	void OnBroken(EDestructionType Type, AActor* Destroyer);

protected:
	virtual void BeginPlay() override;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Destruction", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStaticMeshComponent> Mesh;

private:
	void Break(AActor* Destroyer);
	void UpdateProgressMaterial();
	void SpreadFire();

	float Integrity = 200.f;
	bool bBroken = false;
	bool bBurning = false;
	FTimerHandle FireSpreadTimerHandle;
};
