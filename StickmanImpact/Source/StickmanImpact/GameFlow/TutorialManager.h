// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "GameplayTagContainer.h"
#include "TutorialManager.generated.h"

class UTexture2D;

/** One tutorial popup (DataTable row). TriggerTag is fired by gameplay code via TriggerTutorial(). */
USTRUCT(BlueprintType)
struct FTutorialEntry : public FTableRowBase
{
	GENERATED_BODY()

	// e.g. Tutorial.Combat.FirstDash, Tutorial.World.FirstWaypoint — fire via TriggerTutorial.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tutorial")
	FGameplayTag TriggerTag;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tutorial")
	FText Title;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tutorial")
	FText BodyText;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tutorial")
	TObjectPtr<UTexture2D> Image;

	// One-time by default; repeatable entries (e.g. control reminders) opt out.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tutorial")
	bool bOneTime = true;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnTutorialTriggered, FTutorialEntry, Entry);

/**
 * Context-sensitive tutorials: gameplay code calls TriggerTutorial(Tag) at the teachable
 * moment (first dash, first reaction, first waypoint, ...); the manager looks the tag up in
 * TutorialTable, suppresses already-seen one-time entries (persisted in the settings config
 * section), and broadcasts OnTutorialTriggered for a popup widget to display. Practice
 * domain: a separate level/Data Layer with an AEnemySpawner set to non-respawning dummies —
 * level content, no dedicated code; teleport there via a waypoint.
 */
UCLASS()
class STICKMANIMPACT_API UTutorialManager : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Tutorial")
	TObjectPtr<class UDataTable> TutorialTable;

	// Fires the tutorial for Tag if it exists and hasn't been consumed. Returns true if shown.
	UFUNCTION(BlueprintCallable, Category = "Tutorial")
	bool TriggerTutorial(FGameplayTag Tag);

	UFUNCTION(BlueprintPure, Category = "Tutorial")
	bool HasSeenTutorial(FGameplayTag Tag) const { return SeenTutorialTags.Contains(Tag.ToString()); }

	UFUNCTION(BlueprintCallable, Category = "Tutorial")
	void ResetAllTutorials();

	UFUNCTION(BlueprintPure, Category = "Tutorial")
	int32 GetSeenTutorialCount() const { return SeenTutorialTags.Num(); }

	UPROPERTY(BlueprintAssignable, Category = "Tutorial")
	FOnTutorialTriggered OnTutorialTriggered;

private:
	void PersistSeenTags() const;

	TSet<FString> SeenTutorialTags;
};
