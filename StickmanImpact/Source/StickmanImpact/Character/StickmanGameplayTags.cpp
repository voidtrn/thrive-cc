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
	UE_DEFINE_GAMEPLAY_TAG(State_Movement_Climbing, "State.Movement.Climbing");
	UE_DEFINE_GAMEPLAY_TAG(State_Movement_Gliding, "State.Movement.Gliding");
	UE_DEFINE_GAMEPLAY_TAG(State_Movement_Swimming, "State.Movement.Swimming");
	UE_DEFINE_GAMEPLAY_TAG(SetByCaller_Damage, "SetByCaller.Damage");

	// DEV placeholder ability tags (revert before ship).
	UE_DEFINE_GAMEPLAY_TAG(Ability_Dev_NormalAttack, "Ability.Dev.NormalAttack");
	UE_DEFINE_GAMEPLAY_TAG(Ability_Dev_Skill1, "Ability.Dev.Skill1");
	UE_DEFINE_GAMEPLAY_TAG(Ability_Dev_Skill2, "Ability.Dev.Skill2");
}
