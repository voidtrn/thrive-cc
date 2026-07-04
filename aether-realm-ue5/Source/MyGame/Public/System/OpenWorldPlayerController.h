#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "OpenWorldPlayerController.generated.h"

class UInputMappingContext;
class UInputConfig;

/** Mode input aktif. Menentukan IMC mana yang terpasang. */
UENUM(BlueprintType)
enum class EInputContextMode : uint8
{
	Default   UMETA(DisplayName = "Default (Explore + Combat)"),
	UI        UMETA(DisplayName = "UI (Menu, cursor visible)"),
	Gliding   UMETA(DisplayName = "Gliding"),
	Swimming  UMETA(DisplayName = "Swimming"),
	Dialog    UMETA(DisplayName = "Dialog")
};

/**
 * PlayerController dengan manajemen Input Mapping Context.
 *
 * Aturan:
 * - Default selalu jadi dasar untuk mode gameplay.
 * - Gliding/Swimming = OVERLAY di atas Default (priority lebih tinggi,
 *   override sebagian action, sisanya jatuh ke Default).
 * - UI/Dialog = REPLACE (Default dilepas, cursor muncul).
 */
UCLASS()
class MYGAME_API AOpenWorldPlayerController : public APlayerController
{
	GENERATED_BODY()

public:
	/** Ganti mode input. Idempotent — panggil berulang aman. */
	UFUNCTION(BlueprintCallable, Category = "Input")
	void SetInputContextMode(EInputContextMode NewMode);

	UFUNCTION(BlueprintPure, Category = "Input")
	EInputContextMode GetInputContextMode() const { return CurrentMode; }

	UFUNCTION(BlueprintPure, Category = "Input")
	UInputConfig* GetInputConfig() const { return InputConfig; }

protected:
	virtual void BeginPlay() override;

	/** Data asset pusat referensi semua Input Action (DA_InputConfig). */
	UPROPERTY(EditDefaultsOnly, Category = "Input")
	TObjectPtr<UInputConfig> InputConfig;

	UPROPERTY(EditDefaultsOnly, Category = "Input|Contexts")
	TObjectPtr<UInputMappingContext> IMC_Default;

	UPROPERTY(EditDefaultsOnly, Category = "Input|Contexts")
	TObjectPtr<UInputMappingContext> IMC_UI;

	UPROPERTY(EditDefaultsOnly, Category = "Input|Contexts")
	TObjectPtr<UInputMappingContext> IMC_Gliding;

	UPROPERTY(EditDefaultsOnly, Category = "Input|Contexts")
	TObjectPtr<UInputMappingContext> IMC_Swimming;

	UPROPERTY(EditDefaultsOnly, Category = "Input|Contexts")
	TObjectPtr<UInputMappingContext> IMC_Dialog;

private:
	EInputContextMode CurrentMode = EInputContextMode::Default;

	static constexpr int32 PRIORITY_DEFAULT = 0;
	static constexpr int32 PRIORITY_OVERLAY = 1;
	static constexpr int32 PRIORITY_MODAL = 2;

	void ApplyContextMode(EInputContextMode Mode);
	void SetUIMode(bool bUIMode);
};
