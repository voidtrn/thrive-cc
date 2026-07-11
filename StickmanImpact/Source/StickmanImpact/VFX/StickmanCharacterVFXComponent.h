// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "GameplayTagContainer.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "StickmanCharacterVFXComponent.generated.h"

class UNiagaraSystem;
class UNiagaraComponent;
class UVFXManager;

/**
 * Drives the character's persistent/state VFX off AStickmanCharacter's movement tag:
 * dash trail, sprint wind, glide wind lines, swim splash (looping while swimming), landing
 * impact (one-shot on Falling->grounded transition), plus an elemental aura loop and a
 * weapon trail colored by SetElement() (call on party switch with the new member's element).
 * All spawning goes through the owner's UVFXManager, so pooling/LOD/quality apply.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UStickmanCharacterVFXComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UStickmanCharacterVFXComponent();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

	// State loops (activated while the matching movement state holds).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "VFX|Movement")
	TObjectPtr<UNiagaraSystem> DashTrailVFX;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "VFX|Movement")
	TObjectPtr<UNiagaraSystem> SprintWindVFX;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "VFX|Movement")
	TObjectPtr<UNiagaraSystem> GlideWindLinesVFX;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "VFX|Movement")
	TObjectPtr<UNiagaraSystem> SwimSplashVFX;

	// One-shot on landing (Falling/Gliding -> grounded).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "VFX|Movement")
	TObjectPtr<UNiagaraSystem> LandingImpactVFX;

	// Element-colored loops: aura swirl around the character + weapon trail. Author one
	// Niagara system each with a "ElementColor" linear color User parameter.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "VFX|Element")
	TObjectPtr<UNiagaraSystem> ElementalAuraVFX;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "VFX|Element")
	TObjectPtr<UNiagaraSystem> WeaponTrailVFX;

	// Socket on the mesh the weapon trail attaches to.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "VFX|Element")
	FName WeaponSocketName = TEXT("WeaponSocket");

	UFUNCTION(BlueprintCallable, Category = "VFX|Element")
	void SetElement(EStickmanElement Element);

private:
	void UpdateStateLoop(TObjectPtr<UNiagaraComponent>& LoopComponent, UNiagaraSystem* System, bool bShouldBeActive);

	UPROPERTY() TObjectPtr<UNiagaraComponent> DashTrailComponent;
	UPROPERTY() TObjectPtr<UNiagaraComponent> SprintWindComponent;
	UPROPERTY() TObjectPtr<UNiagaraComponent> GlideWindComponent;
	UPROPERTY() TObjectPtr<UNiagaraComponent> SwimSplashComponent;
	UPROPERTY() TObjectPtr<UNiagaraComponent> AuraComponent;
	UPROPERTY() TObjectPtr<UNiagaraComponent> WeaponTrailComponent;

	FGameplayTag LastMovementTag;
	bool bWasAirborne = false;
};
