#include "Combat/ArtifactSetEffectComponent.h"
#include "Combat/CombatComponent.h"
#include "Combat/BuffComponent.h"
#include "Combat/ShieldComponent.h"
#include "Combat/CharacterProgressionComponent.h"
#include "Combat/ElementalReactionSubsystem.h"
#include "Character/CharacterBase.h"
#include "TimerManager.h"
#include "MyGame.h"

void UArtifactSetEffectComponent::BeginPlay()
{
	Super::BeginPlay();

	OwnerChar = Cast<ACharacterBase>(GetOwner());
	if (!OwnerChar)
	{
		return;
	}
	Progression = OwnerChar->FindComponentByClass<UCharacterProgressionComponent>();
	Buff = OwnerChar->FindComponentByClass<UBuffComponent>();

	if (UCombatComponent* Combat = OwnerChar->FindComponentByClass<UCombatComponent>())
	{
		Combat->OnElementalBurstUsed.AddDynamic(this, &UArtifactSetEffectComponent::HandleBurstUsed);
		Combat->OnElementalSkillUsed.AddDynamic(this, &UArtifactSetEffectComponent::HandleSkillUsed);
	}

	if (UElementalReactionSubsystem* Reactions = GetWorld()->GetSubsystem<UElementalReactionSubsystem>())
	{
		Reactions->OnReactionTriggered.AddDynamic(this, &UArtifactSetEffectComponent::HandleReaction);
		Reactions->OnCrystallizeShield.AddDynamic(this, &UArtifactSetEffectComponent::HandleCrystallizeShield);
	}
}

void UArtifactSetEffectComponent::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
	if (OwnerChar)
	{
		if (UCombatComponent* Combat = OwnerChar->FindComponentByClass<UCombatComponent>())
		{
			Combat->OnElementalBurstUsed.RemoveAll(this);
			Combat->OnElementalSkillUsed.RemoveAll(this);
		}
	}
	if (const UWorld* World = GetWorld())
	{
		if (UElementalReactionSubsystem* Reactions = World->GetSubsystem<UElementalReactionSubsystem>())
		{
			Reactions->OnReactionTriggered.RemoveAll(this);
			Reactions->OnCrystallizeShield.RemoveAll(this);
		}
	}
	Super::EndPlay(EndPlayReason);
}

bool UArtifactSetEffectComponent::HasSetEffect(FName EffectId) const
{
	return Progression && Progression->GetActiveSetEffects().Contains(EffectId);
}

void UArtifactSetEffectComponent::HandleBurstUsed()
{
	if (Buff && OwnerChar && HasSetEffect(TEXT("NoblesseOblige")))
	{
		// +20% ATK (flat snapshot dari ATK sekarang).
		const float Flat = OwnerChar->ATK * NoblesseATKPercent;
		Buff->ApplyBuff(TEXT("NoblesseOblige_ATK"), EArtifactStat::ATK, Flat, NoblesseDuration);
	}
}

void UArtifactSetEffectComponent::HandleSkillUsed()
{
	if (HasSetEffect(TEXT("CrimsonWitch")))
	{
		AddCrimsonStack();
	}
}

void UArtifactSetEffectComponent::HandleReaction(EReactionType Reaction, AActor* Target,
	AActor* Instigator, FVector Location)
{
	// Instructor: karakter yang MEMICU reaksi dapat +120 EM.
	if (Buff && OwnerChar && Instigator == OwnerChar && HasSetEffect(TEXT("Instructor")))
	{
		Buff->ApplyBuff(TEXT("Instructor_EM"), EArtifactStat::ElementalMastery,
			InstructorEMBonus, InstructorDuration);
	}
}

void UArtifactSetEffectComponent::HandleCrystallizeShield(EElement Element, float ShieldStrength, AActor* Instigator)
{
	// Crystallize core: pemicu ambil kristal → shield elemen tsb.
	if (OwnerChar && Instigator == OwnerChar)
	{
		if (UShieldComponent* Shield = OwnerChar->FindComponentByClass<UShieldComponent>())
		{
			Shield->ApplyShield(TEXT("Crystallize"), Element, ShieldStrength, CrystallizeShieldDuration);
		}
	}
}

void UArtifactSetEffectComponent::AddCrimsonStack()
{
	if (!OwnerChar)
	{
		return;
	}
	CrimsonStacks = FMath::Min(CrimsonStacks + 1, CrimsonMaxStacks);

	const float NewBonus = CrimsonStacks * CrimsonPyroPerStack;
	const float Delta = NewBonus - AppliedPyroBonus;
	OwnerChar->DMGBonusPerElement.FindOrAdd(EElement::Pyro) += Delta;
	AppliedPyroBonus = NewBonus;

	// Refresh timer: semua stack hilang bersama setelah CrimsonDuration.
	OwnerChar->GetWorldTimerManager().SetTimer(CrimsonTimer, this,
		&UArtifactSetEffectComponent::ResetCrimsonStacks, CrimsonDuration, false);
}

void UArtifactSetEffectComponent::ResetCrimsonStacks()
{
	if (OwnerChar && AppliedPyroBonus != 0.f)
	{
		OwnerChar->DMGBonusPerElement.FindOrAdd(EElement::Pyro) -= AppliedPyroBonus;
	}
	CrimsonStacks = 0;
	AppliedPyroBonus = 0.f;
}
