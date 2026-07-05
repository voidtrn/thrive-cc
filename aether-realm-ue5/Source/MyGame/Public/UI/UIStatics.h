#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "UI/InventoryTypes.h"
#include "Combat/CombatTypes.h"
#include "System/OpenWorldSaveGame.h"
#include "UIStatics.generated.h"

/** Helper UI: warna rarity, resonance calc, apply settings. */
UCLASS()
class MYGAME_API UUIStatics : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

public:
	/** Border color per rarity: 3* biru, 4* ungu, 5* emas. */
	UFUNCTION(BlueprintPure, Category = "UI")
	static FLinearColor GetRarityColor(EItemRarity Rarity);

	/** Resonance dari komposisi elemen party (4 slot). */
	UFUNCTION(BlueprintPure, Category = "UI|Party")
	static TArray<EElementalResonance> GetPartyResonances(const TArray<EElement>& PartyElements);

	/** Apply graphics settings (resolution scale, quality preset, fps cap, vsync). */
	UFUNCTION(BlueprintCallable, Category = "UI|Settings")
	static void ApplyGraphicsSettings(const FGameSettings& Settings);
};
