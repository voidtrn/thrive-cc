// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Combat/StickmanReactionTypes.h"
#include "AchievementManager.generated.h"

class UTexture2D;

UENUM(BlueprintType)
enum class EAchievementTrigger : uint8
{
	KillCount,			// N enemies killed (any)
	QuestCompleted,		// specific QuestID (TargetID)
	CollectCount,		// N collectibles gathered
	ReactionTriggered,	// N elemental reactions caused
	WaypointsUnlocked	// N waypoints unlocked
};

/** One achievement (DataTable row). TargetID only used by trigger types that name a specific thing. */
USTRUCT(BlueprintType)
struct FAchievementEntry : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Achievement")
	FName AchievementID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Achievement")
	FText Title;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Achievement")
	FText Description;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Achievement")
	TObjectPtr<UTexture2D> Icon;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Achievement")
	EAchievementTrigger TriggerType = EAchievementTrigger::KillCount;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Achievement")
	int32 RequiredCount = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Achievement")
	FString TargetID;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnAchievementUnlocked, FAchievementEntry, Entry);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnAchievementProgress, FName, AchievementID, float, Percent);

/**
 * Listens to the delegates the other systems already broadcast (kills via
 * UCombatFeedbackSubsystem, quests via UQuestManager, collectibles via UCollectibleManager,
 * reactions via UElementalReactionManager, waypoints via UWaypointManager) and advances
 * matching FAchievementEntry rows. Unlocks broadcast OnAchievementUnlocked for a popup widget;
 * progress/unlocked state persists in the settings config section (per-install, like
 * platform achievements behave). Platform achievement upload (Steam etc.) hooks in
 * UnlockInternal — see PACKAGING.md.
 */
UCLASS()
class STICKMANIMPACT_API UAchievementManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Achievements")
	TObjectPtr<class UDataTable> AchievementTable;

	UFUNCTION(BlueprintPure, Category = "Achievements")
	bool IsUnlocked(FName AchievementID) const { return UnlockedIDs.Contains(AchievementID.ToString()); }

	UFUNCTION(BlueprintPure, Category = "Achievements")
	int32 GetProgress(FName AchievementID) const;

	// For the tracking UI: every row + current count, unlocked-or-not.
	UFUNCTION(BlueprintCallable, Category = "Achievements")
	TArray<FAchievementEntry> GetAllAchievements() const;

	UPROPERTY(BlueprintAssignable, Category = "Achievements")
	FOnAchievementUnlocked OnAchievementUnlocked;

	UPROPERTY(BlueprintAssignable, Category = "Achievements")
	FOnAchievementProgress OnAchievementProgress;

private:
	void AdvanceTrigger(EAchievementTrigger TriggerType, const FString& TargetID, int32 Amount);
	void UnlockInternal(const FAchievementEntry& Entry);
	void PersistState() const;

	UFUNCTION()
	void HandleKillConfirmed(AActor* Target);
	UFUNCTION()
	void HandleQuestCompleted(class UQuestDataAsset* Quest);
	UFUNCTION()
	void HandleCollectibleCollected(FString ItemID, FName Region);
	UFUNCTION()
	void HandleReactionTriggered(AActor* Target, EStickmanReactionType Reaction, float Damage, FVector Location);
	UFUNCTION()
	void HandleWaypointUnlocked(class AWaypointActor* Waypoint);

	TSet<FString> UnlockedIDs;
	TMap<FString, int32> ProgressCounts;
};
