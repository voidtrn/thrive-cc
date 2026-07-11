#include "System/EnemyRegistrySubsystem.h"
#include "Character/EnemyBase.h"

void UEnemyRegistrySubsystem::RegisterEnemy(AEnemyBase* Enemy)
{
	if (Enemy)
	{
		Enemies.AddUnique(Enemy);
	}
}

void UEnemyRegistrySubsystem::UnregisterEnemy(AEnemyBase* Enemy)
{
	Enemies.Remove(Enemy);
}
