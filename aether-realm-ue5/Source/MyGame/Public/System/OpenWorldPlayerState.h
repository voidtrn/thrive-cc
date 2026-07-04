#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerState.h"
#include "OpenWorldPlayerState.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnActiveCharacterChanged, int32, NewIndex);

/**
 * State per-player yang direplikasi: komposisi party & karakter aktif.
 * Di co-op nanti tiap pemain bawa party sendiri — struktur ini sudah siap.
 */
UCLASS()
class MYGAME_API AOpenWorldPlayerState : public APlayerState
{
	GENERATED_BODY()

public:
	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

	/** ID karakter di DT_Characters (Data Table), max 4 slot. */
	UFUNCTION(BlueprintPure, Category = "Party")
	const TArray<FName>& GetPartyCharacterIds() const { return PartyCharacterIds; }

	UFUNCTION(BlueprintPure, Category = "Party")
	int32 GetActiveCharacterIndex() const { return ActiveCharacterIndex; }

	UFUNCTION(BlueprintPure, Category = "Party")
	FName GetActiveCharacterId() const;

	/** Server RPC — validasi swap ada di server (anti-cheat co-op). */
	UFUNCTION(Server, Reliable, BlueprintCallable, Category = "Party")
	void ServerSetActiveCharacter(int32 NewIndex);

	/** Server-only. Dipanggil GameMode/GameInstance saat load party. */
	void SetPartyCharacterIds(const TArray<FName>& NewParty);

	UPROPERTY(BlueprintAssignable, Category = "Party")
	FOnActiveCharacterChanged OnActiveCharacterChanged;

protected:
	UPROPERTY(Replicated, VisibleAnywhere, BlueprintReadOnly, Category = "Party")
	TArray<FName> PartyCharacterIds;

	UPROPERTY(ReplicatedUsing = OnRep_ActiveCharacterIndex, VisibleAnywhere, BlueprintReadOnly, Category = "Party")
	int32 ActiveCharacterIndex = 0;

	UFUNCTION()
	void OnRep_ActiveCharacterIndex();
};
