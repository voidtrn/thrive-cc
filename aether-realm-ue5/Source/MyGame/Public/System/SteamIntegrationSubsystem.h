#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "SteamIntegrationSubsystem.generated.h"

/**
 * Steam features via Online Subsystem (works with any OSS, Steam configured
 * in DefaultEngine.ini):
 * - Achievements: unlock by ID (defined in Steamworks App Admin)
 * - Rich Presence: "Exploring Starfell Valley" etc shown to Steam friends
 * - Auth is automatic via OSS login; Cloud Save via steam_autocloud
 *   (no code needed — see PHASE8_RELEASE.md)
 */
UCLASS()
class MYGAME_API USteamIntegrationSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;

	/** Unlock achievement by API name (e.g. ACH_FIRST_WISH). Idempotent. */
	UFUNCTION(BlueprintCallable, Category = "Steam|Achievements")
	void UnlockAchievement(FName AchievementId);

	UFUNCTION(BlueprintPure, Category = "Steam|Achievements")
	bool IsAchievementUnlocked(FName AchievementId) const;

	/** Set rich presence string shown to friends. */
	UFUNCTION(BlueprintCallable, Category = "Steam|Presence")
	void SetRichPresence(const FString& StatusText);

	/** Steam display name of the local player (empty if OSS unavailable). */
	UFUNCTION(BlueprintPure, Category = "Steam")
	FString GetPlayerSteamName() const;

private:
	/** Cache of unlocked IDs this session (also guards double-writes). */
	TSet<FName> UnlockedCache;

	void QueryAchievements();
};
