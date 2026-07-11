// Copyright StickmanImpact Project.

#include "StickmanGameplayTags.h"

namespace StickmanGameplayTags
{
	// The FString param is the tag's "Native" registration comment shown in the tag editor.
	UE_DEFINE_GAMEPLAY_TAG(State_Movement_Idle, "State.Movement.Idle");
	UE_DEFINE_GAMEPLAY_TAG(State_Movement_Walking, "State.Movement.Walking");
	UE_DEFINE_GAMEPLAY_TAG(State_Movement_Sprinting, "State.Movement.Sprinting");
	UE_DEFINE_GAMEPLAY_TAG(State_Movement_Dashing, "State.Movement.Dashing");
	UE_DEFINE_GAMEPLAY_TAG(State_Movement_Jumping, "State.Movement.Jumping");
	UE_DEFINE_GAMEPLAY_TAG(State_Movement_Falling, "State.Movement.Falling");
}
