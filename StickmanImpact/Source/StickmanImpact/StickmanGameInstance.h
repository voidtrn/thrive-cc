// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Engine/GameInstance.h"
#include "StickmanGameInstance.generated.h"

/**
 * Persists across level loads. Holds cross-level global state (current save slot name,
 * player progression cache, options) that individual levels/GameModes shouldn't own.
 */
UCLASS()
class STICKMANIMPACT_API UStickmanGameInstance : public UGameInstance
{
	GENERATED_BODY()

public:
	virtual void Init() override;
	virtual void Shutdown() override;

	UFUNCTION(BlueprintCallable, Category = "SaveSystem")
	FString GetActiveSaveSlotName() const { return ActiveSaveSlotName; }

	UFUNCTION(BlueprintCallable, Category = "SaveSystem")
	void SetActiveSaveSlotName(const FString& SlotName) { ActiveSaveSlotName = SlotName; }

protected:
	// Name of the SaveGame slot currently in use; empty until the player picks/creates one.
	UPROPERTY(BlueprintReadOnly, Category = "SaveSystem")
	FString ActiveSaveSlotName;
};
