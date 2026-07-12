// Copyright StickmanImpact Project.

#include "StickmanGameplayAbility.h"
#include "StickmanAttributeSet.h"
#include "ElementalReactionManager.h"
#include "UI/StickmanDamageNumberManager.h"
#include "UI/StickmanDamageNumberTypes.h"
#include "AI/Enemies/EnemyShieldGuard.h"
#include "World/StickmanTorch.h"
#include "World/StickmanInteractiveFoliage.h"
#include "GameFlow/StickmanCheatManager.h"
#include "CombatFeedbackSubsystem.h"
#include "CombatJuiceSubsystem.h"
#include "ComboMeterSubsystem.h"
#include "AI/AdaptiveDifficultySubsystem.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Character/StickmanCharacter.h"
#include "Equipment/EquipmentManager.h"
#include "Character/StickmanGameplayTags.h"
#include "AbilitySystemComponent.h"
#include "AbilitySystemBlueprintLibrary.h"
#include "Abilities/Tasks/AbilityTask_PlayMontageAndWait.h"
#include "Kismet/GameplayStatics.h"
#include "Camera/CameraShakeBase.h"
#include "GameFramework/PlayerController.h"
#include "NiagaraFunctionLibrary.h"
#include "TimerManager.h"
#include "Engine/GameInstance.h"

UStickmanGameplayAbility::UStickmanGameplayAbility()
{
	InstancingPolicy = EGameplayAbilityInstancingPolicy::InstancedPerActor;
	NetExecutionPolicy = EGameplayAbilityNetExecutionPolicy::LocalPredicted;
}

UStickmanAttributeSet* UStickmanGameplayAbility::GetStickmanAttributeSet() const
{
	if (UAbilitySystemComponent* ASC = GetAbilitySystemComponentFromActorInfo())
	{
		return const_cast<UStickmanAttributeSet*>(ASC->GetSet<UStickmanAttributeSet>());
	}
	return nullptr;
}

bool UStickmanGameplayAbility::CheckCooldown() const
{
	const UAbilitySystemComponent* ASC = GetAbilitySystemComponentFromActorInfo();
	if (!ASC || !SkillData.SkillTag.IsValid())
	{
		return true;
	}
	return !ASC->HasMatchingGameplayTag(SkillData.SkillTag);
}

float UStickmanGameplayAbility::GetCooldownTimeRemaining() const
{
	if (!GetWorld() || !CooldownTimerHandle.IsValid())
	{
		return 0.f;
	}
	return FMath::Max(GetWorld()->GetTimerManager().GetTimerRemaining(CooldownTimerHandle), 0.f);
}

bool UStickmanGameplayAbility::CheckCost() const
{
	if (SkillData.EnergyCost <= 0.f)
	{
		return true;
	}
	const UStickmanAttributeSet* AttributeSet = GetStickmanAttributeSet();
	return AttributeSet && AttributeSet->GetCurrentEnergy() >= SkillData.EnergyCost;
}

bool UStickmanGameplayAbility::CanActivateAbility(const FGameplayAbilitySpecHandle Handle,
	const FGameplayAbilityActorInfo* ActorInfo, const FGameplayTagContainer* SourceTags,
	const FGameplayTagContainer* TargetTags, FGameplayTagContainer* OptionalRelevantTags) const
{
	if (!Super::CanActivateAbility(Handle, ActorInfo, SourceTags, TargetTags, OptionalRelevantTags))
	{
		return false;
	}
	return CheckCooldown() && CheckCost();
}

void UStickmanGameplayAbility::CommitCooldown()
{
	if (!SkillData.SkillTag.IsValid() || SkillData.Cooldown <= 0.f)
	{
		return;
	}

	UAbilitySystemComponent* ASC = GetAbilitySystemComponentFromActorInfo();
	if (!ASC)
	{
		return;
	}

	ASC->AddLooseGameplayTag(SkillData.SkillTag);

	FTimerDelegate CooldownEndDelegate = FTimerDelegate::CreateWeakLambda(ASC, [ASC, Tag = SkillData.SkillTag]()
	{
		ASC->RemoveLooseGameplayTag(Tag);
	});
	GetWorld()->GetTimerManager().SetTimer(CooldownTimerHandle, CooldownEndDelegate, SkillData.Cooldown, false);
}

void UStickmanGameplayAbility::CommitCost()
{
	if (SkillData.EnergyCost <= 0.f)
	{
		return;
	}

	if (UStickmanAttributeSet* AttributeSet = GetStickmanAttributeSet())
	{
		const float NewEnergy = FMath::Clamp(AttributeSet->GetCurrentEnergy() - SkillData.EnergyCost, 0.f,
			AttributeSet->GetMaxEnergy());
		AttributeSet->SetCurrentEnergy(NewEnergy);
		AttributeSet->OnEnergyChanged.Broadcast(NewEnergy, AttributeSet->GetMaxEnergy());
	}
}

void UStickmanGameplayAbility::ActivateAbility(const FGameplayAbilitySpecHandle Handle,
	const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilityActivationInfo ActivationInfo,
	const FGameplayEventData* TriggerEventData)
{
	if (!CheckCooldown() || !CheckCost())
	{
		EndAbility(Handle, ActorInfo, ActivationInfo, true, true);
		return;
	}

	CommitCooldown();
	CommitCost();

	OnAbilityActivated();
}

void UStickmanGameplayAbility::EndAbility(const FGameplayAbilitySpecHandle Handle,
	const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilityActivationInfo ActivationInfo,
	bool bReplicateEndAbility, bool bWasCancelled)
{
	OnAbilityEnded(bWasCancelled);
	Super::EndAbility(Handle, ActorInfo, ActivationInfo, bReplicateEndAbility, bWasCancelled);
}

void UStickmanGameplayAbility::OnAbilityActivated()
{
	// Subclasses override this — base does nothing but immediately end so an ability
	// forgetting to override doesn't hang around forever occupying its activation group.
}

void UStickmanGameplayAbility::OnAbilityEnded(bool bWasCancelled)
{
}

UAbilityTask_PlayMontageAndWait* UStickmanGameplayAbility::PlayAbilityMontage(UAnimMontage* Montage, float PlayRate,
	FName StartSection)
{
	if (!Montage)
	{
		return nullptr;
	}

	UAbilityTask_PlayMontageAndWait* Task = UAbilityTask_PlayMontageAndWait::CreatePlayMontageAndWaitProxy(
		this, NAME_None, Montage, PlayRate, StartSection);
	Task->ReadyForActivation();
	return Task;
}

void UStickmanGameplayAbility::PlayMontageThenEnd(UAnimMontage* Montage, float FallbackDuration)
{
	if (UAbilityTask_PlayMontageAndWait* Task = Montage ? PlayAbilityMontage(Montage) : nullptr)
	{
		Task->OnCompleted.AddDynamic(this, &UStickmanGameplayAbility::HandleGenericMontageEnd);
		Task->OnInterrupted.AddDynamic(this, &UStickmanGameplayAbility::HandleGenericMontageEnd);
		Task->OnCancelled.AddDynamic(this, &UStickmanGameplayAbility::HandleGenericMontageEnd);
	}
	else if (UWorld* World = GetWorld())
	{
		// No montage authored yet — still end on schedule so gameplay is testable pre-art.
		World->GetTimerManager().SetTimer(GenericEndTimerHandle, this,
			&UStickmanGameplayAbility::HandleGenericMontageEnd, FMath::Max(FallbackDuration, 0.05f), false);
	}
}

void UStickmanGameplayAbility::HandleGenericMontageEnd()
{
	K2_EndAbility();
}

void UStickmanGameplayAbility::ApplyRadialElementalDamage(const FVector& Origin, const FVector& ForwardDir,
	float Radius, float HalfAngleDegrees, float DamageMultiplier, TSubclassOf<UGameplayEffect> StatusEffectClass,
	TArray<AActor*>& OutHitActors, const TArray<AActor*>* ExtraActorsToIgnore) const
{
	OutHitActors.Reset();

	AActor* AvatarActor = GetAvatarActorFromActorInfo();
	if (!AvatarActor)
	{
		return;
	}

	TArray<AActor*> Overlaps;
	TArray<AActor*> ActorsToIgnore = { AvatarActor };
	if (ExtraActorsToIgnore)
	{
		ActorsToIgnore.Append(*ExtraActorsToIgnore);
	}
	// Pawns + world objects: torches/interactive foliage react to elemental hits too.
	UGameplayStatics::SphereOverlapActors(this, Origin, Radius,
		TArray<TEnumAsByte<EObjectTypeQuery>>{
			UEngineTypes::ConvertToObjectType(ECC_Pawn),
			UEngineTypes::ConvertToObjectType(ECC_WorldDynamic) }, nullptr,
		ActorsToIgnore, Overlaps);

	const float CosHalfAngle = FMath::Cos(FMath::DegreesToRadians(FMath::Min(HalfAngleDegrees, 180.f)));
	const UStickmanAttributeSet* AttributeSet = GetStickmanAttributeSet();
	const float CasterAttack = AttributeSet ? AttributeSet->GetAttack() : 20.f;

	for (AActor* HitActor : Overlaps)
	{
		if (!HitActor)
		{
			continue;
		}

		if (HalfAngleDegrees < 180.f)
		{
			const FVector ToTarget = (HitActor->GetActorLocation() - Origin).GetSafeNormal();
			if (FVector::DotProduct(ForwardDir, ToTarget) < CosHalfAngle)
			{
				continue;
			}
		}

		ApplyDamageToTarget(HitActor, CasterAttack * DamageMultiplier, StatusEffectClass);
		OutHitActors.Add(HitActor);
	}
}

void UStickmanGameplayAbility::ApplyDamageToTarget(AActor* TargetActor, float DamageAmount,
	TSubclassOf<UGameplayEffect> StatusEffectClass) const
{
	if (!TargetActor || DamageAmount <= 0.f)
	{
		return;
	}

	if (AStickmanTorch* Torch = Cast<AStickmanTorch>(TargetActor))
	{
		Torch->TryAffectWithElement(SkillData.Element);
		return; // Torches have no health/ASC — hitting one is a puzzle interaction, not damage.
	}

	// Interactive foliage: burn (Pyro), freeze (Cryo), cut (physical) — environment interaction.
	if (AStickmanInteractiveFoliage* Foliage = Cast<AStickmanInteractiveFoliage>(TargetActor))
	{
		switch (SkillData.Element)
		{
			case EStickmanElement::Pyro: Foliage->OnBurned(); break;
			case EStickmanElement::Cryo: Foliage->OnFrozen(); break;
			case EStickmanElement::None: Foliage->OnCut(); break;
			default: break;
		}
		return;
	}

	if (TargetActor == UGameplayStatics::GetPlayerPawn(this, 0))
	{
		if (UStickmanCheatManager::IsGodModeEnabled())
		{
			return; // Player is invulnerable under GodMode.
		}
		// Adaptive difficulty: reset the "player untouched" aggression clock.
		if (UGameInstance* GI = GetWorld() ? GetWorld()->GetGameInstance() : nullptr)
		{
			if (UAdaptiveDifficultySubsystem* Difficulty = GI->GetSubsystem<UAdaptiveDifficultySubsystem>())
			{
				Difficulty->NotifyPlayerWasHit();
			}
		}
	}

	UAbilitySystemComponent* TargetASC = UAbilitySystemBlueprintLibrary::GetAbilitySystemComponent(TargetActor);
	if (UStickmanAttributeSet* TargetAttributes = TargetASC ? const_cast<UStickmanAttributeSet*>(
			TargetASC->GetSet<UStickmanAttributeSet>()) : nullptr)
	{
		float FinalDamage = DamageAmount;

		const bool bPlayerIsAttacker = GetAvatarActorFromActorInfo() == UGameplayStatics::GetPlayerPawn(this, 0);

		// Juggle gate: an air-recovering (teched/capped) enemy is hit-immune; landing an air
		// hit re-floats them and counts toward the juggle limit.
		if (AStickmanEnemyCharacter* JuggleTarget = Cast<AStickmanEnemyCharacter>(TargetActor))
		{
			if (JuggleTarget->IsJuggled() || JuggleTarget->GetCharacterMovement()->IsFalling())
			{
				if (!JuggleTarget->RegisterJuggleHit())
				{
					return; // Whiffs into recovery frames.
				}
			}
		}

		// Combo meter: player hits build style/rank; rank (+ armed elemental tag bonus)
		// multiplies damage.
		if (bPlayerIsAttacker)
		{
			if (UGameInstance* GI = GetWorld() ? GetWorld()->GetGameInstance() : nullptr)
			{
				if (UComboMeterSubsystem* ComboMeter = GI->GetSubsystem<UComboMeterSubsystem>())
				{
					ComboMeter->RegisterHit(SkillData.SkillTag);
					FinalDamage *= ComboMeter->ConsumeDamageMultiplier();
				}
			}
		}

		if (const AEnemyShieldGuard* ShieldGuard = Cast<AEnemyShieldGuard>(TargetActor))
		{
			if (const AActor* Avatar = GetAvatarActorFromActorInfo())
			{
				FinalDamage *= ShieldGuard->GetIncomingDamageMultiplier(Avatar->GetActorLocation());
			}
		}

		// Elemental resistance/immunity/weakness on the target (elite 0.5, boss-own-element 0, ...).
		if (const AStickmanEnemyCharacter* ResistTarget = Cast<AStickmanEnemyCharacter>(TargetActor))
		{
			FinalDamage *= ResistTarget->GetElementDamageMultiplier(SkillData.Element);
			if (FinalDamage <= 0.f)
			{
				return; // Immune.
			}
		}

		// Route through the elemental reaction manager when this hit carries an element —
		// this is what actually applies the aura and resolves Melt/Vaporize/Overload/etc.
		// (SkillData.Element == None means a purely physical hit, so it's skipped there).
		if (SkillData.Element != EStickmanElement::None)
		{
			if (UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr)
			{
				if (UElementalReactionManager* ReactionManager = GameInstance->GetSubsystem<UElementalReactionManager>())
				{
					const UStickmanAttributeSet* CasterAttributes = GetStickmanAttributeSet();
					const float CasterEM = CasterAttributes ? CasterAttributes->GetElementalMastery() : 0.f;
					FinalDamage = ReactionManager->CalculateReactionDamage(TargetActor, DamageAmount, SkillData.Element, CasterEM);
				}
			}
		}

		// Crit roll off the caster's equipped CRIT Rate/DMG (UEquipmentManager, if any —
		// enemies/NPCs without one just use the FEquipmentStatTotals defaults: 5%/50%).
		bool bIsCritical = false;
		if (const AStickmanCharacter* CasterCharacter = Cast<AStickmanCharacter>(GetAvatarActorFromActorInfo()))
		{
			if (const UEquipmentManager* CasterEquipment = CasterCharacter->GetEquipmentManager())
			{
				const FEquipmentStatTotals CasterTotals = CasterEquipment->GetTotalStats();
				bIsCritical = FMath::FRand() * 100.f < CasterTotals.CritRatePercent;
				if (bIsCritical)
				{
					FinalDamage *= 1.f + CasterTotals.CritDMGPercent / 100.f;
				}
			}
		}

		const float NewHealth = FMath::Clamp(TargetAttributes->GetHealth() - FinalDamage, 0.f,
			TargetAttributes->GetMaxHealth());
		TargetAttributes->SetHealth(NewHealth);
		TargetAttributes->OnHealthChanged.Broadcast(NewHealth, TargetAttributes->GetMaxHealth());

		if (UGameInstance* GameInstance = GetWorld() ? GetWorld()->GetGameInstance() : nullptr)
		{
			if (UStickmanDamageNumberManager* DamageNumbers = GameInstance->GetSubsystem<UStickmanDamageNumberManager>())
			{
				const EDamageNumberType NumberType = bIsCritical ? EDamageNumberType::Critical
					: UStickmanDamageNumberStatics::GetDamageNumberTypeForElement(SkillData.Element);
				DamageNumbers->SpawnDamageNumber(TargetActor, FinalDamage, NumberType);
			}

			const bool bKilled = NewHealth <= 0.f;
			const AActor* Avatar = GetAvatarActorFromActorInfo();
			const FVector HitDirection = Avatar
				? (TargetActor->GetActorLocation() - Avatar->GetActorLocation()).GetSafeNormal()
				: FVector::ForwardVector;

			if (UCombatFeedbackSubsystem* CombatFeedback = GameInstance->GetSubsystem<UCombatFeedbackSubsystem>())
			{
				CombatFeedback->NotifyHitLanded(TargetActor, FinalDamage, bIsCritical);
				if (bKilled)
				{
					CombatFeedback->NotifyKillConfirmed(TargetActor);
				}
			}
			if (UCombatJuiceSubsystem* Juice = GameInstance->GetSubsystem<UCombatJuiceSubsystem>())
			{
				Juice->NotifyHit(TargetActor, FinalDamage, bIsCritical, SkillData.Element, HitDirection, bKilled);
			}
			if (AStickmanEnemyCharacter* Enemy = Cast<AStickmanEnemyCharacter>(TargetActor))
			{
				Enemy->ReceiveHitFeedback(HitDirection, FinalDamage, bKilled);
			}
		}
	}

	if (!StatusEffectClass || !TargetASC)
	{
		return;
	}

	UAbilitySystemComponent* SourceASC = GetAbilitySystemComponentFromActorInfo();
	if (!SourceASC)
	{
		return;
	}

	FGameplayEffectContextHandle ContextHandle = SourceASC->MakeEffectContext();
	ContextHandle.AddSourceObject(const_cast<UStickmanGameplayAbility*>(this));
	FGameplayEffectSpecHandle SpecHandle = SourceASC->MakeOutgoingSpec(StatusEffectClass, GetAbilityLevel(), ContextHandle);
	if (SpecHandle.IsValid())
	{
		// DoT tick amount per the design docs: 10% of the caster's Attack per second.
		const UStickmanAttributeSet* AttributeSet = GetStickmanAttributeSet();
		const float TickDamage = (AttributeSet ? AttributeSet->GetAttack() : 20.f) * 0.1f;
		SpecHandle.Data->SetSetByCallerMagnitude(StickmanGameplayTags::SetByCaller_Damage, TickDamage);
		SourceASC->ApplyGameplayEffectSpecToTarget(*SpecHandle.Data, TargetASC);
	}
}

void UStickmanGameplayAbility::PlayImpactCameraShake(TSubclassOf<UCameraShakeBase> ShakeClass) const
{
	if (!ShakeClass)
	{
		return;
	}
	if (const APawn* AvatarPawn = Cast<APawn>(GetAvatarActorFromActorInfo()))
	{
		if (APlayerController* PC = Cast<APlayerController>(AvatarPawn->GetController()))
		{
			PC->ClientStartCameraShake(ShakeClass);
		}
	}
}

void UStickmanGameplayAbility::PlayCastAudioVisuals() const
{
	AActor* AvatarActor = GetAvatarActorFromActorInfo();
	if (!AvatarActor)
	{
		return;
	}

	if (SkillData.CastVFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAttached(SkillData.CastVFX, AvatarActor->GetRootComponent(), NAME_None,
			FVector::ZeroVector, FRotator::ZeroRotator, EAttachLocation::KeepRelativeOffset, true);
	}
	if (SkillData.CastSound)
	{
		UGameplayStatics::PlaySoundAtLocation(AvatarActor, SkillData.CastSound, AvatarActor->GetActorLocation());
	}
}
