#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "InputConfig.generated.h"

class UInputAction;

/**
 * Satu data asset pusat berisi referensi semua Input Action.
 * Buat asset-nya di editor: Content/Data/DA_InputConfig, lalu assign
 * setiap IA_* yang dibuat sesuai Docs/PHASE1_SETUP.md.
 * Karakter & controller ambil action dari sini — tidak ada hard path.
 */
UCLASS(BlueprintType, Const)
class MYGAME_API UInputConfig : public UDataAsset
{
	GENERATED_BODY()

public:
	// --- Movement ---
	UPROPERTY(EditDefaultsOnly, Category = "Movement")
	TObjectPtr<UInputAction> Move;

	UPROPERTY(EditDefaultsOnly, Category = "Movement")
	TObjectPtr<UInputAction> Look;

	UPROPERTY(EditDefaultsOnly, Category = "Movement")
	TObjectPtr<UInputAction> Jump;

	UPROPERTY(EditDefaultsOnly, Category = "Movement")
	TObjectPtr<UInputAction> Sprint;

	UPROPERTY(EditDefaultsOnly, Category = "Movement")
	TObjectPtr<UInputAction> Dodge;

	UPROPERTY(EditDefaultsOnly, Category = "Movement")
	TObjectPtr<UInputAction> Glide;

	// --- Combat ---
	UPROPERTY(EditDefaultsOnly, Category = "Combat")
	TObjectPtr<UInputAction> NormalAttack;

	UPROPERTY(EditDefaultsOnly, Category = "Combat")
	TObjectPtr<UInputAction> ChargedAttack;

	UPROPERTY(EditDefaultsOnly, Category = "Combat")
	TObjectPtr<UInputAction> ElementalSkill;

	UPROPERTY(EditDefaultsOnly, Category = "Combat")
	TObjectPtr<UInputAction> ElementalBurst;

	// --- Party ---
	UPROPERTY(EditDefaultsOnly, Category = "Party")
	TObjectPtr<UInputAction> Swap1;

	UPROPERTY(EditDefaultsOnly, Category = "Party")
	TObjectPtr<UInputAction> Swap2;

	UPROPERTY(EditDefaultsOnly, Category = "Party")
	TObjectPtr<UInputAction> Swap3;

	UPROPERTY(EditDefaultsOnly, Category = "Party")
	TObjectPtr<UInputAction> Swap4;

	// --- Interaction & UI ---
	UPROPERTY(EditDefaultsOnly, Category = "Interaction")
	TObjectPtr<UInputAction> Interact;

	UPROPERTY(EditDefaultsOnly, Category = "UI")
	TObjectPtr<UInputAction> OpenMap;

	UPROPERTY(EditDefaultsOnly, Category = "UI")
	TObjectPtr<UInputAction> OpenInventory;

	UPROPERTY(EditDefaultsOnly, Category = "UI")
	TObjectPtr<UInputAction> OpenCharacter;

	UPROPERTY(EditDefaultsOnly, Category = "UI")
	TObjectPtr<UInputAction> OpenWish;

	UPROPERTY(EditDefaultsOnly, Category = "UI")
	TObjectPtr<UInputAction> OpenJournal;

	UPROPERTY(EditDefaultsOnly, Category = "UI")
	TObjectPtr<UInputAction> Pause;
};
