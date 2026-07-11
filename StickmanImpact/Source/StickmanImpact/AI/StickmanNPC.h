// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "Cutscene/StickmanCutsceneActor.h" // for EStickmanCutsceneEmotion, reused here as the NPC's emotion state
#include "StickmanNPC.generated.h"

class UStickmanScheduleComponent;
class UStickmanDialogueTriggerComponent;

/**
 * Town/world NPC: follows a daily routine (UStickmanScheduleComponent), can be talked to
 * (UStickmanDialogueTriggerComponent, via IStickmanInteractable), greets the player on
 * approach, and flees if it notices nearby combat.
 */
UCLASS()
class STICKMANIMPACT_API AStickmanNPC : public ACharacter
{
	GENERATED_BODY()

public:
	AStickmanNPC();

	virtual void Tick(float DeltaSeconds) override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
	float GreetRadius = 300.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
	TObjectPtr<UAnimMontage> GreetMontage;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
	float FleeFromCombatRadius = 1000.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
	float FleeSpeed = 500.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
	float WalkSpeed = 250.f;

	UFUNCTION(BlueprintCallable, Category = "NPC")
	void SetEmotion(EStickmanCutsceneEmotion NewEmotion) { CurrentEmotion = NewEmotion; }

	UFUNCTION(BlueprintPure, Category = "NPC")
	EStickmanCutsceneEmotion GetEmotion() const { return CurrentEmotion; }

	UFUNCTION(BlueprintPure, Category = "NPC")
	bool IsFleeingCombat() const { return bIsFleeingCombat; }

protected:
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "NPC", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStickmanScheduleComponent> ScheduleComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "NPC", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStickmanDialogueTriggerComponent> DialogueComponent;

private:
	void UpdateGreeting();
	void UpdateCombatFlee(float DeltaSeconds);

	bool bHasGreetedPlayer = false;
	bool bIsFleeingCombat = false;
	float TimeSinceFleeCheck = 0.f;
	EStickmanCutsceneEmotion CurrentEmotion = EStickmanCutsceneEmotion::Neutral;
};
