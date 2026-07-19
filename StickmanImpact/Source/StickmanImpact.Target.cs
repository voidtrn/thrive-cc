// Copyright StickmanImpact Project.

using UnrealBuildTool;
using System.Collections.Generic;

public class StickmanImpactTarget : TargetRules
{
	public StickmanImpactTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Game;
		DefaultBuildSettings = BuildSettingsVersion.V7;
		IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
		ExtraModuleNames.Add("StickmanImpact");
	}
}
