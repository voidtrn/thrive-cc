// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "StickmanCutsceneActor.generated.h"

class USkeletalMeshComponent;
class UAnimMontage;
class USoundBase;

UENUM(BlueprintType)
enum class EStickmanCutsceneEmotion : uint8
{
	Neutral,
	Happy,
	Sad,
	Angry,
	Surprised
};

/**
 * Lightweight stickman actor for cutscenes — not a playable character, just a SkeletalMesh
 * with a handful of predefined animation slots, simple emotion morph targets, a look-at
 * target for the AnimBP's Look-At node to read, and a crude open/close mouth "lip sync".
 */
UCLASS()
class STICKMANIMPACT_API AStickmanCutsceneActor : public AActor
{
	GENERATED_BODY()

public:
	AStickmanCutsceneActor();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Animation")
	TObjectPtr<UAnimMontage> IdleMontage;
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Animation")
	TObjectPtr<UAnimMontage> WalkMontage;
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Animation")
	TObjectPtr<UAnimMontage> RunMontage;
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Animation")
	TObjectPtr<UAnimMontage> AttackMontage;
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Animation")
	TObjectPtr<UAnimMontage> CastMontage;
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Animation")
	TObjectPtr<UAnimMontage> HitMontage;
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Animation")
	TObjectPtr<UAnimMontage> DieMontage;

	// Read by the AnimBP's Look-At node (this actor doesn't touch bones directly in C++ —
	// runtime bone manipulation belongs in the AnimGraph, not hand-rolled here).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Look At")
	TObjectPtr<AActor> LookAtTarget;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Lip Sync")
	FName MouthOpenMorphTargetName = TEXT("Mouth_Open");

	UFUNCTION(BlueprintCallable, Category = "Animation")
	void PlaySlot(UAnimMontage* Montage, float PlayRate = 1.f);

	UFUNCTION(BlueprintCallable, Category = "Emotion")
	void SetEmotion(EStickmanCutsceneEmotion Emotion, float BlendWeight = 1.f);

	UFUNCTION(BlueprintPure, Category = "Look At")
	FVector GetLookAtTargetLocation() const;

	UFUNCTION(BlueprintCallable, Category = "Lip Sync")
	void PlaySimpleLipSync(USoundBase* VoiceLine);

	UFUNCTION(BlueprintCallable, Category = "Lip Sync")
	void StopLipSync();

protected:
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Mesh", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<USkeletalMeshComponent> CutsceneMesh;

private:
	void TickLipSync();

	FTimerHandle LipSyncTimerHandle;
	EStickmanCutsceneEmotion CurrentEmotion = EStickmanCutsceneEmotion::Neutral;
};
