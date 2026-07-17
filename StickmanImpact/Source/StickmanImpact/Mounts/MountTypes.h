// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "MountTypes.generated.h"

UENUM(BlueprintType)
enum class EMountType : uint8
{
	Ground,   // Fastest land, can jump, charge attack.
	Flying,   // Stamina-limited altitude, air dash.
	Aquatic,  // Fast swim, underwater breathing.
	Climbing  // Wall/ceiling scaling in special zones.
};

/** Tunable mount stats (bonding raises these; customization armor adds small bonuses). */
USTRUCT(BlueprintType)
struct FMountStats
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mount")
	float MaxSpeed = 1400.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mount")
	float Acceleration = 2048.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mount")
	float JumpZVelocity = 700.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mount")
	float MaxStamina = 100.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mount")
	float Handling = 1.f; // turn-rate scalar

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mount")
	float MaxHealth = 500.f;
};

/** Per-mount persistent record (stable entry). */
USTRUCT(BlueprintType)
struct FMountRecord
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mount")
	FName MountID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mount")
	FString CustomName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mount")
	int32 BondLevel = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mount")
	int32 BondXP = 0;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mount")
	FName EquippedSkinID = NAME_None;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Mount")
	FName EquippedArmorID = NAME_None;
};
