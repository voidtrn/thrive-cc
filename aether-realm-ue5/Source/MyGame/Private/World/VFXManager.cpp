#include "World/VFXManager.h"
#include "Combat/ElementalReactionSubsystem.h"
#include "NiagaraSystem.h"
#include "NiagaraComponent.h"
#include "NiagaraFunctionLibrary.h"

AVFXManager::AVFXManager()
{
	PrimaryActorTick.bCanEverTick = false;

	// Default warna elemen — konsisten dengan UDamageNumberWidget::GetElementColor
	ElementColors = {
		{ EElement::Pyro,    FLinearColor(1.00f, 0.42f, 0.25f) },
		{ EElement::Hydro,   FLinearColor(0.25f, 0.60f, 1.00f) },
		{ EElement::Cryo,    FLinearColor(0.60f, 0.90f, 1.00f) },
		{ EElement::Electro, FLinearColor(0.70f, 0.40f, 1.00f) },
		{ EElement::Anemo,   FLinearColor(0.45f, 0.95f, 0.75f) },
		{ EElement::Geo,     FLinearColor(1.00f, 0.80f, 0.30f) },
		{ EElement::Dendro,  FLinearColor(0.55f, 0.85f, 0.25f) },
	};
}

void AVFXManager::BeginPlay()
{
	Super::BeginPlay();

	if (UElementalReactionSubsystem* Reactions = GetWorld()->GetSubsystem<UElementalReactionSubsystem>())
	{
		Reactions->OnReactionTriggered.AddDynamic(this, &AVFXManager::HandleReaction);
		Reactions->OnCrystallizeShield.AddDynamic(this, &AVFXManager::HandleCrystallize);
	}
}

void AVFXManager::HandleReaction(EReactionType Reaction, AActor* Target, AActor* Instigator, FVector Location)
{
	SpawnReactionVFX(Reaction, Location);
}

void AVFXManager::SpawnReactionVFX(EReactionType Reaction, const FVector& Location)
{
	const TObjectPtr<UNiagaraSystem>* System = ReactionVFX.Find(Reaction);
	if (!System || !*System)
	{
		return;
	}

	UNiagaraComponent* Component = UNiagaraFunctionLibrary::SpawnSystemAtLocation(
		this, *System, Location, FRotator::ZeroRotator,
		FVector::OneVector, /*bAutoDestroy=*/true, /*bAutoActivate=*/true,
		ENCPoolMethod::AutoRelease); // pooling — budget Phase 9

	// Push warna elemen untuk system generik (Swirl memakai warna elemen ter-swirl)
	if (Component)
	{
		EElement ColorElement = EElement::None;
		switch (Reaction)
		{
		case EReactionType::Swirl:          ColorElement = EElement::Anemo;  break;
		case EReactionType::Superconduct:
		case EReactionType::Freeze:
		case EReactionType::Shatter:        ColorElement = EElement::Cryo;   break;
		case EReactionType::Overload:
		case EReactionType::Burning:
		case EReactionType::Burgeon:        ColorElement = EElement::Pyro;   break;
		case EReactionType::ElectroCharged:
		case EReactionType::Aggravate:
		case EReactionType::Hyperbloom:     ColorElement = EElement::Electro; break;
		case EReactionType::Bloom:
		case EReactionType::Quicken:
		case EReactionType::Spread:         ColorElement = EElement::Dendro; break;
		case EReactionType::Crystallize:    ColorElement = EElement::Geo;    break;
		default: break;
		}

		if (const FLinearColor* Color = ElementColors.Find(ColorElement))
		{
			Component->SetVariableLinearColor(TEXT("ElementColor"), *Color);
		}
	}
}

void AVFXManager::HandleCrystallize(EElement Element, float ShieldStrength, AActor* Instigator)
{
	if (!CrystallizeShieldVFX || !Instigator)
	{
		return;
	}

	UNiagaraComponent* Component = UNiagaraFunctionLibrary::SpawnSystemAttached(
		CrystallizeShieldVFX, Instigator->GetRootComponent(), NAME_None,
		FVector::ZeroVector, FRotator::ZeroRotator,
		EAttachLocation::SnapToTarget, /*bAutoDestroy=*/true,
		/*bAutoActivate=*/true, ENCPoolMethod::AutoRelease);

	if (Component)
	{
		if (const FLinearColor* Color = ElementColors.Find(Element))
		{
			Component->SetVariableLinearColor(TEXT("ElementColor"), *Color);
		}
	}
}
