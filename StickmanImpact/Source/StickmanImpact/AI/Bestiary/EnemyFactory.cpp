// Copyright StickmanImpact Project.

#include "EnemyFactory.h"
#include "BestiarySubsystem.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "Components/ActorComponent.h"

bool UEnemyFactory::GetArchetype(FName ArchetypeID, FEnemyArchetype& OutArchetype) const
{
	if (!ArchetypeTable)
	{
		return false;
	}
	if (const FEnemyArchetype* Row = ArchetypeTable->FindRow<FEnemyArchetype>(ArchetypeID, TEXT("EnemyFactory")))
	{
		OutArchetype = *Row;
		return true;
	}
	return false;
}

TArray<FName> UEnemyFactory::GetArchetypesByFaction(EEnemyFaction Faction) const
{
	TArray<FName> Result;
	if (!ArchetypeTable)
	{
		return Result;
	}
	ArchetypeTable->ForeachRow<FEnemyArchetype>(TEXT("EnemyFactory"),
		[&](const FName& RowName, const FEnemyArchetype& Row)
	{
		if (Row.Faction == Faction)
		{
			Result.Add(Row.ArchetypeID.IsNone() ? RowName : Row.ArchetypeID);
		}
	});
	return Result;
}

AStickmanEnemyCharacter* UEnemyFactory::SpawnArchetype(FName ArchetypeID, const FTransform& SpawnTransform, int32 Level)
{
	FEnemyArchetype Archetype;
	if (!GetArchetype(ArchetypeID, Archetype))
	{
		return nullptr;
	}

	UClass* PawnClass = Archetype.EnemyClass ? Archetype.EnemyClass.Get() : AStickmanEnemyCharacter::StaticClass();
	UWorld* World = GetGameInstance()->GetWorld();
	if (!World)
	{
		return nullptr;
	}

	AStickmanEnemyCharacter* Enemy = World->SpawnActorDeferred<AStickmanEnemyCharacter>(PawnClass, SpawnTransform);
	if (!Enemy)
	{
		return nullptr;
	}

	// Stamp the archetype onto the pawn before its BeginPlay initializes from Stats.
	const float LevelMultiplier = 1.f + FMath::Max(Level - 1, 0) * StatGrowthPerLevel;
	Enemy->Stats = Archetype.BaseStats;
	Enemy->Stats.MaxHealth *= LevelMultiplier;
	Enemy->Stats.Attack *= LevelMultiplier;
	Enemy->Stats.Defense *= LevelMultiplier;

	Enemy->Personality = Archetype.Personality;
	Enemy->WeightedAttacks = Archetype.WeightedAttacks;
	Enemy->DefaultAbilities = Archetype.Abilities;
	Enemy->ElementDamageMultipliers = Archetype.ElementResistances;
	Enemy->OptimalCombatDistance = Archetype.OptimalCombatDistance;
	Enemy->bIsLeader = Archetype.bIsLeader;

	// Attach the archetype's signature mechanic component.
	if (Archetype.MechanicComponentClass)
	{
		if (UActorComponent* Mechanic = NewObject<UActorComponent>(Enemy, Archetype.MechanicComponentClass))
		{
			Mechanic->RegisterComponent();
		}
	}

	Enemy->FinishSpawning(SpawnTransform);

	// Journal: first sighting recorded.
	if (UBestiarySubsystem* Bestiary = GetGameInstance()->GetSubsystem<UBestiarySubsystem>())
	{
		Bestiary->NotifyEncountered(ArchetypeID);
	}

	return Enemy;
}
