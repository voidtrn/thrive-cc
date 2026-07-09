#include "Combat/ElementalReactionSubsystem.h"
#include "Combat/DamageCalculator.h"
#include "Character/CharacterBase.h"
#include "Engine/OverlapResult.h"
#include "Kismet/GameplayStatics.h"
#include "MyGame.h"

// ---------- Tick: decay, freeze/quicken expiry, EC DOT, dendro core ----------

void UElementalReactionSubsystem::Tick(float DeltaTime)
{
	const double Now = GetWorld()->GetTimeSeconds();

	// Gauge decay
	for (auto It = ActiveAuras.CreateIterator(); It; ++It)
	{
		if (!It.Key().IsValid())
		{
			It.RemoveCurrent();
			continue;
		}
		TArray<FElementalAura>& Auras = It.Value();
		for (int32 i = Auras.Num() - 1; i >= 0; --i)
		{
			Auras[i].Units -= DecayUnitsPerSecond * DeltaTime;
			if (Auras[i].Units <= 0.f)
			{
				Auras.RemoveAt(i);
			}
		}
		if (Auras.IsEmpty())
		{
			It.RemoveCurrent();
		}
	}

	// Freeze expiry
	for (auto It = FrozenUntil.CreateIterator(); It; ++It)
	{
		if (!It.Key().IsValid() || Now >= It.Value())
		{
			if (It.Key().IsValid())
			{
				It.Key()->SetFrozen(false);
			}
			It.RemoveCurrent();
		}
	}

	// Quicken expiry
	for (auto It = QuickenUntil.CreateIterator(); It; ++It)
	{
		if (!It.Key().IsValid() || Now >= It.Value())
		{
			It.RemoveCurrent();
		}
	}

	// Electro-Charged DOT
	for (int32 i = ECInstances.Num() - 1; i >= 0; --i)
	{
		FElectroChargedInstance& EC = ECInstances[i];
		if (!EC.Target.IsValid() || !EC.Source.IsValid() || EC.TicksLeft <= 0)
		{
			ECInstances.RemoveAt(i);
			continue;
		}
		if (Now >= EC.NextTickTime)
		{
			const float Dmg = UDamageCalculator::TransformativeBaseDamage(EC.Source->Level, 1.2f)
				* (1.f + UDamageCalculator::TransformativeEmBonus(EC.Source->ElementalMastery))
				* UDamageCalculator::ResMultiplier(EC.Target->GetResistance(EElement::Electro));
			EC.Target->ApplyDamage(Dmg, EElement::Electro, EHitReaction::Light);
			EC.TicksLeft--;
			EC.NextTickTime = Now + 1.0;
		}
	}

	// Dendro core meledak (Bloom)
	for (int32 i = DendroCores.Num() - 1; i >= 0; --i)
	{
		if (Now - DendroCores[i].SpawnTime >= DendroCoreLifetime)
		{
			if (DendroCores[i].Owner.IsValid())
			{
				DoTransformativeDamage(DendroCores[i].Owner.Get(), DendroCores[i].Location,
					250.f, EElement::Dendro, 2.0f, EReactionType::Bloom);
			}
			DendroCores.RemoveAt(i);
		}
	}
}

// ---------- Apply & resolve ----------

FReactionResult UElementalReactionSubsystem::ApplyElement(
	ACharacterBase* Target, ACharacterBase* Instigator,
	EElement Element, float GaugeUnits, FName ICDTag, bool bBluntHit)
{
	FReactionResult Result;
	if (!Target || !Instigator)
	{
		return Result;
	}

	// Shatter: hit blunt/Geo ke target frozen — tidak kena ICD
	if (Target->IsFrozen() && (bBluntHit || Element == EElement::Geo))
	{
		Target->SetFrozen(false);
		FrozenUntil.Remove(Target);
		Result.Reaction = EReactionType::Shatter;
		Result.FlatBonus = UDamageCalculator::TransformativeBaseDamage(Instigator->Level, 1.5f);
		OnReactionTriggered.Broadcast(EReactionType::Shatter, Target, Instigator, Target->GetActorLocation());
		return Result;
	}

	if (Element == EElement::None || !PassesICD(Target, ICDTag))
	{
		return Result;
	}

	// Cek konversi dendro core dulu (Hyperbloom/Burgeon)
	if (Element == EElement::Electro || Element == EElement::Pyro)
	{
		for (int32 i = DendroCores.Num() - 1; i >= 0; --i)
		{
			if (FVector::Dist(DendroCores[i].Location, Target->GetActorLocation()) < DendroCoreConvertRadius)
			{
				const bool bHyper = Element == EElement::Electro;
				DoTransformativeDamage(Instigator, DendroCores[i].Location,
					bHyper ? 150.f : 400.f, EElement::Dendro,
					bHyper ? 3.0f : 3.0f,
					bHyper ? EReactionType::Hyperbloom : EReactionType::Burgeon);
				DendroCores.RemoveAt(i);
				break;
			}
		}
	}

	Result = ResolveReaction(Target, Instigator, Element, GaugeUnits, bBluntHit);
	return Result;
}

bool UElementalReactionSubsystem::PassesICD(ACharacterBase* Target, FName ICDTag)
{
	const double Now = GetWorld()->GetTimeSeconds();
	FIcdRecord& Rec = IcdRecords.FindOrAdd(Target).FindOrAdd(ICDTag);

	Rec.HitsSinceApply++;
	if (Now - Rec.LastApplyTime >= IcdSeconds || Rec.HitsSinceApply >= IcdHitCount)
	{
		Rec.LastApplyTime = Now;
		Rec.HitsSinceApply = 0;
		return true;
	}
	return false;
}

FReactionResult UElementalReactionSubsystem::ResolveReaction(
	ACharacterBase* Target, ACharacterBase* Instigator,
	EElement Incoming, float Units, bool bBluntHit)
{
	FReactionResult Result;
	const double Now = GetWorld()->GetTimeSeconds();
	const FVector Loc = Target->GetActorLocation();
	const float EM = Instigator->ElementalMastery;

	auto Broadcast = [&](EReactionType R)
	{
		Result.Reaction = R;
		OnReactionTriggered.Broadcast(R, Target, Instigator, Loc);
	};

	// --- Quicken aura interactions dulu ---
	if (QuickenUntil.Contains(Target))
	{
		if (Incoming == EElement::Dendro)
		{
			Result.FlatBonus = UDamageCalculator::TransformativeBaseDamage(Instigator->Level, 1.25f)
				* (1.f + UDamageCalculator::AmpEmBonus(EM));
			Broadcast(EReactionType::Spread);
			return Result;
		}
		if (Incoming == EElement::Electro)
		{
			Result.FlatBonus = UDamageCalculator::TransformativeBaseDamage(Instigator->Level, 1.15f)
				* (1.f + UDamageCalculator::AmpEmBonus(EM));
			Broadcast(EReactionType::Aggravate);
			return Result;
		}
	}

	// --- Anemo: Swirl dengan aura apa pun (kecuali Geo/Dendro) ---
	if (Incoming == EElement::Anemo)
	{
		for (const EElement Swirlable : { EElement::Pyro, EElement::Hydro, EElement::Cryo, EElement::Electro })
		{
			if (FElementalAura* Aura = FindAura(Target, Swirlable))
			{
				ConsumeAura(Target, Swirlable, Units * 0.5f);
				DoTransformativeDamage(Instigator, Loc, SwirlRadius, Swirlable, 0.6f, EReactionType::Swirl);
				Broadcast(EReactionType::Swirl);
				return Result;
			}
		}
		return Result; // Anemo tanpa aura = tidak meninggalkan aura
	}

	// --- Geo: Crystallize dengan aura apa pun ---
	if (Incoming == EElement::Geo)
	{
		for (const EElement Crystallizable : { EElement::Pyro, EElement::Hydro, EElement::Cryo, EElement::Electro })
		{
			if (FindAura(Target, Crystallizable))
			{
				ConsumeAura(Target, Crystallizable, Units * 0.5f);
				const float Shield = 500.f + EM * 4.f + Instigator->DEF * 0.5f;
				OnCrystallizeShield.Broadcast(Crystallizable, Shield, Instigator);
				Broadcast(EReactionType::Crystallize);
				return Result;
			}
		}
		return Result;
	}

	// --- Pair reactions ---
	struct FPair { EElement Aura; EReactionType Reaction; };
	static const TMap<EElement, TArray<FPair>> ReactionTable = {
		{ EElement::Pyro, {
			{ EElement::Hydro,   EReactionType::Vaporize },   // reverse: hydro aura, pyro trigger → 1.5x
			{ EElement::Cryo,    EReactionType::Melt },       // forward: 2.0x
			{ EElement::Electro, EReactionType::Overload },
			{ EElement::Dendro,  EReactionType::Burning } } },
		{ EElement::Hydro, {
			{ EElement::Pyro,    EReactionType::Vaporize },   // forward: 2.0x
			{ EElement::Cryo,    EReactionType::Freeze },
			{ EElement::Electro, EReactionType::ElectroCharged },
			{ EElement::Dendro,  EReactionType::Bloom } } },
		{ EElement::Cryo, {
			{ EElement::Pyro,    EReactionType::Melt },       // reverse: 1.5x
			{ EElement::Hydro,   EReactionType::Freeze },
			{ EElement::Electro, EReactionType::Superconduct } } },
		{ EElement::Electro, {
			{ EElement::Pyro,    EReactionType::Overload },
			{ EElement::Hydro,   EReactionType::ElectroCharged },
			{ EElement::Cryo,    EReactionType::Superconduct },
			{ EElement::Dendro,  EReactionType::Quicken } } },
		{ EElement::Dendro, {
			{ EElement::Pyro,    EReactionType::Burning },
			{ EElement::Hydro,   EReactionType::Bloom },
			{ EElement::Electro, EReactionType::Quicken } } },
	};

	if (const TArray<FPair>* Pairs = ReactionTable.Find(Incoming))
	{
		for (const FPair& Pair : *Pairs)
		{
			FElementalAura* Aura = FindAura(Target, Pair.Aura);
			if (!Aura)
			{
				continue;
			}

			switch (Pair.Reaction)
			{
			case EReactionType::Vaporize:
			{
				// Forward (Hydro trigger ke Pyro aura) = 2.0x; Reverse (Pyro trigger) = 1.5x
				const float BaseMult = (Incoming == EElement::Hydro) ? 2.0f : 1.5f;
				Result.AmpMultiplier = BaseMult * (1.f + UDamageCalculator::AmpEmBonus(EM));
				ConsumeAura(Target, Pair.Aura, Units * 2.f);
				Broadcast(EReactionType::Vaporize);
				return Result;
			}
			case EReactionType::Melt:
			{
				// Forward (Pyro trigger ke Cryo aura) = 2.0x; Reverse (Cryo trigger) = 1.5x
				const float BaseMult = (Incoming == EElement::Pyro) ? 2.0f : 1.5f;
				Result.AmpMultiplier = BaseMult * (1.f + UDamageCalculator::AmpEmBonus(EM));
				ConsumeAura(Target, Pair.Aura, Units * 2.f);
				Broadcast(EReactionType::Melt);
				return Result;
			}
			case EReactionType::Freeze:
			{
				const float Duration = 3.f + EM / 200.f;
				Target->SetFrozen(true);
				FrozenUntil.Add(Target, Now + Duration);
				ConsumeAura(Target, Pair.Aura, Units);
				Broadcast(EReactionType::Freeze);
				return Result;
			}
			case EReactionType::Superconduct:
			{
				DoTransformativeDamage(Instigator, Loc, SuperconductRadius, EElement::Cryo, 0.5f,
					EReactionType::Superconduct);
				// Superconduct: -40% Physical RES (Element::None) 12s pada target.
				Target->ApplyResShred(EElement::None, 0.4f, 12.f);
				ConsumeAura(Target, Pair.Aura, Units);
				Broadcast(EReactionType::Superconduct);
				return Result;
			}
			case EReactionType::Overload:
			{
				DoTransformativeDamage(Instigator, Loc, OverloadRadius, EElement::Pyro, 2.0f,
					EReactionType::Overload, /*bKnockback=*/true);
				ConsumeAura(Target, Pair.Aura, Units);
				Broadcast(EReactionType::Overload);
				return Result;
			}
			case EReactionType::ElectroCharged:
			{
				// Kedua elemen coexist — jangan konsumsi aura, tambah aura baru juga
				AddAura(Target, Incoming, Units);
				FElectroChargedInstance EC;
				EC.Target = Target;
				EC.Source = Instigator;
				EC.NextTickTime = Now;
				ECInstances.Add(EC);
				Broadcast(EReactionType::ElectroCharged);
				return Result;
			}
			case EReactionType::Burning:
			{
				// DOT sederhana: pakai EC pipeline dengan elemen Pyro (2 tick)
				FElectroChargedInstance Burn;
				Burn.Target = Target;
				Burn.Source = Instigator;
				Burn.NextTickTime = Now;
				ECInstances.Add(Burn);
				Broadcast(EReactionType::Burning);
				return Result;
			}
			case EReactionType::Bloom:
			{
				if (DendroCores.Num() < MaxDendroCores)
				{
					FDendroCore Core;
					Core.Location = Loc;
					Core.SpawnTime = Now;
					Core.Owner = Instigator;
					DendroCores.Add(Core);
				}
				ConsumeAura(Target, Pair.Aura, Units);
				Broadcast(EReactionType::Bloom);
				return Result;
			}
			case EReactionType::Quicken:
			{
				QuickenUntil.Add(Target, Now + 7.f + EM / 100.f);
				ConsumeAura(Target, Pair.Aura, Units);
				Broadcast(EReactionType::Quicken);
				return Result;
			}
			default:
				break;
			}
		}
	}

	// Tidak ada reaction — apply aura baru
	AddAura(Target, Incoming, Units);
	return Result;
}

// ---------- Helpers ----------

void UElementalReactionSubsystem::DoTransformativeDamage(
	ACharacterBase* Instigator, const FVector& Center, float Radius,
	EElement Element, float ReactionCoefficient, EReactionType Reaction, bool bKnockback)
{
	const float Damage = UDamageCalculator::TransformativeBaseDamage(Instigator->Level, ReactionCoefficient)
		* (1.f + UDamageCalculator::TransformativeEmBonus(Instigator->ElementalMastery));

	TArray<ACharacterBase*> Enemies;
	GetEnemiesInRadius(GetWorld(), Center, Radius, Enemies);

	for (ACharacterBase* Victim : Enemies)
	{
		// Reaksi transformative tetap kena elemental RES musuh (Genshin)
		const float FinalDmg = Damage * UDamageCalculator::ResMultiplier(Victim->GetResistance(Element));
		Victim->ApplyDamage(FinalDmg, Element,
			bKnockback ? EHitReaction::Knockback : EHitReaction::Light);

		if (bKnockback)
		{
			const FVector Dir = (Victim->GetActorLocation() - Center).GetSafeNormal2D();
			Victim->LaunchCharacter(Dir * 600.f + FVector(0, 0, 300.f), true, true);
		}
	}
}

void UElementalReactionSubsystem::GetEnemiesInRadius(
	const UWorld* World, const FVector& Center, float Radius,
	TArray<ACharacterBase*>& OutEnemies, FName RequiredTag)
{
	OutEnemies.Reset();
	if (!World)
	{
		return;
	}

	TArray<FOverlapResult> Overlaps;
	FCollisionObjectQueryParams ObjectParams;
	ObjectParams.AddObjectTypesToQuery(ECC_Pawn);

	World->OverlapMultiByObjectType(
		Overlaps, Center, FQuat::Identity, ObjectParams, FCollisionShape::MakeSphere(Radius));

	for (const FOverlapResult& Overlap : Overlaps)
	{
		ACharacterBase* Enemy = Cast<ACharacterBase>(Overlap.GetActor());
		if (Enemy
			&& Enemy->ActorHasTag(RequiredTag)
			&& FVector::Dist(Enemy->GetActorLocation(), Center) <= Radius
			&& !OutEnemies.Contains(Enemy)) // multi-body bisa duplikat actor
		{
			OutEnemies.Add(Enemy);
		}
	}
}

EElement UElementalReactionSubsystem::GetPrimaryAura(AActor* Target) const
{
	if (const TArray<FElementalAura>* Auras = ActiveAuras.Find(Cast<ACharacterBase>(Target)))
	{
		if (!Auras->IsEmpty())
		{
			return (*Auras)[0].Element;
		}
	}
	return EElement::None;
}

void UElementalReactionSubsystem::AddAura(ACharacterBase* Target, EElement Element, float Units)
{
	TArray<FElementalAura>& Auras = ActiveAuras.FindOrAdd(Target);
	if (FElementalAura* Existing = FindAura(Target, Element))
	{
		Existing->Units = FMath::Max(Existing->Units, Units * 0.8f); // refresh, gauge tax
		return;
	}
	FElementalAura NewAura;
	NewAura.Element = Element;
	NewAura.Units = Units * 0.8f; // 80% gauge tax standar
	Auras.Add(NewAura);
}

FElementalAura* UElementalReactionSubsystem::FindAura(ACharacterBase* Target, EElement Element)
{
	TArray<FElementalAura>* Auras = ActiveAuras.Find(Target);
	if (!Auras)
	{
		return nullptr;
	}
	return Auras->FindByPredicate([Element](const FElementalAura& A) { return A.Element == Element; });
}

void UElementalReactionSubsystem::ConsumeAura(ACharacterBase* Target, EElement Element, float Units)
{
	if (FElementalAura* Aura = FindAura(Target, Element))
	{
		Aura->Units -= Units;
		if (Aura->Units <= 0.f)
		{
			ActiveAuras.FindOrAdd(Target).RemoveAll(
				[Element](const FElementalAura& A) { return A.Element == Element; });
		}
	}
}
