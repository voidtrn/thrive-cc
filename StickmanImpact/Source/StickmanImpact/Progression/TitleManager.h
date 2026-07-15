// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Engine/DataTable.h"
#include "TitleManager.generated.h"

class UNiagaraSystem;

/** One unlockable title (DataTable row). */
USTRUCT(BlueprintType)
struct FTitleDefinition : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Title")
	FName TitleID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Title")
	FText DisplayName;

	// Unlocks when this achievement fires (achievement-earned, never grind-bought).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Title")
	FName RequiredAchievementID;

	// Alternative unlock: total achievement-count milestone (0 = achievement-only).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Title")
	int32 RequiredAchievementCount = 0;

	// Rare titles glow: spawned attached to the character while equipped.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Title")
	TObjectPtr<UNiagaraSystem> EquippedVFX;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnTitleUnlocked, FName, TitleID);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnTitleEquipped, FName, TitleID, const FText&, DisplayName);

/**
 * Unlockable nameplate titles. Listens to UAchievementManager::OnAchievementUnlocked and
 * unlocks any FTitleDefinition whose RequiredAchievementID matches (or whose
 * RequiredAchievementCount milestone is crossed). The nameplate widget listens to
 * OnTitleEquipped for text + spawns/destroys EquippedVFX. Hidden achievements
 * (FAchievementEntry::bHidden — UI shows "???" until unlocked) carry over: a title gated
 * on a hidden achievement is itself a surprise.
 */
UCLASS()
class STICKMANIMPACT_API UTitleManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;

	// Assign in a GameInstance/BP init hook before play.
	UFUNCTION(BlueprintCallable, Category = "Titles")
	void SetTitleTable(UDataTable* Table);

	UFUNCTION(BlueprintCallable, Category = "Titles")
	bool EquipTitle(FName TitleID);

	UFUNCTION(BlueprintPure, Category = "Titles")
	FName GetEquippedTitle() const { return EquippedTitleID; }

	UFUNCTION(BlueprintPure, Category = "Titles")
	bool IsTitleUnlocked(FName TitleID) const { return UnlockedTitleIDs.Contains(TitleID); }

	UFUNCTION(BlueprintPure, Category = "Titles")
	TArray<FName> GetUnlockedTitles() const { return UnlockedTitleIDs.Array(); }

	UPROPERTY(BlueprintAssignable, Category = "Titles")
	FOnTitleUnlocked OnTitleUnlocked;

	UPROPERTY(BlueprintAssignable, Category = "Titles")
	FOnTitleEquipped OnTitleEquipped;

	// Save hooks (not yet in the binary save format — see README).
	void ExportSaveState(TArray<FName>& OutUnlocked, FName& OutEquipped) const;
	void ImportSaveState(const TArray<FName>& InUnlocked, FName InEquipped);

private:
	UFUNCTION()
	void HandleAchievementUnlocked(struct FAchievementEntry Entry);

	void EvaluateUnlocks(FName JustUnlockedAchievement, int32 TotalUnlockedCount);

	UPROPERTY()
	TObjectPtr<UDataTable> TitleTable;

	TSet<FName> UnlockedTitleIDs;
	FName EquippedTitleID = NAME_None;
	int32 KnownAchievementCount = 0;
};
