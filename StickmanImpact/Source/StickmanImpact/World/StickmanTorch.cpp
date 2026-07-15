// Copyright StickmanImpact Project.

#include "StickmanTorch.h"
#include "Components/StaticMeshComponent.h"
#include "Components/PointLightComponent.h"
#include "NiagaraComponent.h"

AStickmanTorch::AStickmanTorch()
{
	PrimaryActorTick.bCanEverTick = false;

	TorchMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("TorchMesh"));
	RootComponent = TorchMesh;

	FlameLight = CreateDefaultSubobject<UPointLightComponent>(TEXT("FlameLight"));
	FlameLight->SetupAttachment(RootComponent);
	FlameLight->SetIntensity(3000.f);
	FlameLight->SetLightColor(FLinearColor(1.f, 0.5f, 0.1f));
	FlameLight->SetVisibility(false);

	FlameVFXComponent = CreateDefaultSubobject<UNiagaraComponent>(TEXT("FlameVFXComponent"));
	FlameVFXComponent->SetupAttachment(RootComponent);
	FlameVFXComponent->SetAutoActivate(false);
}

void AStickmanTorch::TryAffectWithElement(EStickmanElement Element)
{
	if (Element == EStickmanElement::Pyro && !bIsLit)
	{
		SetLit(true);
	}
	else if ((Element == EStickmanElement::Hydro || Element == EStickmanElement::Cryo) && bIsLit)
	{
		SetLit(false);
	}
}

void AStickmanTorch::SetLit(bool bNewLit)
{
	bIsLit = bNewLit;
	FlameLight->SetVisibility(bIsLit);

	if (bIsLit)
	{
		if (FlameVFX)
		{
			FlameVFXComponent->SetAsset(FlameVFX);
		}
		FlameVFXComponent->Activate(true);
		OnLit.Broadcast();
	}
	else
	{
		FlameVFXComponent->Deactivate();
		OnExtinguished.Broadcast();
	}
}
