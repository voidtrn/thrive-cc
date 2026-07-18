// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "GuildSubsystem.generated.h"

UENUM(BlueprintType)
enum class EGuildRole : uint8
{
	Initiate,
	Member,
	Veteran,
	Officer,
	GuildMaster
};

USTRUCT(BlueprintType)
struct FGuildMember
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Guild")
	FString PlayerName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Guild")
	EGuildRole Role = EGuildRole::Initiate;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Guild")
	int32 WeeklyContribution = 0;
};

USTRUCT(BlueprintType)
struct FGuildInfo
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Guild")
	FString GuildName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Guild")
	FString GuildTag; // 2-4 chars

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Guild")
	FString Description;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Guild")
	int32 Level = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Guild")
	int32 GuildEXP = 0;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Guild")
	bool bOpenEnrollment = true;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Guild")
	int32 MinLevelRequirement = 1;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnGuildLevelUp, int32, NewLevel);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnGuildRaidProgress, float, HPFraction, int32, RewardTier);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnGuildMissionCompleted, FName, MissionID);

/**
 * Guild data model + progression — deliberately **local-first**. Everything here (creation,
 * roles, EXP/levels/perks, bank, weekly missions, the raid boss's shared HP pool) is the
 * game-side model; making it multi-account (real members, cross-player raid damage, GvG)
 * requires the online backend service the co-op/trading docs already scope out. The model is
 * shaped so a backend can mirror it 1:1 (plain structs, explicit mutations).
 *
 * Perk thresholds (level → perk) follow the design table: 5 +EXP%, 10 bank, 15 shop,
 * 20 hall, 25 +drops, 30 raid boss, 40 GvG, 50 legendary quest — `HasPerk(level)` is what
 * other systems read. The guild hall is a realm layout (housing system) flagged shared.
 */
UCLASS()
class STICKMANIMPACT_API UGuildSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	// --- Guild lifecycle ------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Guild")
	bool CreateGuild(const FString& Name, const FString& Tag);

	UFUNCTION(BlueprintPure, Category = "Guild")
	bool IsInGuild() const { return bInGuild; }

	UFUNCTION(BlueprintPure, Category = "Guild")
	const FGuildInfo& GetGuildInfo() const { return Guild; }

	// --- Members / roles ------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Guild")
	void AddMember(const FString& PlayerName, EGuildRole Role);

	UFUNCTION(BlueprintCallable, Category = "Guild")
	bool SetMemberRole(const FString& PlayerName, EGuildRole Role);

	UFUNCTION(BlueprintPure, Category = "Guild")
	const TArray<FGuildMember>& GetMembers() const { return Members; }

	UFUNCTION(BlueprintPure, Category = "Guild")
	int32 GetMemberCap() const { return 20 + Guild.Level * 2; }

	// --- Progression ----------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Guild")
	void AddGuildEXP(int32 Amount);

	// Level-gated perk check (pass the design-table threshold: 5/10/15/20/25/30/40/50).
	UFUNCTION(BlueprintPure, Category = "Guild")
	bool HasPerk(int32 RequiredLevel) const { return bInGuild && Guild.Level >= RequiredLevel; }

	// --- Bank -----------------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Guild")
	void DepositItem(FName ItemID, int32 Quantity);

	UFUNCTION(BlueprintCallable, Category = "Guild")
	bool WithdrawItem(FName ItemID, int32 Quantity);

	UFUNCTION(BlueprintPure, Category = "Guild")
	int32 GetBankQuantity(FName ItemID) const;

	// --- Weekly missions ------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Guild")
	void SetWeeklyMission(FName MissionID, int32 Goal);

	UFUNCTION(BlueprintCallable, Category = "Guild")
	void AddMissionProgress(FName MissionID, int32 Amount, const FString& ContributorName);

	// --- Raid boss ------------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Guild")
	void StartRaidBoss(float TotalHP);

	// Damage chips the shared pool; crossing 75/50/25/0% fires reward tiers.
	UFUNCTION(BlueprintCallable, Category = "Guild")
	void AddRaidDamage(float Damage, const FString& ContributorName);

	UFUNCTION(BlueprintPure, Category = "Guild")
	float GetRaidHPFraction() const;

	UPROPERTY(BlueprintAssignable, Category = "Guild")
	FOnGuildLevelUp OnGuildLevelUp;

	UPROPERTY(BlueprintAssignable, Category = "Guild")
	FOnGuildRaidProgress OnGuildRaidProgress;

	UPROPERTY(BlueprintAssignable, Category = "Guild")
	FOnGuildMissionCompleted OnGuildMissionCompleted;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Guild")
	int32 EXPPerLevel = 1000;

	// Save hooks (not yet in the binary format — see README).
	void ExportSaveState(FGuildInfo& OutGuild, TArray<FGuildMember>& OutMembers, TMap<FName, int32>& OutBank) const;
	void ImportSaveState(const FGuildInfo& InGuild, const TArray<FGuildMember>& InMembers, const TMap<FName, int32>& InBank);

private:
	FGuildMember* FindMember(const FString& PlayerName);

	bool bInGuild = false;
	FGuildInfo Guild;
	TArray<FGuildMember> Members;
	TMap<FName, int32> Bank;

	struct FMission { int32 Goal = 0; int32 Progress = 0; };
	TMap<FName, FMission> WeeklyMissions;

	float RaidBossMaxHP = 0.f;
	float RaidBossHP = 0.f;
	int32 RaidRewardTierFired = 0;
	TMap<FString, float> RaidContributions;
};
