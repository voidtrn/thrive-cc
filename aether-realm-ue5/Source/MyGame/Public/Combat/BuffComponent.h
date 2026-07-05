#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "UI/InventoryTypes.h"
#include "BuffComponent.generated.h"

class ACharacterBase;

/** Satu buff aktif — delta stat sementara + sisa waktu. */
USTRUCT(BlueprintType)
struct FActiveBuff
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly) FName BuffId;

	/** Stat yang dipengaruhi & besarnya delta (flat, sudah dihitung). */
	UPROPERTY(BlueprintReadOnly) EArtifactStat Stat = EArtifactStat::ATK;

	UPROPERTY(BlueprintReadOnly) float Delta = 0.f;

	UPROPERTY(BlueprintReadOnly) float TimeRemaining = 0.f;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnBuffsChanged, const TArray<FActiveBuff>&, ActiveBuffs);

/**
 * Buff sementara (food/potion). Apply = tambah delta ke CharacterBase +
 * timer; expire = kurangi delta lagi. Delta persis dicatat supaya revert
 * akurat (bukan recompute).
 * ATK/DEF/EM/Crit/ER didukung; heal instan pakai ApplyHeal (bukan buff).
 */
UCLASS(ClassGroup = (Combat), meta = (BlueprintSpawnableComponent))
class MYGAME_API UBuffComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UBuffComponent();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType,
		FActorComponentTickFunction* ThisTickFunction) override;

	/** Tambah buff. BuffId sama = refresh durasi (tidak menumpuk). */
	UFUNCTION(BlueprintCallable, Category = "Buff")
	void ApplyBuff(FName BuffId, EArtifactStat Stat, float Delta, float Duration);

	UFUNCTION(BlueprintCallable, Category = "Buff")
	void RemoveBuff(FName BuffId);

	UFUNCTION(BlueprintPure, Category = "Buff")
	const TArray<FActiveBuff>& GetActiveBuffs() const { return ActiveBuffs; }

	UPROPERTY(BlueprintAssignable, Category = "Buff")
	FOnBuffsChanged OnBuffsChanged;

protected:
	virtual void BeginPlay() override;

private:
	UPROPERTY()
	TObjectPtr<ACharacterBase> OwnerChar;

	UPROPERTY()
	TArray<FActiveBuff> ActiveBuffs;

	void ApplyDelta(EArtifactStat Stat, float Delta, float Sign);
};
