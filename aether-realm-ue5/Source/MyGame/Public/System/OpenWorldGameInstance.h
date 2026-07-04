#pragma once

#include "CoreMinimal.h"
#include "Engine/GameInstance.h"
#include "OpenWorldGameInstance.generated.h"

/**
 * Data persistent antar level & antar session (via SaveGame).
 * Hidup sepanjang proses game — dipakai saat pindah open world <-> dungeon
 * (Level Instance) tanpa kehilangan state party/progress.
 */
UCLASS()
class MYGAME_API UOpenWorldGameInstance : public UGameInstance
{
	GENERATED_BODY()

public:
	virtual void Init() override;

	// --- Party persistent (dibaca PlayerState saat spawn) ---
	UPROPERTY(BlueprintReadWrite, Category = "Persistent|Party")
	TArray<FName> SavedPartyCharacterIds;

	UPROPERTY(BlueprintReadWrite, Category = "Persistent|Party")
	int32 SavedActiveCharacterIndex = 0;

	// --- Progress dunia ---
	/** Waypoint teleport yang sudah terbuka. */
	UPROPERTY(BlueprintReadWrite, Category = "Persistent|World")
	TSet<FName> UnlockedWaypoints;

	/** Collectible yang sudah diambil (ID unik per actor). */
	UPROPERTY(BlueprintReadWrite, Category = "Persistent|World")
	TSet<FName> CollectedItemIds;

	/** Posisi terakhir di open world — dipakai saat balik dari dungeon. */
	UPROPERTY(BlueprintReadWrite, Category = "Persistent|World")
	FTransform LastOpenWorldTransform = FTransform::Identity;

	// --- Save / Load ---
	UFUNCTION(BlueprintCallable, Category = "Persistent|Save")
	bool SaveToSlot(const FString& SlotName = TEXT("Slot0"));

	UFUNCTION(BlueprintCallable, Category = "Persistent|Save")
	bool LoadFromSlot(const FString& SlotName = TEXT("Slot0"));

protected:
	/** Default party untuk new game. Isi ID sesuai DT_Characters. */
	UPROPERTY(EditDefaultsOnly, Category = "Persistent|Party")
	TArray<FName> DefaultParty = { TEXT("Hero_Sword"), TEXT("Mage_Fire") };
};
