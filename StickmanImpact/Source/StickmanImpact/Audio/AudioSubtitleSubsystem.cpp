// Copyright StickmanImpact Project.

#include "AudioSubtitleSubsystem.h"
#include "UI/Menus/SettingsScreenWidget.h"
#include "Kismet/GameplayStatics.h"
#include "GameFramework/Pawn.h"

bool UAudioSubtitleSubsystem::ShouldBroadcast() const
{
	// Gated on the accessibility toggle so callers can fire unconditionally.
	return USettingsScreenWidget::AreAudioCuesForVisualInfoEnabled()
		|| USettingsScreenWidget::AreSubtitlesEnabled();
}

FString UAudioSubtitleSubsystem::DirectionSuffix(const FVector& SourceLocation) const
{
	const APawn* Player = UGameplayStatics::GetPlayerPawn(GetGameInstance(), 0);
	if (!Player)
	{
		return FString();
	}

	const FVector ToSource = (SourceLocation - Player->GetActorLocation()).GetSafeNormal2D();
	const float Forward = FVector::DotProduct(Player->GetActorForwardVector(), ToSource);
	const float Right = FVector::DotProduct(Player->GetActorRightVector(), ToSource);

	if (Forward < -0.5f) return TEXT(" behind you");
	if (Right > 0.5f)    return TEXT(" to your right");
	if (Right < -0.5f)   return TEXT(" to your left");
	return TEXT(" ahead");
}

void UAudioSubtitleSubsystem::BroadcastAt(const FText& BaseText, FVector SourceLocation, EAudioCueImportance Importance)
{
	if (!ShouldBroadcast())
	{
		return;
	}
	const FString Composed = FString::Printf(TEXT("[%s%s]"), *BaseText.ToString(), *DirectionSuffix(SourceLocation));
	OnAudioSubtitle.Broadcast(FText::FromString(Composed), Importance);
}

void UAudioSubtitleSubsystem::Broadcast(const FText& Text, EAudioCueImportance Importance)
{
	if (!ShouldBroadcast())
	{
		return;
	}
	OnAudioSubtitle.Broadcast(FText::FromString(FString::Printf(TEXT("[%s]"), *Text.ToString())), Importance);
}
