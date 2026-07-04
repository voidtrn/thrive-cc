#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Chest.generated.h"

UENUM(BlueprintType)
enum class EChestTier : uint8
{
	Common,     // kayu, 2-5 primogems
	Exquisite,  // trim perak, 5-10
	Precious,   // trim emas, 10-20, chance artifact 4*
	Luxurious   // glow emas, 20-40, guaranteed 4*
};

UENUM(BlueprintType)
enum class EChestState : uint8
{
	Locked,
	Closed,
	Opening,
	Opened
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnChestOpened, class AChest*, Chest, int32, Primogems);

/**
 * Chest dengan tier & persistence. Tidak respawn (kecuali bEventChest).
 * Locked: butuh semua enemy radius tertentu mati (atau puzzle flag via BP).
 * ID unik = nama actor level (stabil untuk save).
 */
UCLASS()
class MYGAME_API AChest : public AActor
{
	GENERATED_BODY()

public:
	AChest();

	/** Interact (F). Return false kalau masih locked / sudah terbuka. */
	UFUNCTION(BlueprintCallable, Category = "Chest")
	bool TryOpen(APlayerController* Player);

	/** BP puzzle memanggil ini untuk buka kunci. */
	UFUNCTION(BlueprintCallable, Category = "Chest")
	void UnlockChest();

	UFUNCTION(BlueprintPure, Category = "Chest")
	EChestState GetState() const { return State; }

	UFUNCTION(BlueprintPure, Category = "Chest")
	FName GetChestId() const { return FName(*GetName()); }

	/** Play animasi buka di BP, lalu panggil FinishOpening. */
	UFUNCTION(BlueprintImplementableEvent, Category = "Chest")
	void OnOpeningStarted();

	UFUNCTION(BlueprintCallable, Category = "Chest")
	void FinishOpening();

	UPROPERTY(BlueprintAssignable, Category = "Chest")
	FOnChestOpened OnChestOpened;

protected:
	virtual void BeginPlay() override;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Chest")
	EChestTier Tier = EChestTier::Common;

	/** Locked = butuh kill enemy sekitar / puzzle. */
	UPROPERTY(EditAnywhere, Category = "Chest")
	bool bStartLocked = false;

	/** Radius cek enemy untuk auto-unlock (0 = manual/puzzle only). */
	UPROPERTY(EditAnywhere, Category = "Chest", meta = (EditCondition = "bStartLocked"))
	float EnemyCheckRadius = 800.f;

	/** Event chest boleh respawn — tidak disimpan ke save. */
	UPROPERTY(EditAnywhere, Category = "Chest")
	bool bEventChest = false;

	/** Loot tambahan per tier (item id → count), roll di BP/Phase 5 loot table. */
	UPROPERTY(EditAnywhere, Category = "Chest")
	TMap<FName, int32> BonusLoot;

private:
	EChestState State = EChestState::Closed;

	int32 RollPrimogems() const;
	bool AreNearbyEnemiesDead() const;
};
