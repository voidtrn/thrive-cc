#include "Combat/EnemyProjectile.h"
#include "Character/EnemyBase.h"
#include "Character/CharacterBase.h"
#include "Components/SphereComponent.h"
#include "GameFramework/ProjectileMovementComponent.h"
#include "MyGame.h"

AEnemyProjectile::AEnemyProjectile()
{
	PrimaryActorTick.bCanEverTick = false;
	bReplicates = true;
	SetReplicateMovement(true);

	CollisionComp = CreateDefaultSubobject<USphereComponent>(TEXT("CollisionComp"));
	CollisionComp->InitSphereRadius(15.f);
	CollisionComp->SetCollisionProfileName(TEXT("OverlapAllDynamic"));
	CollisionComp->OnComponentBeginOverlap.AddDynamic(this, &AEnemyProjectile::OnOverlap);
	SetRootComponent(CollisionComp);

	MovementComp = CreateDefaultSubobject<UProjectileMovementComponent>(TEXT("MovementComp"));
	MovementComp->InitialSpeed = 1800.f;
	MovementComp->MaxSpeed = 1800.f;
	MovementComp->bRotationFollowsVelocity = true;
	MovementComp->ProjectileGravityScale = 0.f; // lurus, bukan arc lob
}

void AEnemyProjectile::BeginPlay()
{
	Super::BeginPlay();
	SetLifeSpan(MaxLifetime);
}

void AEnemyProjectile::InitProjectile(AEnemyBase* InInstigator, float InDamageMultiplier,
	float InGaugeUnits, EHitReaction InReaction, float InSpeed)
{
	InstigatorEnemy = InInstigator;
	DamageMultiplier = InDamageMultiplier;
	GaugeUnits = InGaugeUnits;
	Reaction = InReaction;
	MovementComp->InitialSpeed = InSpeed;
	MovementComp->MaxSpeed = InSpeed;
}

void AEnemyProjectile::LaunchAt(const FVector& TargetLocation)
{
	const FVector Direction = (TargetLocation - GetActorLocation()).GetSafeNormal();
	SetActorRotation(Direction.Rotation());
	MovementComp->Velocity = Direction * MovementComp->InitialSpeed;
}

void AEnemyProjectile::OnOverlap(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
	UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	if (bConsumed || !OtherActor)
	{
		return;
	}

	// Jangan kena enemy lain (friendly fire off) atau diri sendiri.
	if (OtherActor == this || OtherActor->IsA<AEnemyBase>())
	{
		return;
	}

	ACharacterBase* HitCharacter = Cast<ACharacterBase>(OtherActor);
	AEnemyBase* Instigator = InstigatorEnemy.Get();
	if (HitCharacter && Instigator)
	{
		bConsumed = true;
		Instigator->AttackTarget(HitCharacter, DamageMultiplier, GaugeUnits, Reaction);
		Destroy();
	}
}
