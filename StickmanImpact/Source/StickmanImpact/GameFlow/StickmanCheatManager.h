// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/CheatManager.h"
#include "StickmanCheatManager.generated.h"

/**
 * Testing commands (console, dev builds — UCheatManager is stripped from Shipping
 * automatically). Set as CheatClass on AStickmanPlayerController.
 *
 *   AddItem <ItemID> <Count>   SetLevel <Level>       UnlockAllSkills
 *   Teleport <WaypointID>      CompleteQuest <QuestID>
 *   GodMode                    InfiniteStamina
 *
 * GodMode/InfiniteStamina are static flags consumed by the damage paths
 * (UStickmanGameplayAbility::ApplyDamageToTarget, UElementalReactionManager) and
 * AStickmanCharacter::ConsumeStamina.
 */
UCLASS()
class STICKMANIMPACT_API UStickmanCheatManager : public UCheatManager
{
	GENERATED_BODY()

public:
	UFUNCTION(Exec)
	void AddItem(FName ItemID, int32 Count = 1);

	UFUNCTION(Exec)
	void SetLevel(int32 Level);

	UFUNCTION(Exec)
	void UnlockAllSkills();

	UFUNCTION(Exec)
	void Teleport(const FString& WaypointID);

	UFUNCTION(Exec)
	void CompleteQuest(const FString& QuestID);

	UFUNCTION(Exec)
	void GodMode();

	UFUNCTION(Exec)
	void InfiniteStamina();

	// Player hits kill anything in one hit (damage funnel floors target health).
	UFUNCTION(Exec)
	void OneShot();

	// Skill energy costs skipped (check + deduction).
	UFUNCTION(Exec)
	void InfiniteEnergy();

	// Skill cooldowns never commit.
	UFUNCTION(Exec)
	void NoCooldown();

	static bool IsGodModeEnabled() { return bGodMode; }
	static bool IsInfiniteStaminaEnabled() { return bInfiniteStamina; }
	static bool IsOneShotEnabled() { return bOneShot; }
	static bool IsInfiniteEnergyEnabled() { return bInfiniteEnergy; }
	static bool IsNoCooldownEnabled() { return bNoCooldown; }

private:
	static bool bGodMode;
	static bool bInfiniteStamina;
	static bool bOneShot;
	static bool bInfiniteEnergy;
	static bool bNoCooldown;
};
