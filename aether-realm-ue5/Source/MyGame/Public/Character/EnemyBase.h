#pragma once

#include "CoreMinimal.h"
#include "Character/CharacterBase.h"
#include "Engine/DataTable.h"
#include "EnemyBase.generated.h"

UENUM(BlueprintType)
enum class EEnemyType : uint8
{
	Hilichurl,        // melee basic, patrol
	HilichurlArcher,  // ranged, reposition
	Mitachurl,        // elite, shield, charge
	AbyssMage,        // caster, elemental shield
	Slime             // elemental murni, immune elemen sendiri
};

/** Row DataTable stats enemy — buat DT_EnemyStats dari struct ini. */
USTRUCT(BlueprintType)
struct FEnemyStatsRow : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	EEnemyType Type = EEnemyType::Hilichurl;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	float BaseHP = 500.f;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	float BaseATK = 50.f;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	float BaseDEF = 30.f;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int32 Level = 1;

	/** RES per elemen (default 10% semua; slime: 100% elemen sendiri). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TMap<EElement, float> ElementalRES;

	/** Elemen slime (immune). None untuk non-slime. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	EElement InnateElement = EElement::None;

	// --- Drops ---
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int32 MoraDrop = 50;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TArray<FName> MaterialDrops;

	/** 0-1 chance drop artifact. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	float ArtifactDropChance = 0.05f;
};

/**
 * Base enemy. Stats di-load dari DT_EnemyStats via StatsRowName.
 * Auto-tag "Enemy" (dipakai lock-on, AOE, dan trace).
 */
UCLASS()
class MYGAME_API AEnemyBase : public ACharacterBase
{
	GENERATED_BODY()

public:
	AEnemyBase(const FObjectInitializer& ObjectInitializer);

	virtual float GetResistance(EElement DamageElement) const override;

	UFUNCTION(BlueprintPure, Category = "Enemy")
	EEnemyType GetEnemyType() const { return EnemyType; }

	UFUNCTION(BlueprintPure, Category = "Enemy")
	const FEnemyStatsRow& GetStats() const { return CachedStats; }

	/**
	 * Serang target (biasanya player) — apply elemen enemy + damage.
	 * Panggil dari anim notify serangan BP enemy. Elemen dari `Element`
	 * (Pyro slime = Pyro → bisa memicu reaksi di player).
	 * @param DamageMultiplier  persen dari ATK enemy (1.0 = 100%)
	 * @param GaugeUnits        unit elemen (0 = serangan fisik murni)
	 */
	UFUNCTION(BlueprintCallable, Category = "Enemy|Combat")
	void AttackTarget(ACharacterBase* Target, float DamageMultiplier = 1.f,
		float GaugeUnits = 1.f, EHitReaction Reaction = EHitReaction::Light);

protected:
	virtual void BeginPlay() override;
	virtual void HandleDeath() override;

	UPROPERTY(EditDefaultsOnly, Category = "Enemy|Stats")
	TObjectPtr<UDataTable> StatsTable;

	UPROPERTY(EditDefaultsOnly, Category = "Enemy|Stats")
	FName StatsRowName;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Enemy")
	EEnemyType EnemyType = EEnemyType::Hilichurl;

	/** Energy orb spawn saat mati (absorb = team energy). BP assign class orb. */
	UPROPERTY(EditDefaultsOnly, Category = "Enemy|Drops")
	TSubclassOf<AActor> EnergyOrbClass;

	UPROPERTY(EditDefaultsOnly, Category = "Enemy|Drops")
	int32 EnergyOrbCount = 2;

private:
	FEnemyStatsRow CachedStats;

	void LoadStatsFromTable();
};
