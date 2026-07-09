#include "Combat/CombatComponent.h"
#include "Combat/AbilityBase.h"
#include "Combat/CharacterProgressionComponent.h"
#include "Combat/DamageCalculator.h"
#include "Combat/ElementalReactionSubsystem.h"
#include "Character/CharacterBase.h"
#include "Character/OpenWorldMovementComponent.h"
#include "UI/DamageNumberWidget.h"
#include "UI/DamageNumberPoolSubsystem.h"
#include "System/OpenWorldGameInstance.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Kismet/GameplayStatics.h"
#include "MyGame.h"

UCombatComponent::UCombatComponent()
{
	PrimaryComponentTick.bCanEverTick = true;

	// Default combo sesuai spec: 40/50/60/100% ATK, shape variasi
	FComboHitConfig Hit1; Hit1.DamageMultiplier = 0.4f; Hit1.TraceShape = EHitTraceShape::Sphere;
	FComboHitConfig Hit2; Hit2.DamageMultiplier = 0.5f; Hit2.TraceShape = EHitTraceShape::Sphere;
	FComboHitConfig Hit3; Hit3.DamageMultiplier = 0.6f; Hit3.TraceShape = EHitTraceShape::Box;
	FComboHitConfig Hit4; Hit4.DamageMultiplier = 1.0f; Hit4.TraceShape = EHitTraceShape::Line; Hit4.Range = 300.f;
	ComboChain = { Hit1, Hit2, Hit3, Hit4 };
}

void UCombatComponent::BeginPlay()
{
	Super::BeginPlay();
	OwnerChar = Cast<ACharacterBase>(GetOwner());
}

void UCombatComponent::TickComponent(float DeltaTime, ELevelTick TickType,
	FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	// Charged attack: drain stamina selama hold
	if (bCharging)
	{
		ChargeTime += DeltaTime;
		if (ChargeTime > ChargedHoldThreshold)
		{
			if (!OwnerChar->ConsumeStamina(ChargedStaminaPerSecond * DeltaTime))
			{
				ReleaseCharged(); // stamina habis — lepas otomatis
			}
		}
	}
}

// ---------- Combo ----------

void UCombatComponent::TryNormalAttack()
{
	if (!OwnerChar || !OwnerChar->IsAlive())
	{
		return;
	}

	// Airborne? Coba plunge dulu.
	if (OwnerChar->GetCharacterMovement()->IsFalling() && TryPlungeAttack())
	{
		return;
	}

	if (!bAttacking)
	{
		StartComboAttack(0);
		return;
	}

	// Sedang attack: buffer kalau window terbuka
	if (bComboWindowOpen)
	{
		bBufferedAttack = true;
	}
}

void UCombatComponent::StartComboAttack(int32 Index)
{
	if (!ComboChain.IsValidIndex(Index))
	{
		return;
	}

	ComboIndex = Index;
	bAttacking = true;
	bComboWindowOpen = false;
	bBufferedAttack = false;

	if (ComboChain[Index].Montage)
	{
		OwnerChar->PlayAnimMontage(ComboChain[Index].Montage);
	}
}

void UCombatComponent::PerformComboHit()
{
	if (!ComboChain.IsValidIndex(ComboIndex))
	{
		return;
	}
	const FComboHitConfig& Config = ComboChain[ComboIndex];

	FAttackParams Params;
	Params.SkillMultiplier = Config.DamageMultiplier;
	Params.Element = OwnerChar->Element;
	Params.GaugeUnits = 1.f;
	Params.ICDTag = TEXT("NormalAttack");
	Params.EnergyParticles = 1; // spec: 1 particle per normal hit
	Params.bBluntHit = OwnerChar->WeaponType == EWeaponType::Claymore;
	Params.TalentSource = ETalentSource::NormalAttack;

	for (const FHitResult& Hit : DoHitTrace(Config))
	{
		if (ACharacterBase* Victim = Cast<ACharacterBase>(Hit.GetActor()))
		{
			DealDamage(Victim, Params);
		}
	}
}

void UCombatComponent::OnComboWindowOpen()
{
	bComboWindowOpen = true;

	// Auto-lanjut chain setelah buffer window kalau ada input buffered
	FTimerHandle Handle;
	OwnerChar->GetWorldTimerManager().SetTimer(Handle, [this]()
	{
		if (bBufferedAttack && bAttacking)
		{
			StartComboAttack((ComboIndex + 1) % ComboChain.Num());
		}
	}, ComboBufferWindow, false);
}

void UCombatComponent::OnComboEnd()
{
	if (bBufferedAttack)
	{
		StartComboAttack((ComboIndex + 1) % ComboChain.Num());
		return;
	}
	bAttacking = false;
	bComboWindowOpen = false;
	ComboIndex = 0;
}

// ---------- Charged ----------

void UCombatComponent::StartCharging()
{
	bCharging = true;
	ChargeTime = 0.f;

	// Bow/Catalyst: aim manual
	if (OwnerChar->WeaponType == EWeaponType::Bow || OwnerChar->WeaponType == EWeaponType::Catalyst)
	{
		OwnerChar->SetAimMode(true);
	}
}

void UCombatComponent::ReleaseCharged()
{
	const bool bWasCharged = bCharging && ChargeTime >= ChargedHoldThreshold;
	bCharging = false;
	OwnerChar->SetAimMode(false);

	if (!bWasCharged)
	{
		TryNormalAttack(); // tap pendek = normal attack biasa
		return;
	}

	if (ChargedMontage)
	{
		OwnerChar->PlayAnimMontage(ChargedMontage);
	}

	FAttackParams Params;
	Params.SkillMultiplier = ChargedDamageMultiplier; // 150%
	Params.Element = OwnerChar->Element;
	Params.GaugeUnits = 1.f;
	Params.ICDTag = TEXT("ChargedAttack");
	Params.EnergyParticles = 1;
	Params.HitReaction = EHitReaction::Medium;
	Params.TalentSource = ETalentSource::NormalAttack; // charged scale ikut talent Normal

	FComboHitConfig ChargedTrace;
	ChargedTrace.TraceShape = EHitTraceShape::Sphere;
	ChargedTrace.Range = 250.f;
	ChargedTrace.Radius = 120.f;

	for (const FHitResult& Hit : DoHitTrace(ChargedTrace))
	{
		if (ACharacterBase* Victim = Cast<ACharacterBase>(Hit.GetActor()))
		{
			DealDamage(Victim, Params);
		}
	}
}

// ---------- Plunge ----------

bool UCombatComponent::TryPlungeAttack()
{
	UOpenWorldMovementComponent* Move = OwnerChar->GetOpenWorldMovement();
	if (bPlunging || !Move || !Move->IsFalling())
	{
		return false;
	}

	// Spec: harus di udara > 0.5s — pakai ketinggian sebagai proxy + air time via velocity
	bPlunging = true;
	PlungeStartZ = OwnerChar->GetActorLocation().Z;
	Move->StopGliding();

	if (PlungeMontage)
	{
		OwnerChar->PlayAnimMontage(PlungeMontage);
	}
	return true;
}

void UCombatComponent::OnPlungeLand()
{
	if (!bPlunging)
	{
		return;
	}
	bPlunging = false;

	// Damage scaling dari ketinggian jatuh (min 100%, max 300%)
	const float FallHeight = FMath::Max(0.f, PlungeStartZ - OwnerChar->GetActorLocation().Z);
	const float Alpha = FMath::Clamp(FallHeight / PlungeMaxHeight, 0.f, 1.f);
	const float Multiplier = FMath::Lerp(PlungeMinMultiplier, PlungeMaxMultiplier, Alpha);

	FAttackParams Params;
	Params.SkillMultiplier = Multiplier;
	Params.Element = OwnerChar->Element;
	Params.GaugeUnits = 1.f;
	Params.ICDTag = TEXT("Plunge");
	Params.EnergyParticles = 1;
	Params.HitReaction = EHitReaction::Heavy;
	Params.bBluntHit = true; // plunge selalu blunt (shatter frozen)
	Params.TalentSource = ETalentSource::NormalAttack; // plunge scale ikut talent Normal

	// AOE landing — sphere overlap, bukan scan seluruh world
	const FVector Center = OwnerChar->GetActorLocation();
	TArray<ACharacterBase*> Enemies;
	UElementalReactionSubsystem::GetEnemiesInRadius(GetWorld(), Center, PlungeAOERadius, Enemies);

	for (ACharacterBase* Victim : Enemies)
	{
		DealDamage(Victim, Params);
	}

	OwnerChar->PlayHitShake();
	// No fall damage: engine fall damage tidak dipakai default; kalau Phase 4
	// tambah fall damage, cek IsPlunging() untuk skip.
}

// ---------- Dodge ----------

void UCombatComponent::TryDodge()
{
	if (!OwnerChar->IsAlive() || bPlunging)
	{
		return;
	}
	if (!OwnerChar->ConsumeStamina(DodgeStaminaCost)) // 20 — spam sampai stamina habis
	{
		return;
	}

	DodgeStartTime = GetWorld()->GetTimeSeconds();

	if (DodgeMontage)
	{
		OwnerChar->PlayAnimMontage(DodgeMontage);
	}
}

bool UCombatComponent::IsInIFrame() const
{
	return GetWorld()->GetTimeSeconds() - DodgeStartTime < DodgeIFrameDuration;
}

bool UCombatComponent::CheckPerfectDodge()
{
	const double SinceDodge = GetWorld()->GetTimeSeconds() - DodgeStartTime;
	if (SinceDodge < PerfectDodgeWindow)
	{
		OwnerChar->CurrentEnergy = FMath::Min(
			OwnerChar->MaxEnergy,
			OwnerChar->CurrentEnergy + PerfectDodgeEnergyBonus * OwnerChar->EnergyRecharge);
		OnPerfectDodge.Broadcast();
		return true;
	}
	return false;
}

// ---------- Abilities ----------

bool UCombatComponent::TryElementalSkill()
{
	if (ElementalSkill && ElementalSkill->Activate(OwnerChar))
	{
		OnElementalSkillUsed.Broadcast(); // hook set 4pc / constellation
		return true;
	}
	return false;
}

bool UCombatComponent::TryElementalBurst()
{
	if (ElementalBurst && ElementalBurst->Activate(OwnerChar))
	{
		OnElementalBurstUsed.Broadcast();
		return true;
	}
	return false;
}

// ---------- Energy ----------

void UCombatComponent::GainEnergyParticles(int32 Particles)
{
	if (!OwnerChar)
	{
		return;
	}

	// 1 particle ≈ 2 energy flat, dikali Energy Recharge
	const float Energy = Particles * 2.f * OwnerChar->EnergyRecharge;
	OwnerChar->CurrentEnergy = FMath::Min(OwnerChar->MaxEnergy, OwnerChar->CurrentEnergy + Energy);

	// Off-field 60% — anggota party non-aktif (disimpan di GameInstance).
	if (UOpenWorldGameInstance* GI = OwnerChar->GetGameInstance<UOpenWorldGameInstance>())
	{
		for (FCharacterSaveData& Data : GI->PartyCharacterData)
		{
			if (Data.CharacterId != OwnerChar->CharacterID)
			{
				// MaxEnergy per karakter belum tersimpan; clamp longgar (cap saat swap in)
				Data.CurrentEnergy += Energy * 0.6f;
			}
		}
	}
}

// ---------- Damage pipeline ----------

FDamageResult UCombatComponent::DealDamage(ACharacterBase* Victim, const FAttackParams& Params)
{
	FDamageResult Result;
	if (!OwnerChar || !Victim || !Victim->IsAlive())
	{
		return Result;
	}

	// i-frame victim (dodge)
	if (UCombatComponent* VictimCombat = Victim->FindComponentByClass<UCombatComponent>())
	{
		if (VictimCombat->IsInIFrame())
		{
			VictimCombat->CheckPerfectDodge();
			return Result; // damage dinegasi penuh
		}
	}

	// Elemental apply + reaction
	FReactionResult Reaction;
	if (UElementalReactionSubsystem* Elemental = GetWorld()->GetSubsystem<UElementalReactionSubsystem>())
	{
		Reaction = Elemental->ApplyElement(Victim, OwnerChar,
			Params.Element, Params.GaugeUnits, Params.ICDTag, Params.bBluntHit);
	}

	// Skala talent: level talent (1-10) → multiplier (lvl 1 = 1.0×, tiap lvl +10%).
	float EffectiveSkillMult = Params.SkillMultiplier;
	if (Params.TalentSource != ETalentSource::None)
	{
		if (UCharacterProgressionComponent* Progression = OwnerChar->FindComponentByClass<UCharacterProgressionComponent>())
		{
			const FTalentLevels& Talents = Progression->GetTalents();
			int32 TalentLevel = 1;
			switch (Params.TalentSource)
			{
			case ETalentSource::NormalAttack:  TalentLevel = Talents.NormalAttack;  break;
			case ETalentSource::ElementalSkill: TalentLevel = Talents.ElementalSkill; break;
			case ETalentSource::ElementalBurst: TalentLevel = Talents.ElementalBurst; break;
			default: break;
			}
			EffectiveSkillMult *= Progression->GetTalentMultiplier(TalentLevel);
		}
	}

	// Formula final
	bool bCrit = false;
	const float Damage = UDamageCalculator::CalculateDamage(
		OwnerChar, Victim,
		EffectiveSkillMult, Params.FlatDamage, Params.Element,
		Reaction.AmpMultiplier, Reaction.FlatBonus, bCrit);

	Victim->ApplyDamage(Damage, Params.Element, Params.HitReaction);

	Result.FinalDamage = Damage;
	Result.bCrit = bCrit;
	Result.Reaction = Reaction.Reaction;
	Result.Element = Params.Element;

	GainEnergyParticles(Params.EnergyParticles);
	SpawnDamageNumber(Victim->GetActorLocation() + FVector(0, 0, 80.f), Result);
	ApplyHitStop();
	OnDamageDealt.Broadcast(Victim, Result);

	return Result;
}

void UCombatComponent::ApplyHitStop()
{
	if (HitStopSeconds <= 0.f)
	{
		return;
	}

	// Jangan tumpang tindih dengan slow-mo burst yang sedang jalan
	if (UGameplayStatics::GetGlobalTimeDilation(this) < 1.f)
	{
		return;
	}

	UGameplayStatics::SetGlobalTimeDilation(this, HitStopDilation);

	FTimerHandle Handle;
	// Timer terpengaruh dilation → durasi real = HitStopSeconds
	GetWorld()->GetTimerManager().SetTimer(Handle,
		[WeakThis = TWeakObjectPtr<UCombatComponent>(this)]()
		{
			if (WeakThis.IsValid())
			{
				UGameplayStatics::SetGlobalTimeDilation(WeakThis.Get(), 1.f);
			}
		}, HitStopSeconds * HitStopDilation, false);
}

TArray<FHitResult> UCombatComponent::DoHitTrace(const FComboHitConfig& Config) const
{
	TArray<FHitResult> Hits;
	const FVector Start = OwnerChar->GetActorLocation();
	const FVector End = Start + OwnerChar->GetActorForwardVector() * Config.Range;

	FCollisionQueryParams Query;
	Query.AddIgnoredActor(OwnerChar);

	// Channel CombatTrace (ECC_GameTraceChannel1, lihat DefaultGame.ini)
	const ECollisionChannel Channel = ECC_GameTraceChannel1;

	switch (Config.TraceShape)
	{
	case EHitTraceShape::Line:
		GetWorld()->LineTraceMultiByChannel(Hits, Start, End, Channel, Query);
		break;
	case EHitTraceShape::Sphere:
		GetWorld()->SweepMultiByChannel(Hits, Start, End, FQuat::Identity, Channel,
			FCollisionShape::MakeSphere(Config.Radius), Query);
		break;
	case EHitTraceShape::Box:
		GetWorld()->SweepMultiByChannel(Hits, Start, End, OwnerChar->GetActorQuat(), Channel,
			FCollisionShape::MakeBox(FVector(Config.Radius)), Query);
		break;
	}

	// Dedup per actor
	TSet<AActor*> Seen;
	TArray<FHitResult> Unique;
	for (const FHitResult& Hit : Hits)
	{
		if (Hit.GetActor() && !Seen.Contains(Hit.GetActor()))
		{
			Seen.Add(Hit.GetActor());
			Unique.Add(Hit);
		}
	}
	return Unique;
}

void UCombatComponent::SpawnDamageNumber(const FVector& Location, const FDamageResult& Result)
{
	if (!DamageNumberWidgetClass)
	{
		return;
	}

	// Pooled — ratusan hit/detik tidak lagi spawn actor+widget baru per hit.
	if (UDamageNumberPoolSubsystem* NumberPool = GetWorld()->GetSubsystem<UDamageNumberPoolSubsystem>())
	{
		NumberPool->ShowDamageNumber(DamageNumberWidgetClass, Location, Result);
	}
}
