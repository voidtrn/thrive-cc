// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "CoopSessionSubsystem.generated.h"

UENUM(BlueprintType)
enum class ECoopSessionState : uint8
{
	Solo,       // Default single-player.
	Hosting,    // Listen server, joinable.
	Joined      // Connected to someone else's world.
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnCoopSessionStateChanged, ECoopSessionState, NewState);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnCoopPlayerCountChanged, int32, PlayerCount);

/**
 * Co-op session foundations (max 2 players, host/guest). Direct-IP listen-server model:
 * HostSession() reopens the current level with ?listen (host must enable joining —
 * bAllowJoin), JoinSession(IP) client-travels into the host's world. The host's world
 * state is authoritative by construction — the guest brings their party/progression
 * (character EXP, bonds, items live in the guest's own GameInstance subsystems and
 * persist home with them).
 *
 * World scaling: GetEnemyHPScale() = 1 + 0.5 per player beyond the first —
 * AEnemySpawner multiplies it into spawned enemy MaxHealth.
 *
 * SCOPE (read Docs/COOP_REPLICATION.md before building on this): this subsystem, the
 * revive component, and the ping component are the pieces that are correct in both solo
 * and networked play. The rest of the codebase is single-player C++ — subsystem-held
 * combat state does not replicate, and the damage funnel runs client-side. The doc lists
 * the concrete refactor (server-authoritative funnel, GAS replication mode, RPC audit)
 * required before real 2-player sessions are playable. No online-subsystem matchmaking —
 * direct IP / LAN only.
 */
UCLASS()
class STICKMANIMPACT_API UCoopSessionSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "Coop")
	bool HostSession();

	UFUNCTION(BlueprintCallable, Category = "Coop")
	bool JoinSession(const FString& HostAddress);

	// Return to solo: guests travel home to the main level, hosts drop the listen flag.
	UFUNCTION(BlueprintCallable, Category = "Coop")
	void LeaveSession();

	UFUNCTION(BlueprintPure, Category = "Coop")
	ECoopSessionState GetSessionState() const { return SessionState; }

	UFUNCTION(BlueprintPure, Category = "Coop")
	int32 GetPlayerCount() const;

	// 1.0 solo, 1.5 with a guest (+50% per extra player).
	UFUNCTION(BlueprintPure, Category = "Coop")
	float GetEnemyHPScale() const;

	// Host-side gate: guests can only join while true.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Coop")
	bool bAllowJoin = false;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Coop")
	int32 MaxPlayers = 2;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Coop")
	float HPScalePerExtraPlayer = 0.5f;

	// Level to return guests to on LeaveSession.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Coop")
	FName SoloReturnLevel = NAME_None;

	UPROPERTY(BlueprintAssignable, Category = "Coop")
	FOnCoopSessionStateChanged OnSessionStateChanged;

	UPROPERTY(BlueprintAssignable, Category = "Coop")
	FOnCoopPlayerCountChanged OnPlayerCountChanged;

	// Called by the GameMode on PostLogin/Logout so UI + spawners react to drops/joins.
	void NotifyPlayerCountChanged();

private:
	void SetSessionState(ECoopSessionState NewState);

	ECoopSessionState SessionState = ECoopSessionState::Solo;
};
