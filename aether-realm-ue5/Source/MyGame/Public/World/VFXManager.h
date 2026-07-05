#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Combat/CombatTypes.h"
#include "VFXManager.generated.h"

class UNiagaraSystem;

/**
 * Pusat trigger VFX combat — place SATU di L_OpenWorld, assign Niagara
 * system per reaction di detail panel. Auto-bind ke
 * ElementalReactionSubsystem saat BeginPlay: reaction terjadi di mana pun →
 * VFX muncul di lokasi. Designer tinggal isi map, tanpa Blueprint wiring.
 */
UCLASS()
class MYGAME_API AVFXManager : public AActor
{
	GENERATED_BODY()

public:
	AVFXManager();

	/** Spawn manual dari BP (skill impact dsb). */
	UFUNCTION(BlueprintCallable, Category = "VFX")
	void SpawnReactionVFX(EReactionType Reaction, const FVector& Location);

protected:
	virtual void BeginPlay() override;

	/** NS per reaction (NS_Reaction_Vaporize dst — lihat ART_B_VFX.md). */
	UPROPERTY(EditAnywhere, Category = "VFX|Reactions")
	TMap<EReactionType, TObjectPtr<UNiagaraSystem>> ReactionVFX;

	/** Crystallize shield pickup VFX. */
	UPROPERTY(EditAnywhere, Category = "VFX|Reactions")
	TObjectPtr<UNiagaraSystem> CrystallizeShieldVFX;

	/** Warna elemen — dipush ke User Parameter "ElementColor" (Swirl dsb). */
	UPROPERTY(EditAnywhere, Category = "VFX|Reactions")
	TMap<EElement, FLinearColor> ElementColors;

	UFUNCTION()
	void HandleReaction(EReactionType Reaction, AActor* Target, AActor* Instigator, FVector Location);

	UFUNCTION()
	void HandleCrystallize(EElement Element, float ShieldStrength, AActor* Instigator);
};
