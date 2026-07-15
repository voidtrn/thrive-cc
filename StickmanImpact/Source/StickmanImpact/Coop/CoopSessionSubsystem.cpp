// Copyright StickmanImpact Project.

#include "CoopSessionSubsystem.h"
#include "Kismet/GameplayStatics.h"
#include "GameFramework/PlayerController.h"
#include "GameFramework/GameStateBase.h"

bool UCoopSessionSubsystem::HostSession()
{
	if (SessionState != ECoopSessionState::Solo || !GetWorld())
	{
		return false;
	}

	bAllowJoin = true;
	// Reopen the current level as a listen server. Seamless drop-in without this reload
	// requires the world to have been listen-hosted from the start — see the co-op doc.
	const FString LevelName = UGameplayStatics::GetCurrentLevelName(this, true);
	UGameplayStatics::OpenLevel(this, FName(*LevelName), true, TEXT("listen"));
	SetSessionState(ECoopSessionState::Hosting);
	return true;
}

bool UCoopSessionSubsystem::JoinSession(const FString& HostAddress)
{
	if (SessionState != ECoopSessionState::Solo || HostAddress.IsEmpty())
	{
		return false;
	}

	APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0);
	if (!PC)
	{
		return false;
	}

	PC->ClientTravel(HostAddress, TRAVEL_Absolute);
	SetSessionState(ECoopSessionState::Joined);
	return true;
}

void UCoopSessionSubsystem::LeaveSession()
{
	if (SessionState == ECoopSessionState::Solo)
	{
		return;
	}

	if (SessionState == ECoopSessionState::Joined && !SoloReturnLevel.IsNone())
	{
		UGameplayStatics::OpenLevel(this, SoloReturnLevel);
	}
	else if (SessionState == ECoopSessionState::Hosting)
	{
		bAllowJoin = false;
		const FString LevelName = UGameplayStatics::GetCurrentLevelName(this, true);
		UGameplayStatics::OpenLevel(this, FName(*LevelName)); // Drop the listen flag.
	}

	SetSessionState(ECoopSessionState::Solo);
}

int32 UCoopSessionSubsystem::GetPlayerCount() const
{
	const UWorld* World = GetWorld();
	const AGameStateBase* GameState = World ? World->GetGameState() : nullptr;
	return GameState ? FMath::Max(GameState->PlayerArray.Num(), 1) : 1;
}

float UCoopSessionSubsystem::GetEnemyHPScale() const
{
	return 1.f + HPScalePerExtraPlayer * (GetPlayerCount() - 1);
}

void UCoopSessionSubsystem::NotifyPlayerCountChanged()
{
	OnPlayerCountChanged.Broadcast(GetPlayerCount());
}

void UCoopSessionSubsystem::SetSessionState(ECoopSessionState NewState)
{
	if (SessionState != NewState)
	{
		SessionState = NewState;
		OnSessionStateChanged.Broadcast(NewState);
	}
}
