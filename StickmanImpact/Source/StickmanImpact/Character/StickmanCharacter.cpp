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
#include "InputMappingContext.h"
#include "InputAction.h"
#include "InputModifiers.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "StickmanVisuals/StickmanBodyComponent.h"
#include "UObject/ConstructorHelpers.h"
#include "Curves/CurveFloat.h"
#include "Engine/Engine.h"
#include "Combat/StickmanAbilitySystemComponent.h"
#include "Combat/StickmanAttributeSet.h"
#include "Combat/Abilities/GA_NormalAttack.h"
#include "SkillSystem/StickmanSkillDataAsset.h"
#include "Party/StickmanPartyTypes.h"
#include "Equipment/EquipmentManager.h"
#include "GameFlow/StickmanCheatManager.h"
#include "UI/Menus/SettingsScreenWidget.h"
#include "Combat/DefenseComponent.h"
#include "Combat/WeaponSwapComponent.h"
#include "Movement/GrapplingHookComponent.h"
#include "Movement/AerialMovementComponent.h"
#include "Movement/FlowStateComponent.h"
#include "Combat/Awakening/AwakeningComponent.h"
#include "StickmanInteractable.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "GameFramework/SpringArmComponent.h"

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
	Movement->RotationRate = FRotator(0.f, WalkRotationRate, 0.f);
	Movement->JumpZVelocity = 500.f;
	Movement->AirControl = 0.35f;
	Movement->MaxWalkSpeed = WalkSpeed;

	// Momentum & inertia: soft friction/braking gives drift-on-stop instead of a hard snap;
	// separate braking friction so acceleration feel and stopping feel tune independently.
	Movement->GroundFriction = GroundFrictionValue;
	Movement->BrakingDecelerationWalking = BrakingDeceleration;
	Movement->bUseSeparateBrakingFriction = true;
	Movement->BrakingFriction = 1.5f;
	Movement->MaxAcceleration = 1500.f; // Gradual ramp-up; pair with an accel curve in the AnimBP.
	Movement->MaxStepHeight = 55.f; // Auto-step small ledges without a vault.

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

	DefenseComponent = CreateDefaultSubobject<UDefenseComponent>(TEXT("DefenseComponent"));

	WeaponSwapComponent = CreateDefaultSubobject<UWeaponSwapComponent>(TEXT("WeaponSwapComponent"));

	GrapplingHookComponent = CreateDefaultSubobject<UGrapplingHookComponent>(TEXT("GrapplingHookComponent"));
	AerialMovementComponent = CreateDefaultSubobject<UAerialMovementComponent>(TEXT("AerialMovementComponent"));
	FlowStateComponent = CreateDefaultSubobject<UFlowStateComponent>(TEXT("FlowStateComponent"));

	AwakeningComponent = CreateDefaultSubobject<UAwakeningComponent>(TEXT("AwakeningComponent"));

	// DEV placeholder (revert before ship): a cube stand-in sized to the capsule so the pawn is
	// visible with no skeletal mesh authored. Hidden in BeginPlay if a real mesh is set.
	DevPlaceholderMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("DevPlaceholderMesh"));
	DevPlaceholderMesh->SetupAttachment(RootComponent);
	DevPlaceholderMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	DevPlaceholderMesh->SetRelativeScale3D(FVector(0.4f, 0.4f, 1.76f)); // ~20r x 88 half-height
	static ConstructorHelpers::FObjectFinder<UStaticMesh> DevCube(TEXT("/Engine/BasicShapes/Cube.Cube"));
	if (DevCube.Succeeded())
	{
		DevPlaceholderMesh->SetStaticMesh(DevCube.Object);
	}
	// The procedural stickman body is the real visual now, so the flat cube starts hidden.
	DevPlaceholderMesh->SetVisibility(false);

	// Procedural stickman silhouette (blue = player). Attaches to the capsule root.
	PlayerBody = CreateDefaultSubobject<UStickmanBodyComponent>(TEXT("PlayerBody"));
	PlayerBody->SetupAttachment(RootComponent);
	PlayerBody->BodyColor = FLinearColor(0.15f, 0.45f, 0.95f);
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

	// DEV: code-generate input + hide placeholder if a real mesh got assigned (see header).
	BuildFallbackInput();
	const bool bHasRealMesh = GetMesh() && GetMesh()->GetSkeletalMeshAsset() != nullptr;
	if (DevPlaceholderMesh)
	{
		DevPlaceholderMesh->SetVisibility(false); // superseded by the stickman body
	}
	if (PlayerBody)
	{
		// Show the procedural body unless a real skeletal mesh has been authored.
		PlayerBody->SetBodyHidden(bHasRealMesh);
	}

	// DEV: drop a few enemies in front so the world isn't empty (press B for more).
	if (Cast<APlayerController>(GetController()))
	{
		const FVector Base = GetActorLocation() + FVector(600.f, 0.f, 0.f);
		DevSpawnEnemyAt(Base + FVector(0.f, -200.f, 0.f));
		DevSpawnEnemyAt(Base);
		DevSpawnEnemyAt(Base + FVector(0.f,  200.f, 0.f));
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
	TickCameraDynamics(DeltaSeconds);
	TickClimbing(DeltaSeconds);
	TickGliding(DeltaSeconds);
	TickSwimming(DeltaSeconds);
	TickInputBuffer(DeltaSeconds);
	TickAutoVault();
	TickWallRun(DeltaSeconds);
	TickSlide(DeltaSeconds);
	UpdateMovementStateTag();
	ShowDebugOnScreen();

	TimeSinceLanded += DeltaSeconds;
	TimeSinceLookInput += DeltaSeconds;
	if (GetCharacterMovement()->IsFalling() && GetVelocity().Z >= 0.f)
	{
		FallStartHeight = GetActorLocation().Z; // Track apex for roll-landing fall height.
	}
}

void AStickmanCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);

	BuildFallbackInput(); // DEV: ensure the InputActions exist before binding (no-op if IMC asset set).

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
		if (ParryAction)
		{
			EIC->BindAction(ParryAction, ETriggerEvent::Started, this, &AStickmanCharacter::Parry);
		}
		if (WeaponSwapAction)
		{
			EIC->BindAction(WeaponSwapAction, ETriggerEvent::Started, this, &AStickmanCharacter::OnWeaponSwap);
		}
		if (GrappleAction)
		{
			EIC->BindAction(GrappleAction, ETriggerEvent::Started, this, &AStickmanCharacter::OnGrapple);
		}
		if (AirDashAction)
		{
			EIC->BindAction(AirDashAction, ETriggerEvent::Started, this, &AStickmanCharacter::OnAirDash);
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

		// DEV binds: V = TPS/FPS toggle, B = spawn enemy ahead.
		if (DevCameraToggleAction)
		{
			EIC->BindAction(DevCameraToggleAction, ETriggerEvent::Started, this, &AStickmanCharacter::DevToggleCameraMode);
		}
		if (DevSpawnEnemyAction)
		{
			EIC->BindAction(DevSpawnEnemyAction, ETriggerEvent::Started, this, &AStickmanCharacter::DevSpawnEnemy);
		}

		if (GEngine)
		{
			GEngine->AddOnScreenDebugMessage(-1, 5.f, FColor::Green,
				TEXT("[StickmanCharacter] Input bound. V=TPS/FPS  B=spawn enemy"));
		}
	}
	else if (GEngine)
	{
		GEngine->AddOnScreenDebugMessage(-1, 5.f, FColor::Red,
			TEXT("[StickmanCharacter] Enhanced Input FAILED: PlayerInputComponent is not a UEnhancedInputComponent."));
	}
}

// ============================ DEV PLACEHOLDER (revert before ship) ============================
void AStickmanCharacter::BuildFallbackInput()
{
	if (DefaultMappingContext)
	{
		return; // A real IMC asset is assigned — use it, do nothing.
	}

	UInputMappingContext* IMC = NewObject<UInputMappingContext>(this, TEXT("IMC_DevFallback"));

	auto MakeAction = [this](const TCHAR* Name, EInputActionValueType Type) -> UInputAction*
	{
		UInputAction* IA = NewObject<UInputAction>(this, Name);
		IA->ValueType = Type;
		return IA;
	};

	MoveAction         = MakeAction(TEXT("IA_Move"),     EInputActionValueType::Axis2D);
	LookAction         = MakeAction(TEXT("IA_Look"),     EInputActionValueType::Axis2D);
	JumpAction         = MakeAction(TEXT("IA_Jump"),     EInputActionValueType::Boolean);
	SprintAction       = MakeAction(TEXT("IA_Sprint"),   EInputActionValueType::Boolean);
	DashAction         = MakeAction(TEXT("IA_Dash"),     EInputActionValueType::Boolean);
	ParryAction        = MakeAction(TEXT("IA_Parry"),    EInputActionValueType::Boolean);
	NormalAttackAction = MakeAction(TEXT("IA_Attack"),   EInputActionValueType::Boolean);
	Skill1Action       = MakeAction(TEXT("IA_Skill1"),   EInputActionValueType::Boolean);
	Skill2Action       = MakeAction(TEXT("IA_Skill2"),   EInputActionValueType::Boolean);
	InteractAction     = MakeAction(TEXT("IA_Interact"), EInputActionValueType::Boolean);

	// Move is Axis2D. Default key drives X; a YXZ swizzle moves a key onto Y (forward/back).
	auto Swizzle = [this](FEnhancedActionKeyMapping& M)
	{
		UInputModifierSwizzleAxis* Sw = NewObject<UInputModifierSwizzleAxis>(this);
		Sw->Order = EInputAxisSwizzle::YXZ;
		M.Modifiers.Add(Sw);
	};
	auto Negate = [this](FEnhancedActionKeyMapping& M)
	{
		M.Modifiers.Add(NewObject<UInputModifierNegate>(this));
	};

	Swizzle(IMC->MapKey(MoveAction, EKeys::W));                                              // +Y forward
	{ FEnhancedActionKeyMapping& M = IMC->MapKey(MoveAction, EKeys::S); Swizzle(M); Negate(M); } // -Y back
	IMC->MapKey(MoveAction, EKeys::D);                                                       // +X right
	Negate(IMC->MapKey(MoveAction, EKeys::A));                                               // -X left

	IMC->MapKey(LookAction, EKeys::Mouse2D); // mouse X/Y delta

	IMC->MapKey(JumpAction,         EKeys::SpaceBar);
	IMC->MapKey(SprintAction,       EKeys::LeftShift);
	IMC->MapKey(DashAction,         EKeys::LeftControl);
	IMC->MapKey(ParryAction,        EKeys::RightMouseButton);
	IMC->MapKey(NormalAttackAction, EKeys::LeftMouseButton);
	IMC->MapKey(Skill1Action,       EKeys::Q);
	IMC->MapKey(Skill2Action,       EKeys::E);
	IMC->MapKey(InteractAction,     EKeys::F);

	// Dev extras.
	DevCameraToggleAction = MakeAction(TEXT("IA_DevCamToggle"),  EInputActionValueType::Boolean);
	DevSpawnEnemyAction   = MakeAction(TEXT("IA_DevSpawnEnemy"), EInputActionValueType::Boolean);
	IMC->MapKey(DevCameraToggleAction, EKeys::V);
	IMC->MapKey(DevSpawnEnemyAction,   EKeys::B);

	DefaultMappingContext = IMC; // Assign last so a second call short-circuits (idempotent).

	if (GEngine)
	{
		GEngine->AddOnScreenDebugMessage(-1, 6.f, FColor::Yellow,
			TEXT("[StickmanCharacter] DEV fallback input built (WASD/Mouse/Space/Shift/Ctrl/RMB/LMB/Q/E/F)."));
	}
}

void AStickmanCharacter::DevToggleCameraMode()
{
	bDevFirstPerson = !bDevFirstPerson;
	if (CameraBoom)
	{
		// TPS: 300u boom behind, at capsule center. FPS: boom collapsed, raised to head height.
		CameraBoom->TargetArmLength = bDevFirstPerson ? 0.f : 300.f;
		CameraBoom->SetRelativeLocation(FVector(0.f, 0.f, bDevFirstPerson ? 60.f : 0.f));
	}
	if (PlayerBody)
	{
		PlayerBody->SetBodyHidden(bDevFirstPerson); // hide own body in FPS so it doesn't block view
	}
	if (GEngine)
	{
		GEngine->AddOnScreenDebugMessage(-1, 2.f, FColor::Cyan,
			bDevFirstPerson ? TEXT("Camera: FPS") : TEXT("Camera: TPS"));
	}
}

void AStickmanCharacter::DevSpawnEnemy()
{
	// 500u in front of where the camera is looking.
	const FRotator YawRot(0.f, GetControlRotation().Yaw, 0.f);
	const FVector Ahead = GetActorLocation() + FRotationMatrix(YawRot).GetUnitAxis(EAxis::X) * 500.f;
	DevSpawnEnemyAt(Ahead);
}

void AStickmanCharacter::DevSpawnEnemyAt(const FVector& Location)
{
	UWorld* World = GetWorld();
	if (!World)
	{
		return;
	}
	FActorSpawnParameters Params;
	Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AdjustIfPossibleButAlwaysSpawn;
	AStickmanEnemyCharacter* Enemy = World->SpawnActor<AStickmanEnemyCharacter>(
		AStickmanEnemyCharacter::StaticClass(), Location + FVector(0.f, 0.f, 100.f), FRotator::ZeroRotator, Params);
	if (Enemy && GEngine)
	{
		GEngine->AddOnScreenDebugMessage(-1, 2.f, FColor::Orange, TEXT("Enemy spawned."));
	}
}
// ============================================================================================

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
	if (!Axis.IsNearlyZero())
	{
		TimeSinceLookInput = 0.f; // Manual look defers the auto-recenter.
	}
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
	// Turning radius: sprinting characters can't spin on the spot.
	GetCharacterMovement()->RotationRate = FRotator(0.f, SprintRotationRate, 0.f);
}

void AStickmanCharacter::StopSprint()
{
	bWantsToSprint = false;
	GetCharacterMovement()->MaxWalkSpeed = WalkSpeed;
	GetCharacterMovement()->RotationRate = FRotator(0.f, WalkRotationRate, 0.f);
}

void AStickmanCharacter::Jump()
{
	if (bIsClimbing)
	{
		JumpOffWall();
		return;
	}

	if (bIsWallRunning)
	{
		// Wall-run jump-off: away from the wall + up, keeps run momentum.
		bIsWallRunning = false;
		GetCharacterMovement()->GravityScale = 1.f;
		LaunchCharacter(WallRunNormal * 500.f + FVector(0.f, 0.f, GetCharacterMovement()->JumpZVelocity), false, true);
		return;
	}

	if (bIsDashing)
	{
		// Wave dash: dash + jump together = long ground slide carrying dash speed.
		bIsDashing = false;
		GetCharacterMovement()->SetMovementMode(MOVE_Walking);
		StartSlide(WaveDashSlideMultiplier);
		return;
	}

	// Jump cancel: a jump input during a montage's recovery cuts the montage. Buffered
	// instead if pressed mid-active-frames (montage still under 70% complete).
	if (UAnimInstance* AnimInstance = GetMesh() ? GetMesh()->GetAnimInstance() : nullptr)
	{
		if (UAnimMontage* Current = AnimInstance->GetCurrentActiveMontage())
		{
			const float Position = AnimInstance->Montage_GetPosition(Current);
			if (Position / FMath::Max(Current->GetPlayLength(), 0.01f) > 0.7f)
			{
				AnimInstance->Montage_Stop(0.1f, Current);
			}
			else
			{
				BufferAction(EBufferedAction::Jump);
				return;
			}
		}
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

void AStickmanCharacter::Parry()
{
	if (DefenseComponent && !DefenseComponent->IsGuardBroken())
	{
		DefenseComponent->BeginParry();
	}
}

void AStickmanCharacter::OnWeaponSwap()
{
	if (WeaponSwapComponent)
	{
		WeaponSwapComponent->SwapWeapon();
	}
}

void AStickmanCharacter::OnGrapple()
{
	if (GrapplingHookComponent && GrapplingHookComponent->FireGrapple() && FlowStateComponent)
	{
		FlowStateComponent->NotifyTech(EMovementTech::Grapple);
	}
}

void AStickmanCharacter::OnAirDash()
{
	if (!AerialMovementComponent)
	{
		return;
	}
	// Air context: dash if airborne, else fall through to a double jump.
	const bool bDashed = AerialMovementComponent->TryAirDash(GetLastMovementInputVector());
	if (bDashed)
	{
		if (FlowStateComponent) { FlowStateComponent->NotifyTech(EMovementTech::AirDash); }
	}
	else if (AerialMovementComponent->TryDoubleJump() && FlowStateComponent)
	{
		FlowStateComponent->NotifyTech(EMovementTech::DoubleJump);
	}
}

void AStickmanCharacter::Dash()
{
	// Guard-break lockout freezes all defensive/movement action briefly.
	if (DefenseComponent && DefenseComponent->IsGuardBroken())
	{
		return;
	}

	if (bIsDashing || bDashOnCooldown || CurrentStamina < DashStaminaCost)
	{
		if (bDashOnCooldown)
		{
			BufferAction(EBufferedAction::Dash); // Fires the instant cooldown clears (200ms window).
		}
		return;
	}

	// Dash cancel: dashing cuts any current attack montage — core of the movement-tech kit.
	if (UAnimInstance* AnimInstance = GetMesh() ? GetMesh()->GetAnimInstance() : nullptr)
	{
		if (UAnimMontage* Current = AnimInstance->GetCurrentActiveMontage())
		{
			AnimInstance->Montage_Stop(0.05f, Current);
		}
	}
	StopSlide();

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

	// Defense: opens the dodge i-frame / perfect-dodge window and tracks dodge-spam.
	if (DefenseComponent)
	{
		DefenseComponent->NotifyDodgeStarted();
	}
	// Flow: a dash/slide is a movement tech for the chain.
	if (FlowStateComponent)
	{
		FlowStateComponent->NotifyTech(EMovementTech::Slide);
	}

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
// Locomotion: landing, buffer, parkour, camera dynamics
// -------------------------------------------------------------------

void AStickmanCharacter::Landed(const FHitResult& Hit)
{
	Super::Landed(Hit);
	TimeSinceLanded = 0.f;

	const float FallHeight = FallStartHeight - GetActorLocation().Z;
	const FVector HorizontalVelocity = FVector(GetVelocity().X, GetVelocity().Y, 0.f);

	// Bunny hop: jump buffered within the window = immediate re-jump, FULL momentum kept.
	if (BufferedAction == EBufferedAction::Jump && BufferedActionAge <= BunnyHopWindow)
	{
		BufferedAction = EBufferedAction::None;
		CurrentJumpCount = 0;
		LaunchCharacter(HorizontalVelocity + FVector(0.f, 0.f, GetCharacterMovement()->JumpZVelocity), true, true);
		return;
	}

	// Normal landing keeps a fraction of horizontal momentum instead of engine-default braking.
	GetCharacterMovement()->Velocity = HorizontalVelocity * LandingMomentumKeepFraction;

	if (FallHeight >= RollLandingMinFallHeight)
	{
		// Roll landing eats the recovery; without a montage it still functions (no lockup).
		if (RollLandingMontage && GetMesh() && GetMesh()->GetAnimInstance())
		{
			GetMesh()->GetAnimInstance()->Montage_Play(RollLandingMontage);
		}
		CameraPunchOffset = FMath::Min(FallHeight * LandingCameraPunchScale, 60.f);
	}
	else if (FallHeight > 150.f)
	{
		CameraPunchOffset = FMath::Min(FallHeight * LandingCameraPunchScale * 0.5f, 25.f);
	}
}

void AStickmanCharacter::BufferAction(EBufferedAction Action)
{
	// Priority: Dash > Jump > Attack — a higher-priority buffered action is never overwritten
	// by a lower one inside the same window.
	if (BufferedAction != EBufferedAction::None && Action > BufferedAction)
	{
		return;
	}
	BufferedAction = Action;
	BufferedActionAge = 0.f;
}

void AStickmanCharacter::TickInputBuffer(float DeltaSeconds)
{
	if (BufferedAction == EBufferedAction::None)
	{
		return;
	}
	BufferedActionAge += DeltaSeconds;
	if (BufferedActionAge > InputBufferWindow)
	{
		BufferedAction = EBufferedAction::None;
		return;
	}

	// Try to consume: only when the blocking condition cleared.
	const bool bMontageActive = GetMesh() && GetMesh()->GetAnimInstance()
		&& GetMesh()->GetAnimInstance()->GetCurrentActiveMontage() != nullptr;

	switch (BufferedAction)
	{
		case EBufferedAction::Dash:
			if (!bDashOnCooldown && !bIsDashing)
			{
				BufferedAction = EBufferedAction::None;
				Dash();
			}
			break;
		case EBufferedAction::Jump:
			if (!bMontageActive && GetCharacterMovement()->IsMovingOnGround())
			{
				BufferedAction = EBufferedAction::None;
				Jump();
			}
			break;
		case EBufferedAction::Attack:
			if (!bMontageActive)
			{
				BufferedAction = EBufferedAction::None;
				OnNormalAttack();
			}
			break;
		default:
			break;
	}
}

void AStickmanCharacter::TickAutoVault()
{
	if (!bEnableAutoVault || !GetCharacterMovement()->IsMovingOnGround()
		|| GetVelocity().Size2D() < WalkSpeed * 0.8f || bIsSliding)
	{
		return;
	}

	// Waist-height trace hits an obstacle AND head-height is clear AND the top has landing room.
	const FVector Forward = GetActorForwardVector();
	const FVector Feet = GetActorLocation() - FVector(0.f, 0.f, 60.f);
	FCollisionQueryParams QueryParams;
	QueryParams.AddIgnoredActor(this);

	FHitResult WaistHit;
	if (!GetWorld()->LineTraceSingleByChannel(WaistHit, Feet + FVector(0.f, 0.f, 40.f),
			Feet + FVector(0.f, 0.f, 40.f) + Forward * 80.f, ECC_WorldStatic, QueryParams))
	{
		return;
	}
	FHitResult HeadHit;
	const FVector HeadStart = Feet + FVector(0.f, 0.f, MaxVaultHeight + 20.f);
	if (GetWorld()->LineTraceSingleByChannel(HeadHit, HeadStart, HeadStart + Forward * 120.f,
			ECC_WorldStatic, QueryParams))
	{
		return; // Too tall to vault.
	}
	FHitResult TopHit;
	const FVector TopStart = HeadStart + Forward * 100.f;
	if (!GetWorld()->LineTraceSingleByChannel(TopHit, TopStart, TopStart - FVector(0.f, 0.f, MaxVaultHeight + 40.f),
			ECC_WorldStatic, QueryParams))
	{
		return; // Nothing to land on behind the lip.
	}

	if (VaultMontage && GetMesh() && GetMesh()->GetAnimInstance())
	{
		GetMesh()->GetAnimInstance()->Montage_Play(VaultMontage);
	}
	SetActorLocation(TopHit.ImpactPoint + FVector(0.f, 0.f, 90.f), false, nullptr, ETeleportType::TeleportPhysics);
	GetCharacterMovement()->Velocity = Forward * GetVelocity().Size2D(); // Momentum through the vault.
}

void AStickmanCharacter::TickWallRun(float DeltaSeconds)
{
	UCharacterMovementComponent* Movement = GetCharacterMovement();

	if (bIsWallRunning)
	{
		WallRunTimeRemaining -= DeltaSeconds;

		// Wall still there? Re-trace toward it.
		FHitResult WallHit;
		FCollisionQueryParams QueryParams;
		QueryParams.AddIgnoredActor(this);
		const bool bWallStillThere = GetWorld()->LineTraceSingleByChannel(WallHit, GetActorLocation(),
			GetActorLocation() - WallRunNormal * 80.f, ECC_WorldStatic, QueryParams);

		if (WallRunTimeRemaining <= 0.f || !bWallStillThere || Movement->IsMovingOnGround())
		{
			bIsWallRunning = false;
			Movement->GravityScale = 1.f;
			return;
		}

		// Run along the wall: velocity = wall-tangent direction closest to current facing.
		const FVector AlongWall = FVector::CrossProduct(WallRunNormal, FVector::UpVector).GetSafeNormal();
		const float Direction = FVector::DotProduct(AlongWall, GetActorForwardVector()) >= 0.f ? 1.f : -1.f;
		Movement->Velocity = AlongWall * Direction * WallRunSpeed + FVector(0.f, 0.f, Movement->Velocity.Z * 0.4f);
		return;
	}

	// Start: sprinting, airborne, side wall within reach, not climbing/gliding.
	if (!bWantsToSprint || !Movement->IsFalling() || bIsClimbing || bIsGliding)
	{
		return;
	}
	FCollisionQueryParams QueryParams;
	QueryParams.AddIgnoredActor(this);
	for (const float Side : { 1.f, -1.f })
	{
		FHitResult SideHit;
		if (GetWorld()->LineTraceSingleByChannel(SideHit, GetActorLocation(),
				GetActorLocation() + GetActorRightVector() * Side * 70.f, ECC_WorldStatic, QueryParams)
			&& FMath::Abs(SideHit.Normal.Z) < 0.2f) // Near-vertical wall only.
		{
			bIsWallRunning = true;
			WallRunNormal = SideHit.Normal;
			WallRunTimeRemaining = WallRunMaxDuration;
			Movement->GravityScale = 0.25f;
			return;
		}
	}
}

void AStickmanCharacter::TrySlide()
{
	if (bWantsToSprint && GetCharacterMovement()->IsMovingOnGround() && !bIsSliding)
	{
		StartSlide(SlideSpeedBoost);
	}
}

void AStickmanCharacter::StartSlide(float SpeedMultiplier)
{
	bIsSliding = true;
	SlideTimeRemaining = SlideDuration;

	UCharacterMovementComponent* Movement = GetCharacterMovement();
	Movement->GroundFriction = 0.5f; // Near-frictionless while sliding.
	Movement->Velocity = GetActorForwardVector() * FMath::Max(GetVelocity().Size2D(), WalkSpeed) * SpeedMultiplier;

	// Half-height capsule = fits under obstacles ("slide under").
	GetCapsuleComponent()->SetCapsuleHalfHeight(44.f);

	if (SlideMontage && GetMesh() && GetMesh()->GetAnimInstance())
	{
		GetMesh()->GetAnimInstance()->Montage_Play(SlideMontage);
	}
}

void AStickmanCharacter::TickSlide(float DeltaSeconds)
{
	if (!bIsSliding)
	{
		return;
	}
	SlideTimeRemaining -= DeltaSeconds;
	if (SlideTimeRemaining <= 0.f || GetVelocity().Size2D() < WalkSpeed * 0.5f)
	{
		StopSlide();
	}
}

void AStickmanCharacter::StopSlide()
{
	if (!bIsSliding)
	{
		return;
	}
	bIsSliding = false;
	GetCharacterMovement()->GroundFriction = GroundFrictionValue;
	GetCapsuleComponent()->SetCapsuleHalfHeight(88.f);
}

void AStickmanCharacter::TickCameraDynamics(float DeltaSeconds)
{
	const float Speed = GetVelocity().Size2D();
	float SpeedAlpha = FMath::Clamp(Speed / FMath::Max(SprintSpeed, 1.f), 0.f, 1.f);

	// Accessibility: motion-sickness reduction kills the velocity FOV swell and turn tilt
	// (the two biggest motion-sickness contributors). Sprint FOV in TickCamera stays.
	if (USettingsScreenWidget::IsReduceMotionEnabled())
	{
		SpeedAlpha = 0.f;
	}

	// Velocity-based FOV on top of the sprint FOV TickCamera already lerps.
	FollowCamera->SetFieldOfView(FollowCamera->FieldOfView + MaxVelocityFOVBonus * SpeedAlpha * DeltaSeconds * 4.f
		- MaxVelocityFOVBonus * (1.f - SpeedAlpha) * DeltaSeconds * 4.f);
	FollowCamera->SetFieldOfView(FMath::Clamp(FollowCamera->FieldOfView, WalkFOV, SprintFOV + MaxVelocityFOVBonus));

	// Turn tilt: roll opposite the yaw input while moving fast (motorbike lean).
	const float TargetRoll = -CachedLookInput.X * TurnCameraTiltDegrees * SpeedAlpha;
	FRotator BoomRotation = CameraBoom->GetRelativeRotation();
	BoomRotation.Roll = FMath::FInterpTo(BoomRotation.Roll, TargetRoll, DeltaSeconds, 6.f);
	CameraBoom->SetRelativeRotation(BoomRotation);

	// Speed-based boom length + landing punch (punch decays fast).
	CameraPunchOffset = FMath::FInterpTo(CameraPunchOffset, 0.f, DeltaSeconds, 8.f);
	const float BaseLength = FMath::Clamp(CameraBoom->TargetArmLength, MinCameraBoomLength, MaxCameraBoomLength);
	CameraBoom->TargetArmLength = BaseLength + MaxSpeedBoomBonus * SpeedAlpha * DeltaSeconds * 2.f
		- MaxSpeedBoomBonus * (1.f - SpeedAlpha) * DeltaSeconds * 2.f - CameraPunchOffset * DeltaSeconds * 10.f;
	CameraBoom->TargetArmLength = FMath::Clamp(CameraBoom->TargetArmLength, MinCameraBoomLength,
		MaxCameraBoomLength + MaxSpeedBoomBonus);

	// Auto-recenter: idle look input while moving = camera drifts back behind the character.
	if (TimeSinceLookInput >= CameraRecenterDelay && Speed > WalkSpeed * 0.5f && Controller)
	{
		const FRotator Current = Controller->GetControlRotation();
		const FRotator Target(Current.Pitch, GetActorRotation().Yaw, 0.f);
		Controller->SetControlRotation(FMath::RInterpTo(Current, Target, DeltaSeconds, CameraRecenterSpeed));
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
	// Plunge attack: attack while airborne slams to ground (routes to GA_PlungeAttack).
	if (GetCharacterMovement()->IsFalling() && !bIsGliding && PlungeAttackSkillTag.IsValid()
		&& AbilitySystemComponent && AbilitySystemComponent->ActivateSkillByTag(PlungeAttackSkillTag))
	{
		return;
	}

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
