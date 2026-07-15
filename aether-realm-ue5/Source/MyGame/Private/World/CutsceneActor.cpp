#include "World/CutsceneActor.h"
#include "System/OpenWorldPlayerController.h"
#include "System/DialogueManager.h"
#include "Camera/CameraActor.h"
#include "Camera/CameraComponent.h"
#include "GameFramework/Pawn.h"
#include "TimerManager.h"
#include "MyGame.h"

ACutsceneActor::ACutsceneActor()
{
	PrimaryActorTick.bCanEverTick = false;
	SetReplicates(false); // presentation client-local — lihat komentar header
}

void ACutsceneActor::Play(APlayerController* PC)
{
	if (IsPlaying() || Shots.Num() == 0 || !PC)
	{
		return;
	}

	CachedPC = PC;
	CachedPawn = PC->GetPawn();
	CurrentShotIndex = 0;

	if (AOpenWorldPlayerController* OWPC = Cast<AOpenWorldPlayerController>(PC))
	{
		OWPC->SetInputContextMode(EInputContextMode::Dialog); // reuse mode lock existing (belum ada mode "Cutscene" khusus)
	}

	FActorSpawnParameters SpawnParams;
	SpawnParams.Owner = this;
	ShotCamera = GetWorld()->SpawnActor<ACameraActor>(GetActorLocation(), GetActorRotation(), SpawnParams);

	ApplyShot(0);
}

void ACutsceneActor::ApplyShot(int32 ShotIndex)
{
	if (!Shots.IsValidIndex(ShotIndex) || !IsValid(ShotCamera) || !IsValid(CachedPC))
	{
		EndCutscene();
		return;
	}

	const FCutsceneShot& Shot = Shots[ShotIndex];
	const FTransform WorldTransform = GetActorTransform();
	const FVector WorldLoc = WorldTransform.TransformPosition(Shot.RelativeLocation);
	const FRotator WorldRot = (WorldTransform.TransformRotation(Shot.RelativeRotation.Quaternion())).Rotator();

	ShotCamera->SetActorLocationAndRotation(WorldLoc, WorldRot);
	if (UCameraComponent* CamComp = ShotCamera->GetCameraComponent())
	{
		CamComp->SetFieldOfView(Shot.FOV);
	}

	CachedPC->SetViewTargetWithBlend(ShotCamera, Shot.BlendSeconds);

	GetWorldTimerManager().SetTimer(ShotTimer, this, &ACutsceneActor::AdvanceShot,
		Shot.HoldSeconds + Shot.BlendSeconds, false);
}

void ACutsceneActor::AdvanceShot()
{
	++CurrentShotIndex;
	if (Shots.IsValidIndex(CurrentShotIndex))
	{
		ApplyShot(CurrentShotIndex);
	}
	else
	{
		EndCutscene();
	}
}

void ACutsceneActor::Skip()
{
	if (!IsPlaying())
	{
		return;
	}
	GetWorldTimerManager().ClearTimer(ShotTimer);
	EndCutscene();
}

void ACutsceneActor::EndCutscene()
{
	GetWorldTimerManager().ClearTimer(ShotTimer);

	// IsValid() (bukan raw non-null): PC/Pawn bisa destroyed eksternal
	// mid-cutscene (disconnect, dll) — pointer masih non-null tapi pending-kill.
	if (IsValid(CachedPC))
	{
		if (IsValid(CachedPawn))
		{
			CachedPC->SetViewTargetWithBlend(CachedPawn, 0.5f);
		}

		if (AOpenWorldPlayerController* OWPC = Cast<AOpenWorldPlayerController>(CachedPC.Get()))
		{
			OWPC->SetInputContextMode(EInputContextMode::Default);
		}

		if (DialogueTable)
		{
			if (UDialogueManager* Dialogue = CachedPC->GetGameInstance()
					? CachedPC->GetGameInstance()->GetSubsystem<UDialogueManager>()
					: nullptr)
			{
				Dialogue->StartDialogue(DialogueTable, DialogueStartNode);
			}
			else
			{
				UE_LOG(LogAetherRealm, Warning, TEXT("CutsceneActor %s: DialogueManager not found, skipping end-dialogue"), *GetName());
			}
		}
	}

	if (IsValid(ShotCamera))
	{
		ShotCamera->Destroy();
	}
	ShotCamera = nullptr;

	CachedPC = nullptr;
	CachedPawn = nullptr;
	CurrentShotIndex = 0;

	OnCutsceneFinished.Broadcast();

	if (bDestroyAfterPlay)
	{
		Destroy();
	}
}

void ACutsceneActor::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
	if (IsPlaying())
	{
		EndCutscene(); // cegah ShotCamera nyangkut di world & input mode stuck di Dialog
	}
	Super::EndPlay(EndPlayReason);
}
