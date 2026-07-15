// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "CharacterBondSubsystem.generated.h"

UENUM(BlueprintType)
enum class EBondXPSource : uint8
{
	ActivePlay,       // Time spent as the active character (trickle).
	QuestCompleted,   // Quest finished while in party.
	GiftGiven,        // Gift item consumed on the character.
	BondEvent         // Character side-story beat completed.
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnBondLevelUp, const FString&, CharacterID, int32, NewLevel);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnBondUnlock, const FString&, CharacterID, int32, UnlockLevel);

/**
 * Per-party-member bond level (1-10). XP sources map to fixed amounts (data below);
 * thresholds are cumulative XP. Unlock milestones are the design contract:
 *   Lv1 story quest, Lv3 dialogue options, Lv5 idle animation, Lv7 passive buff,
 *   Lv10 signature skin + voice line.
 * This subsystem owns level + the Lv7 passive multiplier
 * (GetBondPassiveScale — multiply into the character's stats where equipment totals
 * are applied); everything else (quests, dialogue variants, animations, skins) keys off
 * GetBondLevel/OnBondUnlock from the systems that own that content —
 * FNPCDialogueVariant-style gating, quest prerequisites, etc.
 */
UCLASS()
class STICKMANIMPACT_API UCharacterBondSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// Auto-wires the two ambient sources: quest completions credit the active character,
	// and a 60s real-time ticker trickles ActivePlay XP to whoever is fielded. Gifts and
	// bond events are explicit AddBondXP calls from their content.
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;
	virtual void Deinitialize() override;

	UFUNCTION(BlueprintCallable, Category = "Bond")
	void AddBondXP(const FString& CharacterID, EBondXPSource Source);

	UFUNCTION(BlueprintPure, Category = "Bond")
	int32 GetBondLevel(const FString& CharacterID) const;

	UFUNCTION(BlueprintPure, Category = "Bond")
	int32 GetBondXP(const FString& CharacterID) const;

	// 1.0 below Lv7; PassiveBuffScale (default +5% all stats) at Lv7+.
	UFUNCTION(BlueprintPure, Category = "Bond")
	float GetBondPassiveScale(const FString& CharacterID) const;

	// Cumulative XP needed for level index+2 (index 0 = XP for level 2).
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Bond")
	TArray<int32> LevelThresholds = { 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200 };

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Bond")
	TMap<EBondXPSource, int32> XPPerSource = {
		{ EBondXPSource::ActivePlay, 5 },
		{ EBondXPSource::QuestCompleted, 60 },
		{ EBondXPSource::GiftGiven, 40 },
		{ EBondXPSource::BondEvent, 150 }
	};

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Bond")
	float PassiveBuffScale = 1.05f;

	// Levels that carry a content unlock — OnBondUnlock fires when these are crossed.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Bond")
	TArray<int32> UnlockLevels = { 1, 3, 5, 7, 10 };

	UPROPERTY(BlueprintAssignable, Category = "Bond")
	FOnBondLevelUp OnBondLevelUp;

	UPROPERTY(BlueprintAssignable, Category = "Bond")
	FOnBondUnlock OnBondUnlock;

	// Save hooks (not yet in the binary save format — see README).
	void ExportSaveState(TMap<FString, int32>& OutXP) const { OutXP = BondXP; }
	void ImportSaveState(const TMap<FString, int32>& InXP) { BondXP = InXP; }

private:
	UFUNCTION()
	void HandleQuestCompleted(class UQuestDataAsset* Quest);

	void CreditActiveCharacter(EBondXPSource Source);
	int32 LevelForXP(int32 XP) const;

	TMap<FString, int32> BondXP;
	FTSTicker::FDelegateHandle ActivePlayTickerHandle;
};
