// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "FactionTypes.h"
#include "NemesisSubsystem.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnNemesisPromoted, const FNemesisCaptain&, Captain);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnNemesisDefeated, const FNemesisCaptain&, Captain);

/**
 * Nemesis-lite: procedurally-generated faction captains that remember the player. Generate a
 * captain (random name + strength/weakness traits + faction + territory). If a captain
 * defeats the player (`NotifyCaptainDefeatedPlayer`), they get promoted (more rank = HP +
 * an ability), remember you (TimesDefeatedPlayer → unique taunt), and add faction territory
 * influence. Defeating a captain (`NotifyCaptainDefeated`) may kill/flee/capture them, drops
 * trait-based loot, weakens their faction's territory, and lets a rival take the slot.
 *
 * The "nemesis board" is GetActiveCaptains — track who beat you, where they are, their
 * weaknesses (revealed after intel/encounters). Captains spawn in the world as
 * AStickmanEnemyCharacter/boss pawns configured from their FNemesisCaptain (traits map to
 * bestiary abilities + element resistances).
 */
UCLASS()
class STICKMANIMPACT_API UNemesisSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// Create a new captain for a faction/territory (returns its ID).
	UFUNCTION(BlueprintCallable, Category = "Nemesis")
	FGuid GenerateCaptain(EFaction Faction, FName Territory);

	UFUNCTION(BlueprintPure, Category = "Nemesis")
	bool GetCaptain(FGuid CaptainID, FNemesisCaptain& OutCaptain) const;

	UFUNCTION(BlueprintPure, Category = "Nemesis")
	TArray<FNemesisCaptain> GetActiveCaptains() const;

	// Captain beat the player: promote + remember + faction influence.
	UFUNCTION(BlueprintCallable, Category = "Nemesis")
	void NotifyCaptainDefeatedPlayer(FGuid CaptainID);

	// Player beat the captain: resolve fate (kill/flee/capture), weaken faction, rival rises.
	UFUNCTION(BlueprintCallable, Category = "Nemesis")
	void NotifyCaptainDefeated(FGuid CaptainID);

	// A taunt line keyed off how many times they've beaten the player.
	UFUNCTION(BlueprintPure, Category = "Nemesis")
	FText GetCaptainTaunt(FGuid CaptainID) const;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Nemesis")
	TArray<FName> PossibleStrengths = { TEXT("ImmuneToStagger"), TEXT("Ambusher"), TEXT("Enraged"), TEXT("ShieldBearer"), TEXT("Summoner") };

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Nemesis")
	TArray<FName> PossibleWeaknesses = { TEXT("FearsFire"), TEXT("StaggerVulnerable"), TEXT("SlowRecovery"), TEXT("PoisonWeak") };

	UPROPERTY(BlueprintAssignable, Category = "Nemesis")
	FOnNemesisPromoted OnNemesisPromoted;

	UPROPERTY(BlueprintAssignable, Category = "Nemesis")
	FOnNemesisDefeated OnNemesisDefeated;

	// Save hooks (not yet in the binary format — see README).
	void ExportSaveState(TArray<FNemesisCaptain>& OutCaptains) const;
	void ImportSaveState(const TArray<FNemesisCaptain>& InCaptains);

private:
	FString RollName() const;

	TMap<FGuid, FNemesisCaptain> Captains;
};
