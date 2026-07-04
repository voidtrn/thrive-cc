#include "Character/CharacterBase.h"
#include "Character/OpenWorldMovementComponent.h"
#include "Character/LockOnComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "Camera/CameraComponent.h"
#include "AbilitySystemComponent.h"
#include "Kismet/GameplayStatics.h"
#include "MyGame.h"

ACharacterBase::ACharacterBase(const FObjectInitializer& ObjectInitializer)
	: Super(ObjectInitializer.SetDefaultSubobjectClass<UOpenWorldMovementComponent>(
		ACharacter::CharacterMovementComponentName))
{
	PrimaryActorTick.bCanEverTick = true;

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

UOpenWorldMovementComponent* ACharacterBase::GetOpenWorldMovement() const
{
	return Cast<UOpenWorldMovementComponent>(GetCharacterMovement());
}

void ACharacterBase::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	TickCamera(DeltaSeconds);
	TickStamina(DeltaSeconds);
}

// ---------- Damage & health ----------

void ACharacterBase::ApplyDamage(float Amount, EElement DamageElement, EHitReaction Reaction)
{
	if (!IsAlive() || Amount <= 0.f)
	{
		return;
	}

	// Phase 3: formula DEF, resistance per elemen, elemental reaction di sini.
	CurrentHP = FMath::Max(0.f, CurrentHP - Amount);
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
	}
}

void ACharacterBase::Heal(float Amount)
{
	if (!IsAlive() || Amount <= 0.f)
	{
		return;
	}
	CurrentHP = FMath::Min(MaxHP, CurrentHP + Amount);
	OnHealthChanged.Broadcast(CurrentHP, MaxHP);
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
	if (CurrentStamina >= MaxStamina)
	{
		return;
	}
	if (GetWorld()->GetTimeSeconds() - LastStaminaUseTime < StaminaRegenDelay)
	{
		return;
	}

	// Sprint & glide menahan regen (dan Phase 2 BP-nya yang men-drain per detik).
	const UOpenWorldMovementComponent* Move = GetOpenWorldMovement();
	if (Move && (Move->IsSprinting() || Move->IsGliding()))
	{
		return;
	}

	CurrentStamina = FMath::Min(MaxStamina, CurrentStamina + StaminaRegenPerSecond * DeltaSeconds);
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
