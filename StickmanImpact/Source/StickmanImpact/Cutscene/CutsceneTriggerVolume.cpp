// Copyright StickmanImpact Project.

#include "CutsceneTriggerVolume.h"
#include "CutsceneManager.h"
#include "Dialogue/DialogueManager.h"
#include "Components/BoxComponent.h"
#include "GameFramework/Character.h"

ACutsceneTriggerVolume::ACutsceneTriggerVolume()
{
	PrimaryActorTick.bCanEverTick = false;

	TriggerBox = CreateDefaultSubobject<UBoxComponent>(TEXT("TriggerBox"));
	RootComponent = TriggerBox;
	TriggerBox->SetBoxExtent(FVector(200.f, 200.f, 200.f));
	TriggerBox->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	TriggerBox->SetCollisionResponseToAllChannels(ECR_Overlap);
}

void ACutsceneTriggerVolume::BeginPlay()
{
	Super::BeginPlay();
	TriggerBox->OnComponentBeginOverlap.AddDynamic(this, &ACutsceneTriggerVolume::OnTriggerBeginOverlap);
}

bool ACutsceneTriggerVolume::AreConditionsMet(AActor* OtherActor) const
{
	if (!Cast<ACharacter>(OtherActor))
	{
		return false;
	}

	if (bOneShot)
	{
		if (const UGameInstance* GameInstance = GetGameInstance())
		{
			if (const UCutsceneManager* CutsceneManager = GameInstance->GetSubsystem<UCutsceneManager>())
			{
				if (!CutsceneID.IsEmpty() && CutsceneManager->HasWatchedCutscene(CutsceneID))
				{
					return false;
				}
			}
		}
	}

	if (RequiredStoryFlags.Num() > 0)
	{
		const UGameInstance* GameInstance = GetGameInstance();
		const UDialogueManager* DialogueManager = GameInstance ? GameInstance->GetSubsystem<UDialogueManager>() : nullptr;
		if (!DialogueManager)
		{
			return false;
		}
		for (const FGameplayTag& Flag : RequiredStoryFlags)
		{
			if (!DialogueManager->HasStoryFlag(Flag))
			{
				return false;
			}
		}
	}

	// RequiredPartyMembers: no party roster subsystem exists yet, so this is always satisfied.
	return true;
}

void ACutsceneTriggerVolume::OnTriggerBeginOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor,
	UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	if (!CutsceneToPlay || !AreConditionsMet(OtherActor))
	{
		return;
	}

	UGameInstance* GameInstance = GetGameInstance();
	UCutsceneManager* CutsceneManager = GameInstance ? GameInstance->GetSubsystem<UCutsceneManager>() : nullptr;
	if (!CutsceneManager)
	{
		return;
	}

	CutsceneManager->PlayCutscene(CutsceneToPlay, bSkippable);
	if (bOneShot && !CutsceneID.IsEmpty())
	{
		CutsceneManager->MarkCutsceneWatched(CutsceneID);
	}
}
