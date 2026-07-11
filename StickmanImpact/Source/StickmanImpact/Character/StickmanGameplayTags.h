// Copyright StickmanImpact Project.
//
// Native gameplay tags for character movement state. Declaring them natively
// (instead of typing raw strings like FGameplayTag::RequestGameplayTag(TEXT("State.Movement.Idle")))
// gives compile-time errors on typos and shows up in the Gameplay Tag editor automatically.

#pragma once

#include "NativeGameplayTags.h"

namespace StickmanGameplayTags
{
	STICKMANIMPACT_API UE_DECLARE_GAMEPLAY_TAG_EXTERN(State_Movement_Idle);
	STICKMANIMPACT_API UE_DECLARE_GAMEPLAY_TAG_EXTERN(State_Movement_Walking);
	STICKMANIMPACT_API UE_DECLARE_GAMEPLAY_TAG_EXTERN(State_Movement_Sprinting);
	STICKMANIMPACT_API UE_DECLARE_GAMEPLAY_TAG_EXTERN(State_Movement_Dashing);
	STICKMANIMPACT_API UE_DECLARE_GAMEPLAY_TAG_EXTERN(State_Movement_Jumping);
	STICKMANIMPACT_API UE_DECLARE_GAMEPLAY_TAG_EXTERN(State_Movement_Falling);
	STICKMANIMPACT_API UE_DECLARE_GAMEPLAY_TAG_EXTERN(State_Movement_Climbing);
	STICKMANIMPACT_API UE_DECLARE_GAMEPLAY_TAG_EXTERN(State_Movement_Gliding);
	STICKMANIMPACT_API UE_DECLARE_GAMEPLAY_TAG_EXTERN(State_Movement_Swimming);

	// SetByCaller magnitude key for periodic-damage GameplayEffects (elemental DoT statuses):
	// the applying ability sets this to the per-tick damage, the GE's modifier reads it back.
	STICKMANIMPACT_API UE_DECLARE_GAMEPLAY_TAG_EXTERN(SetByCaller_Damage);
}
