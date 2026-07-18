// Copyright StickmanImpact Project.

#include "VisualStyleSubsystem.h"
#include "Camera/CameraComponent.h"
#include "Components/PrimitiveComponent.h"
#include "GameFramework/Pawn.h"
#include "Kismet/GameplayStatics.h"
#include "Kismet/KismetMaterialLibrary.h"
#include "Materials/MaterialParameterCollection.h"
#include "Engine/Texture.h"
#include "TimerManager.h"

void UVisualStyleSubsystem::SetMPCScalar(FName Param, float Value)
{
	if (StyleMPC && GetGameInstance()->GetWorld())
	{
		UKismetMaterialLibrary::SetScalarParameterValue(GetGameInstance()->GetWorld(), StyleMPC, Param, Value);
	}
}

// ---------------------------------------------------------------- grading -------------

void UVisualStyleSubsystem::SetRegionLUT(UTexture* LUT, float Intensity)
{
	const APawn* Pawn = UGameplayStatics::GetPlayerPawn(GetGameInstance(), 0);
	UCameraComponent* Camera = Pawn ? Pawn->FindComponentByClass<UCameraComponent>() : nullptr;
	if (!Camera)
	{
		return;
	}
	Camera->PostProcessSettings.bOverride_ColorGradingLUT = (LUT != nullptr);
	Camera->PostProcessSettings.ColorGradingLUT = LUT;
	Camera->PostProcessSettings.bOverride_ColorGradingIntensity = true;
	Camera->PostProcessSettings.ColorGradingIntensity = Intensity;
}

void UVisualStyleSubsystem::SetTimeOfDayBlend(float Blend)
{
	SetMPCScalar(TEXT("TimeOfDayBlend"), FMath::Frac(Blend));
}

void UVisualStyleSubsystem::SetWeatherGrade(float Desaturation, float Contrast)
{
	SetMPCScalar(TEXT("WeatherDesaturation"), FMath::Clamp(Desaturation, 0.f, 1.f));
	SetMPCScalar(TEXT("WeatherContrast"), FMath::Clamp(Contrast, 0.f, 2.f));
}

// ---------------------------------------------------------------- outlines ------------

void UVisualStyleSubsystem::SetActorOutline(AActor* Actor, EOutlineKind Kind)
{
	if (!Actor)
	{
		return;
	}
	const bool bEnable = bOutlinesEnabled && Kind != EOutlineKind::None;

	TArray<UPrimitiveComponent*> Primitives;
	Actor->GetComponents<UPrimitiveComponent>(Primitives);
	for (UPrimitiveComponent* Primitive : Primitives)
	{
		Primitive->SetRenderCustomDepth(bEnable);
		if (bEnable)
		{
			Primitive->SetCustomDepthStencilValue(static_cast<int32>(Kind));
		}
	}
}

// ---------------------------------------------------------------- anime moments -------

void UVisualStyleSubsystem::TriggerSpeedLines(float Duration, float Intensity)
{
	SetMPCScalar(TEXT("SpeedLines"), Intensity);
	if (UWorld* World = GetGameInstance()->GetWorld())
	{
		World->GetTimerManager().SetTimer(SpeedLinesTimerHandle,
			FTimerDelegate::CreateWeakLambda(this, [this]() { SetMPCScalar(TEXT("SpeedLines"), 0.f); }),
			Duration, false);
	}
}

void UVisualStyleSubsystem::TriggerImpactFrame(float Duration)
{
	SetMPCScalar(TEXT("ImpactFrame"), 1.f);
	if (UWorld* World = GetGameInstance()->GetWorld())
	{
		World->GetTimerManager().SetTimer(ImpactFrameTimerHandle,
			FTimerDelegate::CreateWeakLambda(this, [this]() { SetMPCScalar(TEXT("ImpactFrame"), 0.f); }),
			Duration, false);
	}
}
