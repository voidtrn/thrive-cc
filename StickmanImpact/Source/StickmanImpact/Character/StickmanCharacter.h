// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "GameplayTagContainer.h"
#include "AbilitySystemInterface.h"
#include "StickmanStatTypes.h"
#include "StickmanCharacter.generated.h"

class USpringArmComponent;
class UCameraComponent;
class UInputMappingContext;
class UInputAction;
class UCameraShakeBase;
class UCurveFloat;
class UStickmanAbilitySystemComponent;
class UStickmanAttributeSet;
class UGameplayAbility;
class UEquipmentManager;
class UDefenseComponent;
class UWeaponSwapComponent;
struct FInputActionValue;

/**
 * Player-controlled stickman. Third-person character with movement (walk/sprint/dash/
 * double-jump), a stamina economy, gameplay-tag-driven movement state, Enhanced Input
 * bindings for the RPG action set (attack / skills / burst), and a GameplayAbilitySystem
 * component that drives the actual skill activations.
 */
UCLASS()
class STICKMANIMPACT_API AStickmanCharacter : public ACharacter, public IAbilitySystemInterface
{
	GENERATED_BODY()

public:
	AStickmanCharacter();

	virtual void Tick(float DeltaSeconds) override;
	virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;
	virtual void Jump() override;
	virtual void Landed(const FHitResult& Hit) override;
	virtual UAbilitySystemComponent* GetAbilitySystemComponent() const override;

protected:
	virtual void BeginPlay() override;

	// -------------------------------------------------------------------
	// Components
	// -------------------------------------------------------------------

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<USpringArmComponent> CameraBoom;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UCameraComponent> FollowCamera;

	// -------------------------------------------------------------------
	// Ability System (GAS)
	// -------------------------------------------------------------------

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Abilities", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStickmanAbilitySystemComponent> AbilitySystemComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Abilities", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UStickmanAttributeSet> AttributeSet;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Equipment", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UEquipmentManager> EquipmentManager;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Defense", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UDefenseComponent> DefenseComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Weapon", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UWeaponSwapComponent> WeaponSwapComponent;

public:
	UFUNCTION(BlueprintPure, Category = "Equipment")
	UEquipmentManager* GetEquipmentManager() const { return EquipmentManager; }

	UFUNCTION(BlueprintPure, Category = "Defense")
	UDefenseComponent* GetDefenseComponent() const { return DefenseComponent; }

	UFUNCTION(BlueprintPure, Category = "Weapon")
	UWeaponSwapComponent* GetWeaponSwapComponent() const { return WeaponSwapComponent; }

protected:

	// Granted to the ASC on BeginPlay — assign the character's starting kit here
	// (GA_NormalAttack, GA_PyroSlash, GA_PyroBurst, ...) in the character Blueprint.
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Abilities")
	TArray<TSubclassOf<UGameplayAbility>> DefaultAbilities;

public:
	UFUNCTION(BlueprintPure, Category = "Abilities")
	UStickmanAbilitySystemComponent* GetStickmanAbilitySystemComponent() const { return AbilitySystemComponent; }

	UFUNCTION(BlueprintPure, Category = "Abilities")
	UStickmanAttributeSet* GetStickmanAttributeSet() const { return AttributeSet; }

protected:

	// Reconfigures this same pawn to play as a different party member: mesh, base stats, and
	// abilities (re-granted from CharacterData.SkillData). Used by UPartyManager::SwitchToIndex
	// instead of spawning a separate actor per character.
	UFUNCTION(BlueprintCallable, Category = "Party")
	void ApplyCharacterData(const struct FStickmanCharacterData& CharacterData);

	// SkillTag values routed to ActivateSkillByTag() by the matching Enhanced Input handler —
	// must match the SkillTag of one of the abilities in DefaultAbilities to do anything.
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Abilities")
	FGameplayTag NormalAttackSkillTag;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Abilities")
	FGameplayTag Skill1SkillTag;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Abilities")
	FGameplayTag Skill2SkillTag;

	// -------------------------------------------------------------------
	// Enhanced Input
	// -------------------------------------------------------------------

	// Assign in the character Blueprint/DefaultObject to the IMC_Default asset created in-editor.
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputMappingContext> DefaultMappingContext;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> MoveAction;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> LookAction;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> JumpAction;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> SprintAction;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> DashAction;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> ParryAction;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> WeaponSwapAction;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> NormalAttackAction;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> Skill1Action;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> Skill2Action;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> InteractAction;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Interaction")
	float InteractRange = 200.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Interaction")
	float InteractSphereRadius = 50.f;

	// Optional: mouse wheel / gamepad stick axis for camera zoom (not in the base IA list,
	// bind an IA_Zoom asset here if you want zoom; safe to leave unset).
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> ZoomAction;

	// -------------------------------------------------------------------
	// Stats
	// -------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats")
	FStickmanStats Stats;

	// -------------------------------------------------------------------
	// Movement tuning
	// -------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	float WalkSpeed = 400.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	float SprintSpeed = 700.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	float DashDistance = 600.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	float DashCooldown = 1.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	float DashDuration = 0.2f;

	// Optional easing curve (0-1 over 0-1 time). If unset, a linear dash is used.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	TObjectPtr<UCurveFloat> DashCurve;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	int32 MaxJumpCount = 2;

	// -------------------------------------------------------------------
	// Stamina
	// -------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stamina")
	float SprintStaminaDrainRate = 10.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stamina")
	float DashStaminaCost = 25.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stamina")
	float StaminaRegenRate = 8.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stamina")
	float StaminaRegenDelay = 1.f;

	UPROPERTY(BlueprintReadOnly, Category = "Stamina")
	float CurrentStamina = 0.f;

	// -------------------------------------------------------------------
	// Camera tuning
	// -------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
	float CameraLagSpeedValue = 3.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
	float MinCameraBoomLength = 200.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
	float MaxCameraBoomLength = 600.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
	float WalkFOV = 90.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
	float SprintFOV = 100.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
	float FOVInterpSpeed = 4.f;

	// Simple camera shake played on dash start. Assign a UCameraShakeBase Blueprint subclass.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
	TSubclassOf<UCameraShakeBase> DashCameraShakeClass;

	// -------------------------------------------------------------------
	// Exploration: Climbing
	// -------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Climbing")
	float ClimbSpeed = 200.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Climbing")
	float ClimbStaminaDrainRate = 15.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Climbing")
	float WallCheckDistance = 100.f;

	// Actor Tag a climbable wall must have (Actor > Tags in the editor) to be climbable.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Climbing")
	FName ClimbableTag = TEXT("Climbable");

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Climbing")
	float SlideDownSpeed = 400.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Climbing")
	float WallJumpOffForce = 600.f;

	// -------------------------------------------------------------------
	// Exploration: Gliding
	// -------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Gliding")
	float GlideForwardSpeed = 800.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Gliding")
	float GlideDescentRate = 150.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Gliding")
	float GlideStaminaDrainRate = 5.f;

	// Degrees/sec the pitch (via Look Y while gliding) changes dive/climb rate by.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Gliding")
	float GlidePitchInfluence = 300.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Gliding")
	TObjectPtr<UAnimMontage> LandingRollMontage;

	// Elemental-themed unlockable glider trail VFX — index selected via SelectedGliderVariant.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Gliding")
	TArray<TObjectPtr<class UNiagaraSystem>> GliderVFXVariants;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Gliding")
	int32 SelectedGliderVariant = 0;

	// -------------------------------------------------------------------
	// Exploration: Swimming
	// -------------------------------------------------------------------
	// Surface/dive movement itself rides on ACharacterMovementComponent's built-in swimming
	// mode (auto-enters when overlapping a APhysicsVolume with bWaterVolume=true) — this class
	// only layers the breath meter, stamina drain, and drowning damage on top of that.

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Swimming")
	float MaxBreath = 60.f;

	UPROPERTY(BlueprintReadOnly, Category = "Exploration|Swimming")
	float CurrentBreath = 60.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Swimming")
	float SwimStaminaDrainRate = 6.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Swimming")
	float DrowningDamagePerSecond = 20.f;

	// Buoyancy while diving vs surface swimming (UCharacterMovementComponent::Buoyancy: <1 sinks, >1 floats).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Swimming")
	float DiveBuoyancy = 0.6f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Exploration|Swimming")
	float SurfaceBuoyancy = 1.05f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> DiveAction;

	// -------------------------------------------------------------------
	// Locomotion: momentum & inertia
	// -------------------------------------------------------------------

	// Lower friction/braking = drift on stop instead of a hard snap (AAA momentum feel).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Momentum")
	float GroundFrictionValue = 4.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Momentum")
	float BrakingDeceleration = 800.f;

	// Yaw rate while sprinting — lower = real turning radius, no instant 180s at speed.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Momentum")
	float SprintRotationRate = 220.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Momentum")
	float WalkRotationRate = 500.f;

	// Fraction of horizontal velocity kept when landing (momentum preservation).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Momentum")
	float LandingMomentumKeepFraction = 0.7f;

	// -------------------------------------------------------------------
	// Locomotion: parkour-lite
	// -------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Parkour")
	bool bEnableAutoVault = true;

	// Obstacles lower than this vault automatically when sprinting into them (<1m per spec).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Parkour")
	float MaxVaultHeight = 100.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Parkour")
	TObjectPtr<UAnimMontage> VaultMontage;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Parkour")
	float WallRunMaxDuration = 2.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Parkour")
	float WallRunSpeed = 650.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Parkour")
	float SlideDuration = 0.8f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Parkour")
	float SlideSpeedBoost = 1.15f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Parkour")
	TObjectPtr<UAnimMontage> SlideMontage;

	// Falls taller than this trigger the landing roll (input-timed: jump pressed in the
	// buffer window on touch-down = perfect roll, zero recovery).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Parkour")
	float RollLandingMinFallHeight = 500.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Parkour")
	TObjectPtr<UAnimMontage> RollLandingMontage;

	// -------------------------------------------------------------------
	// Locomotion: movement tech
	// -------------------------------------------------------------------

	// Jump pressed within this window of landing = bunny hop (full momentum preserved).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Tech")
	float BunnyHopWindow = 0.2f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Tech")
	float WaveDashSlideMultiplier = 1.6f;

	// Attack while airborne routes to this skill tag (grant GA_PlungeAttack with it).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Tech")
	FGameplayTag PlungeAttackSkillTag;

	// -------------------------------------------------------------------
	// Locomotion: input buffer
	// -------------------------------------------------------------------

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Locomotion|Buffer")
	float InputBufferWindow = 0.2f;

	// -------------------------------------------------------------------
	// Camera dynamics
	// -------------------------------------------------------------------

	// FOV widens with actual velocity (not just the sprint flag) up to this bonus.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera|Dynamics")
	float MaxVelocityFOVBonus = 12.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera|Dynamics")
	float TurnCameraTiltDegrees = 3.f;

	// Boom lengthens with speed up to this bonus (pulled-back sense of velocity).
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera|Dynamics")
	float MaxSpeedBoomBonus = 120.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera|Dynamics")
	float LandingCameraPunchScale = 0.06f;

	// Seconds without look input (while moving) before the camera recenters behind the character.
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera|Dynamics")
	float CameraRecenterDelay = 2.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera|Dynamics")
	float CameraRecenterSpeed = 1.5f;

public:
	// -------------------------------------------------------------------
	// Input handlers
	// -------------------------------------------------------------------

	void Move(const FInputActionValue& Value);
	void Look(const FInputActionValue& Value);
	void Zoom(const FInputActionValue& Value);
	void StartSprint();
	void StopSprint();
	void Dash();
	void Parry();
	void OnWeaponSwap();
	void OnNormalAttack();
	void OnSkill1();
	void OnSkill2();
	void OnInteract();

	// -------------------------------------------------------------------
	// Exploration
	// -------------------------------------------------------------------

	UFUNCTION(BlueprintCallable, Category = "Exploration|Climbing")
	void JumpOffWall();

	UFUNCTION(BlueprintCallable, Category = "Exploration|Climbing")
	void SlideDownWall();

	UFUNCTION(BlueprintCallable, Category = "Exploration|Gliding")
	void DeployGlider();

	UFUNCTION(BlueprintCallable, Category = "Exploration|Gliding")
	void StopGliding();

	void ToggleDive();

	UFUNCTION(BlueprintPure, Category = "Exploration")
	bool IsClimbing() const { return bIsClimbing; }

	UFUNCTION(BlueprintPure, Category = "Exploration")
	bool IsGliding() const { return bIsGliding; }

	UFUNCTION(BlueprintPure, Category = "Exploration")
	float GetBreathPercent() const { return MaxBreath > 0.f ? CurrentBreath / MaxBreath : 1.f; }

	// -------------------------------------------------------------------
	// Locomotion queries + external stamina drain (for components)
	// -------------------------------------------------------------------

	UFUNCTION(BlueprintPure, Category = "Locomotion")
	bool IsSliding() const { return bIsSliding; }

	UFUNCTION(BlueprintPure, Category = "Locomotion")
	bool IsWallRunning() const { return bIsWallRunning; }

	UFUNCTION(BlueprintPure, Category = "Abilities")
	FGameplayTag GetNormalAttackSkillTag() const { return NormalAttackSkillTag; }

	UFUNCTION(BlueprintPure, Category = "Abilities")
	FGameplayTag GetSkill1Tag() const { return Skill1SkillTag; }

	UFUNCTION(BlueprintPure, Category = "Abilities")
	FGameplayTag GetSkill2Tag() const { return Skill2SkillTag; }

	UFUNCTION(BlueprintCallable, Category = "Stamina")
	void DrainStamina(float Amount) { ConsumeStamina(Amount); }

	// Crouch input while sprinting = slide; bind a crouch/slide IA to this.
	UFUNCTION(BlueprintCallable, Category = "Locomotion")
	void TrySlide();

	UFUNCTION(BlueprintPure, Category = "Stamina")
	float GetStaminaPercent() const { return Stats.MaxStamina > 0.f ? CurrentStamina / Stats.MaxStamina : 0.f; }

	UFUNCTION(BlueprintPure, Category = "Movement")
	FGameplayTag GetCurrentMovementTag() const { return CurrentMovementTag; }

	// Raw axis values from the last Move/Look input events — used by the on-screen input
	// debug widget so testers can confirm Enhanced Input is actually reaching the character.
	UFUNCTION(BlueprintPure, Category = "Input|Debug")
	FVector2D GetLastMoveInput() const { return CachedMoveInput; }

	UFUNCTION(BlueprintPure, Category = "Input|Debug")
	FVector2D GetLastLookInput() const { return CachedLookInput; }

private:
	void TickDash(float DeltaSeconds);
	void TickStaminaRegen(float DeltaSeconds);
	void TickCamera(float DeltaSeconds);
	void ConsumeStamina(float Amount);
	void UpdateMovementStateTag();
	void ShowDebugOnScreen() const;

	void TickClimbing(float DeltaSeconds);
	bool TraceForClimbableWall(FHitResult& OutHit) const;
	void StartClimbing(const FHitResult& WallHit);
	void StopClimbing();

	void TickGliding(float DeltaSeconds);

	void TickSwimming(float DeltaSeconds);

	// Locomotion internals.
	enum class EBufferedAction : uint8 { None, Dash, Jump, Attack };
	void BufferAction(EBufferedAction Action);
	void TickInputBuffer(float DeltaSeconds);
	void TickAutoVault();
	void TickWallRun(float DeltaSeconds);
	void TickSlide(float DeltaSeconds);
	void TickCameraDynamics(float DeltaSeconds);
	void StartSlide(float SpeedMultiplier);
	void StopSlide();

	FGameplayTag CurrentMovementTag;

	bool bWantsToSprint = false;

	// Dash runtime state.
	bool bIsDashing = false;
	bool bDashOnCooldown = false;
	FVector DashStartLocation = FVector::ZeroVector;
	FVector DashTargetLocation = FVector::ZeroVector;
	float DashElapsedTime = 0.f;
	FTimerHandle DashCooldownTimerHandle;

	// Stamina runtime state: time since the last stamina-consuming action, used for the regen delay.
	float TimeSinceStaminaUse = 0.f;

	// Double jump runtime state.
	int32 CurrentJumpCount = 0;

	FVector2D CachedMoveInput = FVector2D::ZeroVector;
	FVector2D CachedLookInput = FVector2D::ZeroVector;

	// Climbing runtime state.
	bool bIsClimbing = false;
	FVector ClimbWallNormal = FVector::ZeroVector;

	// Gliding runtime state.
	bool bIsGliding = false;

	// Swimming runtime state.
	bool bWantsToDive = false;
	bool bWasSwimmingLastTick = false;

	// Locomotion runtime state.
	EBufferedAction BufferedAction = EBufferedAction::None;
	float BufferedActionAge = 0.f;
	bool bIsSliding = false;
	float SlideTimeRemaining = 0.f;
	bool bIsWallRunning = false;
	float WallRunTimeRemaining = 0.f;
	FVector WallRunNormal = FVector::ZeroVector;
	float FallStartHeight = 0.f;
	float TimeSinceLanded = 999.f;
	float TimeSinceLookInput = 0.f;
	float CameraPunchOffset = 0.f;
	bool bPlungeQueued = false;
};
