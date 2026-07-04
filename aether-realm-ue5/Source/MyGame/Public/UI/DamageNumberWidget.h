#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "Combat/CombatTypes.h"
#include "DamageNumberWidget.generated.h"

/**
 * Base C++ floating damage number. Widget BP (WBP_DamageNumber) parent ke
 * class ini: layout TextBlock + animasi fade-up/scale-pop, lalu implement
 * OnDamageInfoSet untuk apply warna/font & play animasi.
 */
UCLASS(Abstract)
class MYGAME_API UDamageNumberWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	/** Dipanggil CombatComponent setelah spawn. */
	void SetDamageInfo(const FDamageResult& Result);

	UFUNCTION(BlueprintCallable, Category = "DamageNumber")
	void SetHealInfo(float Amount);

protected:
	/** Angka final tanpa desimal (FText::AsNumber). */
	UPROPERTY(BlueprintReadOnly, Category = "DamageNumber")
	FText DisplayText;

	UPROPERTY(BlueprintReadOnly, Category = "DamageNumber")
	FLinearColor DisplayColor = FLinearColor::White;

	/** 1.0 normal; crit & reaction lebih besar. */
	UPROPERTY(BlueprintReadOnly, Category = "DamageNumber")
	float FontScale = 1.f;

	UPROPERTY(BlueprintReadOnly, Category = "DamageNumber")
	bool bCrit = false;

	UPROPERTY(BlueprintReadOnly, Category = "DamageNumber")
	EReactionType Reaction = EReactionType::None;

	/** Implement di WBP: set text/color/scale ke TextBlock + play anim pop. */
	UFUNCTION(BlueprintImplementableEvent, Category = "DamageNumber")
	void OnDamageInfoSet();

	/** Warna per elemen. */
	UFUNCTION(BlueprintPure, Category = "DamageNumber")
	static FLinearColor GetElementColor(EElement Element);

	/** Warna spesial reaction (Melt/Vape merah besar, dst). */
	static FLinearColor GetReactionColor(EReactionType Reaction);
};
