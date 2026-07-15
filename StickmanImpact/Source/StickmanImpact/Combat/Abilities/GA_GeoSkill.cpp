// Copyright StickmanImpact Project.

#include "GA_GeoSkill.h"
#include "World/StickmanGeoWall.h"
#include "TimerManager.h"
#include "Engine/World.h"

namespace
{
	constexpr float StoneWallCastTime = 0.6f;
}

UGA_GeoSkill::UGA_GeoSkill()
{
	SkillData.SkillType = EStickmanSkillType::ElementalSkill;
	SkillData.Element = EStickmanElement::Geo;
	SkillData.SkillName = TEXT("Stone Wall");
	SkillData.Cooldown = 10.f;
	SkillData.EnergyCost = 0.f;
	DamageMultiplier = 1.f; // 100% ATK
}

void UGA_GeoSkill::OnAbilityActivated()
{
	PlayCastAudioVisuals();
	PlayMontageThenEnd(MontageToPlay, StoneWallCastTime);

	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().SetTimer(SlamTimerHandle, this, &UGA_GeoSkill::SlamAndRaiseWall,
			StoneWallCastTime * 0.5f, false);
	}
}

void UGA_GeoSkill::SlamAndRaiseWall()
{
	AActor* Avatar = GetAvatarActorFromActorInfo();
	UWorld* World = GetWorld();
	if (!Avatar || !World)
	{
		return;
	}

	TArray<AActor*> HitActors;
	ApplyRadialElementalDamage(Avatar->GetActorLocation(), Avatar->GetActorForwardVector(), ShockwaveRadius, 180.f,
		DamageMultiplier, GeoStatusEffectClass, HitActors);

	if (HitActors.Num() > 0)
	{
		PlayImpactCameraShake(HitCameraShakeClass);
	}

	if (WallClass)
	{
		const FVector SpawnLocation = Avatar->GetActorLocation() + Avatar->GetActorForwardVector() * WallSpawnDistance;
		const FRotator SpawnRotation = Avatar->GetActorRotation();
		World->SpawnActor<AStickmanGeoWall>(WallClass, SpawnLocation, SpawnRotation);
	}
}
