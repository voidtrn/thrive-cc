// Copyright StickmanImpact Project.

#include "EnemyCamp.h"
#include "EnemySpawner.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "AI/StickmanAIController.h"
#include "AI/StickmanAITypes.h"
#include "BehaviorTree/BlackboardComponent.h"

AEnemyCamp::AEnemyCamp()
{
	PrimaryActorTick.bCanEverTick = false;
}

void AEnemyCamp::BeginPlay()
{
	Super::BeginPlay();

	for (AEnemySpawner* Spawner : MemberSpawners)
	{
		if (Spawner)
		{
			Spawner->OnEnemyEnteredCombat.AddDynamic(this, &AEnemyCamp::HandleMemberEnteredCombat);
		}
	}
}

void AEnemyCamp::HandleMemberEnteredCombat(AActor* Enemy, AActor* Target)
{
	const AStickmanEnemyCharacter* AlertingEnemy = Cast<AStickmanEnemyCharacter>(Enemy);
	if (!AlertingEnemy || !Target)
	{
		return;
	}

	for (AEnemySpawner* Spawner : MemberSpawners)
	{
		if (!Spawner || Spawner == AlertingEnemy->SpawningSpawner)
		{
			continue; // The spawner whose enemy triggered this doesn't need to alert itself.
		}

		for (AStickmanEnemyCharacter* OtherEnemy : Spawner->GetActiveEnemies())
		{
			AStickmanAIController* AIController = OtherEnemy ? Cast<AStickmanAIController>(OtherEnemy->GetController()) : nullptr;
			UBlackboardComponent* Blackboard = AIController ? AIController->GetBlackboardComponent() : nullptr;
			if (!Blackboard)
			{
				continue;
			}

			Blackboard->SetValueAsObject(StickmanBlackboardKeys::TargetActor, Target);
			Blackboard->SetValueAsVector(StickmanBlackboardKeys::TargetLocation, Target->GetActorLocation());
			Blackboard->SetValueAsEnum(StickmanBlackboardKeys::CurrentState, static_cast<uint8>(EEnemyCombatState::Alert));
		}
	}
}
