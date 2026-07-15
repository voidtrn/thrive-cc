// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "StickmanTorch.generated.h"

class UStaticMeshComponent;
class UPointLightComponent;
class UNiagaraComponent;
class UNiagaraSystem;

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnTorchLit);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnTorchExtinguished);

/** Lights when hit by Pyro, extinguishes when hit by Hydro/Cryo — call TryAffectWithElement() from combat code on hit. */
UCLASS()
class STICKMANIMPACT_API AStickmanTorch : public AActor
{
	GENERATED_BODY()

public:
	AStickmanTorch();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Puzzle")
	TObjectPtr<UNiagaraSystem> FlameVFX;

	UFUNCTION(BlueprintPure, Category = "Puzzle")
	bool IsLit() const { return bIsLit; }

	// Called from combat code (e.g. UStickmanGameplayAbility::ApplyDamageToTarget) when this
	// torch is hit by an elemental attack.
	UFUNCTION(BlueprintCallable, Category = "Puzzle")
	void TryAffectWithElement(EStickmanElement Element);

	UPROPERTY(BlueprintAssignable, Category = "Puzzle")
	FOnTorchLit OnLit;

	UPROPERTY(BlueprintAssignable, Category = "Puzzle")
	FOnTorchExtinguished OnExtinguished;

protected:
	void SetLit(bool bNewLit);

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Puzzle", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStaticMeshComponent> TorchMesh;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Puzzle", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UPointLightComponent> FlameLight;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Puzzle", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UNiagaraComponent> FlameVFXComponent;

private:
	bool bIsLit = false;
};
