#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "QuestTypes.generated.h"

UENUM(BlueprintType)
enum class EQuestType : uint8
{
	ArchonQuest,      // main story
	WorldQuest,       // side, worldbuilding
	DailyCommission,  // 4/hari random dari pool
	StoryQuest        // character-specific
};

UENUM(BlueprintType)
enum class EObjectiveType : uint8
{
	GoToLocation,
	KillEnemy,
	CollectItem,
	TalkToNPC,
	InteractObject,
	CompleteDomain,
	Wait
};

USTRUCT(BlueprintType)
struct FQuestStep
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FName StepID;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FText StepDescription;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	EObjectiveType ObjectiveType = EObjectiveType::TalkToNPC;

	/** Untuk GoToLocation & quest marker di map. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FVector TargetLocation = FVector::ZeroVector;

	/** ID enemy/item/NPC/object/domain (match dengan ReportObjective). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FName TargetID;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, meta = (ClampMin = 1))
	int32 RequiredCount = 1;

	/** Wait objective: detik. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, meta = (EditCondition = "ObjectiveType == EObjectiveType::Wait"))
	float WaitSeconds = 5.f;

	/** DataTable dialogue sebelum step mulai (opsional). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FName PreStepDialogueNode;

	/** Dialogue setelah step selesai (opsional). */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FName PostStepDialogueNode;
};

USTRUCT(BlueprintType)
struct FQuestRewards
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int32 Primogems = 0;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int32 Mora = 0;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int32 ARExp = 0;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TMap<FName, int32> Items;
};

/**
 * Definisi satu quest — buat Data Asset per quest di Content/Data/Quests/.
 * Register semua ke QuestManager (array di BP_OpenWorldGameMode).
 */
UCLASS(BlueprintType)
class MYGAME_API UQuestDataAsset : public UPrimaryDataAsset
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Quest")
	FName QuestID;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Quest")
	FText QuestName;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Quest", meta = (MultiLine = true))
	FText QuestDescription;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Quest")
	EQuestType QuestType = EQuestType::WorldQuest;

	/** Quest yang harus selesai dulu. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Quest")
	TArray<FName> Prerequisites;

	/** Adventure Rank minimum. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Quest", meta = (ClampMin = 1))
	int32 ARRequirement = 1;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Quest")
	TArray<FQuestStep> QuestSteps;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Quest")
	FQuestRewards Rewards;

	/** Auto-start saat prerequisites + AR terpenuhi. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Quest")
	bool bAutoStart = false;
};

/** Progress quest aktif (persist di save). */
USTRUCT(BlueprintType)
struct FActiveQuestState
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly) int32 CurrentStepIndex = 0;
	UPROPERTY(BlueprintReadOnly) int32 CurrentCount = 0;
};
