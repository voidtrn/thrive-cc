// Copyright StickmanImpact Project.

#include "GhostEchoActor.h"
#include "Components/SphereComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "Character/StickmanCharacter.h"
#include "Dialogue/DialogueManager.h"
#include "Kismet/GameplayStatics.h"
#include "TimerManager.h"

AGhostEchoActor::AGhostEchoActor()
{
	PrimaryActorTick.bCanEverTick = false;

	TriggerSphere = CreateDefaultSubobject<USphereComponent>(TEXT("TriggerSphere"));
	RootComponent = TriggerSphere;
	TriggerSphere->SetSphereRadius(400.f);
	TriggerSphere->SetCollisionResponseToAllChannels(ECR_Ignore);
	TriggerSphere->SetCollisionResponseToChannel(ECC_Pawn, ECR_Overlap);
}

void AGhostEchoActor::BeginPlay()
{
	Super::BeginPlay();

	if (const UDialogueManager* Dialogue = GetGameInstance()->GetSubsystem<UDialogueManager>())
	{
		if (CompletedFlag.IsValid() && Dialogue->HasStoryFlag(CompletedFlag))
		{
			SetActorEnableCollision(false);
			return;
		}
	}

	TriggerSphere->OnComponentBeginOverlap.AddDynamic(this, &AGhostEchoActor::HandleOverlap);
}

void AGhostEchoActor::HandleOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor,
	UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	if (bPlaying || !Cast<AStickmanCharacter>(OtherActor))
	{
		return;
	}

	if (RequiredStoryFlag.IsValid())
	{
		const UDialogueManager* Dialogue = GetGameInstance()->GetSubsystem<UDialogueManager>();
		if (!Dialogue || !Dialogue->HasStoryFlag(RequiredStoryFlag))
		{
			return;
		}
	}

	StartEcho();
}

void AGhostEchoActor::StartEcho()
{
	bPlaying = true;

	for (const FGhostFigureSpawn& Figure : GhostFigures)
	{
		USkeletalMeshComponent* Mesh = NewObject<USkeletalMeshComponent>(this);
		Mesh->SetupAttachment(RootComponent);
		Mesh->SetRelativeTransform(Figure.RelativeTransform);
		Mesh->SetSkeletalMesh(Figure.Mesh);
		Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		if (GhostMaterial)
		{
			for (int32 Slot = 0; Slot < Mesh->GetNumMaterials(); ++Slot)
			{
				Mesh->SetMaterial(Slot, GhostMaterial);
			}
		}
		Mesh->RegisterComponent();
		SpawnedFigures.Add(Mesh);
	}

	if (EchoAmbience)
	{
		UGameplayStatics::PlaySoundAtLocation(this, EchoAmbience, GetActorLocation());
	}

	float LastBeatTime = 0.f;
	BeatTimerHandles.SetNum(Beats.Num());
	for (int32 Index = 0; Index < Beats.Num(); ++Index)
	{
		LastBeatTime = FMath::Max(LastBeatTime, Beats[Index].Time);
		if (Beats[Index].Time <= 0.f)
		{
			PlayBeat(Index);
			continue;
		}
		FTimerDelegate Delegate = FTimerDelegate::CreateUObject(this, &AGhostEchoActor::PlayBeat, Index);
		GetWorldTimerManager().SetTimer(BeatTimerHandles[Index], Delegate, Beats[Index].Time, false);
	}

	GetWorldTimerManager().SetTimer(FinishTimerHandle, this, &AGhostEchoActor::FinishEcho, LastBeatTime + EndPadding, false);
	OnEchoStarted();
}

void AGhostEchoActor::PlayBeat(int32 BeatIndex)
{
	if (!Beats.IsValidIndex(BeatIndex))
	{
		return;
	}
	const FGhostEchoBeat& Beat = Beats[BeatIndex];

	if (Beat.Animation && SpawnedFigures.IsValidIndex(Beat.FigureIndex))
	{
		SpawnedFigures[Beat.FigureIndex]->PlayAnimation(Beat.Animation, false);
	}

	if (!Beat.Line.IsEmpty())
	{
		OnEchoBeat.Broadcast(Beat.SpeakerName, Beat.Line);
	}
}

void AGhostEchoActor::FinishEcho()
{
	for (USkeletalMeshComponent* Figure : SpawnedFigures)
	{
		if (Figure)
		{
			Figure->DestroyComponent();
		}
	}
	SpawnedFigures.Empty();

	if (CompletedFlag.IsValid())
	{
		if (UDialogueManager* Dialogue = GetGameInstance()->GetSubsystem<UDialogueManager>())
		{
			Dialogue->SetStoryFlag(CompletedFlag);
		}
	}

	SetActorEnableCollision(false);
	OnEchoFinished.Broadcast();
}
