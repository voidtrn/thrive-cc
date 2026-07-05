#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "System/CharacterRegistry.h"
#include "MainHUDWidget.generated.h"

class ACharacterBase;
class UPartyManagerComponent;
class UQuestManager;

/** Data satu slot party untuk HUD bar. */
USTRUCT(BlueprintType)
struct FPartyMemberHUD
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly) FText Name;
	UPROPERTY(BlueprintReadOnly) TSoftObjectPtr<UTexture2D> Icon;
	UPROPERTY(BlueprintReadOnly) float HPFraction = 1.f;
	UPROPERTY(BlueprintReadOnly) bool bActive = false;
	UPROPERTY(BlueprintReadOnly) bool bAlive = true;
};

/**
 * Base C++ HUD utama — WBP_MainHUD parent ke class ini.
 * Semua data (party bars, skill cooldown, burst energy, stamina, quest
 * tracker) via BlueprintPure — bind langsung di UMG.
 */
UCLASS(Abstract)
class MYGAME_API UMainHUDWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	/** Info slot party 0-3 (HP bar kiri atas). */
	UFUNCTION(BlueprintPure, Category = "HUD|Party")
	FPartyMemberHUD GetPartyMemberHUD(int32 SlotIndex) const;

	UFUNCTION(BlueprintPure, Category = "HUD|Party")
	int32 GetPartySize() const;

	// --- Active character (kanan bawah) ---
	UFUNCTION(BlueprintPure, Category = "HUD|Skill")
	float GetSkillCooldownFraction() const;   // 0 = ready, 1 = full cooldown

	UFUNCTION(BlueprintPure, Category = "HUD|Skill")
	float GetBurstEnergyFraction() const;     // 0-1 energy

	UFUNCTION(BlueprintPure, Category = "HUD|Skill")
	bool IsBurstReady() const;

	UFUNCTION(BlueprintPure, Category = "HUD")
	float GetStaminaFraction() const;

	UFUNCTION(BlueprintPure, Category = "HUD")
	bool ShouldShowStaminaBar() const;        // hanya saat terpakai

	// --- Quest tracker (kiri bawah) ---
	UFUNCTION(BlueprintPure, Category = "HUD|Quest")
	FText GetTrackedQuestName() const;

	UFUNCTION(BlueprintPure, Category = "HUD|Quest")
	FText GetTrackedQuestObjective() const;   // "0/3 Hilichurls"

protected:
	ACharacterBase* GetActiveCharacter() const;
	UPartyManagerComponent* GetPartyManager() const;
	UQuestManager* GetQuestManager() const;
};
