// Copyright StickmanImpact Project.

#include "StickmanAIController.h"
#include "StickmanAITypes.h"
#include "Enemies/StickmanEnemyCharacter.h"
#include "World/EnemySpawner.h"
#include "BehaviorTree/BehaviorTree.h"
#include "BehaviorTree/BlackboardComponent.h"
#include "Perception/AIPerceptionComponent.h"
#include "Perception/AISenseConfig_Sight.h"
#include "Perception/AISense_Sight.h"

AStickmanAIController::AStickmanAIController()
{
	PerceptionComponent = CreateDefaultSubobject<UAIPerceptionComponent>(TEXT("PerceptionComponent"));

	SightConfig = CreateDefaultSubobject<UAISenseConfig_Sight>(TEXT("SightConfig"));
	SightConfig->SightRadius = SightRadius;
	SightConfig->LoseSightRadius = LoseSightRadius;
	SightConfig->PeripheralVisionAngleDegrees = SightAngleDegrees;
	SightConfig->DetectionByAffiliation.bDetectEnemies = true;
	SightConfig->DetectionByAffiliation.bDetectNeutrals = true;
	SightConfig->DetectionByAffiliation.bDetectFriendlies = true;

	PerceptionComponent->ConfigureSense(*SightConfig);
	PerceptionComponent->SetDominantSense(SightConfig->GetSenseImplementation());
	SetPerceptionComponent(*PerceptionComponent);
}

void AStickmanAIController::OnPossess(APawn* InPawn)
{
	Super::OnPossess(InPawn);

	if (!BehaviorTree)
	{
		return;
	}

	UseBlackboard(BehaviorTree->BlackboardAsset, Blackboard);
	if (Blackboard)
	{
		Blackboard->SetValueAsEnum(StickmanBlackboardKeys::CurrentState, static_cast<uint8>(EEnemyCombatState::Patrol));
		Blackboard->SetValueAsFloat(StickmanBlackboardKeys::AlertLevel, 0.f);
	}
	RunBehaviorTree(BehaviorTree);

	PerceptionComponent->OnTargetPerceptionUpdated.AddDynamic(this, &AStickmanAIController::HandlePerceptionUpdated);
}

void AStickmanAIController::HandlePerceptionUpdated(AActor* Actor, FAIStimulus Stimulus)
{
	if (!Blackboard || !Actor)
	{
		return;
	}

	if (Stimulus.WasSuccessfullySensed())
	{
		Blackboard->SetValueAsObject(StickmanBlackboardKeys::TargetActor, Actor);
		Blackboard->SetValueAsVector(StickmanBlackboardKeys::TargetLocation, Actor->GetActorLocation());
		Blackboard->SetValueAsEnum(StickmanBlackboardKeys::CurrentState, static_cast<uint8>(EEnemyCombatState::Combat));
		Blackboard->SetValueAsFloat(StickmanBlackboardKeys::AlertLevel, 1.f);

		if (!bHasNotifiedCombatEntry)
		{
			bHasNotifiedCombatEntry = true;
			if (AStickmanEnemyCharacter* Enemy = Cast<AStickmanEnemyCharacter>(GetPawn()))
			{
				if (AEnemySpawner* Spawner = Cast<AEnemySpawner>(Enemy->SpawningSpawner))
				{
					Spawner->NotifyEnemyEnteredCombat(Enemy, Actor);
				}
			}
		}
	}
	else if (Blackboard->GetValueAsObject(StickmanBlackboardKeys::TargetActor) == Actor)
	{
		// Lost sight of our current target — drop back to Alert (investigate last known
		// location) rather than snapping straight back to Patrol.
		Blackboard->SetValueAsEnum(StickmanBlackboardKeys::CurrentState, static_cast<uint8>(EEnemyCombatState::Alert));
		bHasNotifiedCombatEntry = false;
	}
}
