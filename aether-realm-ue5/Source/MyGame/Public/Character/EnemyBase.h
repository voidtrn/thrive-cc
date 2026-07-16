#pragma once

#include "CoreMinimal.h"
#include "Character/CharacterBase.h"
#include "Engine/DataTable.h"
#include "EnemyBase.generated.h"

class UShieldComponent;
class AEnemyProjectile;

/**
 * Loot musuh ke-grant (server-side, di HandleDeath). MoraGained sudah masuk
 * GameInstance; bArtifactDropped = hasil roll — BP subscriber yang generate
 * FArtifactInstance & pickup VFX (generator artifact = data/BP territory).
 */
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnLootDropped, int32, MoraGained, bool, bArtifactDropped);

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

	/**
	 * Poise resistance. 0 (default, Hilichurl/Slime/Archer) = stagger langsung
	 * kena reaction berat, sama seperti dulu. Elite (Mitachurl/AbyssMage) diisi
	 * >0 supaya butuh beberapa hit berat sebelum ke-break — lihat
	 * ACharacterBase::GetPoiseThreshold / RegisterPoiseDamage.
	 */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	float PoiseThreshold = 0.f;

	/**
	 * Shield fisik/elemental elite (Mitachurl). 0 = tak ada shield. Di-apply
	 * otomatis di BeginPlay lewat UShieldComponent bawaan AEnemyBase, dan
	 * regen otomatis ShieldRegenDelay detik setelah pecah.
	 */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	float ShieldAmount = 0.f;

	/** Elemen shield di atas. None = universal (tak dapat bonus 2.5× elemen cocok). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	EElement ShieldElement = EElement::None;

	/** Detik setelah shield pecah sebelum regen penuh lagi. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	float ShieldRegenDelay = 8.f;

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

	virtual float GetBaseResistance(EElement DamageElement) const override;
	virtual float GetPoiseThreshold() const override { return CachedStats.PoiseThreshold; }

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

	/**
	 * Serang jarak jauh — spawn `ProjectileClass` ke arah Target, damage baru
	 * kena saat proyektil overlap (lewat AttackTarget lagi, tak duplikat
	 * formula). Panggil dari anim notify serangan ranged BP (HilichurlArcher/
	 * AbyssMage). No-op kalau ProjectileClass belum di-assign.
	 */
	UFUNCTION(BlueprintCallable, Category = "Enemy|Combat")
	void FireProjectileAt(ACharacterBase* Target, float DamageMultiplier = 1.f,
		float GaugeUnits = 1.f, EHitReaction Reaction = EHitReaction::Light);

	/** Class proyektil dipakai `FireProjectileAt` — assign di BP child ranged. */
	UPROPERTY(EditDefaultsOnly, Category = "Enemy|Ranged")
	TSubclassOf<AEnemyProjectile> ProjectileClass;

	/** Loot ke-grant saat mati (lihat komentar delegate di atas class). */
	UPROPERTY(BlueprintAssignable, Category = "Enemy|Drops")
	FOnLootDropped OnLootDropped;

protected:
	virtual void BeginPlay() override;
	virtual void EndPlay(const EEndPlayReason::Type EndPlayReason) override;
	virtual void HandleDeath() override;

	/** Shield bawaan enemy (selalu ada, kosong/no-op kalau ShieldAmount stats = 0). */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	TObjectPtr<UShieldComponent> EnemyShield;

	UFUNCTION()
	void OnEnemyShieldBroken();

	void ReapplyElementalShield();

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
	FTimerHandle ShieldRegenTimer;

	void LoadStatsFromTable();
	void ApplyElementalShield();
};
