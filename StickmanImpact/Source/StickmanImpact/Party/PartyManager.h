// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "StickmanPartyTypes.h"
#include "PartyManager.generated.h"

/** Computed bonuses from having 2+ party members sharing an element (or all 4 different). */
USTRUCT(BlueprintType)
struct FElementalResonanceBonuses
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly) float AttackBonusPercent = 0.f;
	UPROPERTY(BlueprintReadOnly) float CritRateBonusPercent = 0.f;
	UPROPERTY(BlueprintReadOnly) float HealingBonusPercent = 0.f;
	UPROPERTY(BlueprintReadOnly) float EnergyRechargeBonusPercent = 0.f;
	UPROPERTY(BlueprintReadOnly) float MoveSpeedBonusPercent = 0.f;
	UPROPERTY(BlueprintReadOnly) float ShieldStrengthBonusPercent = 0.f;
	UPROPERTY(BlueprintReadOnly) float ElementalMasteryBonusFlat = 0.f;
	UPROPERTY(BlueprintReadOnly) float AllElementalDMGBonusPercent = 0.f;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnPartySwitched, int32, NewIndex, int32, OldIndex);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnMemberLeveledUp, int32, MemberIndex, int32, NewLevel);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnMemberAscended, int32, MemberIndex, int32, NewAscensionLevel);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnResonanceChanged);

/**
 * Owns the active 4-member party, the currently-controlled index, switch cooldown, EXP/
 * ascension progress, and Elemental Resonance bonuses. SwitchToIndex() reconfigures the
 * player's single AStickmanCharacter pawn in place (mesh/stats/abilities) rather than
 * spawning/possessing a new actor per member — see AStickmanCharacter::ApplyCharacterData.
 */
UCLASS()
class STICKMANIMPACT_API UPartyManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	static constexpr int32 MaxPartySize = 4;

	UFUNCTION(BlueprintCallable, Category = "Party")
	bool AddPartyMember(const FStickmanCharacterData& CharacterData);

	UFUNCTION(BlueprintCallable, Category = "Party")
	bool RemovePartyMember(const FString& CharacterID);

	UFUNCTION(BlueprintCallable, Category = "Party")
	bool SwitchToIndex(int32 Index);

	UFUNCTION(BlueprintPure, Category = "Party")
	int32 GetActiveIndex() const { return ActiveIndex; }

	UFUNCTION(BlueprintPure, Category = "Party")
	FPartyMemberState GetActiveMember() const;

	UFUNCTION(BlueprintPure, Category = "Party")
	TArray<FPartyMemberState> GetPartyMembers() const { return PartyMembers; }

	UFUNCTION(BlueprintPure, Category = "Party")
	bool IsSwitchOnCooldown() const { return bSwitchOnCooldown; }

	UFUNCTION(BlueprintCallable, Category = "Party|Leveling")
	void GrantEXP(int32 MemberIndex, float EXPAmount);

	UFUNCTION(BlueprintCallable, Category = "Party|Leveling")
	bool TryAscend(int32 MemberIndex);

	UFUNCTION(BlueprintPure, Category = "Party|Resonance")
	FElementalResonanceBonuses GetActiveResonanceBonuses() const { return CachedResonance; }

	// If true, the incoming character's Elemental Burst auto-activates on switch (if off
	// cooldown/has energy) — an unlockable perk, off by default.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Party")
	bool bAutoBurstOnSwitchUnlocked = false;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Party")
	float SwitchCooldownDuration = 2.f;

	// EXP required to reach level N+1 from N — simple quadratic curve, retune freely.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Party|Leveling")
	int32 MaxCharacterLevel = 90;

	UPROPERTY(BlueprintAssignable, Category = "Party")
	FOnPartySwitched OnPartySwitched;

	UPROPERTY(BlueprintAssignable, Category = "Party")
	FOnMemberLeveledUp OnMemberLeveledUp;

	UPROPERTY(BlueprintAssignable, Category = "Party")
	FOnMemberAscended OnMemberAscended;

	UPROPERTY(BlueprintAssignable, Category = "Party")
	FOnResonanceChanged OnResonanceChanged;

	// --- Save/load -----------------------------------------------------------
	void ImportSaveState(const TArray<FPartyMemberState>& Members, int32 ActiveMemberIndex);

private:
	float GetEXPRequiredForLevel(int32 Level) const;
	void RecalculateResonance();
	void ApplyActiveMemberToPawn();

	UPROPERTY()
	TArray<FPartyMemberState> PartyMembers;

	int32 ActiveIndex = 0;
	bool bSwitchOnCooldown = false;
	FTimerHandle SwitchCooldownTimerHandle;

	FElementalResonanceBonuses CachedResonance;
};
