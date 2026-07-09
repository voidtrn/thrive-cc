#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "System/ExpeditionTypes.h"
#include "ExpeditionSubsystem.generated.h"

class UOpenWorldGameInstance;
class UDataTable;

UENUM(BlueprintType)
enum class EExpeditionResult : uint8
{
	Success,
	InvalidData,          // table/row/char tidak valid
	ARTooLow,
	CharacterBusy,        // sudah di expedition lain
	ExpeditionRunning,    // tujuan ini sudah jalan
	SlotsFull,            // max concurrent tercapai
	NotComplete,          // klaim sebelum selesai
	NotFound              // klaim expedition yang tidak jalan
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnExpeditionsChanged, const TArray<FActiveExpedition>&, Active);

/**
 * Expedition — kirim karakter idle (di luar party aktif — validasi party di
 * UI/BP) untuk hadiah pasif berbasis waktu real (Genshin-like). Timestamp,
 * bukan timer: selesai dihitung saat klaim, jalan walau game ditutup.
 * State persist di GameInstance (ActiveExpeditions), subsystem pure logic
 * (pola UWishSystem/UResinSubsystem). UI pegang DT_Expeditions dan
 * mengopernya ke API (pola sama dengan FBannerData di WishSystem).
 */
UCLASS()
class MYGAME_API UExpeditionSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	static constexpr int32 MaxConcurrentExpeditions = 3;

	/** Kirim karakter. Validasi AR/slot/duplikat. */
	UFUNCTION(BlueprintCallable, Category = "Expedition")
	EExpeditionResult StartExpedition(const UDataTable* ExpeditionTable, FName ExpeditionId, FName CharacterId);

	/** Klaim hadiah kalau sudah selesai; hapus dari daftar aktif. */
	UFUNCTION(BlueprintCallable, Category = "Expedition")
	EExpeditionResult ClaimExpedition(const UDataTable* ExpeditionTable, FName ExpeditionId);

	/** Batalkan tanpa hadiah (karakter bebas lagi). */
	UFUNCTION(BlueprintCallable, Category = "Expedition")
	bool CancelExpedition(FName ExpeditionId);

	UFUNCTION(BlueprintPure, Category = "Expedition")
	TArray<FActiveExpedition> GetActiveExpeditions() const;

	/** Detik tersisa; 0 = selesai (siap klaim). -1 = tidak ditemukan. */
	UFUNCTION(BlueprintPure, Category = "Expedition")
	int32 SecondsRemaining(FName ExpeditionId) const;

	UPROPERTY(BlueprintAssignable, Category = "Expedition")
	FOnExpeditionsChanged OnExpeditionsChanged;

	/** Pure static (testable): expedition selesai pada waktu Now? */
	static bool IsCompleteAt(const FDateTime& StartTime, int32 DurationHours, const FDateTime& Now);

protected:
	UOpenWorldGameInstance* GetOWGameInstance() const;
	FActiveExpedition* FindActive(FName ExpeditionId) const;
};
