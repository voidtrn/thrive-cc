#include "Character/OpenWorldMovementComponent.h"
#include "GameFramework/Character.h"
#include "PhysicalMaterials/PhysicalMaterial.h"

UOpenWorldMovementComponent::UOpenWorldMovementComponent()
{
	MaxWalkSpeed = RunSpeed;
	MaxAcceleration = 1500.f;
	BrakingDecelerationWalking = 2000.f;
	AirControl = DefaultAirControl;
	JumpZVelocity = 620.f;
	GravityScale = 1.4f;
	bOrientRotationToMovement = true;
	RotationRate = FRotator(0.f, 540.f, 0.f);

	// Swimming (spec 4A): surface speed 200
	MaxSwimSpeed = 200.f;
}

void UOpenWorldMovementComponent::SetSprinting(bool bNewSprinting)
{
	if (bWantsToSprint == bNewSprinting)
	{
		return;
	}
	bWantsToSprint = bNewSprinting;
	RefreshMaxWalkSpeed();
}

void UOpenWorldMovementComponent::RefreshMaxWalkSpeed()
{
	MaxWalkSpeed = bWantsToSprint ? SprintSpeed : RunSpeed;
}

void UOpenWorldMovementComponent::StartGliding()
{
	if (bIsGliding || !IsFalling())
	{
		return;
	}
	bIsGliding = true;
	AirControl = GlideAirControl;

	// Potong momentum jatuh supaya transisi ke glide terasa "menangkap angin".
	FVector Vel = Velocity;
	Vel.Z = FMath::Max(Vel.Z, GlideVerticalSpeed);
	Velocity = Vel;
}

void UOpenWorldMovementComponent::StopGliding()
{
	if (!bIsGliding)
	{
		return;
	}
	bIsGliding = false;
	AirControl = DefaultAirControl;
}

void UOpenWorldMovementComponent::PhysFalling(float deltaTime, int32 Iterations)
{
	Super::PhysFalling(deltaTime, Iterations);

	if (bIsGliding)
	{
		if (!IsFalling())
		{
			// Mendarat — keluar dari glide otomatis.
			StopGliding();
			return;
		}

		// Auto-fold saat dekat ground
		FHitResult GroundHit;
		FCollisionQueryParams Params;
		Params.AddIgnoredActor(GetOwner());
		const FVector Start = GetOwner()->GetActorLocation();
		if (GetWorld()->LineTraceSingleByChannel(GroundHit, Start,
			Start - FVector(0, 0, 150.f), ECC_Visibility, Params))
		{
			StopGliding();
			return;
		}

		FVector Vel = Velocity;
		// Kunci kecepatan turun konstan.
		Vel.Z = GlideVerticalSpeed;
		// Batasi kecepatan horizontal glide.
		const FVector Horizontal = FVector(Vel.X, Vel.Y, 0.f).GetClampedToMaxSize(GlideMaxHorizontalSpeed);
		Velocity = FVector(Horizontal.X, Horizontal.Y, Vel.Z);
	}
}

// ---------- Climbing ----------

bool UOpenWorldMovementComponent::TraceClimbSurface(FHitResult& OutHit) const
{
	const AActor* Owner = GetOwner();
	FCollisionQueryParams Params;
	Params.AddIgnoredActor(Owner);
	Params.bReturnPhysicalMaterial = true;

	const FVector Start = Owner->GetActorLocation();
	const FVector End = Start + Owner->GetActorForwardVector() * ClimbTraceDistance;
	return GetWorld()->LineTraceSingleByChannel(OutHit, Start, End, ECC_Visibility, Params);
}

bool UOpenWorldMovementComponent::TryStartClimbing()
{
	if (IsClimbing() || IsSwimming())
	{
		return false;
	}

	FHitResult Hit;
	if (!TraceClimbSurface(Hit))
	{
		return false;
	}

	// Sudut permukaan vs horizontal: > MinClimbAngle = climbable wall
	const float SurfaceAngle = FMath::RadiansToDegrees(
		FMath::Acos(FVector::DotProduct(Hit.ImpactNormal, FVector::UpVector)));
	if (SurfaceAngle < MinClimbAngle)
	{
		return false;
	}

	ClimbSurfaceNormal = Hit.ImpactNormal;

	// Cost multiplier dari material dinding
	CurrentClimbCostMultiplier = 1.f;
	if (Hit.PhysMaterial.IsValid())
	{
		if (const float* Mult = ClimbCostMultiplierPerSurface.Find(Hit.PhysMaterial->SurfaceType))
		{
			CurrentClimbCostMultiplier = *Mult;
		}
	}

	StopGliding();
	SetMovementMode(MOVE_Custom, static_cast<uint8>(ECustomMovementMode::CMOVE_Climb));
	Velocity = FVector::ZeroVector;
	bOrientRotationToMovement = false;

	// Hadapkan karakter ke dinding
	GetOwner()->SetActorRotation((-ClimbSurfaceNormal).Rotation());

	// bPressedClimb SENGAJA tidak di-clear di sini — lihat komentar panjang
	// di UpdateCharacterStateBeforeMovement soal kenapa clear di titik ini
	// race dgn SetMoveFor tick yang sama (ke-tangkep review, bukan cuma
	// tebakan). bClimbJustEntered JUGA sengaja TIDAK di-set di sini (beda
	// dari draft sebelumnya, round 3 review) — TryStartClimbing() masih
	// BlueprintCallable langsung buat backward-compat, dan kalau dipanggil
	// dari luar jalur bPressedClimb (bukan lewat RequestClimb()), gak ada
	// request tertunda yang perlu di-clear. bClimbJustEntered di-set di
	// UpdateCharacterStateBeforeMovement sendiri, cuma kalau TryStartClimbing()
	// ini dipanggil DARI SANA (artinya emang lagi konsumsi bPressedClimb) —
	// biar clear tick berikutnya gak nyabut request lain yang gak related
	// (mis. climb langsung + RequestClimb() lain numpuk di window 1 tick).
	return true;
}

void UOpenWorldMovementComponent::StopClimbing()
{
	if (!IsClimbing())
	{
		return;
	}
	SetMovementMode(MOVE_Falling);
	bOrientRotationToMovement = true;
}

void UOpenWorldMovementComponent::JumpClimb()
{
	if (!IsClimbing())
	{
		return;
	}
	Velocity = FVector(0, 0, JumpClimbBoost * 2.f); // impulse ke atas sepanjang dinding
}

void UOpenWorldMovementComponent::PhysCustom(float deltaTime, int32 Iterations)
{
	if (CustomMovementMode == static_cast<uint8>(ECustomMovementMode::CMOVE_Climb))
	{
		PhysClimb(deltaTime, Iterations);
		return;
	}
	Super::PhysCustom(deltaTime, Iterations);
}

void UOpenWorldMovementComponent::PhysClimb(float deltaTime, int32 Iterations)
{
	// Cek dinding masih ada
	FHitResult Hit;
	if (!TraceClimbSurface(Hit))
	{
		// Sampai puncak — dorong ke atas-depan lalu keluar climb
		Velocity = FVector::UpVector * 300.f + GetOwner()->GetActorForwardVector() * 200.f;
		StopClimbing();
		return;
	}
	ClimbSurfaceNormal = Hit.ImpactNormal;

	// Input: proyeksikan ke bidang dinding (kanan = sepanjang wall, atas = naik)
	const FVector Input = ConsumeInputVector();
	const FVector WallRight = FVector::CrossProduct(FVector::UpVector, ClimbSurfaceNormal).GetSafeNormal();
	const FVector WallUp = FVector::CrossProduct(ClimbSurfaceNormal, WallRight).GetSafeNormal();

	const float Speed = bWantsToSprint ? ClimbSpeed * 1.7f : ClimbSpeed;
	FVector Move = (WallRight * FVector::DotProduct(Input, WallRight)
		+ WallUp * FVector::DotProduct(Input, FVector::UpVector)) * Speed;

	// Nempel ke dinding
	Move += -ClimbSurfaceNormal * 50.f;

	Velocity = Move + (JumpClimbBoost > 0.f && Velocity.Z > Speed ? FVector(0, 0, Velocity.Z * 0.85f) : FVector::ZeroVector);

	const FVector Delta = Velocity * deltaTime;
	FHitResult MoveHit;
	SafeMoveUpdatedComponent(Delta, UpdatedComponent->GetComponentQuat(), true, MoveHit);
	if (MoveHit.IsValidBlockingHit())
	{
		SlideAlongSurface(Delta, 1.f - MoveHit.Time, MoveHit.Normal, MoveHit, true);
	}
}

void UOpenWorldMovementComponent::UpdateCharacterStateBeforeMovement(float DeltaSeconds)
{
	Super::UpdateCharacterStateBeforeMovement(DeltaSeconds);

	// Jalan di client (predict) DAN server (replay compressed move) — sumber
	// kebenaran yang sama buat keduanya, bukan cuma nunggu MovementMode
	// nyampe lewat replikasi biasa.
	//
	// PENTING soal timing bPressedClimb (ke-tangkep review, bukan tebakan):
	// PerformMovement 1 tick urutannya UpdateCharacterStateBeforeMovement()
	// (di sini) → physics (StartNewPhysics/PhysCustom) →
	// UpdateCharacterStateAfterMovement() → ReplicateMoveToServer() →
	// NewMove->SetMoveFor() (capture buat compressed move yang dikirim).
	// SetMoveFor SELALU jalan SETELAH fungsi ini, tick yang sama. Makanya
	// bPressedClimb TIDAK BOLEH di-clear di tick yang sama dia dipakai buat
	// mutusin TryStartClimbing() — kalau di-clear duluan, compressed move
	// tick INI kekirim dgn flag false, padahal keputusan climb-nya kejadian
	// tick ini juga → server replay gak pernah lihat flag true → gak pernah
	// mutusin sama → desync persis yang mau ditutup fix ini.
	//
	// Solusi: clear SATU TICK KEMUDIAN, dikonsumsi via bClimbJustEntered
	// (di-set TryStartClimbing() pas berhasil) — BUKAN poll IsClimbing()
	// langsung. Kenapa bukan IsClimbing(): kalau climb masuk LALU keluar
	// lagi di tick yang SAMA (mis. PhysClimb trace-fail instan begitu
	// masuk), IsClimbing() di awal tick berikutnya udah balik false lagi —
	// polling itu bakal kelewat momen clear-nya, bPressedClimb tetap true
	// selamanya → retry re-entry gak diinginkan tiap tick padahal baru aja
	// keluar (round 2 review finding). bClimbJustEntered gak punya masalah
	// itu karena di-set persis pas TryStartClimbing() berhasil, independen
	// dari apa yang kejadian ke MovementMode setelahnya di tick yang sama.
	if (bClimbJustEntered)
	{
		bPressedClimb = false; // request tick sebelumnya udah kekirim & berhasil — aman clear sekarang
		bClimbJustEntered = false;
	}

	if (bPressedClimb && !IsClimbing())
	{
		// bClimbJustEntered cuma di-set DI SINI (bukan di dalam
		// TryStartClimbing() sendiri) — biar cuma nyala kalau entry ini
		// emang hasil konsumsi bPressedClimb, gak nyabut climb-request lain
		// yang gak related kalau ada caller lain manggil TryStartClimbing()
		// langsung (backward-compat path, lihat komentar di sana).
		if (TryStartClimbing())
		{
			bClimbJustEntered = true;
		}
		// Gagal (belum nemu dinding) = bPressedClimb tetap true, retry tick berikutnya.
	}
}

// ---------- Network prediction (FSavedMove) ----------
//
// ANTISIPASI #3 (CODE_REVIEW.md): sebelum ini gak ada FSavedMove custom sama
// sekali. bWantsToSprint & bPressedClimb cuma state lokal di CMC instance
// masing-masing mesin — gak ada compressed-flag/RPC yang ngirim ke server,
// jadi di co-op sungguhan (bukan listen-server-host, yang skip jalur
// SavedMove ini sepenuhnya) sprint speed & climb-entry gak pernah kekirim ke
// server. Fix: custom FSavedMove_Character pakai FLAG_Custom_0/1, pola sama
// persis bPressedJump bawaan engine. Ground truth project ini (CLAUDE.md):
// belum pernah di-compile — pola di bawah ini "matches UE 5.4 API" sejauh
// yang bisa diverifikasi tanpa compiler, BUKAN "sudah diverifikasi jalan".
// Wajib first-compile + co-op playtest nyata sebelum dianggap selesai.

class FSavedMove_OpenWorld : public FSavedMove_Character
{
public:
	typedef FSavedMove_Character Super;

	bool bSavedWantsToSprint = false;
	bool bSavedPressedClimb = false;

	virtual void Clear() override
	{
		Super::Clear();
		bSavedWantsToSprint = false;
		bSavedPressedClimb = false;
	}

	virtual uint8 GetCompressedFlags() const override
	{
		uint8 Result = Super::GetCompressedFlags();
		if (bSavedWantsToSprint)
		{
			Result |= FLAG_Custom_0;
		}
		if (bSavedPressedClimb)
		{
			Result |= FLAG_Custom_1;
		}
		return Result;
	}

	virtual bool CanCombineWith(const FSavedMovePtr& NewMovePtr, ACharacter* InCharacter, float MaxDelta) const override
	{
		const FSavedMove_OpenWorld* NewMove = static_cast<const FSavedMove_OpenWorld*>(NewMovePtr.Get());
		if (bSavedWantsToSprint != NewMove->bSavedWantsToSprint
			|| bSavedPressedClimb != NewMove->bSavedPressedClimb)
		{
			// Beda intent antar move — jangan digabung, tiap move harus terkirim
			// terpisah biar server gak kelewat satu compressed flag.
			return false;
		}
		return Super::CanCombineWith(NewMovePtr, InCharacter, MaxDelta);
	}

	virtual void SetMoveFor(ACharacter* C, float InDeltaTime, FVector const& NewAccel,
		FNetworkPredictionData_Client_Character& ClientData) override
	{
		Super::SetMoveFor(C, InDeltaTime, NewAccel, ClientData);

		if (const UOpenWorldMovementComponent* MoveComp =
			C ? Cast<UOpenWorldMovementComponent>(C->GetCharacterMovement()) : nullptr)
		{
			bSavedWantsToSprint = MoveComp->IsSprinting();
			bSavedPressedClimb = MoveComp->bPressedClimb;
		}
	}

	virtual void PrepMoveFor(ACharacter* C) override
	{
		Super::PrepMoveFor(C);

		if (UOpenWorldMovementComponent* MoveComp =
			C ? Cast<UOpenWorldMovementComponent>(C->GetCharacterMovement()) : nullptr)
		{
			MoveComp->bPressedClimb = bSavedPressedClimb;
		}
	}
};

class FNetworkPredictionData_Client_OpenWorld : public FNetworkPredictionData_Client_Character
{
public:
	typedef FNetworkPredictionData_Client_Character Super;

	FNetworkPredictionData_Client_OpenWorld(const UCharacterMovementComponent& ClientMovement)
		: Super(ClientMovement)
	{
	}

	virtual FSavedMovePtr AllocateNewMove() override
	{
		return FSavedMovePtr(new FSavedMove_OpenWorld());
	}
};

FNetworkPredictionData_Client* UOpenWorldMovementComponent::GetPredictionData_Client() const
{
	// Sama pola engine: lazy-alloc sekali, pasang factory custom biar
	// AllocateNewMove() balikin FSavedMove_OpenWorld bukan base class.
	if (ClientPredictionData == nullptr)
	{
		UOpenWorldMovementComponent* MutableThis = const_cast<UOpenWorldMovementComponent*>(this);
		MutableThis->ClientPredictionData = new FNetworkPredictionData_Client_OpenWorld(*this);
	}
	return ClientPredictionData;
}

void UOpenWorldMovementComponent::UpdateFromCompressedFlags(uint8 Flags)
{
	Super::UpdateFromCompressedFlags(Flags);

	// Server-side (replay compressed move dari client) & client-side
	// (autonomous proxy nerima balik dari sendiri) — jalur yang sama buat
	// unpack apa yang di-pack GetCompressedFlags() di atas.
	SetSprinting((Flags & FSavedMove_Character::FLAG_Custom_0) != 0);
	bPressedClimb = (Flags & FSavedMove_Character::FLAG_Custom_1) != 0;
}
