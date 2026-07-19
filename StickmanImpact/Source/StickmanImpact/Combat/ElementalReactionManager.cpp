// Copyright StickmanImpact Project.

#include "ElementalReactionManager.h"
#include "StickmanReactionEffectsDataAsset.h"
#include "StickmanAttributeSet.h"
#include "GameFlow/StickmanCheatManager.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "World/StickmanElementalShard.h"
#include "AbilitySystemBlueprintLibrary.h"
#include "AbilitySystemComponent.h"
#include "AbilitySystemInterface.h"
#include "Kismet/GameplayStatics.h"
#include "Kismet/KismetSystemLibrary.h"
#include "GameFramework/Character.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/PlayerController.h"
#include "TimerManager.h"
#include "HAL/IConsoleManager.h"
#include "NiagaraFunctionLibrary.h"
#include "Camera/CameraShakeBase.h"
#include "Engine/Engine.h"

namespace
{
	// Simplified aura-decay tuning: real Genshin uses a per-element "Gauge Unit" decay table.
	// This keeps the same spirit (Dendro/Electro aura decays fastest, Cryo/Hydro slowest)
	// without reproducing the exact unit-conversion math.
	float GetElementDecayRate(EStickmanElement Element)
	{
		switch (Element)
		{
			case EStickmanElement::Dendro: return 30.f;
			case EStickmanElement::Electro: return 28.f;
			case EStickmanElement::Anemo: return 25.f;
			case EStickmanElement::Geo: return 25.f;
			case EStickmanElement::Pyro: return 20.f;
			case EStickmanElement::Hydro: return 18.f;
			case EStickmanElement::Cryo: return 16.f;
			default: return 20.f;
		}
	}
}

void UElementalReactionManager::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);

	ShowReactionLogCommand = IConsoleManager::Get().RegisterConsoleCommand(
		TEXT("Stickman.ShowReactionLog"),
		TEXT("Toggle elemental reaction console logging on/off."),
		FConsoleCommandDelegate::CreateUObject(this, &UElementalReactionManager::ToggleReactionLog),
		ECVF_Default);

	DisplayElementalGaugeCommand = IConsoleManager::Get().RegisterConsoleCommand(
		TEXT("Stickman.DisplayElementalGauge"),
		TEXT("Toggle on-screen elemental gauge debug values for all tracked actors."),
		FConsoleCommandDelegate::CreateUObject(this, &UElementalReactionManager::ToggleGaugeDisplay),
		ECVF_Default);
}

void UElementalReactionManager::Deinitialize()
{
	if (ShowReactionLogCommand)
	{
		IConsoleManager::Get().UnregisterConsoleObject(ShowReactionLogCommand);
		ShowReactionLogCommand = nullptr;
	}
	if (DisplayElementalGaugeCommand)
	{
		IConsoleManager::Get().UnregisterConsoleObject(DisplayElementalGaugeCommand);
		DisplayElementalGaugeCommand = nullptr;
	}

	Super::Deinitialize();
}

void UElementalReactionManager::ToggleReactionLog()
{
	bLoggingEnabled = !bLoggingEnabled;
	UE_LOG(LogTemp, Display, TEXT("[ElementalReactionManager] Reaction logging %s"),
		bLoggingEnabled ? TEXT("ENABLED") : TEXT("DISABLED"));
}

void UElementalReactionManager::ToggleGaugeDisplay()
{
	bDisplayGaugeDebug = !bDisplayGaugeDebug;
	UE_LOG(LogTemp, Display, TEXT("[ElementalReactionManager] Gauge debug display %s"),
		bDisplayGaugeDebug ? TEXT("ENABLED") : TEXT("DISABLED"));
}

// -------------------------------------------------------------------
// Aura bookkeeping
// -------------------------------------------------------------------

float UElementalReactionManager::GetBaseAuraDuration(EStickmanElement Element, float Gauge) const
{
	return FMath::Clamp(Gauge / GetElementDecayRate(Element), 2.f, 12.f);
}

void UElementalReactionManager::PruneExpiredElements(AActor* Target)
{
	TArray<FActiveElement>* Auras = ActiveElementsMap.Find(Target);
	if (!Auras)
	{
		return;
	}
	const float Now = GetWorld()->GetTimeSeconds();
	Auras->RemoveAll([Now](const FActiveElement& A) { return A.IsExpired(Now); });
}

TArray<FActiveElement> UElementalReactionManager::GetActiveElements(AActor* Target)
{
	PruneExpiredElements(Target);
	if (const TArray<FActiveElement>* Auras = ActiveElementsMap.Find(Target))
	{
		return *Auras;
	}
	return TArray<FActiveElement>();
}

bool UElementalReactionManager::IsFrozen(AActor* Target) const
{
	const FStickmanReactionState* State = ReactionStateMap.Find(Target);
	return State && State->bFrozen;
}

float UElementalReactionManager::GetDefenseMultiplier(AActor* Target) const
{
	const FStickmanReactionState* State = ReactionStateMap.Find(Target);
	if (State && State->bDefenseShredded && GetWorld()->GetTimeSeconds() < State->DefenseShredEndTime)
	{
		return 1.f - State->DefenseShredFraction;
	}
	return 1.f;
}

bool UElementalReactionManager::IsSwirlable(EStickmanElement Element)
{
	return Element == EStickmanElement::Pyro || Element == EStickmanElement::Hydro
		|| Element == EStickmanElement::Cryo || Element == EStickmanElement::Electro;
}

bool UElementalReactionManager::IsCrystallizable(EStickmanElement Element)
{
	return Element == EStickmanElement::Pyro || Element == EStickmanElement::Hydro
		|| Element == EStickmanElement::Cryo || Element == EStickmanElement::Electro;
}

EStickmanReactionType UElementalReactionManager::DetermineTripleReaction(EStickmanElement A, EStickmanElement B,
	EStickmanElement Incoming) const
{
	auto Has = [&](EStickmanElement E) { return A == E || B == E || Incoming == E; };
	const bool bHasAnemo = Has(EStickmanElement::Anemo);

	// Anemo + any 2 swirlable elements = Elemental Storm.
	if (bHasAnemo)
	{
		int32 Swirlable = 0;
		for (EStickmanElement E : { A, B, Incoming })
		{
			if (IsSwirlable(E))
			{
				++Swirlable;
			}
		}
		if (Swirlable >= 2)
		{
			return EStickmanReactionType::ElementalStorm;
		}
	}

	if (Has(EStickmanElement::Pyro) && Has(EStickmanElement::Hydro) && Has(EStickmanElement::Cryo))
		return EStickmanReactionType::Shatterfrost;
	if (Has(EStickmanElement::Pyro) && Has(EStickmanElement::Electro) && Has(EStickmanElement::Dendro))
		return EStickmanReactionType::Wildfire;
	if (Has(EStickmanElement::Hydro) && Has(EStickmanElement::Cryo) && Has(EStickmanElement::Electro))
		return EStickmanReactionType::SuperconductFreeze;
	if (Has(EStickmanElement::Electro) && Has(EStickmanElement::Pyro) && Has(EStickmanElement::Hydro))
		return EStickmanReactionType::ElectroChargedSteam;

	return EStickmanReactionType::None;
}

void UElementalReactionManager::TrackReactionChain(AActor* Target, EStickmanElement ConsumedA, EStickmanElement ConsumedB)
{
	const double Now = GetWorld()->GetTimeSeconds();
	if (Now - LastReactionTime > ChainWindow)
	{
		ReactionChainCount = 0;
		ElementsConsumedThisChain.Reset();
	}
	LastReactionTime = Now;
	++ReactionChainCount;
	ElementsConsumedThisChain.Add(static_cast<uint8>(ConsumedA));
	ElementsConsumedThisChain.Add(static_cast<uint8>(ConsumedB));

	if (ReactionChainCount > 1)
	{
		OnReactionChain.Broadcast(ReactionChainCount); // "Reaction chain x3!" UI hook.
	}

	// Grand Reaction: all 7 elements consumed within one chain.
	if (ElementsConsumedThisChain.Num() >= 7 && Target)
	{
		TArray<AActor*> Overlaps;
		UKismetSystemLibrary::SphereOverlapActors(Target, Target->GetActorLocation(), GrandReactionRadius,
			TArray<TEnumAsByte<EObjectTypeQuery>>{ UEngineTypes::ConvertToObjectType(ECC_Pawn) }, nullptr,
			TArray<AActor*>(), Overlaps);
		for (AActor* Nearby : Overlaps)
		{
			ApplyDirectDamage(Nearby, GrandReactionDamage);
		}
		UE_LOG(LogTemp, Display, TEXT("[Reactions] GRAND REACTION! All 7 elements chained."));
		ElementsConsumedThisChain.Reset();
		ReactionChainCount = 0;
	}
}

float UElementalReactionManager::GetChainDamageMultiplier() const
{
	return 1.f + ChainDamageBonusPerLink * FMath::Max(ReactionChainCount - 1, 0);
}

float UElementalReactionManager::GetTargetReactionDamageScale(AActor* Target, EStickmanReactionType Reaction) const
{
	if (const AStickmanEnemyCharacter* Enemy = Cast<AStickmanEnemyCharacter>(Target))
	{
		return Enemy->GetReactionDamageMultiplier(Reaction);
	}
	return 1.f;
}

EStickmanReactionType UElementalReactionManager::DetermineReaction(EStickmanElement Existing, EStickmanElement Incoming) const
{
	if (Incoming == EStickmanElement::Anemo && IsSwirlable(Existing)) return EStickmanReactionType::Swirl;
	if (Existing == EStickmanElement::Anemo && IsSwirlable(Incoming)) return EStickmanReactionType::Swirl;

	if (Incoming == EStickmanElement::Geo && IsCrystallizable(Existing)) return EStickmanReactionType::Crystallize;
	if (Existing == EStickmanElement::Geo && IsCrystallizable(Incoming)) return EStickmanReactionType::Crystallize;

	auto Pair = [Existing, Incoming](EStickmanElement A, EStickmanElement B)
	{
		return (Existing == A && Incoming == B) || (Existing == B && Incoming == A);
	};

	if (Pair(EStickmanElement::Pyro, EStickmanElement::Cryo)) return EStickmanReactionType::Melt;
	if (Pair(EStickmanElement::Pyro, EStickmanElement::Hydro)) return EStickmanReactionType::Vaporize;
	if (Pair(EStickmanElement::Pyro, EStickmanElement::Electro)) return EStickmanReactionType::Overload;
	if (Pair(EStickmanElement::Pyro, EStickmanElement::Dendro)) return EStickmanReactionType::Burning;
	if (Pair(EStickmanElement::Cryo, EStickmanElement::Hydro)) return EStickmanReactionType::Frozen;
	if (Pair(EStickmanElement::Cryo, EStickmanElement::Electro)) return EStickmanReactionType::Superconduct;
	if (Pair(EStickmanElement::Hydro, EStickmanElement::Electro)) return EStickmanReactionType::ElectroCharged;
	if (Pair(EStickmanElement::Hydro, EStickmanElement::Dendro)) return EStickmanReactionType::Bloom;
	if (Pair(EStickmanElement::Electro, EStickmanElement::Dendro)) return EStickmanReactionType::Quicken;

	return EStickmanReactionType::None;
}

// -------------------------------------------------------------------
// Core API
// -------------------------------------------------------------------

FStickmanReactionResult UElementalReactionManager::ApplyElement(AActor* Target, EStickmanElement Element, float Gauge,
	float AttackerElementalMastery)
{
	FStickmanReactionResult Result;
	if (!Target || Element == EStickmanElement::None)
	{
		return Result;
	}

	PruneExpiredElements(Target);
	const float Now = GetWorld()->GetTimeSeconds();
	FStickmanReactionState& State = ReactionStateMap.FindOrAdd(Target);

	// Quicken is state-based (not an aura entry) — an Electro/Dendro hit on a Quickened
	// target is Aggravate/Spread instead of re-triggering Quicken or falling through to a
	// normal aura application.
	if (State.bQuickened && Now < State.QuickenEndTime)
	{
		if (Element == EStickmanElement::Electro)
		{
			Result = ResolveReaction(Target, EStickmanReactionType::Aggravate, EStickmanElement::Dendro, Element,
				AttackerElementalMastery, true);
			State.QuickenEndTime = Now + 8.f;
			return Result;
		}
		if (Element == EStickmanElement::Dendro)
		{
			Result = ResolveReaction(Target, EStickmanReactionType::Spread, EStickmanElement::Electro, Element,
				AttackerElementalMastery, true);
			State.QuickenEndTime = Now + 8.f;
			return Result;
		}
	}

	TArray<FActiveElement>& Auras = ActiveElementsMap.FindOrAdd(Target);

	// Triple reactions first: two distinct existing auras + the incoming element.
	if (Auras.Num() >= 2)
	{
		for (int32 IndexA = 0; IndexA < Auras.Num(); ++IndexA)
		{
			for (int32 IndexB = IndexA + 1; IndexB < Auras.Num(); ++IndexB)
			{
				const EStickmanElement ElementA = Auras[IndexA].Element;
				const EStickmanElement ElementB = Auras[IndexB].Element;
				const EStickmanReactionType Triple = DetermineTripleReaction(ElementA, ElementB, Element);
				if (Triple == EStickmanReactionType::None)
				{
					continue;
				}
				// Consume both auras.
				Auras.RemoveAt(IndexB);
				Auras.RemoveAt(IndexA);
				TrackReactionChain(Target, ElementA, ElementB);
				ElementsConsumedThisChain.Add(static_cast<uint8>(Element));
				Result = ResolveReaction(Target, Triple, ElementA, Element, AttackerElementalMastery, true);
				Result.ReactionDamage *= GetChainDamageMultiplier();
				return Result;
			}
		}
	}

	int32 ReactingIndex = INDEX_NONE;
	for (int32 Index = 0; Index < Auras.Num(); ++Index)
	{
		if (Auras[Index].Element != Element && DetermineReaction(Auras[Index].Element, Element) != EStickmanReactionType::None)
		{
			ReactingIndex = Index;
			break;
		}
	}

	if (ReactingIndex != INDEX_NONE)
	{
		const EStickmanElement ExistingElement = Auras[ReactingIndex].Element;
		const EStickmanReactionType Reaction = DetermineReaction(ExistingElement, Element);
		Auras.RemoveAt(ReactingIndex);

		TrackReactionChain(Target, ExistingElement, Element);
		Result = ResolveReaction(Target, Reaction, ExistingElement, Element, AttackerElementalMastery, true);
		Result.ReactionDamage *= GetChainDamageMultiplier() * GetTargetReactionDamageScale(Target, Reaction);
	}
	else
	{
		const int32 SameElementIndex = Auras.IndexOfByPredicate(
			[Element](const FActiveElement& A) { return A.Element == Element; });
		const float Duration = GetBaseAuraDuration(Element, Gauge);

		if (SameElementIndex != INDEX_NONE)
		{
			Auras[SameElementIndex].Gauge = FMath::Max(Auras[SameElementIndex].Gauge, Gauge);
			Auras[SameElementIndex].Duration = Duration;
			Auras[SameElementIndex].AppliedTime = Now;
		}
		else
		{
			FActiveElement NewAura;
			NewAura.Element = Element;
			NewAura.Gauge = Gauge;
			NewAura.Duration = Duration;
			NewAura.AppliedTime = Now;
			Auras.Add(NewAura);
		}

		OnElementApplied.Broadcast(Target, Element, Gauge);
	}

	return Result;
}

float UElementalReactionManager::CalculateReactionDamage(AActor* Target, float IncomingDamage,
	EStickmanElement AttackerElement, float ElementalMastery)
{
	if (!Target || AttackerElement == EStickmanElement::None)
	{
		return IncomingDamage;
	}

	// Default gauge per hit — a full-strength application (matches "Gauge" being an
	// authorable per-ability value; abilities that want a weaker infusion should call
	// ApplyElement() directly with their own Gauge instead of going through this helper).
	constexpr float DefaultGauge = 100.f;

	const FStickmanReactionResult Result = ApplyElement(Target, AttackerElement, DefaultGauge, ElementalMastery);

	const float FinalDamage = (IncomingDamage * Result.DamageMultiplier) + Result.ReactionDamage;

	if (bLoggingEnabled && Result.Reaction != EStickmanReactionType::None)
	{
		UE_LOG(LogTemp, Log, TEXT("[Reaction] %s on %s: incoming=%.1f x%.2f + %.1f = %.1f"),
			*UEnum::GetValueAsString(Result.Reaction), *Target->GetName(), IncomingDamage, Result.DamageMultiplier,
			Result.ReactionDamage, FinalDamage);
	}

	return FinalDamage;
}

bool UElementalReactionManager::TryShatterFrozen(AActor* Target, float& OutDamageMultiplier)
{
	OutDamageMultiplier = 1.f;
	FStickmanReactionState* State = ReactionStateMap.Find(Target);
	if (!State || !State->bFrozen)
	{
		return false;
	}

	OutDamageMultiplier = 2.5f; // 100% base + 150% shatter bonus
	State->bFrozen = false;

	if (ACharacter* TargetCharacter = Cast<ACharacter>(Target))
	{
		TargetCharacter->GetCharacterMovement()->SetMovementMode(MOVE_Walking);
	}

	LogReaction(Target, EStickmanReactionType::Frozen, 0.f);
	return true;
}

// -------------------------------------------------------------------
// Reaction resolution
// -------------------------------------------------------------------

FStickmanReactionResult UElementalReactionManager::ResolveReaction(AActor* Target, EStickmanReactionType Reaction,
	EStickmanElement ExistingElement, EStickmanElement IncomingElement, float ElementalMastery, bool bAllowSwirlSpread)
{
	FStickmanReactionResult Result;
	Result.Reaction = Reaction;

	const FVector TargetLocation = Target ? Target->GetActorLocation() : FVector::ZeroVector;

	switch (Reaction)
	{
		case EStickmanReactionType::Melt:
		case EStickmanReactionType::Vaporize:
		{
			// Forward (Pyro is the attacking element): 2.0x. Reverse (Cryo/Hydro attacking a
			// Pyro aura): 1.5x. Matches the real game's asymmetric Melt/Vaporize multipliers.
			Result.DamageMultiplier = (IncomingElement == EStickmanElement::Pyro) ? 2.f : 1.5f;
			break;
		}
		case EStickmanReactionType::Overload:
		{
			Result.ReactionDamage = ElementalMastery * 2.f;
			ApplyDirectDamage(Target, Result.ReactionDamage);
			ApplyOverloadKnockback(Target, 300.f, 800.f);
			break;
		}
		case EStickmanReactionType::Burning:
		{
			StartBurningDoT(Target, ElementalMastery);
			// "Spreads to nearby dendro objects" — hook point for a future world-object
			// system (burnable foliage etc.); no such system exists yet, so just log it.
			UE_LOG(LogTemp, Verbose, TEXT("[Burning] would spread to nearby Dendro objects near %s"), *TargetLocation.ToString());
			break;
		}
		case EStickmanReactionType::Frozen:
		{
			FreezeTarget(Target, 3.f);
			break;
		}
		case EStickmanReactionType::Superconduct:
		{
			Result.ReactionDamage = ElementalMastery * 0.5f;
			ApplyDirectDamage(Target, Result.ReactionDamage);
			if (FStickmanReactionState* State = ReactionStateMap.Find(Target))
			{
				State->bDefenseShredded = true;
				State->DefenseShredEndTime = GetWorld()->GetTimeSeconds() + 12.f;
				State->DefenseShredFraction = 0.4f;
			}
			break;
		}
		case EStickmanReactionType::ElectroCharged:
		{
			StartElectroChargedTicks(Target, ElementalMastery);
			break;
		}
		case EStickmanReactionType::Bloom:
		{
			StartBloomCore(Target, ElementalMastery);
			break;
		}
		case EStickmanReactionType::Swirl:
		{
			Result.ReactionDamage = ElementalMastery * 1.2f;
			ApplyDirectDamage(Target, Result.ReactionDamage);
			if (bAllowSwirlSpread)
			{
				// Whichever element wasn't Anemo is the one that gets carried outward.
				const EStickmanElement SpreadElement =
					(ExistingElement == EStickmanElement::Anemo) ? IncomingElement : ExistingElement;
				ApplySwirlSpread(Target, SpreadElement, ElementalMastery);
			}
			break;
		}
		case EStickmanReactionType::Crystallize:
		{
			if (UWorld* World = GetWorld())
			{
				if (ElementalShardClass)
				{
					const EStickmanElement ShardElement =
						(ExistingElement == EStickmanElement::Geo) ? IncomingElement : ExistingElement;
					AStickmanElementalShard* Shard = World->SpawnActor<AStickmanElementalShard>(
						ElementalShardClass, TargetLocation + FVector(0.f, 0.f, 50.f), FRotator::ZeroRotator);
					if (Shard)
					{
						Shard->Element = ShardElement;
						Shard->ShieldAmount = ElementalMastery * 1.5f;
						Shard->Lifetime = 15.f;
					}
				}
			}
			break;
		}
		case EStickmanReactionType::Quicken:
		{
			if (FStickmanReactionState* State = ReactionStateMap.Find(Target))
			{
				State->bQuickened = true;
				State->QuickenEndTime = GetWorld()->GetTimeSeconds() + 8.f;
			}
			break;
		}
		case EStickmanReactionType::Aggravate:
		case EStickmanReactionType::Spread:
		{
			Result.ReactionDamage = ElementalMastery * 0.6f;
			ApplyDirectDamage(Target, Result.ReactionDamage);
			break;
		}

		// --- Triple reactions ------------------------------------------------
		case EStickmanReactionType::Shatterfrost:
		{
			// AoE freeze + physical shatter burst.
			Result.ReactionDamage = ElementalMastery * 2.5f;
			TArray<AActor*> Overlaps;
			UKismetSystemLibrary::SphereOverlapActors(Target, TargetLocation, 400.f,
				TArray<TEnumAsByte<EObjectTypeQuery>>{ UEngineTypes::ConvertToObjectType(ECC_Pawn) }, nullptr,
				TArray<AActor*>(), Overlaps);
			for (AActor* Nearby : Overlaps)
			{
				FreezeTarget(Nearby, 2.f);
				ApplyDirectDamage(Nearby, Result.ReactionDamage);
			}
			break;
		}
		case EStickmanReactionType::Wildfire:
		{
			// Spreading burn that hits EVERYONE in radius — including the player. Dual-use
			// by design: risk/reward for triggering it close.
			Result.ReactionDamage = ElementalMastery * 1.5f;
			TArray<AActor*> Overlaps;
			UKismetSystemLibrary::SphereOverlapActors(Target, TargetLocation, 500.f,
				TArray<TEnumAsByte<EObjectTypeQuery>>{ UEngineTypes::ConvertToObjectType(ECC_Pawn) }, nullptr,
				TArray<AActor*>(), Overlaps);
			for (AActor* Nearby : Overlaps)
			{
				StartBurningDoT(Nearby, ElementalMastery);
			}
			break;
		}
		case EStickmanReactionType::SuperconductFreeze:
		{
			Result.ReactionDamage = ElementalMastery * 1.2f;
			ApplyDirectDamage(Target, Result.ReactionDamage);
			FreezeTarget(Target, 3.f);
			if (FStickmanReactionState* State = ReactionStateMap.Find(Target))
			{
				State->bDefenseShredded = true;
				State->DefenseShredEndTime = GetWorld()->GetTimeSeconds() + 12.f;
				State->DefenseShredFraction = 0.4f;
			}
			break;
		}
		case EStickmanReactionType::ElectroChargedSteam:
		{
			// Blinding fog: damage + the fog visual is the reaction's authored VFX; "blind"
			// on enemies = drop their sight briefly (Alert level dip handled AI-side via the
			// Suspicious fallback when they lose the target in fog).
			Result.ReactionDamage = ElementalMastery * 1.8f;
			ApplyDirectDamage(Target, Result.ReactionDamage);
			break;
		}
		case EStickmanReactionType::ElementalStorm:
		{
			// Massive swirl: heavy AoE + spreads BOTH consumed elements outward.
			Result.ReactionDamage = ElementalMastery * 3.f;
			TArray<AActor*> Overlaps;
			UKismetSystemLibrary::SphereOverlapActors(Target, TargetLocation, 700.f,
				TArray<TEnumAsByte<EObjectTypeQuery>>{ UEngineTypes::ConvertToObjectType(ECC_Pawn) }, nullptr,
				TArray<AActor*>(), Overlaps);
			for (AActor* Nearby : Overlaps)
			{
				ApplyDirectDamage(Nearby, Result.ReactionDamage * 0.5f);
				if (IsSwirlable(ExistingElement))
				{
					ApplyElement(Nearby, ExistingElement, 40.f, ElementalMastery);
				}
			}
			break;
		}
		default:
			break;
	}

	if (Reaction != EStickmanReactionType::None)
	{
		PlayReactionEffects(Target, Reaction);
		LogReaction(Target, Reaction, Result.ReactionDamage);
		OnReactionTriggered.Broadcast(Target, Reaction, Result.ReactionDamage, TargetLocation);
	}

	return Result;
}

void UElementalReactionManager::ApplyDirectDamage(AActor* Target, float Damage) const
{
	if (!Target || Damage <= 0.f)
	{
		return;
	}
	if (UStickmanCheatManager::IsGodModeEnabled() && Target == UGameplayStatics::GetPlayerPawn(Target, 0))
	{
		return;
	}

	UAbilitySystemComponent* ASC = UAbilitySystemBlueprintLibrary::GetAbilitySystemComponent(Target);
	UStickmanAttributeSet* AttributeSet = ASC ? const_cast<UStickmanAttributeSet*>(ASC->GetSet<UStickmanAttributeSet>()) : nullptr;
	if (!AttributeSet)
	{
		return;
	}

	const float NewHealth = FMath::Clamp(AttributeSet->GetHealth() - Damage, 0.f, AttributeSet->GetMaxHealth());
	AttributeSet->SetHealth(NewHealth);
	AttributeSet->OnHealthChanged.Broadcast(NewHealth, AttributeSet->GetMaxHealth());
}

void UElementalReactionManager::PlayReactionEffects(AActor* Target, EStickmanReactionType Reaction) const
{
	if (!Target)
	{
		return;
	}

	const FReactionEffectData* EffectData = ReactionEffects ? ReactionEffects->ReactionEffects.Find(Reaction) : nullptr;
	if (!EffectData)
	{
		return;
	}

	if (EffectData->VFX)
	{
		UNiagaraFunctionLibrary::SpawnSystemAtLocation(Target, EffectData->VFX, Target->GetActorLocation());
	}
	if (EffectData->Sound)
	{
		UGameplayStatics::PlaySoundAtLocation(Target, EffectData->Sound, Target->GetActorLocation());
	}

	// Only "major" reactions per the design spec shake the camera.
	const bool bIsMajorReaction = Reaction == EStickmanReactionType::Melt || Reaction == EStickmanReactionType::Vaporize
		|| Reaction == EStickmanReactionType::Overload;
	if (bIsMajorReaction && EffectData->CameraShakeClass)
	{
		if (const APawn* PlayerPawn = Cast<APawn>(UGameplayStatics::GetPlayerPawn(Target, 0)))
		{
			if (APlayerController* PC = Cast<APlayerController>(PlayerPawn->GetController()))
			{
				PC->ClientStartCameraShake(EffectData->CameraShakeClass);
			}
		}
	}
}

void UElementalReactionManager::LogReaction(AActor* Target, EStickmanReactionType Reaction, float Damage) const
{
	if (!bLoggingEnabled)
	{
		return;
	}
	UE_LOG(LogTemp, Log, TEXT("[ElementalReactionManager] %s triggered on %s (reaction damage: %.1f)"),
		*UEnum::GetValueAsString(Reaction), Target ? *Target->GetName() : TEXT("<null>"), Damage);
}

// -------------------------------------------------------------------
// Per-reaction behavior
// -------------------------------------------------------------------

void UElementalReactionManager::FreezeTarget(AActor* Target, float Duration)
{
	FStickmanReactionState& State = ReactionStateMap.FindOrAdd(Target);
	State.bFrozen = true;
	State.FrozenEndTime = GetWorld()->GetTimeSeconds() + Duration;

	if (ACharacter* TargetCharacter = Cast<ACharacter>(Target))
	{
		TargetCharacter->GetCharacterMovement()->DisableMovement();
	}

	FTimerHandle UnfreezeHandle;
	TWeakObjectPtr<AActor> WeakTarget(Target);
	GetWorld()->GetTimerManager().SetTimer(UnfreezeHandle, FTimerDelegate::CreateUObject(this,
		&UElementalReactionManager::UnfreezeTarget, WeakTarget), Duration, false);
}

void UElementalReactionManager::UnfreezeTarget(TWeakObjectPtr<AActor> Target)
{
	AActor* ResolvedTarget = Target.Get();
	if (!ResolvedTarget)
	{
		return;
	}

	if (FStickmanReactionState* State = ReactionStateMap.Find(ResolvedTarget))
	{
		if (!State->bFrozen)
		{
			return; // Already shattered early via TryShatterFrozen().
		}
		State->bFrozen = false;
	}

	if (ACharacter* TargetCharacter = Cast<ACharacter>(ResolvedTarget))
	{
		TargetCharacter->GetCharacterMovement()->SetMovementMode(MOVE_Walking);
	}
}

void UElementalReactionManager::StartBurningDoT(AActor* Target, float ElementalMastery)
{
	TWeakObjectPtr<AActor> WeakTarget(Target);
	TSharedRef<int32> TicksRemaining = MakeShared<int32>(6); // 6 ticks over 6 seconds
	TSharedRef<FTimerHandle> TickHandleRef = MakeShared<FTimerHandle>();

	FTimerDelegate TickDelegate = FTimerDelegate::CreateWeakLambda(this,
		[this, WeakTarget, ElementalMastery, TicksRemaining, TickHandleRef]()
	{
		AActor* ResolvedTarget = WeakTarget.Get();
		if (!ResolvedTarget)
		{
			GetWorld()->GetTimerManager().ClearTimer(*TickHandleRef);
			return;
		}

		ApplyDirectDamage(ResolvedTarget, ElementalMastery * 0.4f);

		--(*TicksRemaining);
		if (*TicksRemaining <= 0)
		{
			GetWorld()->GetTimerManager().ClearTimer(*TickHandleRef);
		}
	});

	GetWorld()->GetTimerManager().SetTimer(*TickHandleRef, TickDelegate, 1.f, true);
}

void UElementalReactionManager::StartElectroChargedTicks(AActor* Target, float ElementalMastery)
{
	TWeakObjectPtr<AActor> WeakOrigin(Target);
	TSharedRef<int32> TicksRemaining = MakeShared<int32>(4); // 4 ticks over 3 seconds
	TSharedRef<FTimerHandle> TickHandleRef = MakeShared<FTimerHandle>();

	FTimerDelegate TickDelegate = FTimerDelegate::CreateWeakLambda(this,
		[this, WeakOrigin, ElementalMastery, TicksRemaining, TickHandleRef]()
	{
		AActor* Origin = WeakOrigin.Get();
		if (!Origin)
		{
			GetWorld()->GetTimerManager().ClearTimer(*TickHandleRef);
			return;
		}

		ApplyDirectDamage(Origin, ElementalMastery * 1.5f);

		// Chain to nearby actors that currently carry a Hydro aura ("wet" enemies).
		TArray<AActor*> Overlaps;
		TArray<AActor*> ActorsToIgnore = { Origin };
		UKismetSystemLibrary::SphereOverlapActors(Origin, Origin->GetActorLocation(), 400.f,
			TArray<TEnumAsByte<EObjectTypeQuery>>{ UEngineTypes::ConvertToObjectType(ECC_Pawn) }, nullptr,
			ActorsToIgnore, Overlaps);
		for (AActor* Nearby : Overlaps)
		{
			const TArray<FActiveElement>* NearbyAuras = ActiveElementsMap.Find(Nearby);
			const bool bIsWet = NearbyAuras && NearbyAuras->ContainsByPredicate(
				[](const FActiveElement& A) { return A.Element == EStickmanElement::Hydro; });
			if (bIsWet)
			{
				ApplyDirectDamage(Nearby, ElementalMastery * 1.5f);
			}
		}

		--(*TicksRemaining);
		if (*TicksRemaining <= 0)
		{
			GetWorld()->GetTimerManager().ClearTimer(*TickHandleRef);
		}
	});

	GetWorld()->GetTimerManager().SetTimer(*TickHandleRef, TickDelegate, 0.75f, true);
}

void UElementalReactionManager::StartBloomCore(AActor* Target, float ElementalMastery)
{
	TWeakObjectPtr<AActor> WeakTarget(Target);
	FTimerHandle CoreHandle;
	FTimerDelegate CoreDelegate = FTimerDelegate::CreateWeakLambda(this, [this, WeakTarget, ElementalMastery]()
	{
		AActor* ResolvedTarget = WeakTarget.Get();
		if (!ResolvedTarget)
		{
			return;
		}
		// Dendro Core detonation. Hyperbloom (hit by Electro) / Burgeon (hit by Pyro) early
		// triggers with a bonus multiplier are a hook for later — this is the base explosion.
		ApplyDirectDamage(ResolvedTarget, ElementalMastery * 1.8f);
		UE_LOG(LogTemp, Log, TEXT("[Bloom] Dendro Core detonated near %s"), *ResolvedTarget->GetName());
	});
	GetWorld()->GetTimerManager().SetTimer(CoreHandle, CoreDelegate, 2.f, false);
}

void UElementalReactionManager::ApplyOverloadKnockback(AActor* Center, float Radius, float Force) const
{
	if (!Center)
	{
		return;
	}

	TArray<AActor*> Overlaps;
	UKismetSystemLibrary::SphereOverlapActors(Center, Center->GetActorLocation(), Radius,
		TArray<TEnumAsByte<EObjectTypeQuery>>{ UEngineTypes::ConvertToObjectType(ECC_Pawn) }, nullptr,
		TArray<AActor*>(), Overlaps);

	for (AActor* Nearby : Overlaps)
	{
		if (ACharacter* NearbyCharacter = Cast<ACharacter>(Nearby))
		{
			FVector Direction = NearbyCharacter->GetActorLocation() - Center->GetActorLocation();
			Direction = Direction.IsNearlyZero() ? FVector::UpVector : Direction.GetSafeNormal();
			NearbyCharacter->LaunchCharacter(Direction * Force + FVector(0.f, 0.f, Force * 0.3f), true, true);
		}
	}
}

void UElementalReactionManager::ApplySwirlSpread(AActor* Origin, EStickmanElement SpreadElement, float ElementalMastery)
{
	if (!Origin || SpreadElement == EStickmanElement::None)
	{
		return;
	}

	TArray<AActor*> Overlaps;
	TArray<AActor*> ActorsToIgnore = { Origin };
	UKismetSystemLibrary::SphereOverlapActors(Origin, Origin->GetActorLocation(), 500.f,
		TArray<TEnumAsByte<EObjectTypeQuery>>{ UEngineTypes::ConvertToObjectType(ECC_Pawn) }, nullptr,
		ActorsToIgnore, Overlaps);

	for (AActor* Nearby : Overlaps)
	{
		// Secondary targets can Melt/Vaporize/etc. off this spread, and in principle chain
		// into a further Swirl too (matches the real game) — each hop only fires if that
		// specific target happens to already be carrying a matching aura, so in practice
		// this self-limits rather than cascading indefinitely through a crowd.
		ApplyElement(Nearby, SpreadElement, 50.f, ElementalMastery);
	}
}
