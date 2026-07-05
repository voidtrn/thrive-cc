#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "UITweenSubsystem.generated.h"

class UWidget;

/** Preset animasi UI (spec F2). */
UENUM(BlueprintType)
enum class EUITween : uint8
{
	PopIn,        // scale 0.6 -> 1.0 overshoot elastis + fade in (open menu/popup)
	PopOut,       // scale -> 0.85 + fade out (close)
	FadeIn,
	FadeOut,
	SlideInRight, // toast notification: geser dari kanan + fade
	Pulse         // scale 1 -> 1.08 -> 1 (energy full, burst ready)
};

/**
 * Framework animasi UI ringan — tanpa perlu bikin UMG Animation asset per
 * widget. Panggil dari BP mana pun:
 *   UITween->Play(MyPanel, EUITween::PopIn, 0.3);
 * Menganimasikan RenderTransform (scale/translation) + RenderOpacity.
 * Untuk animasi kompleks (wish reveal, keyframe banyak) tetap pakai
 * UMG Animation biasa.
 */
UCLASS()
class MYGAME_API UUITweenSubsystem : public UTickableWorldSubsystem
{
	GENERATED_BODY()

public:
	virtual void Tick(float DeltaTime) override;
	virtual TStatId GetStatId() const override
	{
		RETURN_QUICK_DECLARE_CYCLE_STAT(UUITweenSubsystem, STATGROUP_Tickables);
	}

	/** Mainkan preset tween di widget. Tween lama di widget sama di-replace. */
	UFUNCTION(BlueprintCallable, Category = "UI|Tween")
	void Play(UWidget* Widget, EUITween Tween, float Duration = 0.3f);

private:
	struct FActiveTween
	{
		TWeakObjectPtr<UWidget> Widget;
		EUITween Type = EUITween::FadeIn;
		float Elapsed = 0.f;
		float Duration = 0.3f;
	};

	TArray<FActiveTween> ActiveTweens;

	static void ApplyTween(UWidget* Widget, EUITween Type, float Alpha);
	static float EaseOutBack(float T);
	static float EaseOutCubic(float T);
};
