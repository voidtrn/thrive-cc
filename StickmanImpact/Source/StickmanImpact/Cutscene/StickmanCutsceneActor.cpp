// Copyright StickmanImpact Project.

#include "StickmanCutsceneActor.h"
#include "Components/SkeletalMeshComponent.h"
#include "Kismet/GameplayStatics.h"
#include "TimerManager.h"

AStickmanCutsceneActor::AStickmanCutsceneActor()
{
	PrimaryActorTick.bCanEverTick = false;

	CutsceneMesh = CreateDefaultSubobject<USkeletalMeshComponent>(TEXT("CutsceneMesh"));
	RootComponent = CutsceneMesh;
}

void AStickmanCutsceneActor::PlaySlot(UAnimMontage* Montage, float PlayRate)
{
	if (Montage && CutsceneMesh && CutsceneMesh->GetAnimInstance())
	{
		CutsceneMesh->GetAnimInstance()->Montage_Play(Montage, PlayRate);
	}
}

void AStickmanCutsceneActor::SetEmotion(EStickmanCutsceneEmotion Emotion, float BlendWeight)
{
	if (!CutsceneMesh)
	{
		return;
	}

	// Clear the previous emotion's morph target before setting the new one so they don't blend.
	static const TMap<EStickmanCutsceneEmotion, FName> EmotionMorphNames = {
		{ EStickmanCutsceneEmotion::Happy, TEXT("Emotion_Happy") },
		{ EStickmanCutsceneEmotion::Sad, TEXT("Emotion_Sad") },
		{ EStickmanCutsceneEmotion::Angry, TEXT("Emotion_Angry") },
		{ EStickmanCutsceneEmotion::Surprised, TEXT("Emotion_Surprised") },
	};

	if (const FName* PreviousMorphName = EmotionMorphNames.Find(CurrentEmotion))
	{
		CutsceneMesh->SetMorphTarget(*PreviousMorphName, 0.f);
	}

	CurrentEmotion = Emotion;

	if (const FName* NewMorphName = EmotionMorphNames.Find(Emotion))
	{
		CutsceneMesh->SetMorphTarget(*NewMorphName, FMath::Clamp(BlendWeight, 0.f, 1.f));
	}
}

FVector AStickmanCutsceneActor::GetLookAtTargetLocation() const
{
	if (LookAtTarget)
	{
		return LookAtTarget->GetActorLocation();
	}
	return GetActorLocation() + GetActorForwardVector() * 300.f;
}

void AStickmanCutsceneActor::PlaySimpleLipSync(USoundBase* VoiceLine)
{
	if (!VoiceLine)
	{
		return;
	}

	UGameplayStatics::PlaySoundAtLocation(this, VoiceLine, GetActorLocation());

	GetWorldTimerManager().SetTimer(LipSyncTimerHandle, this, &AStickmanCutsceneActor::TickLipSync, 0.08f, true);

	FTimerHandle StopHandle;
	GetWorldTimerManager().SetTimer(StopHandle, this, &AStickmanCutsceneActor::StopLipSync,
		VoiceLine->GetDuration(), false);
}

void AStickmanCutsceneActor::TickLipSync()
{
	if (!CutsceneMesh)
	{
		return;
	}
	// Crude flapping-mouth lip sync: no phoneme analysis, just jitter the mouth-open morph.
	CutsceneMesh->SetMorphTarget(MouthOpenMorphTargetName, FMath::FRandRange(0.1f, 0.8f));
}

void AStickmanCutsceneActor::StopLipSync()
{
	GetWorldTimerManager().ClearTimer(LipSyncTimerHandle);
	if (CutsceneMesh)
	{
		CutsceneMesh->SetMorphTarget(MouthOpenMorphTargetName, 0.f);
	}
}
