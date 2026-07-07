#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "Combat/CombatTypes.h"
#include "StatusEffectComponent.generated.h"

class ACharacterBase;

/** Jenis efek status/affliction. */
UENUM(BlueprintType)
enum class EStatusType : uint8
{
	MoveSpeedMultiplier,  // Magnitude = pengali (0.5 = slow 50%, 1.3 = fast)
	DamageOverTime,       // Magnitude = damage per tick
	Stun                  // kunci gerak (Magnitude diabaikan)
};

/** Satu status aktif. */
USTRUCT(BlueprintType)
struct FStatusEffect
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly) FName StatusId;

	UPROPERTY(BlueprintReadOnly) EStatusType Type = EStatusType::MoveSpeedMultiplier;

	UPROPERTY(BlueprintReadOnly) float Magnitude = 1.f;

	/** Elemen untuk DOT (RES/shield). None = fisik. */
	UPROPERTY(BlueprintReadOnly) EElement Element = EElement::None;

	/** Interval tick DOT (detik). <=0 = tidak nge-tick. */
	UPROPERTY(BlueprintReadOnly) float TickInterval = 1.f;

	UPROPERTY(BlueprintReadOnly) float TimeRemaining = 0.f;

	float TimeToNextTick = 0.f;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnStatusChanged, const TArray<FStatusEffect>&, Active);

/**
 * Affliction umum: slow, stun, DOT. Melengkapi frozen (di reaction subsystem)
 * & buff (BuffComponent). Pasang di CharacterBase.
 *
 * MoveSpeed: kalikan MaxWalkSpeed dengan produk semua pengali aktif.
 * Stun: DisableMovement (hormati frozen — tidak un-freeze saat lepas stun).
 * DOT: `ApplyDamageOverTime` tiap interval (kena shield, tanpa hit-react spam).
 */
UCLASS(ClassGroup = (Combat), meta = (BlueprintSpawnableComponent))
class MYGAME_API UStatusEffectComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UStatusEffectComponent();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType,
		FActorComponentTickFunction* ThisTickFunction) override;

	/** Terapkan status. StatusId sama = refresh durasi + magnitude. */
	UFUNCTION(BlueprintCallable, Category = "Status")
	void ApplyStatus(FName StatusId, EStatusType Type, float Magnitude,
		float Duration, float TickInterval = 1.f, EElement Element = EElement::None);

	UFUNCTION(BlueprintCallable, Category = "Status")
	void RemoveStatus(FName StatusId);

	UFUNCTION(BlueprintPure, Category = "Status")
	bool HasStatus(FName StatusId) const;

	UFUNCTION(BlueprintPure, Category = "Status")
	bool IsStunned() const;

	UFUNCTION(BlueprintPure, Category = "Status")
	const TArray<FStatusEffect>& GetActiveStatuses() const { return ActiveStatuses; }

	UPROPERTY(BlueprintAssignable, Category = "Status")
	FOnStatusChanged OnStatusChanged;

protected:
	virtual void BeginPlay() override;

private:
	UPROPERTY() TObjectPtr<ACharacterBase> OwnerChar;
	UPROPERTY() TArray<FStatusEffect> ActiveStatuses;

	float BaseWalkSpeed = 0.f;
	bool bMovementDisabledByStun = false;

	void RecomputeMoveSpeed();
	void UpdateStunState();
};
