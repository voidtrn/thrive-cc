#pragma once

#include "CoreMinimal.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "OpenWorldMovementComponent.generated.h"

/** Custom movement mode di MOVE_Custom. */
UENUM(BlueprintType)
enum class ECustomMovementMode : uint8
{
	CMOVE_None = 0,
	CMOVE_Climb = 1
};

/**
 * Movement custom: 3 tier kecepatan darat (walk/run/sprint sesuai
 * blend space 0-250 / 250-500 / 500-800), glide, climb (custom mode).
 */
UCLASS()
class MYGAME_API UOpenWorldMovementComponent : public UCharacterMovementComponent
{
	GENERATED_BODY()

public:
	UOpenWorldMovementComponent();

	UFUNCTION(BlueprintCallable, Category = "Movement")
	void SetSprinting(bool bNewSprinting);

	UFUNCTION(BlueprintPure, Category = "Movement")
	bool IsSprinting() const { return bWantsToSprint; }

	UFUNCTION(BlueprintCallable, Category = "Movement|Glide")
	void StartGliding();

	UFUNCTION(BlueprintCallable, Category = "Movement|Glide")
	void StopGliding();

	UFUNCTION(BlueprintPure, Category = "Movement|Glide")
	bool IsGliding() const { return bIsGliding; }

	// ---------- Climbing ----------
	/**
	 * Set intent "mau climb" — dikonsumsi `UpdateCharacterStateBeforeMovement`
	 * tiap tick (sama pola `bPressedJump` engine), lewat compressed flag jadi
	 * server independen mutusin sama kayak client predict (ANTISIPASI #3,
	 * CODE_REVIEW.md — sebelum ini gak ada FSavedMove custom sama sekali,
	 * jadi `bWantsToSprint`/climb-entry gak pernah nyampe ke server di co-op).
	 * Pakai ini (bukan panggil TryStartClimbing langsung) dari input BP biar
	 * predict/replay konsisten.
	 */
	UFUNCTION(BlueprintCallable, Category = "Movement|Climb")
	void RequestClimb() { bPressedClimb = true; }

	/**
	 * Batalin climb request yang belum terpenuhi (mis. player lepas tombol
	 * climb sebelum nemu dinding). Tanpa ini, `bPressedClimb` retry trace
	 * tiap tick tanpa batas sampai nemu dinding — gak salah, tapi buang
	 * cost trace + gak ada cara keluar dari intent itu.
	 */
	UFUNCTION(BlueprintCallable, Category = "Movement|Climb")
	void CancelClimbRequest() { bPressedClimb = false; }

	/**
	 * Cek dinding di depan (angle > 45°) lalu masuk mode climb. Tetap
	 * BlueprintCallable buat backward-compat (single-player/listen-host
	 * aman dipanggil langsung), tapi utk co-op yang bener pakai
	 * `RequestClimb()` — lihat komentar di sana.
	 */
	UFUNCTION(BlueprintCallable, Category = "Movement|Climb")
	bool TryStartClimbing();

	UFUNCTION(BlueprintCallable, Category = "Movement|Climb")
	void StopClimbing();

	/** Lompatan kecil ke atas saat climbing. Stamina dicek pemanggil (25). */
	UFUNCTION(BlueprintCallable, Category = "Movement|Climb")
	void JumpClimb();

	UFUNCTION(BlueprintPure, Category = "Movement|Climb")
	bool IsClimbing() const
	{
		return MovementMode == MOVE_Custom && CustomMovementMode == static_cast<uint8>(ECustomMovementMode::CMOVE_Climb);
	}

	/** Multiplier stamina dari material dinding (licin = mahal). */
	UFUNCTION(BlueprintPure, Category = "Movement|Climb")
	float GetClimbSurfaceCostMultiplier() const { return CurrentClimbCostMultiplier; }

	UPROPERTY(EditDefaultsOnly, Category = "Movement|Climb")
	float ClimbSpeed = 120.f;

	/** Sudut minimal permukaan dianggap wall (derajat dari horizontal). */
	UPROPERTY(EditDefaultsOnly, Category = "Movement|Climb")
	float MinClimbAngle = 45.f;

	UPROPERTY(EditDefaultsOnly, Category = "Movement|Climb")
	float ClimbTraceDistance = 80.f;

	/** Boost jump climb (unit). */
	UPROPERTY(EditDefaultsOnly, Category = "Movement|Climb")
	float JumpClimbBoost = 200.f;

	/** Stamina cost per surface type (licin > 1.0). */
	UPROPERTY(EditDefaultsOnly, Category = "Movement|Climb")
	TMap<TEnumAsByte<EPhysicalSurface>, float> ClimbCostMultiplierPerSurface;

	// --- Speed tiers (match BS_Locomotion) ---
	UPROPERTY(EditDefaultsOnly, Category = "Movement|Speeds")
	float WalkSpeed = 250.f;

	UPROPERTY(EditDefaultsOnly, Category = "Movement|Speeds")
	float RunSpeed = 500.f;

	UPROPERTY(EditDefaultsOnly, Category = "Movement|Speeds")
	float SprintSpeed = 800.f;

	// --- Glide tuning ---
	/** Kecepatan turun konstan saat glide (cm/s). */
	UPROPERTY(EditDefaultsOnly, Category = "Movement|Glide")
	float GlideVerticalSpeed = -180.f;

	UPROPERTY(EditDefaultsOnly, Category = "Movement|Glide")
	float GlideAirControl = 0.9f;

	UPROPERTY(EditDefaultsOnly, Category = "Movement|Glide")
	float GlideMaxHorizontalSpeed = 600.f;

	virtual void PhysFalling(float deltaTime, int32 Iterations) override;
	virtual void PhysCustom(float deltaTime, int32 Iterations) override;
	virtual void UpdateCharacterStateBeforeMovement(float DeltaSeconds) override;

	// ---------- Network prediction (FSavedMove) ----------
	// bWantsToSprint & bPressedClimb sekarang jadi bagian compressed move flags
	// (FLAG_Custom_0/1) — server independen replay keputusan yang sama dgn
	// client predict, bukan cuma percaya MovementMode yang datang belakangan.
	virtual FNetworkPredictionData_Client* GetPredictionData_Client() const override;
	virtual void UpdateFromCompressedFlags(uint8 Flags) override;

	/**
	 * "Sticky" sampai tick BERIKUTNYA setelah entry berhasil (baru di-clear
	 * di `UpdateCharacterStateBeforeMovement`, via `bClimbJustEntered` —
	 * bukan poll `IsClimbing()` langsung, lihat komentar situ), BUKAN
	 * di-clear langsung di `TryStartClimbing()` pas berhasil. Alasan:
	 * `SetMoveFor` (capture buat compressed move yang dikirim ke server)
	 * selalu jalan SETELAH `UpdateCharacterStateBeforeMovement` di tick yang
	 * sama — clear di tick yang sama dgn keputusan climb bikin compressed
	 * move tick itu kekirim dgn flag false, server gak pernah lihat true,
	 * gak pernah mutusin sama (silent desync, ke-tangkep review round 1).
	 * Clear 1 tick kemudian aman karena capture tick sebelumnya udah lewat.
	 */
	bool bPressedClimb = false;

private:
	/**
	 * Internal bookkeeping — TIDAK bagian compressed flag, gak perlu (server
	 * replay `TryStartClimbing()` sendiri set ini juga, deterministic, gak
	 * butuh transmit). Set true HANYA di `UpdateCharacterStateBeforeMovement`,
	 * pas `TryStartClimbing()` yang dipanggil DARI SITU (hasil konsumsi
	 * `bPressedClimb`) berhasil — SENGAJA BUKAN di dalam `TryStartClimbing()`
	 * itu sendiri (round 3 review: kalau di situ, direct-call dari luar
	 * jalur request bisa nyabut climb-request lain yang gak related).
	 * Dikonsumsi tick berikutnya buat clear `bPressedClimb` — dipisah dari
	 * `IsClimbing()` karena `IsClimbing()` bisa udah stale kalau climb masuk
	 * LALU keluar lagi di tick yang sama (mis. `PhysClimb` trace-fail
	 * instan): polling `IsClimbing()` doang bakal kelewat clear-nya, retry
	 * re-entry gak diinginkan padahal baru aja keluar (round 2 review finding).
	 */
	bool bClimbJustEntered = false;

protected:
	bool bWantsToSprint = false;
	bool bIsGliding = false;

	float DefaultAirControl = 0.35f;
	float CurrentClimbCostMultiplier = 1.f;
	FVector ClimbSurfaceNormal = FVector::ZeroVector;

	void RefreshMaxWalkSpeed();
	void PhysClimb(float deltaTime, int32 Iterations);
	bool TraceClimbSurface(FHitResult& OutHit) const;
};
