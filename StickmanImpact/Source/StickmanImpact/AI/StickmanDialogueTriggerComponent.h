// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "GameplayTagContainer.h"
#include "StickmanInteractable.h"
#include "World/StickmanWorldTypes.h"
#include "StickmanDialogueTriggerComponent.generated.h"

class UDialogueSequence;

/** One context-gated dialogue option — first matching variant (top-down) wins. */
USTRUCT(BlueprintType)
struct FNPCDialogueVariant
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	TObjectPtr<UDialogueSequence> Sequence;

	// All set conditions must match; unset conditions are ignored.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	FGameplayTag RequiredStoryFlag;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	bool bOnlyAtNight = false;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	bool bOnlyInRain = false;

	// NPC memory: requires having talked to this NPC at least this many times before.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	int32 MinPreviousInteractions = 0;

	// Requires a specific active party member (CharacterID) — "player's equipped character".
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	FString RequiredActiveCharacterID;
};

/**
 * Interact-to-talk with context selection + NPC memory: Variants are checked top-down against
 * story flags, time of day, weather, interaction count (this NPC remembers you), and the
 * active party member; first match plays, else DialogueToPlay (the default). Interaction
 * count persists for the session (per-NPC world state; add to the save's world data when
 * NPC identity stabilizes — honest gap).
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UStickmanDialogueTriggerComponent : public UActorComponent, public IStickmanInteractable
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	TObjectPtr<UDialogueSequence> DialogueToPlay;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	TArray<FNPCDialogueVariant> Variants;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dialogue")
	FText InteractionPrompt;

	UPROPERTY(BlueprintReadOnly, Category = "Dialogue")
	int32 InteractionCount = 0;

	virtual void Interact_Implementation(AActor* Instigator) override;
	virtual FText GetInteractionPrompt_Implementation() const override { return InteractionPrompt; }

private:
	UDialogueSequence* SelectContextDialogue() const;
};
