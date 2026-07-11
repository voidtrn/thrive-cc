// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "World/StickmanWorldTypes.h"
#include "StickmanVoiceComponent.generated.h"

class USoundBase;

UENUM(BlueprintType)
enum class EVoiceLineCategory : uint8
{
	SkillCast,		// combat: skill cast shouts
	BurstCast,
	HitReaction,
	Death,
	ChestOpen,		// exploration
	WeatherComment,
	IdleChatter,
	StoryDialogue	// cutscene VO (normally driven by FDialogueLine::VoiceLine instead)
};

/** All voice lines for one language. Keyed per category; multiple entries per category = random pick. */
USTRUCT(BlueprintType)
struct FVoiceLineSet
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Voice")
	TMap<EVoiceLineCategory, TObjectPtr<USoundBase>> Lines;
};

/**
 * Per-character voice lines with language selection. PlayVoiceLine picks the current
 * language's set (falls back to DefaultLanguage) and routes through UStickmanAudioManager's
 * Voice category. Idle chatter fires on its own random timer while not in combat; weather
 * comments fire on UWeatherManager::OnWeatherChanged. Multiple takes per category: point the
 * USoundBase at a SoundCue/MetaSound with an internal random node — simpler than per-take
 * arrays here.
 */
UCLASS(ClassGroup = (Custom), meta = (BlueprintSpawnableComponent))
class STICKMANIMPACT_API UStickmanVoiceComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	// Language code -> voice set (e.g. "en", "ja", "id").
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Voice")
	TMap<FString, FVoiceLineSet> VoiceSetsByLanguage;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Voice")
	FString DefaultLanguage = TEXT("en");

	// Global (static): every voice component follows one selected VO language.
	UFUNCTION(BlueprintCallable, Category = "Voice")
	static void SetVoiceLanguage(const FString& LanguageCode);

	UFUNCTION(BlueprintPure, Category = "Voice")
	static FString GetVoiceLanguage();

	UFUNCTION(BlueprintCallable, Category = "Voice")
	void PlayVoiceLine(EVoiceLineCategory Category);

	// --- Idle chatter -----------------------------------------------------
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Voice|Idle")
	bool bEnableIdleChatter = true;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Voice|Idle")
	FVector2D IdleChatterIntervalRange = FVector2D(45.f, 120.f);

protected:
	virtual void BeginPlay() override;
	virtual void EndPlay(const EEndPlayReason::Type EndPlayReason) override;

	UFUNCTION()
	void HandleWeatherChanged(EStickmanWeatherType NewWeather);

private:
	void ScheduleNextIdleChatter();
	void PlayIdleChatter();

	FTimerHandle IdleChatterTimerHandle;

	static FString CurrentVoiceLanguage;
};
