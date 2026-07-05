#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "DialogueTypes.generated.h"

class USoundBase;
class UTexture2D;

UENUM(BlueprintType)
enum class EDialogueConditionType : uint8
{
	None,
	QuestCompleted,
	QuestActive,
	HasItem
};

USTRUCT(BlueprintType)
struct FDialogueCondition
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	EDialogueConditionType Type = EDialogueConditionType::None;

	/** Quest ID / Item ID. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FName TargetID;

	/** Minimal count untuk HasItem. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int32 Count = 1;
};

UENUM(BlueprintType)
enum class EDialogueActionType : uint8
{
	None,
	GiveItem,
	TakeItem,
	StartQuest,
	ReportTalkObjective, // lapor TalkToNPC objective ke QuestManager
	GivePrimogems,
	GiveMora
};

USTRUCT(BlueprintType)
struct FDialogueAction
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	EDialogueActionType Type = EDialogueActionType::None;

	/** Item ID / Quest ID / NPC ID. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FName TargetID;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int32 Amount = 1;
};

USTRUCT(BlueprintType)
struct FDialogueChoice
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FText ChoiceText;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FName NextNodeID;

	/** Choice hanya tampil kalau condition lolos. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FDialogueCondition Condition;
};

/** Row DataTable dialogue tree — satu tabel per percakapan/NPC. */
USTRUCT(BlueprintType)
struct FDialogueNode : public FTableRowBase
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FText SpeakerName;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TSoftObjectPtr<UTexture2D> SpeakerPortrait;

	/** Portrait kiri (true) / kanan (false) — visual novel layout. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	bool bPortraitLeft = true;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, meta = (MultiLine = true))
	FText DialogueText;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TSoftObjectPtr<USoundBase> VoiceLine;

	/** Kosong = pakai NextNodeID; isi = tampilkan pilihan. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TArray<FDialogueChoice> Choices;

	/** Node lanjutan kalau tanpa choice. None = dialog selesai. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FName NextNodeID;

	/** Dieksekusi saat node ini tampil. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TArray<FDialogueAction> Actions;
};
