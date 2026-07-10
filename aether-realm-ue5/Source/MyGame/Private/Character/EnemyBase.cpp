#include "Character/EnemyBase.h"
#include "Character/EnemyAIController.h"
#include "System/PacingDirectorSubsystem.h"
#include "Combat/ElementalReactionSubsystem.h"
#include "Combat/DamageCalculator.h"
#include "Combat/ShieldComponent.h"
#include "Combat/EnemyProjectile.h"
#include "GameFramework/SpringArmComponent.h"
#include "Camera/CameraComponent.h"
#include "TimerManager.h"
#include "MyGame.h"

namespace
{
	// Shield elite tak punya durasi natural — refresh sendiri lewat regen timer,
	// jadi cukup kasih durasi panjang (bukan literal "selamanya", tapi lebih
	// dari cukup buat 1 encounter).
	constexpr float EliteShieldDuration = 99999.f;
}

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

	// Selalu ada, no-op kalau CachedStats.ShieldAmount == 0 (lihat ApplyElementalShield).
	EnemyShield = CreateDefaultSubobject<UShieldComponent>(TEXT("EnemyShield"));
}

void AEnemyBase::BeginPlay()
{
	LoadStatsFromTable();
	Super::BeginPlay(); // Super setelah load: CurrentHP = MaxHP dari table

	if (EnemyShield)
	{
		EnemyShield->OnShieldBroken.AddDynamic(this, &AEnemyBase::OnEnemyShieldBroken);
	}
	ApplyElementalShield();
}

void AEnemyBase::ApplyElementalShield()
{
	if (!EnemyShield || CachedStats.ShieldAmount <= 0.f)
	{
		return;
	}
	EnemyShield->ApplyShield(TEXT("EliteShield"), CachedStats.ShieldElement,
		CachedStats.ShieldAmount, EliteShieldDuration);
}

void AEnemyBase::OnEnemyShieldBroken()
{
	if (CachedStats.ShieldAmount <= 0.f || CachedStats.ShieldRegenDelay <= 0.f)
	{
		return;
	}
	GetWorldTimerManager().SetTimer(ShieldRegenTimer, this,
		&AEnemyBase::ReapplyElementalShield, CachedStats.ShieldRegenDelay, false);
}

void AEnemyBase::ReapplyElementalShield()
{
	if (IsAlive())
	{
		ApplyElementalShield();
	}
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
	MaxHP = Row->BaseHP;
	ATK = Row->BaseATK;
	DEF = Row->BaseDEF;
	Level = Row->Level;
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
	// Server-authoritative: dipanggil dari anim notify, yang di UE jalan di
	// tiap mesin yang mensimulasikan animasi (bukan cuma server). Tanpa guard
	// ini, client bisa independently hitung & apply damage ke CurrentHP
	// (replicated) — lawan aturan "validasi selalu server-side" project ini.
	if (!HasAuthority())
	{
		return;
	}

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

	// CC berat (Stagger/Knockback/Launch/KnockedDown) di-handle otomatis di
	// ACharacterBase::ApplyDamage lewat poise system (RegisterPoiseDamage) —
	// simetris dengan arah player→enemy, tak perlu duplikasi di sini lagi.
	Target->ApplyDamage(Damage, Element, Reaction);
}

void AEnemyBase::FireProjectileAt(ACharacterBase* Target, float DamageMultiplier,
	float GaugeUnits, EHitReaction Reaction)
{
	// Server-authoritative — sama alasan dengan AttackTarget. Spawn actor dari
	// client juga tak akan replicate ke pemain lain, jadi guard di sini juga
	// mencegah "hantu" proyektil client-only yang tak sinkron.
	if (!HasAuthority())
	{
		return;
	}

	if (!Target || !Target->IsAlive() || !ProjectileClass || !GetWorld())
	{
		return;
	}

	const FVector SpawnLocation = GetActorLocation() + GetActorForwardVector() * 60.f + FVector(0.f, 0.f, 50.f);

	FActorSpawnParameters SpawnParams;
	SpawnParams.Owner = this;
	SpawnParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

	if (AEnemyProjectile* Projectile = GetWorld()->SpawnActor<AEnemyProjectile>(
		ProjectileClass, SpawnLocation, FRotator::ZeroRotator, SpawnParams))
	{
		Projectile->InitProjectile(this, DamageMultiplier, GaugeUnits, Reaction);
		Projectile->LaunchAt(Target->GetActorLocation() + FVector(0.f, 0.f, 50.f));
	}
}

void AEnemyBase::HandleDeath()
{
	Super::HandleDeath();

	// Pacing director: kill = relief stress + deteksi clutch; lepas hitungan aggro.
	if (UPacingDirectorSubsystem* Pacing = GetWorld()->GetSubsystem<UPacingDirectorSubsystem>())
	{
		Pacing->ReportEnemyKilled(GetActorLocation());

		const AEnemyAIController* AI = Cast<AEnemyAIController>(GetController());
		if (AI && AI->HasAggro())
		{
			Pacing->ReportEnemyAggro(-1);
		}
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
