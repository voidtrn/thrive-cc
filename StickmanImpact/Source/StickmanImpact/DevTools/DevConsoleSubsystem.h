// Copyright StickmanImpact Project.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "DevConsoleSubsystem.generated.h"

UENUM(BlueprintType)
enum class EDevCommandCategory : uint8
{
	Cheat,     // god, oneshot, giveitem...
	Debug,     // visualizations, overlays
	Test,      // automated test runners
	World,     // teleport, spawnenemy, speed
	System     // help, clear, history
};

USTRUCT(BlueprintType)
struct FDevConsoleLine
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "DevConsole")
	FString Text;

	UPROPERTY(BlueprintReadOnly, Category = "DevConsole")
	FLinearColor Color = FLinearColor::White;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnConsoleLog, const FDevConsoleLine&, Line);

/**
 * The game-side developer console (UDeveloperConsoleWidget is the UI on top; tilde opens
 * it — see the widget). Owns the command registry, history, prefix autocomplete, and the
 * colored log stream. Commands are lambdas over the existing systems — the console adds no
 * game logic of its own, it's a front-end for UStickmanCheatManager, the subsystems, and a
 * handful of engine exec commands.
 *
 * Categories color the log (Cheat yellow, Debug cyan, Test green, World orange, System
 * gray). `help` lists everything grouped by category; `help <cmd>` shows usage.
 *
 * Shipping builds: RegisterAllCommands() is compiled out (UE_BUILD_SHIPPING) — the
 * console exists but knows no commands, matching UCheatManager's own stripping.
 */
UCLASS()
class STICKMANIMPACT_API UDevConsoleSubsystem : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;

	// Parse + run one input line. Logs the echo, the result, and errors.
	UFUNCTION(BlueprintCallable, Category = "DevConsole")
	void Execute(const FString& CommandLine);

	// Best autocomplete for a partial input (longest common completion of matches);
	// logs the candidate list when ambiguous. Returns the (possibly extended) input.
	UFUNCTION(BlueprintCallable, Category = "DevConsole")
	FString Autocomplete(const FString& Partial);

	// History navigation for up/down arrows. Direction: -1 older, +1 newer.
	UFUNCTION(BlueprintCallable, Category = "DevConsole")
	FString NavigateHistory(int32 Direction);

	UFUNCTION(BlueprintPure, Category = "DevConsole")
	const TArray<FDevConsoleLine>& GetLogLines() const { return LogLines; }

	UPROPERTY(BlueprintAssignable, Category = "DevConsole")
	FOnConsoleLog OnConsoleLog;

	// Also usable by any system that wants a line in the dev console (damage log etc.).
	void Log(const FString& Text, EDevCommandCategory Category = EDevCommandCategory::System);
	void LogError(const FString& Text);

	// debug.damagelog toggle — the damage funnel checks this and echoes hits into the console.
	static bool IsDamageLogEnabled() { return bDamageLogEnabled; }

	using FCommandHandler = TFunction<void(const TArray<FString>& Args)>;
	void RegisterCommand(const FString& Name, EDevCommandCategory Category, const FString& Usage,
		FCommandHandler Handler);

private:
	struct FDevCommand
	{
		EDevCommandCategory Category = EDevCommandCategory::System;
		FString Usage;
		FCommandHandler Handler;
	};

	void RegisterAllCommands();
	static FLinearColor CategoryColor(EDevCommandCategory Category);

	// Command-target helpers.
	class UStickmanCheatManager* GetCheats() const;
	class AStickmanCharacter* GetPlayerCharacter() const;

	TMap<FString, FDevCommand> Commands; // Keyed lowercase.
	TArray<FDevConsoleLine> LogLines;
	TArray<FString> History;
	int32 HistoryCursor = INDEX_NONE;

	bool bAIFrozen = false;
	bool bHUDHidden = false;
	static bool bDamageLogEnabled;
};
