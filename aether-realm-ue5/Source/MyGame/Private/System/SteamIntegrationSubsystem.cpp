#include "System/SteamIntegrationSubsystem.h"
#include "OnlineSubsystem.h"
#include "Interfaces/OnlineIdentityInterface.h"
#include "Interfaces/OnlineAchievementsInterface.h"
#include "Interfaces/OnlinePresenceInterface.h"
#include "MyGame.h"

void USteamIntegrationSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);
	QueryAchievements();
}

void USteamIntegrationSubsystem::QueryAchievements()
{
	IOnlineSubsystem* OSS = IOnlineSubsystem::Get();
	if (!OSS)
	{
		return;
	}

	const IOnlineIdentityPtr Identity = OSS->GetIdentityInterface();
	const IOnlineAchievementsPtr Achievements = OSS->GetAchievementsInterface();
	if (!Identity.IsValid() || !Achievements.IsValid())
	{
		return;
	}

	const FUniqueNetIdPtr UserId = Identity->GetUniquePlayerId(0);
	if (!UserId.IsValid())
	{
		return;
	}

	// Cache achievement state so IsAchievementUnlocked works offline-ish
	Achievements->QueryAchievements(*UserId,
		FOnQueryAchievementsCompleteDelegate::CreateLambda(
			[this](const FUniqueNetId&, const bool bSuccess)
			{
				UE_LOG(LogAetherRealm, Log, TEXT("Achievement query: %s"),
					bSuccess ? TEXT("OK") : TEXT("FAILED"));
			}));
}

void USteamIntegrationSubsystem::UnlockAchievement(FName AchievementId)
{
	if (UnlockedCache.Contains(AchievementId))
	{
		return; // already written this session
	}

	IOnlineSubsystem* OSS = IOnlineSubsystem::Get();
	if (!OSS)
	{
		UE_LOG(LogAetherRealm, Warning, TEXT("No online subsystem — achievement '%s' skipped"),
			*AchievementId.ToString());
		return;
	}

	const IOnlineIdentityPtr Identity = OSS->GetIdentityInterface();
	const IOnlineAchievementsPtr Achievements = OSS->GetAchievementsInterface();
	const FUniqueNetIdPtr UserId = Identity.IsValid() ? Identity->GetUniquePlayerId(0) : nullptr;
	if (!Achievements.IsValid() || !UserId.IsValid())
	{
		return;
	}

	FOnlineAchievementsWritePtr WriteObject = MakeShared<FOnlineAchievementsWrite, ESPMode::ThreadSafe>();
	WriteObject->SetFloatStat(AchievementId.ToString(), 100.0f);

	FOnlineAchievementsWriteRef WriteRef = WriteObject.ToSharedRef();
	Achievements->WriteAchievements(*UserId, WriteRef,
		FOnAchievementsWrittenDelegate::CreateLambda(
			[this, AchievementId](const FUniqueNetId&, const bool bSuccess)
			{
				if (bSuccess)
				{
					UnlockedCache.Add(AchievementId);
					UE_LOG(LogAetherRealm, Log, TEXT("Achievement unlocked: %s"),
						*AchievementId.ToString());
				}
			}));
}

bool USteamIntegrationSubsystem::IsAchievementUnlocked(FName AchievementId) const
{
	return UnlockedCache.Contains(AchievementId);
}

void USteamIntegrationSubsystem::SetRichPresence(const FString& StatusText)
{
	IOnlineSubsystem* OSS = IOnlineSubsystem::Get();
	if (!OSS)
	{
		return;
	}

	const IOnlineIdentityPtr Identity = OSS->GetIdentityInterface();
	const IOnlinePresencePtr Presence = OSS->GetPresenceInterface();
	const FUniqueNetIdPtr UserId = Identity.IsValid() ? Identity->GetUniquePlayerId(0) : nullptr;
	if (!Presence.IsValid() || !UserId.IsValid())
	{
		return;
	}

	FOnlineUserPresenceStatus Status;
	Status.StatusStr = StatusText;
	Status.State = EOnlinePresenceState::Online;
	Presence->SetPresence(*UserId, Status);
}

FString USteamIntegrationSubsystem::GetPlayerSteamName() const
{
	IOnlineSubsystem* OSS = IOnlineSubsystem::Get();
	const IOnlineIdentityPtr Identity = OSS ? OSS->GetIdentityInterface() : nullptr;
	return Identity.IsValid() ? Identity->GetPlayerNickname(0) : FString();
}
