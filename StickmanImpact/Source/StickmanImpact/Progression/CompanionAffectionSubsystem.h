// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "CompanionAffectionSubsystem.generated.h"

UENUM(BlueprintType)
enum class EAffectionMilestone : uint8
{
	Stranger,     // 0-20
	Acquaintance, // 21-40
	Friend,       // 41-60
	CloseFriend,  // 61-80
	Beloved,      // 81-99
	SoulBond      // 100
};

UENUM(BlueprintType)
enum class ERomanceState : uint8
{
	None,
	Interested,   // romantic dialogue picked
	Confessed,    // confession scene done — romance active
	BrokenUp
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnAffectionMilestone, const FString&, CharacterID, EAffectionMilestone, Milestone);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnPersonalQuestUnlocked, const FString&, CharacterID, int32, QuestPart);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnRomanceStateChanged, const FString&, CharacterID, ERomanceState, NewState);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnBattleBondLevelUp, const FString&, CharacterID, int32, NewLevel);

/**
 * Persona/Mass-Effect companion depth, layered over the coarser UCharacterBondSubsystem
 * (which keeps its ambient sources). Affection 0-100 per companion:
 *
 * - **Sources**: dialogue choices, party time, gifts (companion-specific preference
 *   multipliers via `SetGiftPreference`/`GiveGift`), quest completion, value-aligned
 *   choices — all through `AddAffection` (clamped, milestone deltas fire the delegate).
 * - **Personal quests**: parts 1-5 unlock at 20/40/60/80/100 — `GetUnlockedQuestPart` +
 *   the unlock delegate; the quests themselves are UQuestDataAssets keyed per part.
 * - **Romance** (optional, per-companion `SetRomanceable`): requires affection ≥ 80 +
 *   personal quest part ≥ 4 + `ExpressRomanticInterest` before `TryConfess` succeeds.
 *   Multiple active romances allowed only for companions flagged `bAcceptsPolyamory`
 *   (jealousy: a second confession with a non-accepting partner active drops the first
 *   partner's affection). `BreakUp` costs affection heavily.
 * - **Battle bond**: fighting together (`AddBattleBondXP`) levels 1-5 → team attack /
 *   passive boost / auto-revive / shared energy / dual awakening — combat systems gate on
 *   `GetBattleBondLevel`.
 *
 * Campfire scenes, birthday events, and companion banter are content on the existing
 * dialogue/banter systems reading these values.
 */
UCLASS()
class STICKMANIMPACT_API UCompanionAffectionSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// --- Affection ------------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Affection")
	void AddAffection(const FString& CharacterID, int32 Amount);

	UFUNCTION(BlueprintPure, Category = "Affection")
	int32 GetAffection(const FString& CharacterID) const;

	UFUNCTION(BlueprintPure, Category = "Affection")
	EAffectionMilestone GetMilestone(const FString& CharacterID) const;

	// --- Gifts ----------------------------------------------------------------------------

	// Preference multiplier for an item category (loved 2.0, liked 1.5, disliked 0.5).
	UFUNCTION(BlueprintCallable, Category = "Affection")
	void SetGiftPreference(const FString& CharacterID, FName ItemCategory, float Multiplier);

	UFUNCTION(BlueprintCallable, Category = "Affection")
	void GiveGift(const FString& CharacterID, FName ItemCategory, int32 BaseAffection);

	// --- Personal quests ------------------------------------------------------------------

	// Highest unlocked part (1-5; 0 = none).
	UFUNCTION(BlueprintPure, Category = "Affection")
	int32 GetUnlockedQuestPart(const FString& CharacterID) const;

	UFUNCTION(BlueprintCallable, Category = "Affection")
	void MarkQuestPartCompleted(const FString& CharacterID, int32 Part);

	UFUNCTION(BlueprintPure, Category = "Affection")
	int32 GetCompletedQuestPart(const FString& CharacterID) const;

	// --- Romance --------------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Affection")
	void SetRomanceable(const FString& CharacterID, bool bRomanceable, bool bAcceptsPolyamory);

	UFUNCTION(BlueprintCallable, Category = "Affection")
	void ExpressRomanticInterest(const FString& CharacterID);

	// Confession: affection>=80, quest part>=4 done, interest expressed. Handles jealousy.
	UFUNCTION(BlueprintCallable, Category = "Affection")
	bool TryConfess(const FString& CharacterID);

	UFUNCTION(BlueprintCallable, Category = "Affection")
	void BreakUp(const FString& CharacterID);

	UFUNCTION(BlueprintPure, Category = "Affection")
	ERomanceState GetRomanceState(const FString& CharacterID) const;

	// --- Battle bond ----------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Affection")
	void AddBattleBondXP(const FString& CharacterID, int32 Amount);

	UFUNCTION(BlueprintPure, Category = "Affection")
	int32 GetBattleBondLevel(const FString& CharacterID) const;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Affection")
	TArray<int32> BattleBondXPPerLevel = { 200, 600, 1200, 2000 };

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Affection")
	int32 BreakUpAffectionCost = 40;

	UPROPERTY(BlueprintAssignable, Category = "Affection")
	FOnAffectionMilestone OnAffectionMilestone;

	UPROPERTY(BlueprintAssignable, Category = "Affection")
	FOnPersonalQuestUnlocked OnPersonalQuestUnlocked;

	UPROPERTY(BlueprintAssignable, Category = "Affection")
	FOnRomanceStateChanged OnRomanceStateChanged;

	UPROPERTY(BlueprintAssignable, Category = "Affection")
	FOnBattleBondLevelUp OnBattleBondLevelUp;

	// Save hooks (not yet in the binary format — see README).
	void ExportSaveState(TMap<FString, int32>& OutAffection, TMap<FString, int32>& OutQuestParts,
		TMap<FString, uint8>& OutRomance, TMap<FString, int32>& OutBattleBond) const;
	void ImportSaveState(const TMap<FString, int32>& InAffection, const TMap<FString, int32>& InQuestParts,
		const TMap<FString, uint8>& InRomance, const TMap<FString, int32>& InBattleBond);

private:
	struct FCompanionState
	{
		int32 Affection = 0;
		int32 CompletedQuestPart = 0;
		bool bRomanceable = false;
		bool bAcceptsPolyamory = false;
		bool bInterestExpressed = false;
		ERomanceState Romance = ERomanceState::None;
		int32 BattleBondXP = 0;
		TMap<FName, float> GiftPreferences;
	};

	static EAffectionMilestone MilestoneForValue(int32 Value);
	FCompanionState& State(const FString& CharacterID) { return Companions.FindOrAdd(CharacterID); }
	const FCompanionState* FindState(const FString& CharacterID) const { return Companions.Find(CharacterID); }

	TMap<FString, FCompanionState> Companions;
};
