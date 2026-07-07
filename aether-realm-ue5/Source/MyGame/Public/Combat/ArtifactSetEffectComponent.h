#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "Combat/CombatTypes.h"
#include "ArtifactSetEffectComponent.generated.h"

class ACharacterBase;
class UCharacterProgressionComponent;
class UBuffComponent;

/**
 * Efek gameplay 4-piece artifact set + reaksi crystallize→shield.
 * Pasang di CharacterBase. Baca set aktif dari progression
 * (`GetActiveSetEffects`), subscribe event combat/reaction, terapkan efek.
 *
 * Set yang di-handle (FourPieceEffectId di DT_ArtifactSets):
 *   "NoblesseOblige" — setelah Burst: +20% ATK 12s
 *   "CrimsonWitch"   — setelah Skill: +7.5% Pyro DMG per stack (max 3, 10s)
 *   "Instructor"     — trigger reaksi apa pun: +120 EM 8s
 *
 * Crystallize (core, bukan set): pemicu dapat shield Geo — selalu aktif.
 */
UCLASS(ClassGroup = (Combat), meta = (BlueprintSpawnableComponent))
class MYGAME_API UArtifactSetEffectComponent : public UActorComponent
{
	GENERATED_BODY()

protected:
	virtual void BeginPlay() override;
	virtual void EndPlay(const EEndPlayReason::Type EndPlayReason) override;

	// --- Handler event ---
	UFUNCTION() void HandleBurstUsed();
	UFUNCTION() void HandleSkillUsed();
	UFUNCTION() void HandleReaction(EReactionType Reaction, AActor* Target, AActor* Instigator, FVector Location);
	UFUNCTION() void HandleCrystallizeShield(EElement Element, float ShieldStrength, AActor* Instigator);

	// --- Konfigurasi efek (tuning) ---
	UPROPERTY(EditDefaultsOnly, Category = "SetEffect|Noblesse")
	float NoblesseATKPercent = 0.20f;

	UPROPERTY(EditDefaultsOnly, Category = "SetEffect|Noblesse")
	float NoblesseDuration = 12.f;

	UPROPERTY(EditDefaultsOnly, Category = "SetEffect|CrimsonWitch")
	float CrimsonPyroPerStack = 0.075f;

	UPROPERTY(EditDefaultsOnly, Category = "SetEffect|CrimsonWitch")
	int32 CrimsonMaxStacks = 3;

	UPROPERTY(EditDefaultsOnly, Category = "SetEffect|CrimsonWitch")
	float CrimsonDuration = 10.f;

	UPROPERTY(EditDefaultsOnly, Category = "SetEffect|Instructor")
	float InstructorEMBonus = 120.f;

	UPROPERTY(EditDefaultsOnly, Category = "SetEffect|Instructor")
	float InstructorDuration = 8.f;

	UPROPERTY(EditDefaultsOnly, Category = "SetEffect|Crystallize")
	float CrystallizeShieldDuration = 15.f;

private:
	UPROPERTY() TObjectPtr<ACharacterBase> OwnerChar;
	UPROPERTY() TObjectPtr<UCharacterProgressionComponent> Progression;
	UPROPERTY() TObjectPtr<UBuffComponent> Buff;

	bool HasSetEffect(FName EffectId) const;

	// Crimson Witch: stack Pyro DMG dengan timer reset.
	int32 CrimsonStacks = 0;
	float AppliedPyroBonus = 0.f;
	FTimerHandle CrimsonTimer;
	void AddCrimsonStack();
	void ResetCrimsonStacks();
};
