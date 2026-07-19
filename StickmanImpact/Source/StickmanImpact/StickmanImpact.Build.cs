// Copyright StickmanImpact Project.

using UnrealBuildTool;

public class StickmanImpact : ModuleRules
{
	public StickmanImpact(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		// Flat module layout (no Public/Private split) — allow module-root-relative
		// includes like "SkillSystem/StickmanSkillTypes.h".
		PublicIncludePaths.Add(ModuleDirectory);

		PublicDependencyModuleNames.AddRange(new string[]
		{
			"Core",
			"CoreUObject",
			"Engine",
			"InputCore",

			// Requested modules for skill / combat / UI / audio systems.
			"EnhancedInput",
			"GameplayAbilities",
			"GameplayTags",
			"GameplayTasks",
			"UMG",
			"LevelSequence",
			"MovieScene",
			"Niagara",
			"MetasoundEngine",
		});

		PrivateDependencyModuleNames.AddRange(new string[]
		{
			"Slate",
			"SlateCore",
			"PhysicsCore", // EPhysicalSurface / UPhysicalMaterial::DetermineSurfaceType (footsteps)
			"AIModule",
			"NavigationSystem",
			"Json",
			"JsonUtilities", // FJsonObjectConverter (character-creator share codes)
			"PakFile",       // FPakPlatformFile (.smod mod mounting)
		});
	}
}
