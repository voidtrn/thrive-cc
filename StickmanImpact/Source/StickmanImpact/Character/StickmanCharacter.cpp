// Copyright StickmanImpact Project.

#include "StickmanCharacter.h"
#include "StickmanGameplayTags.h"
#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "GameFramework/PlayerController.h"
#include "EnhancedInputComponent.h"
#include "EnhancedInputSubsystems.h"
#include "InputActionValue.h"
#include "Curves/CurveFloat.h"
#include "Engine/Engine.h"
#include "Combat/StickmanAbilitySystemComponent.h"
#include "Combat/StickmanAttributeSet.h"
#include "Combat/Abilities/GA_NormalAttack.h"
#include "SkillSystem/StickmanSkillDataAsset.h"
#include "Party/StickmanPartyTypes.h"
#include "Equipment/EquipmentManager.h"
#include "GameFlow/StickmanCheatManager.h"
#include "StickmanInteractable.h"

AStickmanCharacter::AStickmanCharacter()
{
	PrimaryActorTick.bCanEverTick = true;

	// Stickman proportions: a thin, tall capsule stands in for the simple-geometry body.
	// Swap the skeletal mesh + anim blueprint on GetMesh() in the character Blueprint.
	GetCapsuleComponent()->InitCapsuleSize(20.f, 88.f);
	GetMesh()->SetRelativeLocation(FVector(0.f, 0.f, -88.f));
	GetMesh()->SetRelativeRotation(FRotator(0.f, -90.f, 0.f));

	// Character rotates to face movement direction; the controller only drives the camera.
	bUseControllerRotationPitch = false;
	bUseControllerRotationYaw = false;
	bUseControllerRotationRoll = false;

	UCharacterMovementComponent* Movement = GetCharacterMovement();
	Movement->bOrientRotationToMovement = true;
	Movement->RotationRate = FRotator(0.f, 500.f, 0.f);
	Movement->JumpZVelocity = 500.f;
	Movement->AirControl = 0.35f;
	Movement->MaxWalkSpeed = WalkSpeed;

	// Third-person spring arm + camera.
	CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
	CameraBoom->SetupAttachment(RootComponent);
	CameraBoom->TargetArmLength = 300.f;
	CameraBoom->bUsePawnControlRotation = true;
	CameraBoom->bEnableCameraLag = true;
	CameraBoom->CameraLagSpeed = CameraLagSpeedValue;

	FollowCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("FollowCamera"));
	FollowCamera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName);
	FollowCamera->bUsePawnControlRotation = false;

	// Double jump: base ACharacter only allows one jump, so we track our own counter
	// and gate it against MaxJumpCount instead of relying on JumpMaxCount (kept for clarity).
	JumpMaxCount = MaxJumpCount;

	AbilitySystemComponent = CreateDefaultSubobject<UStickmanAbilitySystemComponent>(TEXT("AbilitySystemComponent"));
	AbilitySystemComponent->SetIsReplicated(true);
	AbilitySystemComponent->SetReplicationMode(EGameplayEffectReplicationMode::Mixed);

	AttributeSet = CreateDefaultSubobject<UStickmanAttributeSet>(TEXT("AttributeSet"));

	EquipmentManager = CreateDefaultSubobject<UEquipmentManager>(TEXT("EquipmentManager"));
}

UAbilitySystemComponent* AStickmanCharacter::GetAbilitySystemComponent() const
{
	return AbilitySystemComponent;
}

void AStickmanCharacter::ApplyCharacterData(const FStickmanCharacterData& CharacterData)
{
	if (USkeletalMesh* Mesh = CharacterData.CharacterMesh.LoadSynchronous())
	{
		GetMesh()->SetSkeletalMesh(Mesh);
	}

	Stats = CharacterData.BaseStats;
	if (AttributeSet)
	{
		AttributeSet->InitHealth(Stats.MaxHealth);
		AttributeSet->InitMaxHealth(Stats.MaxHealth);
		AttributeSet->InitStamina(Stats.MaxStamina);
		AttributeSet->InitMaxStamina(Stats.MaxStamina);
		AttributeSet->InitAttack(Stats.Attack);
		AttributeSet->InitDefense(Stats.Defense);
		AttributeSet->InitElementalMastery(Stats.ElementalMastery);
		AttributeSet->InitEnergyRecharge(Stats.EnergyRecharge);
		if (EquipmentManager)
		{
			EquipmentManager->ApplyTotalsToAttributeSet(AttributeSet, Stats.Attack, Stats.Defense, Stats.MaxHealth);
		}
	}

	if (!AbilitySystemComponent || !CharacterData.SkillData)
	{
		return;
	}

	// Swap the granted kit: clear whatever the previous character had, grant this one's — but
	// keep GA_NormalAttack granted (it's the same class for every character; only its combo
	// data changes, pushed into the retained instance below).
	UGA_NormalAttack* RetainedNormalAttack = nullptr;
	TArray<FGameplayAbilitySpecHandle> HandlesToClear;
	for (const FGameplayAbilitySpec& Spec : AbilitySystemComponent->GetActivatableAbilities())
	{
		if (UGA_NormalAttack* NormalAttack = Cast<UGA_NormalAttack>(Spec.Ability))
		{
			RetainedNormalAttack = NormalAttack;
			continue;
		}
		HandlesToClear.Add(Spec.Handle);
	}
	for (const FGameplayAbilitySpecHandle& Handle : HandlesToClear)
	{
		AbilitySystemComponent->ClearAbility(Handle);
	}

	DefaultAbilities.Reset();
	if (UClass* SkillClass = CharacterData.SkillData->ElementalSkill.AbilityClass.LoadSynchronous())
	{
		DefaultAbilities.Add(SkillClass);
	}
	if (UClass* BurstClass = CharacterData.SkillData->ElementalBurst.AbilityClass.LoadSynchronous())
	{
		DefaultAbilities.Add(BurstClass);
	}
	for (const FSkillData& Passive : CharacterData.SkillData->PassiveSkills)
	{
		if (UClass* PassiveClass = Passive.AbilityClass.LoadSynchronous())
		{
			DefaultAbilities.Add(PassiveClass);
		}
	}

	Skill1SkillTag = CharacterData.SkillData->ElementalSkill.SkillTag;
	Skill2SkillTag = CharacterData.SkillData->ElementalBurst.SkillTag;

	AbilitySystemComponent->GrantDefaultAbilities(DefaultAbilities);

	if (RetainedNormalAttack)
	{
		RetainedNormalAttack->NormalAttackCombo = CharacterData.SkillData->NormalAttackCombo;
		RetainedNormalAttack->WeaponType = CharacterData.WeaponType;
		// Catalyst normal attacks are elemental; every other weapon type's normal attack is
		// physical unless a specific character/weapon passive infuses it (set that on
		// RetainedNormalAttack->SkillData.Element afterwards from Blueprint if so).
		RetainedNormalAttack->SkillData.Element =
			(CharacterData.WeaponType == EWeaponType::Catalyst) ? CharacterData.Element : EStickmanElement::None;
	}
}

void AStickmanCharacter::BeginPlay()
{
	Super::BeginPlay();

	CurrentStamina = Stats.MaxStamina;
	CurrentBreath = MaxBreath;
	CameraBoom->TargetArmLength = FMath::Clamp(CameraBoom->TargetArmLength, MinCameraBoomLength, MaxCameraBoomLength);
	FollowCamera->SetFieldOfView(WalkFOV);
	CurrentMovementTag = StickmanGameplayTags::State_Movement_Idle;

	if (AbilitySystemComponent)
	{
		AbilitySystemComponent->InitAbilityActorInfo(this, this);
		if (AttributeSet)
		{
			AttributeSet->InitHealth(Stats.MaxHealth);
			AttributeSet->InitMaxHealth(Stats.MaxHealth);
			AttributeSet->InitStamina(Stats.MaxStamina);
			AttributeSet->InitMaxStamina(Stats.MaxStamina);
			AttributeSet->InitAttack(Stats.Attack);
			AttributeSet->InitDefense(Stats.Defense);
			AttributeSet->InitElementalMastery(Stats.ElementalMastery);
			AttributeSet->InitEnergyRecharge(Stats.EnergyRecharge);
			if (EquipmentManager)
			{
				EquipmentManager->ApplyTotalsToAttributeSet(AttributeSet, Stats.Attack, Stats.Defense, Stats.MaxHealth);
			}
		}
		AbilitySystemComponent->GrantDefaultAbilities(DefaultAbilities);
	}

	if (APlayerController* PC = Cast<APlayerController>(GetController()))
	{
		if (UEnhancedInputLocalPlayerSubsystem* Subsystem =
				ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(PC->GetLocalPlayer()))
		{
			if (DefaultMappingContext)
			{
				Subsystem->AddMappingContext(DefaultMappingContext, 0);
			}
		}
	}
}

void AStickmanCharacter::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	TickDash(DeltaSeconds);
	TickStaminaRegen(DeltaSeconds);
	TickCamera(DeltaSeconds);
	TickClimbing(DeltaSeconds);
	TickGliding(DeltaSeconds);
	TickSwimming(DeltaSeconds);
	UpdateMovementStateTag();
	ShowDebugOnScreen();
}

void AStickmanCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);

	if (UEnhancedInputComponent* EIC = Cast<UEnhancedInputComponent>(PlayerInputComponent))
	{
		if (MoveAction)
		{
			EIC->BindAction(MoveAction, ETriggerEvent::Triggered, this, &AStickmanCharacter::Move);
		}
		if (LookAction)
		{
			EIC->BindAction(LookAction, ETriggerEvent::Triggered, this, &AStickmanCharacter::Look);
		}
		if (JumpAction)
		{
			EIC->BindAction(JumpAction, ETriggerEvent::Started, this, &AStickmanCharacter::Jump);
			EIC->BindAction(JumpAction, ETriggerEvent::Completed, this, &ACharacter::StopJumping);
		}
		if (SprintAction)
		{
			EIC->BindAction(SprintAction, ETriggerEvent::Started, this, &AStickmanCharacter::StartSprint);
			EIC->BindAction(SprintAction, ETriggerEvent::Completed, this, &AStickmanCharacter::StopSprint);
		}
		if (DashAction)
		{
			EIC->BindAction(DashAction, ETriggerEvent::Started, this, &AStickmanCharacter::Dash);
		}
		if (NormalAttackAction)
		{
			EIC->BindAction(NormalAttackAction, ETriggerEvent::Started, this, &AStickmanCharacter::OnNormalAttack);
		}
		if (Skill1Action)
		{
			EIC->BindAction(Skill1Action, ETriggerEvent::Started, this, &AStickmanCharacter::OnSkill1);
		}
		if (Skill2Action)
		{
			EIC->BindAction(Skill2Action, ETriggerEvent::Started, this, &AStickmanCharacter::OnSkill2);
		}
		if (InteractAction)
		{
			EIC->BindAction(InteractAction, ETriggerEvent::Started, this, &AStickmanCharacter::OnInteract);
		}
		if (ZoomAction)
		{
			EIC->BindAction(ZoomAction, ETriggerEvent::Triggered, this, &AStickmanCharacter::Zoom);
		}
		if (DiveAction)
		{
			EIC->BindAction(DiveAction, ETriggerEvent::Started, this, &AStickmanCharacter::ToggleDive);
		}

		if (GEngine)
		{
			GEngine->AddOnScreenDebugMessage(-1, 5.f, FColor::Green,
				TEXT("[StickmanCharacter] Enhanced Input bound OK."));
		}
	}
	else if (GEngine)
	{
		GEngine->AddOnScreenDebugMessage(-1, 5.f, FColor::Red,
			TEXT("[StickmanCharacter] Enhanced Input FAILED: PlayerInputComponent is not a UEnhancedInputComponent."));
	}
}

// -------------------------------------------------------------------
// Movement
// -------------------------------------------------------------------

void AStickmanCharacter::Move(const FInputActionValue& Value)
{
	const FVector2D Axis = Value.Get<FVector2D>();
	CachedMoveInput = Axis;
	if (!Controller || (Axis.X == 0.f && Axis.Y == 0.f))
	{
		return;
	}

	if (bIsClimbing)
	{
		// On the wall: Y = up/down the wall face, X = sideways along it.
		const FVector ClimbUp = FVector::UpVector;
		const FVector ClimbRight = FVector::CrossProduct(ClimbWallNormal, ClimbUp).GetSafeNormal();
		AddMovementInput(ClimbUp, Axis.Y);
		AddMovementInput(ClimbRight, Axis.X);
		return;
	}

	if (bIsGliding)
	{
		// While gliding, forward/back pitches the glide (handled in TickGliding via
		// CachedMoveInput.Y); left/right still steers normally.
		const FRotator YawRotation(0.f, Controller->GetControlRotation().Yaw, 0.f);
		const FVector RightDir = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::Y);
		AddMovementInput(RightDir, Axis.X);
		return;
	}

	// Movement is relative to the controller's yaw so "forward" always means "camera forward".
	const FRotator YawRotation(0.f, Controller->GetControlRotation().Yaw, 0.f);
	const FVector ForwardDir = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::X);
	const FVector RightDir = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::Y);

	AddMovementInput(ForwardDir, Axis.Y);
	AddMovementInput(RightDir, Axis.X);
}

void AStickmanCharacter::Look(const FInputActionValue& Value)
{
	const FVector2D Axis = Value.Get<FVector2D>();
	CachedLookInput = Axis;
	AddControllerYawInput(Axis.X);
	AddControllerPitchInput(Axis.Y);
}

void AStickmanCharacter::Zoom(const FInputActionValue& Value)
{
	const float AxisValue = Value.Get<float>();
	CameraBoom->TargetArmLength = FMath::Clamp(
		CameraBoom->TargetArmLength - AxisValue * 25.f, MinCameraBoomLength, MaxCameraBoomLength);
}

void AStickmanCharacter::StartSprint()
{
	if (bIsDashing || CurrentStamina <= 0.f)
	{
		return;
	}
	bWantsToSprint = true;
	GetCharacterMovement()->MaxWalkSpeed = SprintSpeed;
}

void AStickmanCharacter::StopSprint()
{
	bWantsToSprint = false;
	GetCharacterMovement()->MaxWalkSpeed = WalkSpeed;
}

void AStickmanCharacter::Jump()
{
	if (bIsClimbing)
	{
		JumpOffWall();
		return;
	}

	// ACharacter's built-in jump only fires while airborne if bIsCrouched/movement mode allows
	// a single jump. We add a manual counter so a second press mid-air launches an extra jump.
	if (CurrentJumpCount >= MaxJumpCount)
	{
		// A third press while still airborne deploys the glider instead of doing nothing.
		if (!bIsGliding && GetCharacterMovement()->IsFalling())
		{
			DeployGlider();
		}
		return;
	}

	if (CurrentJumpCount > 0)
	{
		// Re-launch: cancel falling velocity on Z before re-applying jump impulse.
		LaunchCharacter(FVector(0.f, 0.f, GetCharacterMovement()->JumpZVelocity), false, true);
	}
	else
	{
		Super::Jump();
	}
	++CurrentJumpCount;
}

void AStickmanCharacter::Dash()
{
	if (bIsDashing || bDashOnCooldown || CurrentStamina < DashStaminaCost)
	{
		return;
	}

	FVector DashDirection = GetLastMovementInputVector();
	if (DashDirection.IsNearlyZero())
	{
		DashDirection = GetActorForwardVector();
	}
	DashDirection.Z = 0.f;
	DashDirection.Normalize();

	DashStartLocation = GetActorLocation();
	DashTargetLocation = DashStartLocation + DashDirection * DashDistance;
	DashElapsedTime = 0.f;
	bIsDashing = true;

	ConsumeStamina(DashStaminaCost);

	// Dashing ignores normal ground friction/acceleration while it's driving the actor directly.
	GetCharacterMovement()->SetMovementMode(MOVE_Flying);

	if (DashCameraShakeClass)
	{
		if (APlayerController* PC = Cast<APlayerController>(GetController()))
		{
			PC->ClientStartCameraShake(DashCameraShakeClass);
		}
	}

	bDashOnCooldown = true;
	GetWorldTimerManager().SetTimer(DashCooldownTimerHandle, [this]() { bDashOnCooldown = false; },
		DashCooldown, false);
}

void AStickmanCharacter::TickDash(float DeltaSeconds)
{
	if (!bIsDashing)
	{
		return;
	}

	DashElapsedTime += DeltaSeconds;
	float Alpha = FMath::Clamp(DashElapsedTime / DashDuration, 0.f, 1.f);
	if (DashCurve)
	{
		Alpha = DashCurve->GetFloatValue(Alpha);
	}

	const FVector NewLocation = FMath::Lerp(DashStartLocation, DashTargetLocation, Alpha);
	FHitResult Hit;
	SetActorLocation(NewLocation, true, &Hit);

	if (DashElapsedTime >= DashDuration || Hit.bBlockingHit)
	{
		bIsDashing = false;
		GetCharacterMovement()->SetMovementMode(MOVE_Falling);
	}
}

// -------------------------------------------------------------------
// Stamina
// -------------------------------------------------------------------

void AStickmanCharacter::ConsumeStamina(float Amount)
{
	if (UStickmanCheatManager::IsInfiniteStaminaEnabled())
	{
		return;
	}
	CurrentStamina = FMath::Clamp(CurrentStamina - Amount, 0.f, Stats.MaxStamina);
	TimeSinceStaminaUse = 0.f;
}

void AStickmanCharacter::TickStaminaRegen(float DeltaSeconds)
{
	if (bWantsToSprint && CurrentStamina > 0.f)
	{
		CurrentStamina = FMath::Clamp(CurrentStamina - SprintStaminaDrainRate * DeltaSeconds, 0.f, Stats.MaxStamina);
		TimeSinceStaminaUse = 0.f;
		if (CurrentStamina <= 0.f)
		{
			StopSprint();
		}
		return;
	}

	TimeSinceStaminaUse += DeltaSeconds;
	if (TimeSinceStaminaUse >= StaminaRegenDelay && CurrentStamina < Stats.MaxStamina)
	{
		CurrentStamina = FMath::Clamp(CurrentStamina + StaminaRegenRate * DeltaSeconds, 0.f, Stats.MaxStamina);
	}
}

// -------------------------------------------------------------------
// Camera
// -------------------------------------------------------------------

void AStickmanCharacter::TickCamera(float DeltaSeconds)
{
	CameraBoom->CameraLagSpeed = CameraLagSpeedValue;

	const float TargetFOV = bWantsToSprint ? SprintFOV : WalkFOV;
	FollowCamera->SetFieldOfView(
		FMath::FInterpTo(FollowCamera->FieldOfView, TargetFOV, DeltaSeconds, FOVInterpSpeed));
}

// -------------------------------------------------------------------
// Exploration: Climbing
// -------------------------------------------------------------------

bool AStickmanCharacter::TraceForClimbableWall(FHitResult& OutHit) const
{
	const FVector Start = GetActorLocation();
	const FVector End = Start + GetActorForwardVector() * WallCheckDistance;

	FCollisionQueryParams QueryParams;
	QueryParams.AddIgnoredActor(this);

	if (!GetWorld()->LineTraceSingleByChannel(OutHit, Start, End, ECC_WorldStatic, QueryParams))
	{
		return false;
	}
	return OutHit.GetActor() && OutHit.GetActor()->ActorHasTag(ClimbableTag);
}

void AStickmanCharacter::TickClimbing(float DeltaSeconds)
{
	if (bIsClimbing)
	{
		// Stop climbing if the wall's gone, we've run out of stamina, or drifted off it.
		FHitResult WallHit;
		if (CurrentStamina <= 0.f || !TraceForClimbableWall(WallHit))
		{
			StopClimbing();
			return;
		}
		ClimbWallNormal = WallHit.Normal;

		GetCharacterMovement()->Velocity.Z = 0.f; // Suppress gravity while glued to the wall.
		ConsumeStamina(ClimbStaminaDrainRate * DeltaSeconds);
		return;
	}

	// Auto-start: airborne (jumping/falling) and facing a climbable wall closely.
	if (!GetCharacterMovement()->IsFalling() || CurrentStamina <= 0.f)
	{
		return;
	}
	FHitResult WallHit;
	if (TraceForClimbableWall(WallHit))
	{
		StartClimbing(WallHit);
	}
}

void AStickmanCharacter::StartClimbing(const FHitResult& WallHit)
{
	bIsClimbing = true;
	ClimbWallNormal = WallHit.Normal;
	CurrentJumpCount = 0; // A fresh climb resets the jump/glide chain for when they let go.
	GetCharacterMovement()->SetMovementMode(MOVE_Flying);
	GetCharacterMovement()->MaxFlySpeed = ClimbSpeed;
}

void AStickmanCharacter::StopClimbing()
{
	if (!bIsClimbing)
	{
		return;
	}
	bIsClimbing = false;
	GetCharacterMovement()->SetMovementMode(MOVE_Falling);
}

void AStickmanCharacter::JumpOffWall()
{
	if (!bIsClimbing)
	{
		return;
	}
	const FVector LaunchVelocity = ClimbWallNormal * WallJumpOffForce + FVector(0.f, 0.f, WallJumpOffForce * 0.6f);
	StopClimbing();
	LaunchCharacter(LaunchVelocity, true, true);
}

void AStickmanCharacter::SlideDownWall()
{
	if (!bIsClimbing)
	{
		return;
	}
	// Fast, stamina-free descent: just drop straight down at SlideDownSpeed until they let go
	// (TickClimbing's normal exit conditions — losing the wall trace — end the slide).
	GetCharacterMovement()->Velocity = FVector(0.f, 0.f, -SlideDownSpeed);
}

// -------------------------------------------------------------------
// Exploration: Gliding
// -------------------------------------------------------------------

void AStickmanCharacter::DeployGlider()
{
	if (bIsClimbing || GetCharacterMovement()->IsMovingOnGround())
	{
		return;
	}
	bIsGliding = true;
	GetCharacterMovement()->SetMovementMode(MOVE_Falling);
	GetCharacterMovement()->GravityScale = 0.15f;
	GetCharacterMovement()->Velocity.Z = FMath::Max(GetCharacterMovement()->Velocity.Z, -GlideDescentRate);
}

void AStickmanCharacter::StopGliding()
{
	if (!bIsGliding)
	{
		return;
	}
	bIsGliding = false;
	GetCharacterMovement()->GravityScale = 1.f;

	if (LandingRollMontage && GetMesh() && GetMesh()->GetAnimInstance())
	{
		GetMesh()->GetAnimInstance()->Montage_Play(LandingRollMontage);
	}
}

void AStickmanCharacter::TickGliding(float DeltaSeconds)
{
	if (!bIsGliding)
	{
		return;
	}

	if (GetCharacterMovement()->IsMovingOnGround())
	{
		StopGliding();
		return;
	}
	if (CurrentStamina <= 0.f)
	{
		StopGliding();
		return;
	}

	ConsumeStamina(GlideStaminaDrainRate * DeltaSeconds);

	// Pitch control: forward/back Move input dives (faster descent, more forward speed) or
	// pulls up (slower descent) — CachedMoveInput.Y reuses the same axis as ground movement.
	const float PitchInput = CachedMoveInput.Y;
	const float DescentRate = GlideDescentRate * (1.f - PitchInput * 0.5f);
	const float ForwardSpeed = GlideForwardSpeed * (1.f + FMath::Max(PitchInput, 0.f) * 0.5f);

	const FVector Forward = GetActorForwardVector();
	FVector NewVelocity = Forward * ForwardSpeed;
	NewVelocity.Z = -DescentRate;
	GetCharacterMovement()->Velocity = FVector(NewVelocity.X, NewVelocity.Y, NewVelocity.Z);
}

// -------------------------------------------------------------------
// Exploration: Swimming
// -------------------------------------------------------------------

void AStickmanCharacter::ToggleDive()
{
	if (!GetCharacterMovement()->IsSwimming())
	{
		return;
	}
	bWantsToDive = !bWantsToDive;
	GetCharacterMovement()->Buoyancy = bWantsToDive ? DiveBuoyancy : SurfaceBuoyancy;
}

void AStickmanCharacter::TickSwimming(float DeltaSeconds)
{
	const bool bIsSwimmingNow = GetCharacterMovement()->IsSwimming();

	if (bIsSwimmingNow)
	{
		ConsumeStamina(SwimStaminaDrainRate * DeltaSeconds);

		if (bWantsToDive)
		{
			CurrentBreath = FMath::Max(CurrentBreath - DeltaSeconds, 0.f);
			if (CurrentBreath <= 0.f && AttributeSet)
			{
				const float NewHealth = FMath::Max(AttributeSet->GetHealth() - DrowningDamagePerSecond * DeltaSeconds, 0.f);
				AttributeSet->SetHealth(NewHealth);
				AttributeSet->OnHealthChanged.Broadcast(NewHealth, AttributeSet->GetMaxHealth());
			}
		}
		else
		{
			CurrentBreath = FMath::Min(CurrentBreath + DeltaSeconds * 2.f, MaxBreath); // Recover breath fast at the surface.
		}
	}
	else if (bWasSwimmingLastTick)
	{
		// Just left the water — reset for next time rather than leaving stale dive state.
		bWantsToDive = false;
		CurrentBreath = MaxBreath;
	}

	bWasSwimmingLastTick = bIsSwimmingNow;
}

// -------------------------------------------------------------------
// Movement state (GameplayTags)
// -------------------------------------------------------------------

void AStickmanCharacter::UpdateMovementStateTag()
{
	using namespace StickmanGameplayTags;

	FGameplayTag NewTag = State_Movement_Idle;
	const UCharacterMovementComponent* Movement = GetCharacterMovement();

	if (bIsDashing)
	{
		NewTag = State_Movement_Dashing;
	}
	else if (bIsClimbing)
	{
		NewTag = State_Movement_Climbing;
	}
	else if (bIsGliding)
	{
		NewTag = State_Movement_Gliding;
	}
	else if (Movement->IsSwimming())
	{
		NewTag = State_Movement_Swimming;
	}
	else if (Movement->IsFalling())
	{
		NewTag = (Movement->Velocity.Z > 0.f) ? State_Movement_Jumping : State_Movement_Falling;
	}
	else if (bWantsToSprint && !Movement->GetLastInputVector().IsNearlyZero())
	{
		NewTag = State_Movement_Sprinting;
	}
	else if (!GetVelocity().IsNearlyZero())
	{
		NewTag = State_Movement_Walking;
	}

	if (Movement->IsMovingOnGround())
	{
		CurrentJumpCount = 0;
	}

	CurrentMovementTag = NewTag;
}

// -------------------------------------------------------------------
// Combat / interaction stubs — real logic wired up by SkillSystem & Combat modules.
// -------------------------------------------------------------------

void AStickmanCharacter::OnNormalAttack()
{
	if (!AbilitySystemComponent || !AbilitySystemComponent->ActivateOrQueueComboSkill(NormalAttackSkillTag))
	{
		if (GEngine)
		{
			GEngine->AddOnScreenDebugMessage(-1, 1.f, FColor::White, TEXT("NormalAttack (no ability granted for NormalAttackSkillTag)"));
		}
	}
}

void AStickmanCharacter::OnSkill1()
{
	if (!AbilitySystemComponent || !AbilitySystemComponent->ActivateSkillByTag(Skill1SkillTag))
	{
		if (GEngine)
		{
			GEngine->AddOnScreenDebugMessage(-1, 1.f, FColor::Cyan, TEXT("Skill1 (no ability granted for Skill1SkillTag)"));
		}
	}
}

void AStickmanCharacter::OnSkill2()
{
	if (!AbilitySystemComponent || !AbilitySystemComponent->ActivateSkillByTag(Skill2SkillTag))
	{
		if (GEngine)
		{
			GEngine->AddOnScreenDebugMessage(-1, 1.f, FColor::Magenta, TEXT("Skill2 (no ability granted for Skill2SkillTag)"));
		}
	}
}

void AStickmanCharacter::OnInteract()
{
	FVector TraceStart = GetActorLocation();
	FVector TraceEnd = TraceStart + GetActorForwardVector() * InteractRange;

	FHitResult Hit;
	FCollisionQueryParams QueryParams;
	QueryParams.AddIgnoredActor(this);
	const bool bHit = GetWorld()->SweepSingleByChannel(Hit, TraceStart, TraceEnd, FQuat::Identity, ECC_Pawn,
		FCollisionShape::MakeSphere(InteractSphereRadius), QueryParams);

	AActor* HitActor = bHit ? Hit.GetActor() : nullptr;
	if (!HitActor)
	{
		return;
	}

	if (HitActor->Implements<UStickmanInteractable>())
	{
		IStickmanInteractable::Execute_Interact(HitActor, this);
		return;
	}

	if (UActorComponent* InteractableComponent = HitActor->FindComponentByInterface(UStickmanInteractable::StaticClass()))
	{
		IStickmanInteractable::Execute_Interact(InteractableComponent, this);
	}
}

void AStickmanCharacter::ShowDebugOnScreen() const
{
	if (!GEngine)
	{
		return;
	}
	GEngine->AddOnScreenDebugMessage(1, 0.f, FColor::White,
		FString::Printf(TEXT("Stamina: %.0f / %.0f"), CurrentStamina, Stats.MaxStamina));
	GEngine->AddOnScreenDebugMessage(2, 0.f, FColor::White,
		FString::Printf(TEXT("MoveState: %s"), *CurrentMovementTag.ToString()));
}
