#pragma once

#include "CoreMinimal.h"
#include "Character/CharacterBase.h"
#include "Engine/DataTable.h"
#include "PlayableCharacter.generated.h"

/** Row DataTable identitas karakter playable — buat DT_Characters dari struct ini. */
USTRUCT(BlueprintType)
struct FCharacterDefinitionRow : public FTableRowBase
{
	GENERATED_BODY()

	/** Nama tampil UI (mis. "Kagari"). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FText DisplayName;

	/** Subtitle/epithet (mis. "Flamebound Wanderer") — lihat ART_A_CHARACTERS.md A2. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FText Title;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	EElement Element = EElement::None;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	EWeaponType WeaponType = EWeaponType::Sword;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	float BaseHP = 1000.f;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	float BaseATK = 100.f;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	float BaseDEF = 50.f;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	float BaseElementalMastery = 0.f;

	/** Portrait UI — party select, HUD swap icon, dst. Soft ref: gak load kalau tak dipakai. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TSoftObjectPtr<UTexture2D> Portrait;
};

/**
 * Base karakter playable — identitas & base stats di-load dari DT_Characters,
 * pola sama persis dengan AEnemyBase/FEnemyStatsRow (lihat
 * Docs/ART_A_CHARACTERS.md A2: spec 3 karakter starter Char_Kagari/
 * Char_Yukine/Char_Shiden, yang sebelumnya cuma ada di dokumen desain, tak
 * ada representasi kode-nya sama sekali).
 *
 * BP child per karakter cukup assign StatsTable + CharacterRowName; komponen
 * combat (Combat/Buff/Progression/Shield/Status) tetap di-add manual per
 * Docs/COMBAT_COMPONENTS.md — sistem ini cuma urus identitas & base stats.
 */
UCLASS(Abstract)
class MYGAME_API APlayableCharacter : public ACharacterBase
{
	GENERATED_BODY()

public:
	APlayableCharacter(const FObjectInitializer& ObjectInitializer);

	UFUNCTION(BlueprintPure, Category = "Character")
	const FCharacterDefinitionRow& GetCharacterDefinition() const { return CachedDefinition; }

	UFUNCTION(BlueprintPure, Category = "Character")
	FText GetDisplayName() const { return CachedDefinition.DisplayName; }

	UFUNCTION(BlueprintPure, Category = "Character")
	FText GetTitle() const { return CachedDefinition.Title; }

protected:
	virtual void BeginPlay() override;

	UPROPERTY(EditDefaultsOnly, Category = "Character|Identity")
	TObjectPtr<UDataTable> StatsTable;

	/** Row name di DT_Characters, mis. "Char_Kagari". */
	UPROPERTY(EditDefaultsOnly, Category = "Character|Identity")
	FName CharacterRowName;

private:
	FCharacterDefinitionRow CachedDefinition;

	void LoadCharacterDefinition();
};
