// Copyright StickmanImpact Project.

#include "DefenseComponent.h"
#include "DefenseSkillSubsystem.h"
#include "StyleSubsystem.h"
#include "StickmanAttributeSet.h"
#include "Character/StickmanCharacter.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "Audio/StickmanAudioManager.h"
#include "NiagaraFunctionLibrary.h"
#include "AbilitySystemComponent.h"
#include "GameplayTagContainer.h"
#include "GameFramework/Character.h"
#include "Kismet/GameplayStatics.h"
#include "EngineUtils.h"
#include "TimerManager.h"

UDefenseComponent::UDefenseComponent()
{
	PrimaryComponentTick.bCanEverTick = false;
}

void UDefenseComponent::BeginPlay()
{
	Super::BeginPlay();

	// Sensible element-color defaults if none authored.
	if (ElementColors.Num() == 0)
	{
		ElementColors.Add(EStickmanElement::Pyro,    FLinearColor(1.f, 0.35f, 0.1f));
		ElementColors.Add(EStickmanElement::Hydro,   FLinearColor(0.2f, 0.6f, 1.f));
		ElementColors.Add(EStickmanElement::Cryo,    FLinearColor(0.6f, 0.9f, 1.f));
		ElementColors.Add(EStickmanElement::Electro, FLinearColor(0.7f, 0.4f, 1.f));
		ElementColors.Add(EStickmanElement::Anemo,   FLinearColor(0.4f, 1.f, 0.8f));
		ElementColors.Add(EStickmanElement::Geo,     FLinearColor(1.f, 0.8f, 0.3f));
		ElementColors.Add(EStickmanElement::Dendro,  FLinearColor(0.5f, 1.f, 0.3f));
	}
}

UDefenseSkillSubsystem* UDefenseComponent::GetSkills() const
{
	const UGameInstance* GameInstance = GetOwner() ? GetOwner()->GetGameInstance() : nullptr;
	return GameInstance ? GameInstance->GetSubsystem<UDefenseSkillSubsystem>() : nullptr;
}

FLinearColor UDefenseComponent::ColorForElement(EStickmanElement Element) const
{
	const FLinearColor* Color = ElementColors.Find(Element);
	return Color ? *Color : FLinearColor::White;
}

void UDefenseComponent::PlaySound(USoundBase* Sound) const
{
	if (!Sound)
	{
		return;
	}
	if (const UGameInstance* GameInstance = GetOwner()->GetGameInstance())
	{
		if (UStickmanAudioManager* Audio = GameInstance->GetSubsystem<UStickmanAudioManager>())
		{
			Audio->PlaySFX(Sound, GetOwner()->GetActorLocation());
		}
	}
}

// ---------------------------------------------------------------- dodge ---------------

void UDefenseComponent::NotifyDodgeStarted()
{
	const double Now = GetWorld()->GetTimeSeconds();
	DodgeStartTime = Now;

	// Spam tracking: prune old entries, then check the count in-window.
	RecentDodgeTimes.RemoveAll([this, Now](double Time) { return Now - Time > DodgeSpamWindow; });
	RecentDodgeTimes.Add(Now);
	if (RecentDodgeTimes.Num() >= DodgeSpamCount)
	{
		DodgeSpamPenaltyUntil = Now + DodgeSpamPenalty;
	}
}

// ---------------------------------------------------------------- parry ---------------

void UDefenseComponent::BeginParry()
{
	if (IsGuardBroken())
	{
		return; // Locked out mid guard-break.
	}
	ParryStartTime = GetWorld()->GetTimeSeconds();
}

bool UDefenseComponent::IsGuardBroken() const
{
	return GetWorld() && GetWorld()->GetTimeSeconds() < GuardBreakUntil;
}

// ---------------------------------------------------------------- resolve -------------

EDefenseResult UDefenseComponent::ResolveIncomingAttack(AActor* Attacker, bool bAttackParryable)
{
	const double Now = GetWorld()->GetTimeSeconds();
	const UDefenseSkillSubsystem* Skills = GetSkills();

	EStickmanElement AttackerElement = EStickmanElement::None;
	// (Attacker's element could be read from its current ability; default None = white glow.)

	// --- Dodge resolution: is a dash active/recent? ---
	const double SinceDodge = Now - DodgeStartTime;
	if (SinceDodge >= 0.0 && SinceDodge <= IFrameWindow)
	{
		const bool bPenalized = Now < DodgeSpamPenaltyUntil;

		if (!bPenalized && SinceDodge <= PerfectDodgeWindow)
		{
			TriggerWitchTime(AttackerElement, Attacker);
			return EDefenseResult::PerfectDodge;
		}
		// Inside i-frames but past the perfect slice: negate, no bonus.
		return EDefenseResult::IFrame;
	}

	// Near miss: dodged just a hair late.
	if (SinceDodge > IFrameWindow && SinceDodge <= IFrameWindow + NearMissGrace)
	{
		UWorld* World = GetWorld();
		UGameplayStatics::SetGlobalTimeDilation(World, NearMissDilation);
		World->GetTimerManager().SetTimer(NearMissTimerHandle, FTimerDelegate::CreateWeakLambda(World, [World]()
		{
			UGameplayStatics::SetGlobalTimeDilation(World, 1.f);
		}), NearMissRealSeconds * NearMissDilation, false);
		OnNearMiss.Broadcast(ColorForElement(AttackerElement));
		// Near miss doesn't negate — it's a "you were close" nudge; full damage still lands.
		return EDefenseResult::None;
	}

	// --- Parry resolution: is a parry active? ---
	const double SinceParry = Now - ParryStartTime;
	float ParryWindow = Skills ? Skills->GetParryWindow() : 0.15f;
	// DMC Royal Guard stance doubles the parry window.
	if (const UGameInstance* GameInstance = GetOwner()->GetGameInstance())
	{
		if (const UStyleSubsystem* Style = GameInstance->GetSubsystem<UStyleSubsystem>())
		{
			ParryWindow *= Style->GetParryWindowMultiplier();
		}
	}
	if (SinceParry >= 0.0 && SinceParry <= ParryWindow + PartialParryGrace)
	{
		if (!bAttackParryable)
		{
			// Red attack — parry can't catch it. Punished as a guard break.
			GuardBreakUntil = Now + GuardBreakLockout;
			OnGuardBroken.Broadcast();
			return EDefenseResult::GuardBreak;
		}

		if (SinceParry <= ParryWindow)
		{
			// PERFECT PARRY.
			if (AStickmanEnemyCharacter* Enemy = Cast<AStickmanEnemyCharacter>(Attacker))
			{
				Enemy->ForceStagger(ParryStaggerDuration);
			}

			// Refund burst energy.
			if (const AStickmanCharacter* Player = Cast<AStickmanCharacter>(GetOwner()))
			{
				if (UStickmanAttributeSet* Attributes = Player->GetStickmanAttributeSet())
				{
					const float Refund = Attributes->GetMaxEnergy() * ParryEnergyRefundFraction;
					Attributes->SetCurrentEnergy(FMath::Min(Attributes->GetCurrentEnergy() + Refund,
						Attributes->GetMaxEnergy()));
					Attributes->OnEnergyChanged.Broadcast(Attributes->GetCurrentEnergy(), Attributes->GetMaxEnergy());
				}
			}

			ArmCounter(RiposteDamageMultiplier);
			PlaySound(ParrySound);

			// Level 4: AoE blast on parry.
			if (Skills && Skills->ParryEmitsBlast())
			{
				OnParryBlast.Broadcast();
				for (TActorIterator<AStickmanEnemyCharacter> It(GetWorld()); It; ++It)
				{
					if (*It != Attacker &&
						FVector::Dist(It->GetActorLocation(), GetOwner()->GetActorLocation()) <= ParryBlastRadius)
					{
						It->ForceStagger(ParryStaggerDuration * 0.5f);
					}
				}
			}

			ParryStartTime = -100.0; // Consume.
			OnParryResolved.Broadcast(EDefenseResult::PerfectParry);
			return EDefenseResult::PerfectParry;
		}

		// PARTIAL PARRY: reduced damage, spark, no stagger.
		if (ParrySparkVFX)
		{
			UNiagaraFunctionLibrary::SpawnSystemAtLocation(this, ParrySparkVFX, GetOwner()->GetActorLocation());
		}
		ParryStartTime = -100.0;
		OnParryResolved.Broadcast(EDefenseResult::PartialParry);
		return EDefenseResult::PartialParry;
	}

	// No active dodge or parry catching this hit — full damage, no guard-break punish (a
	// stale parry press from seconds ago shouldn't count as a "failed parry").
	return EDefenseResult::None;
}

float UDefenseComponent::GetDamageMultiplier(EDefenseResult Result)
{
	switch (Result)
	{
		case EDefenseResult::PerfectDodge:
		case EDefenseResult::IFrame:
		case EDefenseResult::PerfectParry:
			return 0.f;
		case EDefenseResult::PartialParry:
			return 0.5f;
		case EDefenseResult::GuardBreak:
		case EDefenseResult::None:
		default:
			return 1.f;
	}
}

// ---------------------------------------------------------------- witch time ----------

void UDefenseComponent::TriggerWitchTime(EStickmanElement Element, AActor* Attacker)
{
	UWorld* World = GetWorld();
	const UDefenseSkillSubsystem* Skills = GetSkills();
	const float Duration = Skills ? Skills->GetWitchTimeDuration() : 1.5f;

	bWitchTimeActive = true;
	UGameplayStatics::SetGlobalTimeDilation(World, WitchTimeDilation);

	// Keep the player at real-time speed: CustomTimeDilation stacks on the global one.
	if (AActor* Owner = GetOwner())
	{
		Owner->CustomTimeDilation = 1.f / FMath::Max(WitchTimeDilation, KINDA_SMALL_NUMBER);
	}

	PlaySound(PerfectDodgeSound);
	OnPerfectDodge.Broadcast(ColorForElement(Element));
	ArmCounter(CounterDamageMultiplier);

	// Level 3: witch time spreads a brief stagger to nearby enemies.
	if (Skills && Skills->WitchTimeSpreads())
	{
		for (TActorIterator<AStickmanEnemyCharacter> It(World); It; ++It)
		{
			if (FVector::Dist(It->GetActorLocation(), GetOwner()->GetActorLocation()) <= WitchTimeSpreadRadius)
			{
				It->ForceStagger(0.5f);
			}
		}
	}

	// Level 4: auto-counter — fire the player's normal attack once during witch time.
	if (Skills && Skills->HasAutoCounter())
	{
		if (AStickmanCharacter* Player = Cast<AStickmanCharacter>(GetOwner()))
		{
			if (UAbilitySystemComponent* ASC = Player->GetStickmanAbilitySystemComponent())
			{
				ASC->TryActivateAbilitiesByTag(FGameplayTagContainer(Player->GetNormalAttackSkillTag()));
			}
		}
	}

	// Restore after Duration real-seconds (timer runs in dilated time, so scale it).
	World->GetTimerManager().SetTimer(WitchTimeTimerHandle, this, &UDefenseComponent::EndWitchTime,
		Duration * WitchTimeDilation, false);
}

void UDefenseComponent::EndWitchTime()
{
	bWitchTimeActive = false;
	if (UWorld* World = GetWorld())
	{
		UGameplayStatics::SetGlobalTimeDilation(World, 1.f);
	}
	if (AActor* Owner = GetOwner())
	{
		Owner->CustomTimeDilation = 1.f;
	}
}

// ---------------------------------------------------------------- counter -------------

void UDefenseComponent::ArmCounter(float Multiplier)
{
	ArmedCounterMultiplier = Multiplier;
	// Counter valid through the reaction window (witch-time duration + a real-time grace).
	const UDefenseSkillSubsystem* Skills = GetSkills();
	const float Window = (Skills ? Skills->GetWitchTimeDuration() : 1.5f) + 0.5f;
	CounterExpiryTime = GetWorld()->GetTimeSeconds() + Window;
	OnCounterArmed.Broadcast(Multiplier);
}

float UDefenseComponent::ConsumeCounterMultiplier()
{
	if (ArmedCounterMultiplier > 1.f && GetWorld()->GetTimeSeconds() <= CounterExpiryTime)
	{
		const float Multiplier = ArmedCounterMultiplier;
		ArmedCounterMultiplier = 1.f; // One-shot.
		return Multiplier;
	}
	ArmedCounterMultiplier = 1.f;
	return 1.f;
}
