// Copyright StickmanImpact Project.

#include "ModManagerSubsystem.h"
#include "HAL/FileManager.h"
#include "HAL/PlatformFileManager.h"
#include "IPlatformFilePak.h"
#include "Misc/Paths.h"
#include "Misc/FileHelper.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

FString UModManagerSubsystem::GetModsDirectory() const
{
	return FPaths::Combine(FPaths::ProjectDir(), TEXT("Mods"));
}

bool UModManagerSubsystem::ParseManifest(const FString& SmodPath, FModInfo& OutInfo) const
{
	// The manifest ships beside the .smod as <name>.mod.json (keeps parsing trivial —
	// reading from inside the pak would require mounting first).
	const FString ManifestPath = FPaths::ChangeExtension(SmodPath, TEXT("mod.json"));
	FString Json;
	if (!FFileHelper::LoadFileToString(Json, *ManifestPath))
	{
		return false;
	}

	TSharedPtr<FJsonObject> Root;
	const TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(Json);
	if (!FJsonSerializer::Deserialize(Reader, Root) || !Root.IsValid())
	{
		return false;
	}

	OutInfo.ModID = Root->GetStringField(TEXT("id"));
	OutInfo.DisplayName = Root->GetStringField(TEXT("name"));
	Root->TryGetStringField(TEXT("author"), OutInfo.Author);
	Root->TryGetStringField(TEXT("version"), OutInfo.Version);
	Root->TryGetStringField(TEXT("type"), OutInfo.ModType);

	const TArray<TSharedPtr<FJsonValue>>* Roots = nullptr;
	if (Root->TryGetArrayField(TEXT("mountRoots"), Roots))
	{
		for (const TSharedPtr<FJsonValue>& Value : *Roots)
		{
			OutInfo.MountRoots.Add(Value->AsString());
		}
	}
	const TArray<TSharedPtr<FJsonValue>>* Required = nullptr;
	if (Root->TryGetArrayField(TEXT("requires"), Required))
	{
		for (const TSharedPtr<FJsonValue>& Value : *Required)
		{
			OutInfo.RequiredMods.Add(Value->AsString());
		}
	}

	OutInfo.FilePath = SmodPath;
	return !OutInfo.ModID.IsEmpty();
}

int32 UModManagerSubsystem::ScanMods()
{
	Mods.Empty();

	TArray<FString> SmodFiles;
	IFileManager::Get().FindFiles(SmodFiles, *(GetModsDirectory() / TEXT("*.smod")), true, false);

	for (const FString& FileName : SmodFiles)
	{
		FModInfo Info;
		if (ParseManifest(GetModsDirectory() / FileName, Info))
		{
			Mods.Add(MoveTemp(Info));
		}
	}
	return Mods.Num();
}

void UModManagerSubsystem::SetModEnabled(const FString& ModID, bool bEnabled)
{
	for (FModInfo& Mod : Mods)
	{
		if (Mod.ModID == ModID)
		{
			Mod.bEnabled = bEnabled;
			return;
		}
	}
}

void UModManagerSubsystem::SetLoadOrder(const TArray<FString>& OrderedModIDs)
{
	Mods.Sort([&OrderedModIDs](const FModInfo& A, const FModInfo& B)
	{
		const int32 IndexA = OrderedModIDs.IndexOfByKey(A.ModID);
		const int32 IndexB = OrderedModIDs.IndexOfByKey(B.ModID);
		return (IndexA == INDEX_NONE ? MAX_int32 : IndexA) < (IndexB == INDEX_NONE ? MAX_int32 : IndexB);
	});
}

int32 UModManagerSubsystem::MountEnabledMods()
{
	// The pak platform file is present when launched with -UsePaks / in packaged builds.
	FPakPlatformFile* PakPlatform = static_cast<FPakPlatformFile*>(
		FPlatformFileManager::Get().FindPlatformFile(FPakPlatformFile::GetTypeName()));
	if (!PakPlatform)
	{
		UE_LOG(LogTemp, Warning, TEXT("[Mods] Pak platform file unavailable (editor run?) — mods not mounted."));
		return 0;
	}

	int32 Mounted = 0;
	for (const FModInfo& Mod : Mods)
	{
		if (!Mod.bEnabled || !AreRequirementsMet(Mod.ModID))
		{
			continue;
		}
		// Mount order = list order; later mounts override earlier assets.
		if (PakPlatform->Mount(*Mod.FilePath, 100 + Mounted, nullptr))
		{
			++Mounted;
		}
		else
		{
			UE_LOG(LogTemp, Warning, TEXT("[Mods] Failed to mount %s"), *Mod.FilePath);
		}
	}

	bModsActive = Mounted > 0;
	return Mounted;
}

TArray<FString> UModManagerSubsystem::FindConflicts() const
{
	TArray<FString> Conflicts;
	for (int32 A = 0; A < Mods.Num(); ++A)
	{
		for (int32 B = A + 1; B < Mods.Num(); ++B)
		{
			for (const FString& RootA : Mods[A].MountRoots)
			{
				if (Mods[B].MountRoots.Contains(RootA))
				{
					Conflicts.Add(FString::Printf(TEXT("%s <-> %s (%s)"),
						*Mods[A].ModID, *Mods[B].ModID, *RootA));
					break;
				}
			}
		}
	}
	return Conflicts;
}

bool UModManagerSubsystem::AreRequirementsMet(const FString& ModID) const
{
	const FModInfo* Mod = Mods.FindByPredicate([&](const FModInfo& Info) { return Info.ModID == ModID; });
	if (!Mod)
	{
		return false;
	}
	for (const FString& Required : Mod->RequiredMods)
	{
		const FModInfo* Dependency = Mods.FindByPredicate([&](const FModInfo& Info) { return Info.ModID == Required; });
		if (!Dependency || !Dependency->bEnabled)
		{
			return false;
		}
	}
	return true;
}
