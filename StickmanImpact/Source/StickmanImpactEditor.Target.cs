// Copyright StickmanImpact Project.

using UnrealBuildTool;
using System.Collections.Generic;

public class StickmanImpactEditorTarget : TargetRules
{
	public StickmanImpactEditorTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Editor;
		DefaultBuildSettings = BuildSettingsVersion.V7;
		IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
		ExtraModuleNames.Add("StickmanImpact");
	}
}
