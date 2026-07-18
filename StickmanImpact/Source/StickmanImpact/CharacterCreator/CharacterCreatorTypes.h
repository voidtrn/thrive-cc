// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "SkillSystem/StickmanSkillTypes.h"
#include "CharacterCreatorTypes.generated.h"

UENUM(BlueprintType)
enum class EStickmanHeadShape : uint8
{
	Circle,
	Oval,
	Squarish,
	Diamond
};

UENUM(BlueprintType)
enum class EStickmanEyeStyle : uint8
{
	Dots,
	Circles,
	Expressive,
	Glowing
};

UENUM(BlueprintType)
enum class EStickmanMouthStyle : uint8
{
	Line,
	Curved,
	Open
};

UENUM(BlueprintType)
enum class EStickmanVoice : uint8
{
	Male1, Male2, Male3, Male4,
	Female1, Female2, Female3, Female4,
	Robotic1, Robotic2
};

/**
 * The full custom-character appearance + identity. Serializable (export/import share codes =
 * this struct → base64 via the creator subsystem). Body sliders map onto the stickman rig's
 * morph/bone scales in the character BP; colors drive the line/eye/aura/accent material
 * params.
 */
USTRUCT(BlueprintType)
struct FCustomCharacterPreset
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator")
	FString PresetName = TEXT("Traveler");

	// --- Body (0..1 sliders) ---
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator", meta = (ClampMin = "0", ClampMax = "1"))
	float Height = 0.5f; // slight hitbox influence (capsule scale ±5%)

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator", meta = (ClampMin = "0", ClampMax = "1"))
	float Build = 0.5f; // thin -> muscular (line thickness)

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator", meta = (ClampMin = "0", ClampMax = "1"))
	float HeadSize = 0.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator", meta = (ClampMin = "0", ClampMax = "1"))
	float LimbLength = 0.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator", meta = (ClampMin = "0", ClampMax = "1"))
	float TorsoLength = 0.5f;

	// --- Head/face ---
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator")
	EStickmanHeadShape HeadShape = EStickmanHeadShape::Circle;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator")
	EStickmanEyeStyle EyeStyle = EStickmanEyeStyle::Dots;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator", meta = (ClampMin = "0", ClampMax = "1"))
	float EyeSpacing = 0.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator", meta = (ClampMin = "0", ClampMax = "1"))
	float EyeSize = 0.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator")
	EStickmanMouthStyle MouthStyle = EStickmanMouthStyle::Line;

	// Accessory IDs (glasses, mask, bandana, hat) — content rows; NAME_None = none.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator")
	TArray<FName> AccessoryIDs;

	// --- Colors ---
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator")
	FLinearColor BodyColor = FLinearColor::Black;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator")
	FLinearColor EyeColor = FLinearColor::White;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator")
	FLinearColor AuraColor = FLinearColor(0.2f, 0.8f, 1.f);

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator")
	FLinearColor AccentColor = FLinearColor::White;

	// --- Identity ---
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator")
	EStickmanElement StartingElement = EStickmanElement::Anemo;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator")
	EWeaponType StartingWeapon = EWeaponType::Sword;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creator")
	EStickmanVoice Voice = EStickmanVoice::Male1;
};
