// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "SkinTypes.generated.h"

class USkeletalMesh;
class UNiagaraSystem;
class USoundBase;
class UTexture2D;
class UAnimMontage;

UENUM(BlueprintType)
enum class ESkinTier : uint8
{
	Default,
	Recolor,    // Common: palette swap (MPC colors), earnable in-game
	Outfit,     // Rare: clothing/armor mesh changes
	Themed,     // Epic: full redesign + skill VFX recolor
	Legendary,  // new model, animations, voice, VFX
	Mythic      // evolving (changes with level), unique HUD/music
};

/**
 * One skin (DataTable row). Everything optional — a Recolor fills only VFXColorOverride; a
 * Mythic fills everything + evolution stages. Skill VFX recolors ride the Material Parameter
 * Collection color params the VFX system already uses (recolor without remaking assets).
 */
USTRUCT(BlueprintType)
struct FSkinDef : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skin")
	FName SkinID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skin")
	FString CharacterID; // which character this skin belongs to

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skin")
	FText DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skin")
	ESkinTier Tier = ESkinTier::Recolor;

	// --- Components (all optional; unset = keep default) ---
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skin")
	TSoftObjectPtr<USkeletalMesh> CharacterMesh;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skin")
	TSoftObjectPtr<USkeletalMesh> WeaponMesh;

	// Skill-VFX color theme (pushed into the VFX Material Parameter Collection).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skin")
	FLinearColor VFXColorOverride = FLinearColor::White;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skin")
	bool bOverridesVFXColor = false;

	// Legendary+: SFX/voice/animation variants.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skin")
	TSoftObjectPtr<USoundBase> SkillSFXOverride;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skin")
	TSoftObjectPtr<USoundBase> VoiceLineOverride;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skin")
	TSoftObjectPtr<UAnimMontage> IdleAnimationOverride;

	// UI variants.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skin")
	TSoftObjectPtr<UTexture2D> PortraitOverride;

	// Mythic: evolution stage thresholds (character level) — the skin's look advances per stage
	// (BP reads GetMythicStage and swaps material params).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skin")
	TArray<int32> MythicStageLevels;

	// Collection/set membership (own the whole set = bonus).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skin")
	FName CollectionID = NAME_None;

	// Seasonal availability window flag (content-side schedule).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Skin")
	bool bSeasonal = false;
};
