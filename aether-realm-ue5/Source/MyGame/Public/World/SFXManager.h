#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Combat/CombatTypes.h"
#include "SFXManager.generated.h"

class USoundBase;

/**
 * Pusat trigger SFX elemental combat — pasangan audio dari AVFXManager
 * (World/VFXManager.h), pola sama persis: SATU actor di L_OpenWorld, assign
 * USoundBase per reaction di detail panel. Auto-bind ke
 * ElementalReactionSubsystem saat BeginPlay: reaction terjadi di mana pun →
 * SFX muncul di lokasi. Designer tinggal isi map, tanpa Blueprint wiring.
 *
 * Weapon swing/impact SFX (Docs/ART_C_AUDIO.md tabel Combat) TETAP di-hook
 * lewat `CombatComponent::OnDamageDealt` per BP karakter — itu delegate
 * per-instance component (satu per karakter), bukan broadcast subsystem
 * global seperti reaction, jadi di luar scope manager tunggal ini. Sama
 * alasan kenapa AVFXManager juga tak meng-handle weapon swing VFX.
 */
UCLASS()
class MYGAME_API ASFXManager : public AActor
{
	GENERATED_BODY()

public:
	ASFXManager();

	/** Play manual dari BP (skill impact dsb). */
	UFUNCTION(BlueprintCallable, Category = "SFX")
	void PlayReactionSFX(EReactionType Reaction, const FVector& Location);

protected:
	virtual void BeginPlay() override;

	/** Sound per reaction (SFX_Reaction_Vaporize dst — lihat ART_C_AUDIO.md tabel Elemental). */
	UPROPERTY(EditAnywhere, Category = "SFX|Reactions")
	TMap<EReactionType, TObjectPtr<USoundBase>> ReactionSFX;

	/** Crystallize shield pickup SFX. */
	UPROPERTY(EditAnywhere, Category = "SFX|Reactions")
	TObjectPtr<USoundBase> CrystallizeShieldSFX;

	/** Volume dasar semua reaction SFX (0-2) — tuning cepat tanpa edit asset. */
	UPROPERTY(EditAnywhere, Category = "SFX|Reactions", meta = (ClampMin = 0, ClampMax = 2))
	float ReactionVolume = 1.f;

	UFUNCTION()
	void HandleReaction(EReactionType Reaction, AActor* Target, AActor* Instigator, FVector Location);

	UFUNCTION()
	void HandleCrystallize(EElement Element, float ShieldStrength, AActor* Instigator);
};
