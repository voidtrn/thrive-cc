#include "World/SFXManager.h"
#include "Combat/ElementalReactionSubsystem.h"
#include "Kismet/GameplayStatics.h"
#include "Sound/SoundBase.h"

ASFXManager::ASFXManager()
{
	PrimaryActorTick.bCanEverTick = false;
}

void ASFXManager::BeginPlay()
{
	Super::BeginPlay();

	if (UElementalReactionSubsystem* Reactions = GetWorld()->GetSubsystem<UElementalReactionSubsystem>())
	{
		Reactions->OnReactionTriggered.AddDynamic(this, &ASFXManager::HandleReaction);
		Reactions->OnCrystallizeShield.AddDynamic(this, &ASFXManager::HandleCrystallize);
	}
}

void ASFXManager::HandleReaction(EReactionType Reaction, AActor* Target, AActor* Instigator, FVector Location)
{
	PlayReactionSFX(Reaction, Location);
}

void ASFXManager::PlayReactionSFX(EReactionType Reaction, const FVector& Location)
{
	const TObjectPtr<USoundBase>* Sound = ReactionSFX.Find(Reaction);
	if (!Sound || !*Sound)
	{
		return;
	}

	UGameplayStatics::PlaySoundAtLocation(this, *Sound, Location, ReactionVolume);
}

void ASFXManager::HandleCrystallize(EElement Element, float ShieldStrength, AActor* Instigator)
{
	if (!CrystallizeShieldSFX || !Instigator)
	{
		return;
	}

	UGameplayStatics::PlaySoundAtLocation(this, CrystallizeShieldSFX, Instigator->GetActorLocation(), ReactionVolume);
}
