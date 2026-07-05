#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ConsumableComponent.generated.h"

class ACharacterBase;
class UDataTable;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnItemCooked, FName, ItemId, bool, bSuccess);

/**
 * Pakai food/potion & masak (cooking). Pasang di player character.
 * UseConsumable: cek inventory GameInstance → efek ke owner (heal/buff/
 * revive) → kurangi 1 dari inventory.
 * CookItem: cek bahan Recipe → kurangi bahan → tambah hasil ke inventory.
 */
UCLASS(ClassGroup = (Gameplay), meta = (BlueprintSpawnableComponent))
class MYGAME_API UConsumableComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	/** Pakai 1 item. False kalau tidak punya / efek gagal. */
	UFUNCTION(BlueprintCallable, Category = "Consumable")
	bool UseConsumable(FName ItemId);

	/** Masak resep. False kalau bahan kurang. */
	UFUNCTION(BlueprintCallable, Category = "Consumable")
	bool CookItem(FName ItemId);

	UFUNCTION(BlueprintPure, Category = "Consumable")
	bool CanCook(FName ItemId) const;

	UPROPERTY(BlueprintAssignable, Category = "Consumable")
	FOnItemCooked OnItemCooked;

protected:
	virtual void BeginPlay() override;

	UPROPERTY(EditDefaultsOnly, Category = "Consumable")
	TObjectPtr<UDataTable> ConsumableTable;

private:
	UPROPERTY()
	TObjectPtr<ACharacterBase> OwnerChar;

	class UOpenWorldGameInstance* GetGI() const;
};
