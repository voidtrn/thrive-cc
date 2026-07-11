// Copyright StickmanImpact Project.

#include "StickmanVoiceComponent.h"
#include "StickmanAudioManager.h"
#include "World/WeatherManager.h"
#include "GameFramework/Actor.h"
#include "Engine/World.h"
#include "TimerManager.h"

FString UStickmanVoiceComponent::CurrentVoiceLanguage = TEXT("en");

void UStickmanVoiceComponent::SetVoiceLanguage(const FString& LanguageCode)
{
	CurrentVoiceLanguage = LanguageCode;
}

FString UStickmanVoiceComponent::GetVoiceLanguage()
{
	return CurrentVoiceLanguage;
}

void UStickmanVoiceComponent::BeginPlay()
{
	Super::BeginPlay();

	if (bEnableIdleChatter)
	{
		ScheduleNextIdleChatter();
	}

	if (UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr)
	{
		if (UWeatherManager* Weather = GameInstance->GetSubsystem<UWeatherManager>())
		{
			Weather->OnWeatherChanged.AddDynamic(this, &UStickmanVoiceComponent::HandleWeatherChanged);
		}
	}
}

void UStickmanVoiceComponent::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
	if (UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr)
	{
		if (UWeatherManager* Weather = GameInstance->GetSubsystem<UWeatherManager>())
		{
			Weather->OnWeatherChanged.RemoveDynamic(this, &UStickmanVoiceComponent::HandleWeatherChanged);
		}
	}
	if (GetWorld())
	{
		GetWorld()->GetTimerManager().ClearTimer(IdleChatterTimerHandle);
	}
	Super::EndPlay(EndPlayReason);
}

void UStickmanVoiceComponent::PlayVoiceLine(EVoiceLineCategory Category)
{
	const FVoiceLineSet* VoiceSet = VoiceSetsByLanguage.Find(CurrentVoiceLanguage);
	if (!VoiceSet)
	{
		VoiceSet = VoiceSetsByLanguage.Find(DefaultLanguage);
	}
	if (!VoiceSet)
	{
		return;
	}

	const TObjectPtr<USoundBase>* Line = VoiceSet->Lines.Find(Category);
	if (!Line || !*Line)
	{
		return;
	}

	const AActor* Owner = GetOwner();
	UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr;
	if (UStickmanAudioManager* AudioManager = GameInstance ? GameInstance->GetSubsystem<UStickmanAudioManager>() : nullptr)
	{
		AudioManager->PlaySFX(*Line, Owner ? Owner->GetActorLocation() : FVector::ZeroVector);
	}
}

void UStickmanVoiceComponent::HandleWeatherChanged(EStickmanWeatherType NewWeather)
{
	PlayVoiceLine(EVoiceLineCategory::WeatherComment);
}

void UStickmanVoiceComponent::ScheduleNextIdleChatter()
{
	if (!GetWorld())
	{
		return;
	}
	const float Delay = FMath::FRandRange(IdleChatterIntervalRange.X, IdleChatterIntervalRange.Y);
	GetWorld()->GetTimerManager().SetTimer(IdleChatterTimerHandle, this,
		&UStickmanVoiceComponent::PlayIdleChatter, Delay, false);
}

void UStickmanVoiceComponent::PlayIdleChatter()
{
	PlayVoiceLine(EVoiceLineCategory::IdleChatter);
	ScheduleNextIdleChatter();
}
