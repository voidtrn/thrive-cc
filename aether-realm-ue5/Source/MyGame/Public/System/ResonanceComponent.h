#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "Combat/CombatTypes.h"
#include "UI/InventoryTypes.h"
#include "ResonanceComponent.generated.h"

class ACharacterBase;
class UDataTable;
class UOpenWorldGameInstance;
class UPartyManagerComponent;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnResonanceChanged, const TArray<EElementalResonance>&, Active);

/**
 * Elemental Resonance party-wide (spec 5). Hitung komposisi elemen party →
 * aktifkan resonance → terapkan ke karakter aktif.
 *
 * Pasang di PlayerController. Auto-refresh saat party swap (bind
 * PartyManager->OnPartySwapped). Efek stat lewat progression
 * (ATK%/HP%/EM) + field CharacterBase (stamina cost, RES). Efek kondisional
 * (crit vs frozen, energy dari reaction, shield) di-expose sebagai query.
 *
 *   2 Pyro     Fervent Flames     +25% ATK
 *   2 Hydro    Soothing Water     +25% Max HP
 *   2 Cryo     Shattering Ice     +15% crit vs frozen (query)
 *   2 Electro  High Voltage       energy dari reaction (query)
 *   2 Anemo    Impetuous Winds    -15% stamina cost
 *   2 Geo      Enduring Rock      +15% shield strength (query)
 *   2 Dendro   Sprawling Greenery +50 EM
 *   4 beda     Protective Canopy  +15% semua RES
 */
UCLASS(ClassGroup = (Progression), meta = (BlueprintSpawnableComponent))
class MYGAME_API UResonanceComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	/** Hitung ulang resonance dari party & terapkan ke karakter aktif. */
	UFUNCTION(BlueprintCallable, Category = "Resonance")
	void RefreshResonances();

	/** Bind ke PartyManager supaya swap otomatis re-apply. Panggil sekali. */
	UFUNCTION(BlueprintCallable, Category = "Resonance")
	void BindToPartyManager(UPartyManagerComponent* PartyManager);

	UFUNCTION(BlueprintPure, Category = "Resonance")
	const TArray<EElementalResonance>& GetActiveResonances() const { return ActiveResonances; }

	UFUNCTION(BlueprintPure, Category = "Resonance")
	bool HasResonance(EElementalResonance Resonance) const { return ActiveResonances.Contains(Resonance); }

	// --- Query efek kondisional (dibaca sistem lain / BP) ---
	/** Shattering Ice: +15% crit rate melawan musuh frozen. */
	UFUNCTION(BlueprintPure, Category = "Resonance")
	float GetCritRateVsFrozenBonus() const { return HasResonance(EElementalResonance::ShatteringIce) ? 0.15f : 0.f; }

	/** Enduring Rock: +15% shield strength (dibaca shield system). */
	UFUNCTION(BlueprintPure, Category = "Resonance")
	float GetShieldStrengthBonus() const { return HasResonance(EElementalResonance::EnduringRock) ? 0.15f : 0.f; }

	/** High Voltage: reaction Electro men-generate energy tambahan. */
	UFUNCTION(BlueprintPure, Category = "Resonance")
	bool IsHighVoltageActive() const { return HasResonance(EElementalResonance::HighVoltage); }

	UPROPERTY(BlueprintAssignable, Category = "Resonance")
	FOnResonanceChanged OnResonanceChanged;

protected:
	/** DT_Characters (FCharacterDefRow). Sumber elemen per karakter. */
	UPROPERTY(EditDefaultsOnly, Category = "Resonance|Data")
	TObjectPtr<UDataTable> CharacterTable;

	/** Party swap → re-apply ke karakter baru. */
	UFUNCTION()
	void HandlePartySwapped(int32 NewIndex, ACharacterBase* NewCharacter);

private:
	UPROPERTY()
	TArray<EElementalResonance> ActiveResonances;

	UOpenWorldGameInstance* GetGI() const;
	EElement GetElementForCharacter(FName CharacterId) const;

	/** Hitung resonance aktif dari komposisi elemen party (tanpa apply). */
	void ComputeActiveResonances();

	/** Terapkan efek stat resonance ke satu karakter (biasanya yang aktif). */
	void ApplyToCharacter(ACharacterBase* Character);
};
