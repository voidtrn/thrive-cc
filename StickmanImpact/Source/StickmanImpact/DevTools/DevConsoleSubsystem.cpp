// Copyright StickmanImpact Project.

#include "DevConsoleSubsystem.h"
#include "AutomatedTestSubsystem.h"
#include "GameFlow/StickmanCheatManager.h"
#include "Character/StickmanCharacter.h"
#include "AI/Enemies/StickmanEnemyCharacter.h"
#include "AIController.h"
#include "BrainComponent.h"
#include "Combat/ElementalReactionManager.h"
#include "UI/HUDWidget.h"
#include "UI/MinimapWidget.h"
#include "World/EnemySpawner.h"
#include "GameFramework/PlayerController.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Kismet/GameplayStatics.h"
#include "EngineUtils.h"
#include "UObject/UObjectIterator.h"

void UDevConsoleSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);
#if !UE_BUILD_SHIPPING
	RegisterAllCommands();
#endif
}

// ---------------------------------------------------------------- infrastructure ------

FLinearColor UDevConsoleSubsystem::CategoryColor(EDevCommandCategory Category)
{
	switch (Category)
	{
		case EDevCommandCategory::Cheat:  return FLinearColor(1.f, 0.9f, 0.3f);  // yellow
		case EDevCommandCategory::Debug:  return FLinearColor(0.3f, 0.9f, 1.f);  // cyan
		case EDevCommandCategory::Test:   return FLinearColor(0.4f, 1.f, 0.5f);  // green
		case EDevCommandCategory::World:  return FLinearColor(1.f, 0.6f, 0.2f);  // orange
		case EDevCommandCategory::System:
		default:                          return FLinearColor(0.75f, 0.75f, 0.75f);
	}
}

void UDevConsoleSubsystem::Log(const FString& Text, EDevCommandCategory Category)
{
	FDevConsoleLine Line;
	Line.Text = Text;
	Line.Color = CategoryColor(Category);
	LogLines.Add(Line);
	if (LogLines.Num() > 500)
	{
		LogLines.RemoveAt(0, LogLines.Num() - 500);
	}
	OnConsoleLog.Broadcast(Line);
}

void UDevConsoleSubsystem::LogError(const FString& Text)
{
	FDevConsoleLine Line;
	Line.Text = Text;
	Line.Color = FLinearColor(1.f, 0.3f, 0.3f);
	LogLines.Add(Line);
	OnConsoleLog.Broadcast(Line);
}

void UDevConsoleSubsystem::RegisterCommand(const FString& Name, EDevCommandCategory Category,
	const FString& Usage, FCommandHandler Handler)
{
	FDevCommand Command;
	Command.Category = Category;
	Command.Usage = Usage;
	Command.Handler = MoveTemp(Handler);
	Commands.Add(Name.ToLower(), MoveTemp(Command));
}

void UDevConsoleSubsystem::Execute(const FString& CommandLine)
{
	const FString Trimmed = CommandLine.TrimStartAndEnd();
	if (Trimmed.IsEmpty())
	{
		return;
	}

	History.Add(Trimmed);
	HistoryCursor = INDEX_NONE;
	Log(TEXT("> ") + Trimmed);

	TArray<FString> Parts;
	Trimmed.ParseIntoArrayWS(Parts);
	const FString Name = Parts[0].ToLower();
	Parts.RemoveAt(0);

	if (const FDevCommand* Command = Commands.Find(Name))
	{
		Command->Handler(Parts);
	}
	else
	{
		LogError(FString::Printf(TEXT("Unknown command '%s'. Try 'help'."), *Name));
	}
}

FString UDevConsoleSubsystem::Autocomplete(const FString& Partial)
{
	const FString Prefix = Partial.TrimStartAndEnd().ToLower();
	if (Prefix.IsEmpty())
	{
		return Partial;
	}

	TArray<FString> Matches;
	for (const TPair<FString, FDevCommand>& Pair : Commands)
	{
		if (Pair.Key.StartsWith(Prefix))
		{
			Matches.Add(Pair.Key);
		}
	}

	if (Matches.Num() == 0)
	{
		return Partial;
	}
	if (Matches.Num() == 1)
	{
		return Matches[0] + TEXT(" ");
	}

	// Extend to the longest common prefix and show the candidates.
	Matches.Sort();
	FString Common = Matches[0];
	for (const FString& Match : Matches)
	{
		int32 Same = 0;
		const int32 Max = FMath::Min(Common.Len(), Match.Len());
		while (Same < Max && Common[Same] == Match[Same]) { ++Same; }
		Common.LeftInline(Same);
	}
	Log(FString::Join(Matches, TEXT("   ")));
	return Common;
}

FString UDevConsoleSubsystem::NavigateHistory(int32 Direction)
{
	if (History.Num() == 0)
	{
		return FString();
	}

	if (HistoryCursor == INDEX_NONE)
	{
		HistoryCursor = History.Num(); // One past the end = empty input.
	}
	HistoryCursor = FMath::Clamp(HistoryCursor + Direction, 0, History.Num());
	return History.IsValidIndex(HistoryCursor) ? History[HistoryCursor] : FString();
}

UStickmanCheatManager* UDevConsoleSubsystem::GetCheats() const
{
	const APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0);
	return PC ? Cast<UStickmanCheatManager>(PC->CheatManager) : nullptr;
}

AStickmanCharacter* UDevConsoleSubsystem::GetPlayerCharacter() const
{
	return Cast<AStickmanCharacter>(UGameplayStatics::GetPlayerPawn(this, 0));
}

// ---------------------------------------------------------------- commands ------------

void UDevConsoleSubsystem::RegisterAllCommands()
{
	// --- System --------------------------------------------------------------------------
	RegisterCommand(TEXT("help"), EDevCommandCategory::System, TEXT("help [command]"),
		[this](const TArray<FString>& Args)
	{
		if (Args.Num() > 0)
		{
			if (const FDevCommand* Command = Commands.Find(Args[0].ToLower()))
			{
				Log(Command->Usage, Command->Category);
			}
			else
			{
				LogError(FString::Printf(TEXT("No such command '%s'."), *Args[0]));
			}
			return;
		}
		for (uint8 CategoryIndex = 0; CategoryIndex <= static_cast<uint8>(EDevCommandCategory::System); ++CategoryIndex)
		{
			const EDevCommandCategory Category = static_cast<EDevCommandCategory>(CategoryIndex);
			TArray<FString> Names;
			for (const TPair<FString, FDevCommand>& Pair : Commands)
			{
				if (Pair.Value.Category == Category)
				{
					Names.Add(Pair.Key);
				}
			}
			if (Names.Num() > 0)
			{
				Names.Sort();
				Log(FString::Join(Names, TEXT("  ")), Category);
			}
		}
	});

	RegisterCommand(TEXT("clear"), EDevCommandCategory::System, TEXT("clear"),
		[this](const TArray<FString>&)
	{
		LogLines.Empty();
		Log(TEXT("(cleared)"));
	});

	// --- Cheats (thin forwards to UStickmanCheatManager so console + engine console agree) --
	auto ForwardCheat = [this](TFunction<void(UStickmanCheatManager&)> Fn)
	{
		return [this, Fn = MoveTemp(Fn)](const TArray<FString>&)
		{
			if (UStickmanCheatManager* Cheats = GetCheats())
			{
				Fn(*Cheats);
			}
			else
			{
				LogError(TEXT("Cheat manager unavailable (Shipping build or wrong CheatClass)."));
			}
		};
	};

	RegisterCommand(TEXT("god"), EDevCommandCategory::Cheat, TEXT("god — toggle invincibility"),
		ForwardCheat([](UStickmanCheatManager& C) { C.GodMode(); }));
	RegisterCommand(TEXT("oneshot"), EDevCommandCategory::Cheat, TEXT("oneshot — player hits kill in one"),
		ForwardCheat([](UStickmanCheatManager& C) { C.OneShot(); }));
	RegisterCommand(TEXT("infstamina"), EDevCommandCategory::Cheat, TEXT("infstamina — unlimited stamina"),
		ForwardCheat([](UStickmanCheatManager& C) { C.InfiniteStamina(); }));
	RegisterCommand(TEXT("infenergy"), EDevCommandCategory::Cheat, TEXT("infenergy — unlimited skill energy"),
		ForwardCheat([](UStickmanCheatManager& C) { C.InfiniteEnergy(); }));
	RegisterCommand(TEXT("nocooldown"), EDevCommandCategory::Cheat, TEXT("nocooldown — skills never cool down"),
		ForwardCheat([](UStickmanCheatManager& C) { C.NoCooldown(); }));

	RegisterCommand(TEXT("giveitem"), EDevCommandCategory::Cheat, TEXT("giveitem <id> [qty]"),
		[this](const TArray<FString>& Args)
	{
		if (Args.Num() < 1) { LogError(TEXT("Usage: giveitem <id> [qty]")); return; }
		if (UStickmanCheatManager* Cheats = GetCheats())
		{
			Cheats->AddItem(FName(*Args[0]), Args.Num() > 1 ? FCString::Atoi(*Args[1]) : 1);
			Log(FString::Printf(TEXT("Gave %s."), *Args[0]), EDevCommandCategory::Cheat);
		}
	});

	RegisterCommand(TEXT("setlevel"), EDevCommandCategory::Cheat, TEXT("setlevel <level>"),
		[this](const TArray<FString>& Args)
	{
		if (Args.Num() < 1) { LogError(TEXT("Usage: setlevel <level>")); return; }
		if (UStickmanCheatManager* Cheats = GetCheats())
		{
			Cheats->SetLevel(FCString::Atoi(*Args[0]));
			Log(FString::Printf(TEXT("Level set to %s."), *Args[0]), EDevCommandCategory::Cheat);
		}
	});

	RegisterCommand(TEXT("completequest"), EDevCommandCategory::Cheat, TEXT("completequest <questid>"),
		[this](const TArray<FString>& Args)
	{
		if (Args.Num() < 1) { LogError(TEXT("Usage: completequest <questid>")); return; }
		if (UStickmanCheatManager* Cheats = GetCheats())
		{
			Cheats->CompleteQuest(Args[0]);
			Log(FString::Printf(TEXT("Quest %s force-completed."), *Args[0]), EDevCommandCategory::Cheat);
		}
	});

	// --- World -----------------------------------------------------------------------------
	RegisterCommand(TEXT("speed"), EDevCommandCategory::World, TEXT("speed <multiplier> — global time dilation"),
		[this](const TArray<FString>& Args)
	{
		const float Multiplier = Args.Num() > 0 ? FCString::Atof(*Args[0]) : 1.f;
		UGameplayStatics::SetGlobalTimeDilation(this, FMath::Clamp(Multiplier, 0.05f, 10.f));
		Log(FString::Printf(TEXT("Game speed x%.2f"), Multiplier), EDevCommandCategory::World);
	});

	RegisterCommand(TEXT("teleport"), EDevCommandCategory::World, TEXT("teleport <x> <y> <z>"),
		[this](const TArray<FString>& Args)
	{
		if (Args.Num() < 3) { LogError(TEXT("Usage: teleport <x> <y> <z>")); return; }
		if (AStickmanCharacter* Player = GetPlayerCharacter())
		{
			const FVector Destination(FCString::Atof(*Args[0]), FCString::Atof(*Args[1]), FCString::Atof(*Args[2]));
			Player->TeleportTo(Destination, Player->GetActorRotation());
			Log(FString::Printf(TEXT("Teleported to %s"), *Destination.ToCompactString()), EDevCommandCategory::World);
		}
	});

	RegisterCommand(TEXT("spawnenemy"), EDevCommandCategory::World, TEXT("spawnenemy <classpath|nearest> — spawn at nearest spawner or load class"),
		[this](const TArray<FString>& Args)
	{
		AStickmanCharacter* Player = GetPlayerCharacter();
		if (!Player) { return; }

		if (Args.Num() == 0 || Args[0] == TEXT("nearest"))
		{
			// Kick the nearest spawner — respects its pool/level scaling.
			AEnemySpawner* Nearest = nullptr;
			float BestDistance = TNumericLimits<float>::Max();
			for (TActorIterator<AEnemySpawner> It(GetWorld()); It; ++It)
			{
				const float Distance = FVector::Dist(It->GetActorLocation(), Player->GetActorLocation());
				if (Distance < BestDistance) { BestDistance = Distance; Nearest = *It; }
			}
			if (Nearest)
			{
				Nearest->SpawnOneEnemy();
				Log(TEXT("Nearest spawner kicked."), EDevCommandCategory::World);
			}
			else
			{
				LogError(TEXT("No AEnemySpawner in level. Pass a class path instead."));
			}
			return;
		}

		UClass* EnemyClass = LoadClass<AStickmanEnemyCharacter>(nullptr, *Args[0]);
		if (!EnemyClass)
		{
			LogError(FString::Printf(TEXT("Class '%s' not found (use full path, e.g. /Game/Enemies/BP_Slime.BP_Slime_C)."), *Args[0]));
			return;
		}
		const FVector SpawnAt = Player->GetActorLocation() + Player->GetActorForwardVector() * 400.f;
		if (GetWorld()->SpawnActor<AStickmanEnemyCharacter>(EnemyClass, SpawnAt, FRotator::ZeroRotator))
		{
			Log(FString::Printf(TEXT("Spawned %s."), *Args[0]), EDevCommandCategory::World);
		}
	});

	RegisterCommand(TEXT("revealmap"), EDevCommandCategory::World, TEXT("revealmap — clear fog of war"),
		[this](const TArray<FString>&)
	{
		int32 Revealed = 0;
		for (TObjectIterator<UMinimapWidget> It; It; ++It)
		{
			if (It->GetWorld() == GetWorld())
			{
				It->RevealAll();
				++Revealed;
			}
		}
		Log(Revealed > 0 ? TEXT("Map revealed.") : TEXT("No minimap widget live."), EDevCommandCategory::World);
	});

	RegisterCommand(TEXT("togglehud"), EDevCommandCategory::World, TEXT("togglehud — hide HUD for screenshots"),
		[this](const TArray<FString>&)
	{
		bHUDHidden = !bHUDHidden;
		for (TObjectIterator<UHUDWidget> It; It; ++It)
		{
			if (It->GetWorld() == GetWorld() && It->IsInViewport())
			{
				It->SetVisibility(bHUDHidden ? ESlateVisibility::Collapsed : ESlateVisibility::Visible);
			}
		}
		Log(bHUDHidden ? TEXT("HUD hidden.") : TEXT("HUD shown."), EDevCommandCategory::World);
	});

	RegisterCommand(TEXT("freezeai"), EDevCommandCategory::World, TEXT("freezeai — pause/resume all AI brains"),
		[this](const TArray<FString>&)
	{
		bAIFrozen = !bAIFrozen;
		int32 Count = 0;
		for (TActorIterator<AStickmanEnemyCharacter> It(GetWorld()); It; ++It)
		{
			const AAIController* AI = Cast<AAIController>(It->GetController());
			if (AI && AI->BrainComponent)
			{
				if (bAIFrozen) { AI->BrainComponent->PauseLogic(TEXT("DevConsole freezeai")); }
				else { AI->BrainComponent->ResumeLogic(TEXT("DevConsole freezeai")); }
				++Count;
			}
			It->GetCharacterMovement()->StopMovementImmediately();
		}
		Log(FString::Printf(TEXT("AI %s (%d brains)."), bAIFrozen ? TEXT("frozen") : TEXT("resumed"), Count),
			EDevCommandCategory::World);
	});

	RegisterCommand(TEXT("playersonly"), EDevCommandCategory::World, TEXT("playersonly — engine freeze of everything but the player"),
		[this](const TArray<FString>&)
	{
		if (APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0))
		{
			PC->ConsoleCommand(TEXT("playersonly")); // Engine-native toggle.
			Log(TEXT("playersonly toggled."), EDevCommandCategory::World);
		}
	});

	// --- Debug visualizations ---------------------------------------------------------------
	auto EngineExec = [this](const TCHAR* Command, const TCHAR* Description)
	{
		return [this, Command, Description](const TArray<FString>&)
		{
			if (APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0))
			{
				PC->ConsoleCommand(Command);
				Log(Description, EDevCommandCategory::Debug);
			}
		};
	};

	RegisterCommand(TEXT("debug.collision"), EDevCommandCategory::Debug, TEXT("debug.collision — collision wireframe"),
		EngineExec(TEXT("show Collision"), TEXT("Collision wireframe toggled.")));
	RegisterCommand(TEXT("debug.navmesh"), EDevCommandCategory::Debug, TEXT("debug.navmesh — navmesh overlay"),
		EngineExec(TEXT("show Navigation"), TEXT("NavMesh overlay toggled.")));
	RegisterCommand(TEXT("debug.aipaths"), EDevCommandCategory::Debug, TEXT("debug.aipaths — AI debug (paths/perception; ' to cycle)"),
		EngineExec(TEXT("ShowDebug AI"), TEXT("AI debug toggled (engine ShowDebug AI).")));
	RegisterCommand(TEXT("debug.memory"), EDevCommandCategory::Debug, TEXT("debug.memory — memory overlay"),
		EngineExec(TEXT("Stickman.ShowMemory"), TEXT("Memory overlay toggled (PerformanceManager).")));

	RegisterCommand(TEXT("debug.damagelog"), EDevCommandCategory::Debug, TEXT("debug.damagelog — echo every damage event here"),
		[this](const TArray<FString>&)
	{
		bDamageLogEnabled = !bDamageLogEnabled;
		Log(bDamageLogEnabled ? TEXT("Damage log ON.") : TEXT("Damage log OFF."), EDevCommandCategory::Debug);
	});

	RegisterCommand(TEXT("debug.gauges"), EDevCommandCategory::Debug, TEXT("debug.gauges — dump elemental auras on all enemies"),
		[this](const TArray<FString>&)
	{
		UElementalReactionManager* Reactions = GetGameInstance()->GetSubsystem<UElementalReactionManager>();
		if (!Reactions) { return; }
		int32 Reported = 0;
		for (TActorIterator<AStickmanEnemyCharacter> It(GetWorld()); It; ++It)
		{
			const TArray<FActiveElement> Elements = Reactions->GetActiveElements(*It);
			if (Elements.Num() == 0) { continue; }
			FString Line = It->GetName() + TEXT(": ");
			for (const FActiveElement& Active : Elements)
			{
				Line += FString::Printf(TEXT("[%s %.0f] "),
					*UEnum::GetDisplayValueAsText(Active.Element).ToString(), Active.Gauge);
			}
			Log(Line, EDevCommandCategory::Debug);
			++Reported;
		}
		if (Reported == 0) { Log(TEXT("No active auras."), EDevCommandCategory::Debug); }
	});

	RegisterCommand(TEXT("debug.net"), EDevCommandCategory::Debug, TEXT("debug.net — replication debug"),
		[this](const TArray<FString>&)
	{
		Log(TEXT("Single-player build: nothing replicates yet. See Docs/COOP_REPLICATION.md;"), EDevCommandCategory::Debug);
		Log(TEXT("once networked, use engine 'net.*' CVars + 'stat net'."), EDevCommandCategory::Debug);
	});

	// --- Automated tests (forwarded to UAutomatedTestSubsystem) -----------------------------
	RegisterCommand(TEXT("test.bench"), EDevCommandCategory::Test, TEXT("test.bench [seconds=30] — FPS benchmark"),
		[this](const TArray<FString>& Args)
	{
		if (UAutomatedTestSubsystem* Tests = GetGameInstance()->GetSubsystem<UAutomatedTestSubsystem>())
		{
			Tests->StartBenchmark(Args.Num() > 0 ? FCString::Atof(*Args[0]) : 30.f);
		}
	});
	RegisterCommand(TEXT("test.combat"), EDevCommandCategory::Test, TEXT("test.combat [enemies=5] — spawn wave, time the clear"),
		[this](const TArray<FString>& Args)
	{
		if (UAutomatedTestSubsystem* Tests = GetGameInstance()->GetSubsystem<UAutomatedTestSubsystem>())
		{
			Tests->StartCombatScenario(Args.Num() > 0 ? FCString::Atoi(*Args[0]) : 5);
		}
	});
	RegisterCommand(TEXT("test.save"), EDevCommandCategory::Test, TEXT("test.save [slot=3] — save/load integrity check"),
		[this](const TArray<FString>& Args)
	{
		if (UAutomatedTestSubsystem* Tests = GetGameInstance()->GetSubsystem<UAutomatedTestSubsystem>())
		{
			Tests->RunSaveIntegrityTest(Args.Num() > 0 ? FCString::Atoi(*Args[0]) : 3);
		}
	});
	RegisterCommand(TEXT("test.skills"), EDevCommandCategory::Test, TEXT("test.skills — activate every granted skill in sequence"),
		[this](const TArray<FString>&)
	{
		if (UAutomatedTestSubsystem* Tests = GetGameInstance()->GetSubsystem<UAutomatedTestSubsystem>())
		{
			Tests->RunAllSkillsTest();
		}
	});
	RegisterCommand(TEXT("test.record"), EDevCommandCategory::Test, TEXT("test.record — start/stop movement recording"),
		[this](const TArray<FString>&)
	{
		if (UAutomatedTestSubsystem* Tests = GetGameInstance()->GetSubsystem<UAutomatedTestSubsystem>())
		{
			Tests->ToggleRecording();
		}
	});
	RegisterCommand(TEXT("test.playback"), EDevCommandCategory::Test, TEXT("test.playback — replay last recording"),
		[this](const TArray<FString>&)
	{
		if (UAutomatedTestSubsystem* Tests = GetGameInstance()->GetSubsystem<UAutomatedTestSubsystem>())
		{
			Tests->StartPlayback();
		}
	});
}

bool UDevConsoleSubsystem::bDamageLogEnabled = false;
