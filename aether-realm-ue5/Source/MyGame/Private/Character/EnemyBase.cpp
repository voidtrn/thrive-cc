#include "Character/EnemyBase.h"
#include "Combat/ElementalReactionSubsystem.h"
#include "Combat/DamageCalculator.h"
#include "Combat/StatusEffectComponent.h"
#include "System/AchievementSubsystem.h"
#include "System/OpenWorldGameInstance.h"
#include "System/WorldLevelStatics.h"
#include "GameFramework/SpringArmComponent.h"
#include "Camera/CameraComponent.h"
#include "MyGame.h"

AEnemyBase::AEnemyBase(const FObjectInitializer& ObjectInitializer)
	: Super(ObjectInitializer)
{
	Tags.Add(TEXT("Enemy"));

	// Enemy tidak butuh spring arm camera — matikan
	if (CameraBoom)
	{
		CameraBoom->SetActive(false);
	}
	if (FollowCamera)
	{
		FollowCamera->SetActive(false);
	}
}

void AEnemyBase::BeginPlay()
{
	LoadStatsFromTable();
	Super::BeginPlay(); // Super setelah load: CurrentHP = MaxHP dari table
}

void AEnemyBase::LoadStatsFromTable()
{
	if (!StatsTable || StatsRowName.IsNone())
	{
		return;
	}

	const FEnemyStatsRow* Row = StatsTable->FindRow<FEnemyStatsRow>(StatsRowName, TEXT("EnemyStats"));
	if (!Row)
	{
		UE_LOG(LogAetherRealm, Warning, TEXT("Enemy stats row '%s' not found"), *StatsRowName.ToString());
		return;
	}

	CachedStats = *Row;
	EnemyType = Row->Type;

	// World level scaling: AR pemain → musuh lebih kuat (Genshin-like).
	// Berjalan server-side saat spawn; co-op ikut AR host.
	int32 WorldLevel = 0;
	if (const UOpenWorldGameInstance* GI = Cast<UOpenWorldGameInstance>(GetGameInstance()))
	{
		WorldLevel = UWorldLevelStatics::WorldLevelForAR(GI->AdventureRank);
	}

	MaxHP = Row->BaseHP * UWorldLevelStatics::EnemyHPMultiplier(WorldLevel);
	ATK = Row->BaseATK * UWorldLevelStatics::EnemyATKMultiplier(WorldLevel);
	DEF = Row->BaseDEF * UWorldLevelStatics::EnemyDEFMultiplier(WorldLevel);
	Level = Row->Level + UWorldLevelStatics::BonusEnemyLevels(WorldLevel);

	// Drop ikut naik — dibaca HandleDeath/loot flow dari CachedStats.
	CachedStats.MoraDrop = FMath::RoundToInt32(
		Row->MoraDrop * UWorldLevelStatics::MoraDropMultiplier(WorldLevel));
}

float AEnemyBase::GetBaseResistance(EElement DamageElement) const
{
	// Slime: immune elemen sendiri
	if (CachedStats.InnateElement != EElement::None && DamageElement == CachedStats.InnateElement)
	{
		return 1.f; // 100% RES → multiplier 0.5 per formula; gameplay-wise hampir immune
	}

	if (const float* Res = CachedStats.ElementalRES.Find(DamageElement))
	{
		return *Res;
	}
	return 0.1f; // default 10%
}

void AEnemyBase::AttackTarget(ACharacterBase* Target, float DamageMultiplier,
	float GaugeUnits, EHitReaction Reaction)
{
	if (!Target || !Target->IsAlive())
	{
		return;
	}

	// Apply elemen enemy dulu (bisa memicu reaksi di player), lalu damage.
	float ReactionMult = 1.f;
	float FlatReaction = 0.f;
	if (Element != EElement::None && GaugeUnits > 0.f)
	{
		if (UElementalReactionSubsystem* Reactions = GetWorld()->GetSubsystem<UElementalReactionSubsystem>())
		{
			const FReactionResult R = Reactions->ApplyElement(
				Target, this, Element, GaugeUnits, TEXT("EnemyAttack"), /*bBlunt=*/false);
			ReactionMult = R.AmpMultiplier;
			FlatReaction = R.FlatBonus;
		}
	}

	bool bCrit = false;
	const float Damage = UDamageCalculator::CalculateDamage(
		this, Target, DamageMultiplier, 0.f, Element, ReactionMult, FlatReaction, bCrit);

	Target->ApplyDamage(Damage, Element, Reaction);

	// Serangan CC berat → stun singkat via status system.
	if (Reaction == EHitReaction::Knockback || Reaction == EHitReaction::Launch
		|| Reaction == EHitReaction::KnockedDown)
	{
		if (UStatusEffectComponent* Status = Target->FindComponentByClass<UStatusEffectComponent>())
		{
			Status->ApplyStatus(TEXT("EnemyKnockdown"), EStatusType::Stun, 0.f, /*Duration=*/1.5f);
		}
	}
}

void AEnemyBase::HandleDeath()
{
	Super::HandleDeath();

	UAchievementSubsystem::Report(this, TEXT("Stat_EnemiesDefeated"));

	if (UGameDirectorSubsystem* Director = GetWorld()->GetSubsystem<UGameDirectorSubsystem>())
	{
		Director->ReportEnemyKilled();
	}

	// Spawn energy orbs
	if (EnergyOrbClass)
	{
		for (int32 i = 0; i < EnergyOrbCount; ++i)
		{
			const FVector Offset(FMath::FRandRange(-50.f, 50.f), FMath::FRandRange(-50.f, 50.f), 50.f);
			GetWorld()->SpawnActor<AActor>(EnergyOrbClass, GetActorLocation() + Offset, FRotator::ZeroRotator);
		}
	}

	// Drops: mora + material + artifact roll — Phase 4 inventory system.
	// Data sudah tersedia di CachedStats (MoraDrop, MaterialDrops, ArtifactDropChance).

	SetLifeSpan(3.f); // despawn setelah death anim
}
