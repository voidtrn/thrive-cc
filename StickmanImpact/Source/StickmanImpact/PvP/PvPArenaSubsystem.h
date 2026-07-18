// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "PvPArenaSubsystem.generated.h"

UENUM(BlueprintType)
enum class EPvPMode : uint8
{
	Duel1v1,
	Team3v3,
	FreeForAll,
	ElementalClash, // random element assigned, reactions emphasized
	BossRace,       // parallel boss clears, fastest wins
	Casual,
	Ranked
};

UENUM(BlueprintType)
enum class EPvPTier : uint8
{
	Iron, Bronze, Silver, Gold, Platinum, Diamond, Master, Grandmaster, Celestial
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnPvPRatingChanged, int32, NewRating, EPvPTier, Tier);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnPvPMatchEnded, bool, bWon);

/**
 * PvP rules + progression layer. What's real here: the PvP **balance profile** (stat
 * normalization, halved equipment effects, tuned damage/CC/heal scalars the damage funnel
 * multiplies through when a match is active — `IsPvPActive` + the Get*Scalar reads), the
 * character **ban/pick** flow for 3v3, Elo rating with the 9-tier ladder + placement
 * matches + weekly decay, arena-token rewards, and win-streak bonuses.
 *
 * Honest scope: actual player-vs-player netplay rides the co-op networking refactor
 * (Docs/COOP_REPLICATION.md) + a match service for matchmaking/leaderboards — the same
 * backend the guild/trading docs scope. Until then the full rule set runs locally against
 * mirror-AI (Doppelganger archetype) for offline duels/training, which is also how the
 * balance profile gets tuned. Arena maps + hazards are level content; spectator/replay =
 * the replay system.
 */
UCLASS()
class STICKMANIMPACT_API UPvPArenaSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// --- Match lifecycle ------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "PvP")
	void BeginMatch(EPvPMode Mode);

	UFUNCTION(BlueprintCallable, Category = "PvP")
	void EndMatch(bool bWon);

	UFUNCTION(BlueprintPure, Category = "PvP")
	bool IsPvPActive() const { return bMatchActive; }

	UFUNCTION(BlueprintPure, Category = "PvP")
	EPvPMode GetActiveMode() const { return ActiveMode; }

	// --- Balance profile (damage funnel + systems read while a match is active) -----------

	UFUNCTION(BlueprintPure, Category = "PvP")
	float GetDamageScalar() const { return bMatchActive ? PvPDamageScalar : 1.f; }

	UFUNCTION(BlueprintPure, Category = "PvP")
	float GetEquipmentEffectScalar() const { return bMatchActive ? 0.5f : 1.f; }

	UFUNCTION(BlueprintPure, Category = "PvP")
	float GetCCDurationScalar() const { return bMatchActive ? 0.6f : 1.f; }

	UFUNCTION(BlueprintPure, Category = "PvP")
	float GetHealingScalar() const { return bMatchActive ? 0.7f : 1.f; }

	// --- Ban/pick (3v3 ranked) ------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "PvP")
	bool BanCharacter(const FString& CharacterID, bool bTeamA);

	UFUNCTION(BlueprintPure, Category = "PvP")
	bool IsCharacterBanned(const FString& CharacterID) const;

	// --- Rating ---------------------------------------------------------------------------

	UFUNCTION(BlueprintPure, Category = "PvP")
	int32 GetRating() const { return Rating; }

	UFUNCTION(BlueprintPure, Category = "PvP")
	EPvPTier GetTier() const;

	UFUNCTION(BlueprintPure, Category = "PvP")
	bool IsInPlacements() const { return PlacementMatchesPlayed < 10; }

	// Weekly decay if no ranked match played (call from the weekly rollover).
	UFUNCTION(BlueprintCallable, Category = "PvP")
	void ApplyWeeklyDecay();

	// --- Rewards --------------------------------------------------------------------------

	UFUNCTION(BlueprintPure, Category = "PvP")
	int32 GetArenaTokens() const { return ArenaTokens; }

	UFUNCTION(BlueprintCallable, Category = "PvP")
	bool SpendArenaTokens(int32 Amount);

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "PvP")
	float PvPDamageScalar = 0.75f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "PvP")
	int32 EloK = 32;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "PvP")
	int32 WeeklyDecayAmount = 25;

	UPROPERTY(BlueprintAssignable, Category = "PvP")
	FOnPvPRatingChanged OnPvPRatingChanged;

	UPROPERTY(BlueprintAssignable, Category = "PvP")
	FOnPvPMatchEnded OnPvPMatchEnded;

	// Save hooks (not yet in the binary format — see README).
	void ExportSaveState(int32& OutRating, int32& OutTokens, int32& OutPlacements) const;
	void ImportSaveState(int32 InRating, int32 InTokens, int32 InPlacements);

private:
	void UpdateElo(bool bWon);

	bool bMatchActive = false;
	EPvPMode ActiveMode = EPvPMode::Casual;

	TSet<FString> BannedByTeamA;
	TSet<FString> BannedByTeamB;

	int32 Rating = 1000;
	int32 PlacementMatchesPlayed = 0;
	int32 WinStreak = 0;
	int32 ArenaTokens = 0;
	bool bPlayedRankedThisWeek = false;
};
