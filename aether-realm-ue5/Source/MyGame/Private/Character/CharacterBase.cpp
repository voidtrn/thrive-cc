#include "Character/CharacterBase.h"
#include "Character/OpenWorldMovementComponent.h"
#include "Character/LockOnComponent.h"
#include "Combat/ShieldComponent.h"
#include "Combat/StatusEffectComponent.h"
#include "System/OpenWorldGameInstance.h"
#include "GameFramework/SpringArmComponent.h"
#include "Camera/CameraComponent.h"
#include "AbilitySystemComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Net/UnrealNetwork.h"
#include "MyGame.h"

ACharacterBase::ACharacterBase(const FObjectInitializer& ObjectInitializer)
	: Super(ObjectInitializer.SetDefaultSubobjectClass<UOpenWorldMovementComponent>(
		ACharacter::CharacterMovementComponentName))
{
	PrimaryActorTick.bCanEverTick = true;

	// Co-op ready: character direplikasi (single-player = listen server implisit)
	bReplicates = true;
	SetReplicateMovement(true);

	bUseControllerRotationYaw = false; // orient to movement, kamera bebas orbit

	// Spring arm — nilai spec 2C: lag 3, rotation lag 5, collision test on
	CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
	CameraBoom->SetupAttachment(RootComponent);
	CameraBoom->TargetArmLength = 400.f;
	CameraBoom->bUsePawnControlRotation = true;
	CameraBoom->bEnableCameraLag = true;
	CameraBoom->CameraLagSpeed = 3.f;
	CameraBoom->bEnableCameraRotationLag = true;
	CameraBoom->CameraRotationLagSpeed = 5.f;
	CameraBoom->bDoCollisionTest = true; // auto-zoom saat dekat dinding
	CameraBoom->ProbeSize = 12.f;
	CameraBoom->SocketOffset = FVector(0.f, 0.f, 60.f);

	FollowCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("FollowCamera"));
	FollowCamera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName);
	FollowCamera->bUsePawnControlRotation = false;
	FollowCamera->SetFieldOfView(80.f);

	AbilitySystem = CreateDefaultSubobject<UAbilitySystemComponent>(TEXT("AbilitySystem"));
	AbilitySystem->SetIsReplicated(true);
	AbilitySystem->SetReplicationMode(EGameplayEffectReplicationMode::Mixed);

	LockOn = CreateDefaultSubobject<ULockOnComponent>(TEXT("LockOn"));

	TargetZoom = CameraBoom->TargetArmLength;
}

void ACharacterBase::BeginPlay()
{
	Super::BeginPlay();

	// Stamina cap dari upgrade Statue of The Seven (persistent, max 240)
	if (const UOpenWorldGameInstance* GI = GetGameInstance<UOpenWorldGameInstance>())
	{
		if (IsPlayerControlled())
		{
			MaxStamina = FMath::Min(240.f, 100.f + GI->StaminaCapBonus);
		}
	}

	CurrentHP = MaxHP;
	CurrentStamina = MaxStamina;
	TargetZoom = CameraBoom->TargetArmLength;

	if (AbilitySystem)
	{
		AbilitySystem->InitAbilityActorInfo(this, this);
	}
}

UAbilitySystemComponent* ACharacterBase::GetAbilitySystemComponent() const
{
	return AbilitySystem;
}

void ACharacterBase::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);
	DOREPLIFETIME(ACharacterBase, CurrentHP);
	DOREPLIFETIME(ACharacterBase, CurrentEnergy);
}

UOpenWorldMovementComponent* ACharacterBase::GetOpenWorldMovement() const
{
	return Cast<UOpenWorldMovementComponent>(GetCharacterMovement());
}

void ACharacterBase::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	TickCamera(DeltaSeconds);
	TickStamina(DeltaSeconds);

	// Bersihkan RES shred yang kadaluarsa (cegah array tumbuh tanpa batas).
	if (ActiveResShreds.Num() > 0)
	{
		const double Now = GetWorld()->GetTimeSeconds();
		ActiveResShreds.RemoveAll([Now](const FActiveResShred& S) { return S.ExpiryTime <= Now; });
	}
}

// ---------- Stats: DMG bonus & RES ----------

float ACharacterBase::GetDMGBonus(EElement DamageElement) const
{
	// Physical (None) tidak dapat elemental DMG bonus.
	if (DamageElement == EElement::None)
	{
		return PhysicalDMGBonus;
	}
	float Bonus = ElementalDMGBonus; // universal (mis. sumber generic)
	if (const float* PerElem = DMGBonusPerElement.Find(DamageElement))
	{
		Bonus += *PerElem;
	}
	return Bonus;
}

void ACharacterBase::ApplyResShred(EElement ResElement, float Amount, float Duration)
{
	if (Amount <= 0.f || Duration <= 0.f)
	{
		return;
	}
	FActiveResShred Shred;
	Shred.Element = ResElement;
	Shred.Amount = Amount;
	Shred.ExpiryTime = GetWorld()->GetTimeSeconds() + Duration;
	ActiveResShreds.Add(Shred);
}

float ACharacterBase::GetResShred(EElement DamageElement) const
{
	const double Now = GetWorld()->GetTimeSeconds();
	float Total = 0.f;
	for (const FActiveResShred& S : ActiveResShreds)
	{
		if (S.Element == DamageElement && S.ExpiryTime > Now)
		{
			Total += S.Amount;
		}
	}
	return Total;
}

float ACharacterBase::GetResistance(EElement DamageElement) const
{
	// RES efektif bisa negatif (shred > base) → ResMultiplier handle (RES<0 → /4).
	// FlatRESBonus dari resonance (Protective Canopy) menambah semua elemen.
	return GetBaseResistance(DamageElement) - GetResShred(DamageElement) + FlatRESBonus;
}

// ---------- Damage & health ----------

void ACharacterBase::ApplyDamage(float Amount, EElement DamageElement, EHitReaction Reaction)
{
	if (!IsAlive() || Amount <= 0.f || bInvulnerable)
	{
		return;
	}

	// Shield serap dulu (elemental shield 2.5× vs elemen cocok).
	float ToHP = Amount;
	if (UShieldComponent* Shield = FindComponentByClass<UShieldComponent>())
	{
		ToHP = Shield->AbsorbDamage(Amount, DamageElement);
	}

	CurrentHP = FMath::Max(0.f, CurrentHP - ToHP);
	OnHealthChanged.Broadcast(CurrentHP, MaxHP);

	if (UAnimMontage* const* Montage = HitReactionMontages.Find(Reaction))
	{
		if (*Montage)
		{
			PlayAnimMontage(*Montage);
		}
	}

	PlayHitShake();

	if (!IsAlive())
	{
		HandleDeath();
		return;
	}

	RegisterPoiseDamage(Reaction);
}

void ACharacterBase::ApplyDamageOverTime(float Amount, EElement DamageElement)
{
	if (!IsAlive() || Amount <= 0.f || bInvulnerable)
	{
		return;
	}

	float ToHP = Amount;
	if (UShieldComponent* Shield = FindComponentByClass<UShieldComponent>())
	{
		ToHP = Shield->AbsorbDamage(Amount, DamageElement);
	}

	CurrentHP = FMath::Max(0.f, CurrentHP - ToHP);
	OnHealthChanged.Broadcast(CurrentHP, MaxHP);

	if (!IsAlive())
	{
		HandleDeath();
	}
}

// ---------- Poise / stagger ----------

float ACharacterBase::GetPoiseDamageForReaction(EHitReaction Reaction)
{
	// Hanya reaction tier CC-berat yang accumulate poise. Light/Medium/Heavy
	// murni anim, tak menyentuh poise.
	switch (Reaction)
	{
	case EHitReaction::Stagger:     return 40.f;
	case EHitReaction::Knockback:   return 70.f;
	case EHitReaction::Launch:      return 100.f;
	case EHitReaction::KnockedDown: return 140.f;
	default:                        return 0.f;
	}
}

void ACharacterBase::RegisterPoiseDamage(EHitReaction Reaction)
{
	const float PoiseDamage = GetPoiseDamageForReaction(Reaction);
	if (PoiseDamage <= 0.f)
	{
		return;
	}

	const float Threshold = GetPoiseThreshold();
	if (Threshold <= 0.f)
	{
		// Tak ada resistance — perilaku lama: reaction berat langsung stagger.
		ApplyPoiseBreakStun(Reaction);
		return;
	}

	const double Now = GetWorld() ? GetWorld()->GetTimeSeconds() : 0.0;
	if (Now - LastPoiseHitTime > PoiseResetWindow)
	{
		AccumulatedPoise = 0.f;
	}
	LastPoiseHitTime = Now;

	AccumulatedPoise += PoiseDamage;
	if (AccumulatedPoise >= Threshold)
	{
		AccumulatedPoise = 0.f;
		ApplyPoiseBreakStun(Reaction);
		OnPoiseBroken.Broadcast();
	}
}

void ACharacterBase::ApplyPoiseBreakStun(EHitReaction Reaction)
{
	float StunDuration = 1.5f;
	if (Reaction == EHitReaction::Stagger)
	{
		StunDuration = 0.8f;
	}
	else if (Reaction == EHitReaction::KnockedDown)
	{
		StunDuration = 2.f;
	}

	if (UStatusEffectComponent* Status = FindComponentByClass<UStatusEffectComponent>())
	{
		Status->ApplyStatus(TEXT("PoiseBreak"), EStatusType::Stun, 0.f, StunDuration);
	}
}

void ACharacterBase::Heal(float Amount)
{
	if (!IsAlive() || Amount <= 0.f)
	{
		return;
	}
	// HealingBonus meningkatkan heal keluar (dari gear healer)
	const float Healed = Amount * (1.f + HealingBonus);
	CurrentHP = FMath::Min(MaxHP, CurrentHP + Healed);
	OnHealthChanged.Broadcast(CurrentHP, MaxHP);
}

void ACharacterBase::SetFrozen(bool bNewFrozen)
{
	if (bFrozen == bNewFrozen)
	{
		return;
	}
	bFrozen = bNewFrozen;

	if (UCharacterMovementComponent* Move = GetCharacterMovement())
	{
		if (bFrozen)
		{
			Move->DisableMovement();
		}
		else
		{
			Move->SetMovementMode(MOVE_Walking);
		}
	}
}

void ACharacterBase::HandleDeath()
{
	UE_LOG(LogAetherRealm, Log, TEXT("%s died"), *CharacterID.ToString());
	OnDied.Broadcast(this);
	// Phase 3: ragdoll/dissolve VFX + auto-swap ke anggota party hidup.
}

// ---------- Stamina ----------

bool ACharacterBase::ConsumeStamina(float Amount)
{
	if (CurrentStamina < Amount)
	{
		return false;
	}
	CurrentStamina -= Amount;
	LastStaminaUseTime = GetWorld()->GetTimeSeconds();
	return true;
}

void ACharacterBase::TickStamina(float DeltaSeconds)
{
	UOpenWorldMovementComponent* Move = GetOpenWorldMovement();
	if (!Move)
	{
		return;
	}

	// --- Drain kontinu (spec 4A) ---
	float DrainPerSecond = 0.f;

	if (Move->IsClimbing())
	{
		DrainPerSecond = (Move->IsSprinting() ? SprintClimbStaminaPerSecond : ClimbStaminaPerSecond)
			* Move->GetClimbSurfaceCostMultiplier();
	}
	else if (Move->IsGliding())
	{
		// Wind current: naik gratis
		DrainPerSecond = bInWindCurrent ? 0.f : GlideStaminaPerSecond;
	}
	else if (Move->IsSwimming())
	{
		DrainPerSecond = SwimStaminaPerSecond;
	}
	else if (Move->IsSprinting() && GetVelocity().SizeSquared() > 100.f)
	{
		DrainPerSecond = SprintStaminaPerSecond;
	}

	DrainPerSecond *= StaminaCostMultiplier; // Anemo resonance -15%

	if (DrainPerSecond > 0.f)
	{
		CurrentStamina = FMath::Max(0.f, CurrentStamina - DrainPerSecond * DeltaSeconds);
		LastStaminaUseTime = GetWorld()->GetTimeSeconds();

		if (CurrentStamina <= 0.f)
		{
			if (Move->IsClimbing())
			{
				Move->StopClimbing(); // slide down — AnimBP handle slide anim via falling
			}
			else if (Move->IsGliding())
			{
				Move->StopGliding();
			}
			else if (Move->IsSprinting())
			{
				Move->SetSprinting(false);
			}
			else if (Move->IsSwimming())
			{
				// Drowning: HP drain 10% MaxHP per detik
				CurrentHP = FMath::Max(0.f, CurrentHP - MaxHP * DrowningHPPercentPerSecond * DeltaSeconds);
				OnHealthChanged.Broadcast(CurrentHP, MaxHP);
				if (!IsAlive())
				{
					HandleDeath();
				}
			}
		}
		return;
	}

	// --- Regen ---
	if (CurrentStamina >= MaxStamina)
	{
		return;
	}
	if (GetWorld()->GetTimeSeconds() - LastStaminaUseTime < StaminaRegenDelay)
	{
		return;
	}

	CurrentStamina = FMath::Min(MaxStamina, CurrentStamina + StaminaRegenPerSecond * DeltaSeconds);
}

bool ACharacterBase::TryJumpClimb()
{
	UOpenWorldMovementComponent* Move = GetOpenWorldMovement();
	if (!Move || !Move->IsClimbing())
	{
		return false;
	}
	if (!ConsumeStamina(JumpClimbStaminaCost))
	{
		return false;
	}
	Move->JumpClimb();
	return true;
}

// ---------- Camera ----------

void ACharacterBase::ZoomCamera(float AxisValue)
{
	TargetZoom = FMath::Clamp(TargetZoom - AxisValue * ZoomStep, MinZoom, MaxZoom);
}

void ACharacterBase::SetAimMode(bool bEnabled)
{
	bAimMode = bEnabled;
}

void ACharacterBase::TickCamera(float DeltaSeconds)
{
	// Zoom halus ke target scroll
	CameraBoom->TargetArmLength = FMath::FInterpTo(
		CameraBoom->TargetArmLength, TargetZoom, DeltaSeconds, ZoomInterpSpeed);

	// Aim mode: FOV menyempit
	const float DesiredFOV = bAimMode ? AimFOV : DefaultFOV;
	FollowCamera->SetFieldOfView(FMath::FInterpTo(
		FollowCamera->FieldOfView, DesiredFOV, DeltaSeconds, FOVInterpSpeed));
}

void ACharacterBase::PlayHitShake()
{
	PlayShake(HitShakeClass);
}

void ACharacterBase::PlayBurstShake()
{
	PlayShake(BurstShakeClass);
}

void ACharacterBase::PlayShake(TSubclassOf<UCameraShakeBase> ShakeClass) const
{
	if (!ShakeClass)
	{
		return;
	}
	if (APlayerController* PC = Cast<APlayerController>(GetController()))
	{
		PC->ClientStartCameraShake(ShakeClass);
	}
}
