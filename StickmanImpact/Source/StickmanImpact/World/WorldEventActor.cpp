// Copyright StickmanImpact Project.

#include "WorldEventActor.h"
#include "WorldEventManager.h"
#include "TimerManager.h"

void AWorldEventActor::BeginPlay()
{
	Super::BeginPlay();

	GetWorldTimerManager().SetTimer(ExpiryTimerHandle, this, &AWorldEventActor::FailEvent, DurationSeconds, false);
	OnEventBegin();
}

void AWorldEventActor::CompleteEvent()
{
	Finish(true);
}

void AWorldEventActor::FailEvent()
{
	Finish(false);
}

void AWorldEventActor::Finish(bool bCompleted)
{
	if (bFinished)
	{
		return;
	}
	bFinished = true;

	if (UWorldEventManager* Manager = GetGameInstance()
			? GetGameInstance()->GetSubsystem<UWorldEventManager>() : nullptr)
	{
		Manager->NotifyEventEnded(bCompleted);
	}
	Destroy();
}
