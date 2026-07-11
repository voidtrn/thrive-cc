// Copyright StickmanImpact Project.

#include "CharacterScreenWidget.h"
#include "CharacterPreviewStage.h"
#include "Components/Image.h"
#include "Components/TextBlock.h"
#include "Components/ProgressBar.h"
#include "Components/Button.h"
#include "Components/PanelWidget.h"
#include "Party/PartyManager.h"
#include "Equipment/EquipmentManager.h"
#include "Character/StickmanCharacter.h"
#include "SkillSystem/StickmanSkillDataAsset.h"
#include "Kismet/GameplayStatics.h"
#include "Engine/TextureRenderTarget2D.h"

UPartyManager* UCharacterScreenWidget::GetPartyManager() const
{
	const UGameInstance* GameInstance = GetGameInstance();
	return GameInstance ? GameInstance->GetSubsystem<UPartyManager>() : nullptr;
}

UEquipmentManager* UCharacterScreenWidget::GetPlayerEquipment() const
{
	const AStickmanCharacter* PlayerCharacter = Cast<AStickmanCharacter>(UGameplayStatics::GetPlayerPawn(this, 0));
	return PlayerCharacter ? PlayerCharacter->GetEquipmentManager() : nullptr;
}

void UCharacterScreenWidget::NativeConstruct()
{
	Super::NativeConstruct();

	if (PartyTabButton0) PartyTabButton0->OnClicked.AddDynamic(this, &UCharacterScreenWidget::OnPartyTab0);
	if (PartyTabButton1) PartyTabButton1->OnClicked.AddDynamic(this, &UCharacterScreenWidget::OnPartyTab1);
	if (PartyTabButton2) PartyTabButton2->OnClicked.AddDynamic(this, &UCharacterScreenWidget::OnPartyTab2);
	if (PartyTabButton3) PartyTabButton3->OnClicked.AddDynamic(this, &UCharacterScreenWidget::OnPartyTab3);

	if (UWorld* World = GetWorld())
	{
		// Spawn the preview stage far below the world so it never shows up in-game.
		PreviewStage = World->SpawnActor<ACharacterPreviewStage>(
			ACharacterPreviewStage::StaticClass(), FVector(0.f, 0.f, -100000.f), FRotator::ZeroRotator);
	}

	if (const UPartyManager* PartyManager = GetPartyManager())
	{
		SelectedMemberIndex = PartyManager->GetActiveIndex();
	}
	RefreshAll();
}

void UCharacterScreenWidget::NativeDestruct()
{
	if (PreviewStage)
	{
		PreviewStage->Destroy();
		PreviewStage = nullptr;
	}
	Super::NativeDestruct();
}

void UCharacterScreenWidget::SelectPartyTab(int32 MemberIndex)
{
	const UPartyManager* PartyManager = GetPartyManager();
	if (!PartyManager || !PartyManager->GetPartyMembers().IsValidIndex(MemberIndex))
	{
		return;
	}
	SelectedMemberIndex = MemberIndex;
	RefreshAll();
}

void UCharacterScreenWidget::RotatePreview(float DeltaDegrees)
{
	if (PreviewStage)
	{
		PreviewStage->AddYaw(DeltaDegrees * PreviewRotateSpeed);
	}
}

void UCharacterScreenWidget::EquipWeaponOnSelected(const FWeaponData& Weapon)
{
	if (UEquipmentManager* Equipment = GetPlayerEquipment())
	{
		Equipment->EquipWeapon(Weapon);
		RefreshAll();
	}
}

void UCharacterScreenWidget::EquipArtifactOnSelected(const FArtifactData& Artifact)
{
	if (UEquipmentManager* Equipment = GetPlayerEquipment())
	{
		Equipment->EquipArtifact(Artifact);
		RefreshAll();
	}
}

void UCharacterScreenWidget::RefreshAll()
{
	const UPartyManager* PartyManager = GetPartyManager();
	if (!PartyManager || !PartyManager->GetPartyMembers().IsValidIndex(SelectedMemberIndex))
	{
		return;
	}

	const FPartyMemberState Member = PartyManager->GetPartyMembers()[SelectedMemberIndex];

	if (NameText)
	{
		NameText->SetText(Member.CharacterData.CharacterName);
	}

	if (PreviewStage)
	{
		if (USkeletalMesh* Mesh = Member.CharacterData.CharacterMesh.LoadSynchronous())
		{
			PreviewStage->SetPreviewMesh(Mesh);
		}
		if (PreviewImage && PreviewStage->GetPreviewRenderTarget())
		{
			// Bind the RT into the image brush — a simple brush swap is enough here.
			FSlateBrush Brush = PreviewImage->GetBrush();
			Brush.SetResourceObject(PreviewStage->GetPreviewRenderTarget());
			PreviewImage->SetBrush(Brush);
		}
	}

	RefreshStatsPanel();
	RefreshEquipmentSlots();
	RefreshSkillsAndConstellations();
	RefreshLevelBar();
}

void UCharacterScreenWidget::RefreshStatsPanel()
{
	const UPartyManager* PartyManager = GetPartyManager();
	const UEquipmentManager* Equipment = GetPlayerEquipment();
	if (!PartyManager)
	{
		return;
	}

	const FPartyMemberState Member = PartyManager->GetPartyMembers()[SelectedMemberIndex];
	const FStickmanStats& Base = Member.CharacterData.BaseStats;
	const FEquipmentStatTotals Totals = Equipment ? Equipment->GetTotalStats() : FEquipmentStatTotals();

	auto SetStat = [](UTextBlock* Text, const TCHAR* Label, float Value)
	{
		if (Text)
		{
			Text->SetText(FText::FromString(FString::Printf(TEXT("%s: %.0f"), Label, Value)));
		}
	};

	SetStat(HPStatText, TEXT("HP"), Base.MaxHealth * (1.f + Totals.PercentHP / 100.f) + Totals.FlatHP);
	SetStat(ATKStatText, TEXT("ATK"), Base.Attack * (1.f + Totals.PercentATK / 100.f) + Totals.FlatATK);
	SetStat(DEFStatText, TEXT("DEF"), Base.Defense * (1.f + Totals.PercentDEF / 100.f) + Totals.FlatDEF);
	SetStat(EMStatText, TEXT("Elemental Mastery"), Base.ElementalMastery + Totals.ElementalMastery);
	SetStat(ERStatText, TEXT("Energy Recharge %"), 100.f + Totals.EnergyRechargePercent);
	SetStat(CritRateStatText, TEXT("CRIT Rate %"), Totals.CritRatePercent);
	SetStat(CritDMGStatText, TEXT("CRIT DMG %"), Totals.CritDMGPercent);
}

void UCharacterScreenWidget::RefreshEquipmentSlots()
{
	const UEquipmentManager* Equipment = GetPlayerEquipment();
	if (!Equipment)
	{
		return;
	}

	if (WeaponSlotIcon && Equipment->GetEquippedWeapon().WeaponIcon)
	{
		WeaponSlotIcon->SetBrushFromTexture(Equipment->GetEquippedWeapon().WeaponIcon);
	}

	struct FSlotBinding { EArtifactSlot Slot; UImage* Icon; };
	const FSlotBinding Bindings[] = {
		{ EArtifactSlot::Flower, FlowerSlotIcon }, { EArtifactSlot::Plume, PlumeSlotIcon },
		{ EArtifactSlot::Sands, SandsSlotIcon }, { EArtifactSlot::Goblet, GobletSlotIcon },
		{ EArtifactSlot::Circlet, CircletSlotIcon },
	};
	for (const FSlotBinding& Binding : Bindings)
	{
		if (!Binding.Icon)
		{
			continue;
		}
		FArtifactData Artifact;
		if (Equipment->GetEquippedArtifact(Binding.Slot, Artifact) && Artifact.ArtifactIcon)
		{
			Binding.Icon->SetBrushFromTexture(Artifact.ArtifactIcon);
			Binding.Icon->SetVisibility(ESlateVisibility::Visible);
		}
		else
		{
			Binding.Icon->SetVisibility(ESlateVisibility::Hidden); // Hidden not Collapsed: keep the slot's layout space.
		}
	}
}

void UCharacterScreenWidget::RefreshSkillsAndConstellations()
{
	const UPartyManager* PartyManager = GetPartyManager();
	if (!PartyManager)
	{
		return;
	}

	const FPartyMemberState Member = PartyManager->GetPartyMembers()[SelectedMemberIndex];
	const UStickmanSkillDataAsset* Skills = Member.CharacterData.SkillData;
	if (Skills)
	{
		if (SkillIcon && Skills->ElementalSkill.SkillIcon)
		{
			SkillIcon->SetBrushFromTexture(Skills->ElementalSkill.SkillIcon);
		}
		if (SkillNameText)
		{
			SkillNameText->SetText(FText::FromString(Skills->ElementalSkill.SkillName));
		}
		if (BurstIcon && Skills->ElementalBurst.SkillIcon)
		{
			BurstIcon->SetBrushFromTexture(Skills->ElementalBurst.SkillIcon);
		}
		if (BurstNameText)
		{
			BurstNameText->SetText(FText::FromString(Skills->ElementalBurst.SkillName));
		}
	}

	// Constellation viewer: light up the first N children of ConstellationPanel (author 6
	// icon widgets in the WBP) where N = the member's unlocked constellation level.
	if (ConstellationPanel)
	{
		for (int32 Index = 0; Index < ConstellationPanel->GetChildrenCount(); ++Index)
		{
			if (UWidget* Child = ConstellationPanel->GetChildAt(Index))
			{
				Child->SetRenderOpacity(Index < Member.UnlockedConstellationLevel ? 1.f : 0.3f);
			}
		}
	}
}

void UCharacterScreenWidget::RefreshLevelBar()
{
	const UPartyManager* PartyManager = GetPartyManager();
	if (!PartyManager)
	{
		return;
	}
	const FPartyMemberState Member = PartyManager->GetPartyMembers()[SelectedMemberIndex];

	if (LevelText)
	{
		LevelText->SetText(FText::Format(NSLOCTEXT("CharacterScreen", "LevelFormat", "Lv. {0}"),
			FText::AsNumber(Member.CurrentLevel)));
	}
	if (EXPBar)
	{
		const float Required = 100.f * Member.CurrentLevel * Member.CurrentLevel; // Mirrors UPartyManager's curve.
		EXPBar->SetPercent(Required > 0.f ? FMath::Clamp(Member.CurrentEXP / Required, 0.f, 1.f) : 0.f);
	}
}
