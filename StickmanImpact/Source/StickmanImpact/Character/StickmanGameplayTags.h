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
}
