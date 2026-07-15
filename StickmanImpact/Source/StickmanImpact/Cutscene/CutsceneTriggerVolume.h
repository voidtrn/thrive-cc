// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "GameplayTagContainer.h"
#include "CutsceneTriggerVolume.generated.h"

class UBoxComponent;
class ULevelSequence;

/** Plays a Level Sequence cutscene when the player enters, if its conditions are met. */
UCLASS()
class STICKMANIMPACT_API ACutsceneTriggerVolume : public AActor
{
	GENERATED_BODY()

public:
	ACutsceneTriggerVolume();

	// Identity used for "already watched" tracking, independent of which sequence is assigned.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Cutscene")
	FString CutsceneID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Cutscene")
	TObjectPtr<ULevelSequence> CutsceneToPlay;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Cutscene")
	bool bSkippable = true;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Cutscene")
	bool bOneShot = true;

	// All of these must already be set on UDialogueManager's story flags to trigger.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Cutscene|Conditions")
	TArray<FGameplayTag> RequiredStoryFlags;

	// Hook for a future party system — always passes today since there's no party roster yet.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Cutscene|Conditions")
	TArray<FString> RequiredPartyMembers;

protected:
	virtual void BeginPlay() override;

	UFUNCTION()
	void OnTriggerBeginOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp,
		int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

	bool AreConditionsMet(AActor* OtherActor) const;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Cutscene", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UBoxComponent> TriggerBox;
};
