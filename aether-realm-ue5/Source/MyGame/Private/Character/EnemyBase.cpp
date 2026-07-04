#include "Character/EnemyBase.h"
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
	MaxHP = Row->BaseHP;
	ATK = Row->BaseATK;
	DEF = Row->BaseDEF;
	Level = Row->Level;
}

float AEnemyBase::GetResistance(EElement DamageElement) const
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

void AEnemyBase::HandleDeath()
{
	Super::HandleDeath();

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
