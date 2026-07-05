#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "System/CharacterRegistry.h"
#include "PartyManagerComponent.generated.h"

class ACharacterBase;
class UDataTable;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnPartySwapped, int32, NewIndex, ACharacterBase*, NewCharacter);

/**
 * Party swap Genshin-style — pasang di AOpenWorldPlayerController (BP).
 * Swap = spawn class karakter baru di transform pawn lama, possess,
 * destroy lama. HP/energy per karakter disimpan di GameInstance
 * (PartyCharacterData) supaya swap bolak-balik tidak reset state.
 * Bind IA_Swap1-4 → SwapToSlot(0-3).
 */
UCLASS(ClassGroup = (Party), meta = (BlueprintSpawnableComponent))
class MYGAME_API UPartyManagerComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	/** Spawn karakter aktif pertama (panggil dari GameMode/PC BeginPlay). */
	UFUNCTION(BlueprintCallable, Category = "Party")
	void InitializeParty();

	/** Swap ke slot 0-3. False: index invalid / karakter mati / cooldown / sama. */
	UFUNCTION(BlueprintCallable, Category = "Party")
	bool SwapToSlot(int32 Index);

	/** Definisi karakter di slot (HUD icons). */
	UFUNCTION(BlueprintPure, Category = "Party")
	bool GetSlotDef(int32 Index, FCharacterDefRow& OutDef) const;

	UFUNCTION(BlueprintPure, Category = "Party")
	int32 GetActiveSlot() const { return ActiveSlot; }

	UFUNCTION(BlueprintPure, Category = "Party")
	int32 GetPartySize() const;

	UPROPERTY(BlueprintAssignable, Category = "Party")
	FOnPartySwapped OnPartySwapped;

protected:
	/** DT_Characters (FCharacterDefRow). */
	UPROPERTY(EditDefaultsOnly, Category = "Party")
	TObjectPtr<UDataTable> CharacterTable;

	/** Cooldown antar swap (detik). */
	UPROPERTY(EditDefaultsOnly, Category = "Party")
	float SwapCooldown = 1.f;

private:
	int32 ActiveSlot = 0;
	double LastSwapTime = -999.0;

	APlayerController* GetPC() const;
	FName GetSlotCharacterId(int32 Index) const;
	void SaveCurrentCharacterState(ACharacterBase* Character);
	void RestoreCharacterState(ACharacterBase* Character, FName CharacterId);
	ACharacterBase* SpawnCharacterForSlot(int32 Index, const FTransform& Transform);
};
