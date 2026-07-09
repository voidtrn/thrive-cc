#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "Combat/CombatTypes.h"
#include "AimModeComponent.generated.h"

class ACharacterBase;
class AAimedProjectile;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnAimModeChanged, bool, bAiming);

/**
 * Mode TPS — bidik over-the-shoulder ala aim mode Genshin / third-person
 * shooter. Pasang di BP karakter (terutama Bow/Catalyst).
 *
 * Enter aim:
 *   - Kamera merapat ke bahu (arm pendek + socket offset samping, interp halus
 *     lewat sistem kamera existing: SetCameraZoomTarget + FOV SetAimMode)
 *   - Karakter strafe: rotasi ikut kamera (bUseControllerRotationYaw),
 *     bukan arah gerak
 *   - Jalan pelan (AimWalkSpeed)
 * FireShot: spawn projectile dari muzzle ke titik bidik (crosshair tengah
 * layar) + spread cone. Server-authoritative via RPC — co-op aman.
 *
 * Input wiring + crosshair widget: lihat Docs/TPS_MODE.md.
 */
UCLASS(ClassGroup = (Combat), meta = (BlueprintSpawnableComponent))
class MYGAME_API UAimModeComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UAimModeComponent();

	/** Masuk mode bidik. False kalau ditolak (climb/glide/swim/mati). */
	UFUNCTION(BlueprintCallable, Category = "Aim")
	bool EnterAimMode();

	UFUNCTION(BlueprintCallable, Category = "Aim")
	void ExitAimMode();

	UFUNCTION(BlueprintPure, Category = "Aim")
	bool IsAiming() const { return bAiming; }

	/** Ganti bahu kiri/kanan (Q saat aim, ala TPS modern). */
	UFUNCTION(BlueprintCallable, Category = "Aim")
	void ToggleShoulder();

	/**
	 * Titik yang crosshair tunjuk: trace dari tengah kamera. Return false
	 * kalau tidak kena apa pun (pakai titik jauh di OutPoint).
	 */
	UFUNCTION(BlueprintCallable, Category = "Aim")
	bool GetAimPoint(FVector& OutPoint) const;

	/**
	 * Tembak projectile ke titik bidik. Params masuk pipeline DealDamage
	 * penuh (talent, reaction, crit). Spread dalam derajat setengah-sudut
	 * (0 = laser; hip-fire BP bisa kasih 3-5).
	 */
	UFUNCTION(BlueprintCallable, Category = "Aim")
	bool FireShot(TSubclassOf<AAimedProjectile> ProjectileClass,
		const FAttackParams& Params, float SpreadHalfAngleDeg = 0.f);

	/**
	 * Arah dalam cone spread — deterministik dari dua random 0-1
	 * (pure static, automation-testable).
	 */
	static FVector ComputeSpreadDirection(
		const FVector& BaseDir, float HalfAngleDeg, float Rand01A, float Rand01B);

	UPROPERTY(BlueprintAssignable, Category = "Aim")
	FOnAimModeChanged OnAimModeChanged;

	// ---------- Tuning ----------
	UPROPERTY(EditDefaultsOnly, Category = "Aim|Camera")
	float AimArmLength = 160.f;

	/** Offset bahu (Y dibalik saat shoulder kiri). */
	UPROPERTY(EditDefaultsOnly, Category = "Aim|Camera")
	FVector AimSocketOffset = FVector(0.f, 55.f, 55.f);

	UPROPERTY(EditDefaultsOnly, Category = "Aim|Camera")
	float CameraInterpSpeed = 12.f;

	UPROPERTY(EditDefaultsOnly, Category = "Aim|Movement")
	float AimWalkSpeed = 200.f;

	/** Socket mesh asal projectile. */
	UPROPERTY(EditDefaultsOnly, Category = "Aim|Fire")
	FName MuzzleSocket = TEXT("weapon_r");

	UPROPERTY(EditDefaultsOnly, Category = "Aim|Fire")
	float AimTraceDistance = 10000.f;

protected:
	virtual void BeginPlay() override;
	virtual void TickComponent(float DeltaTime, ELevelTick TickType,
		FActorComponentTickFunction* ThisTickFunction) override;
	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

	/** Spawn projectile di server (dipanggil dari owner client). */
	UFUNCTION(Server, Reliable)
	void ServerFireShot(TSubclassOf<AAimedProjectile> ProjectileClass,
		FVector_NetQuantize Origin, FVector_NetQuantizeNormal Direction,
		FAttackParams Params);

	UFUNCTION()
	void OnRep_Aiming();

	void ApplyAimState(bool bNewAiming);

	/** Direplikasi supaya simulated proxy (co-op) mainkan pose aim. */
	UPROPERTY(ReplicatedUsing = OnRep_Aiming)
	bool bAiming = false;

	bool bRightShoulder = true;

	// State tersimpan buat restore saat exit
	float SavedArmLength = 400.f;
	FVector SavedSocketOffset = FVector(0.f, 0.f, 60.f);
	float SavedMaxWalkSpeed = 500.f;
	bool bSavedOrientRotation = true;
	bool bSavedControllerYaw = false;

	UPROPERTY()
	TObjectPtr<ACharacterBase> OwnerChar;
};
