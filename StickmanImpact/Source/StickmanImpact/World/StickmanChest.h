// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "StickmanInteractable.h"
#include "Quest/StickmanQuestTypes.h"
#include "StickmanChest.generated.h"

class UStaticMeshComponent;

UENUM(BlueprintType)
enum class EChestRarity : uint8
{
	Common,
	Rare,
	Luxurious
};

/** Opens on interact, grants Reward once, then stays open (never respawns its loot). */
UCLASS()
class STICKMANIMPACT_API AStickmanChest : public AActor, public IStickmanInteractable
{
	GENERATED_BODY()

public:
	AStickmanChest();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Chest")
	FString ChestID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Chest")
	EChestRarity Rarity = EChestRarity::Common;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Chest")
	FRewardData Reward;

	UFUNCTION(BlueprintPure, Category = "Chest")
	bool IsOpened() const { return bIsOpened; }

	virtual void Interact_Implementation(AActor* Instigator) override;
	virtual FText GetInteractionPrompt_Implementation() const override;

protected:
	virtual void BeginPlay() override;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Chest", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStaticMeshComponent> ChestMesh;

private:
	bool bIsOpened = false;
};
