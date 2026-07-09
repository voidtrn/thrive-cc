#!/usr/bin/env python3
"""Generate content DataTable JSON untuk import ke UE5.

Output (Content/Data/):
  DT_Items.json          (FItemDefRow)       — definisi semua item/material/food
  DT_Weapons.json        (FWeaponDefRow)     — 6 senjata (roster awal)
  DT_Characters.json     (FCharacterDefRow)  — 3 karakter starter
  DT_ArtifactSets.json   (FArtifactSetRow)   — 5 set (3 punya efek C++)
  DT_EnemyStats.json     (FEnemyStatsRow)    — 5 tipe musuh × tier + slime elemen
  DT_Consumables.json    (FConsumableDefRow) — food + resep cooking
  DT_Shop_General.json   (FShopItemRow)      — dagangan merchant umum
  DT_Banners.json        (FBannerData)       — 4 banner wish

Aturan sama dengan generate_leveling_data.py: angka balance diubah DI SINI,
jalankan ulang, Reimport di editor. Asset refs (Icon/Mesh/Class) sengaja
kosong — assign di editor setelah art ada.
"""

import json
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "Content", "Data")


def write(filename, rows):
    path = os.path.join(OUT_DIR, filename)
    with open(path, "w") as f:
        json.dump(rows, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"{filename}: {len(rows)} rows")


# ---------------------------------------------------------------- DT_Items

def items():
    def item(name, display, desc, category, rarity, max_stack=999):
        return {
            "Name": name,
            "DisplayName": display,
            "Description": desc,
            "Category": category,
            "Rarity": rarity,
            "MaxStack": max_stack,
        }

    rows = []
    # Material ascension/talent (katalog DATA_TABLES.md)
    rows += [
        item("Mat_PyroGem", "Agnite Gem", "Kristal elemen Pyro untuk ascension.", "Material", "FourStar"),
        item("Mat_CryoGem", "Glacite Gem", "Kristal elemen Cryo untuk ascension.", "Material", "FourStar"),
        item("Mat_ElectroGem", "Fulgite Gem", "Kristal elemen Electro untuk ascension.", "Material", "FourStar"),
        item("Mat_Flameherb", "Flameherb", "Herba merah menyala — specialty region vulkanik.", "Material", "TwoStar"),
        item("Mat_Frostbloom", "Frostbloom", "Bunga es abadi — specialty area salju.", "Material", "TwoStar"),
        item("Mat_Stormfruit", "Stormfruit", "Buah bermuatan listrik — specialty dataran tinggi.", "Material", "TwoStar"),
        item("Mat_BossCore", "Primal Core", "Inti energi world boss.", "Material", "FourStar"),
        item("Mat_SlimeGel", "Slime Gel", "Gel kenyal drop musuh kecil.", "Material", "OneStar"),
        item("Mat_SlimeCore", "Slime Core", "Inti padat slime besar / mob elite.", "Material", "ThreeStar"),
        item("Mat_TalentBook_Ember", "Teachings of Ember", "Buku talent elemen Pyro.", "Material", "ThreeStar"),
        item("Mat_TalentBook_Frost", "Teachings of Frost", "Buku talent elemen Cryo.", "Material", "ThreeStar"),
        item("Mat_TalentBook_Storm", "Teachings of Storm", "Buku talent elemen Electro.", "Material", "ThreeStar"),
        item("Mat_WeeklyRelic", "Stormlord's Relic", "Material langka weekly boss.", "Material", "FiveStar"),
        item("Mat_WeaponOre", "Reinforce Ore", "Ore penguat senjata (ascension).", "Material", "TwoStar"),
        item("Mat_WeaponCrystal", "Reinforce Crystal", "Kristal penguat langka (phase tinggi).", "Material", "FourStar"),
        # EXP items (ID sudah dipakai LevelingComponent)
        item("Item_HeroWit", "Hero's Wit", "EXP karakter 20.000.", "Material", "FourStar"),
        item("Item_MysticOre", "Mystic Enhancement Ore", "EXP senjata 10.000.", "Material", "ThreeStar"),
    ]
    # Bahan masak
    rows += [
        item("Ing_RawMeat", "Raw Meat", "Daging buruan segar.", "Material", "OneStar"),
        item("Ing_Rice", "Rice", "Beras lokal.", "Material", "OneStar"),
        item("Ing_Mushroom", "Mushroom", "Jamur hutan.", "Material", "OneStar"),
        item("Ing_Berry", "Sunberry", "Beri manis, bahan tonik.", "Material", "OneStar"),
        item("Ing_Fish", "River Fish", "Ikan sungai.", "Material", "OneStar"),
    ]
    # Food (output cooking — efek di DT_Consumables)
    rows += [
        item("Food_GrilledMeat", "Grilled Meat", "Heal cepat sederhana.", "Food", "OneStar", 99),
        item("Food_HeartyStew", "Hearty Stew", "Heal besar berbasis persen.", "Food", "ThreeStar", 99),
        item("Food_RevivalBroth", "Revival Broth", "Menghidupkan karakter tumbang.", "Food", "ThreeStar", 99),
        item("Food_ATKSkewer", "Blazing Skewer", "Buff ATK sementara.", "Food", "TwoStar", 99),
        item("Food_CritBerryTart", "Critical Berry Tart", "Buff Crit Rate sementara.", "Food", "ThreeStar", 99),
    ]
    return rows


# -------------------------------------------------------------- DT_Weapons

def weapons():
    def weapon(name, display, wtype, rarity, atk1, atk_per_lvl, substat, sub_base, sub_per_lvl, passive=""):
        row = {
            "Name": name,
            "DisplayName": display,
            "WeaponType": wtype,
            "Rarity": rarity,
            "BaseATKLevel1": atk1,
            "ATKPerLevel": atk_per_lvl,
            "SubStat": substat,
            "SubStatBase": sub_base,
            "SubStatPerLevel": sub_per_lvl,
        }
        if passive:
            row["PassiveId"] = passive
        return row

    # Angka contoh PHASE10 dipertahankan (Sword_Iron, Claymore_Flame, Catalyst_Frost).
    return [
        weapon("Sword_Iron", "Iron Blade", "Sword", 3, 40, 7, "CritRate", 0.06, 0.0007),
        weapon("Sword_Flameforged", "Flameforged Edge", "Sword", 4, 44, 8, "ATKPercent", 0.09, 0.001,
               "Passive_SkillDMG"),          # skill DMG +12/15/18/21/24% per refine
        weapon("Catalyst_Frost", "Frost Codex", "Catalyst", 4, 44, 8, "EnergyRecharge", 0.10, 0.0011,
               "Passive_HealBonus"),         # healing bonus +8% per refine step
        weapon("Polearm_Storm", "Stormpiercer", "Polearm", 4, 44, 8, "EnergyRecharge", 0.10, 0.0011,
               "Passive_ElectroDMG"),        # Electro DMG +10% per refine step
        weapon("Bow_Gale", "Galestring", "Bow", 4, 42, 8, "CritDMG", 0.12, 0.0013),
        weapon("Claymore_Flame", "Flame Cleaver", "Claymore", 5, 48, 9, "ATKPercent", 0.10, 0.0012,
               "Passive_BurstATK"),          # setelah burst: +20% ATK 10s
    ]


# ----------------------------------------------------------- DT_Characters

def characters():
    def char(name, display, element, wtype, rarity):
        # CharacterClass/Icon/Portrait: assign di editor (BP child + art).
        return {
            "Name": name,
            "DisplayName": display,
            "Element": element,
            "WeaponType": wtype,
            "Rarity": rarity,
        }

    return [
        char("Char_Kagari", "Kagari", "Pyro", "Sword", 5),
        char("Char_Yukine", "Yukine", "Cryo", "Catalyst", 4),
        char("Char_Shiden", "Shiden", "Electro", "Polearm", 4),
    ]


# --------------------------------------------------------- DT_ArtifactSets

def artifact_sets():
    def aset(name, display, two_stat, two_val, four_effect="", four_stat=None, four_val=0.0):
        row = {
            "Name": name,
            "SetName": display,
            "TwoPieceBonus": {"Stat": two_stat, "Value": two_val},
        }
        if four_effect:
            row["FourPieceEffectId"] = four_effect
        if four_stat:
            row["FourPieceStatBonus"] = {"Stat": four_stat, "Value": four_val}
        return row

    # 3 set pertama punya efek C++ di UArtifactSetEffectComponent (EffectId
    # harus persis: NoblesseOblige / CrimsonWitch / Instructor).
    return [
        aset("Set_NoblesseOblige", "Noblesse Oblige", "EnergyRecharge", 0.10, four_effect="NoblesseOblige"),
        aset("Set_CrimsonWitch", "Crimson Witch of Embers", "ElementalDMGBonus", 0.15, four_effect="CrimsonWitch"),
        aset("Set_Instructor", "Instructor", "ElementalMastery", 80.0, four_effect="Instructor"),
        # 2 set stat-only (tanpa efek khusus — langsung jalan via ApplySetBonuses)
        aset("Set_Gladiator", "Gladiator's Resolve", "ATKPercent", 0.18, four_stat="ATKPercent", four_val=0.17),
        aset("Set_Maiden", "Maiden's Mercy", "HealingBonus", 0.15, four_stat="HPPercent", four_val=0.20),
    ]


# ---------------------------------------------------------- DT_EnemyStats

def enemy_stats():
    def enemy(name, etype, hp, atk, deff, level, mora, drops, innate="None", res_override=None, artifact_chance=0.05):
        res = {"Pyro": 0.1, "Hydro": 0.1, "Cryo": 0.1, "Electro": 0.1,
               "Anemo": 0.1, "Geo": 0.1, "Dendro": 0.1}
        if res_override:
            res.update(res_override)
        return {
            "Name": name,
            "Type": etype,
            "BaseHP": hp,
            "BaseATK": atk,
            "BaseDEF": deff,
            "Level": level,
            "ElementalRES": res,
            "InnateElement": innate,
            "MoraDrop": mora,
            "MaterialDrops": drops,
            "ArtifactDropChance": artifact_chance,
        }

    rows = []
    # Tier awal (region start, lv 1-10)
    rows += [
        enemy("Hilichurl_T1", "Hilichurl", 500, 50, 30, 5, 60, ["Mat_SlimeGel"]),
        enemy("HilichurlArcher_T1", "HilichurlArcher", 400, 60, 25, 5, 60, ["Mat_SlimeGel"]),
        enemy("Slime_Pyro_T1", "Slime", 350, 45, 20, 4, 40, ["Mat_SlimeGel"],
              innate="Pyro", res_override={"Pyro": 1.0}),
        enemy("Slime_Cryo_T1", "Slime", 350, 45, 20, 4, 40, ["Mat_SlimeGel"],
              innate="Cryo", res_override={"Cryo": 1.0}),
        enemy("Slime_Electro_T1", "Slime", 350, 45, 20, 4, 40, ["Mat_SlimeGel"],
              innate="Electro", res_override={"Electro": 1.0}),
    ]
    # Tier elite (lv 20+, drop core)
    rows += [
        enemy("Mitachurl_T2", "Mitachurl", 3500, 140, 80, 20, 300,
              ["Mat_SlimeGel", "Mat_SlimeCore"], artifact_chance=0.25),
        enemy("AbyssMage_Pyro_T2", "AbyssMage", 2200, 160, 60, 20, 350,
              ["Mat_SlimeCore"], innate="Pyro",
              res_override={"Pyro": 0.4}, artifact_chance=0.25),
        enemy("AbyssMage_Cryo_T2", "AbyssMage", 2200, 160, 60, 20, 350,
              ["Mat_SlimeCore"], innate="Cryo",
              res_override={"Cryo": 0.4}, artifact_chance=0.25),
        enemy("Slime_Pyro_T2", "Slime", 1800, 120, 50, 20, 150,
              ["Mat_SlimeGel", "Mat_SlimeCore"], innate="Pyro", res_override={"Pyro": 1.0}),
    ]
    # World boss (weekly — drop gem + core + relic)
    rows += [
        enemy("Boss_StormColossus", "Mitachurl", 25000, 320, 150, 30, 2000,
              ["Mat_BossCore", "Mat_ElectroGem", "Mat_WeeklyRelic"],
              innate="Electro", res_override={"Electro": 0.5}, artifact_chance=1.0),
    ]
    return rows


# --------------------------------------------------------- DT_Consumables

def consumables():
    def food(name, effect, magnitude, recipe, buff_stat=None, buff_delta=0.0, buff_duration=0.0):
        row = {
            "Name": name,
            "DisplayName": "",  # display dari DT_Items (nama sama); kolom ini cadangan UI
            "Effect": effect,
            "Magnitude": magnitude,
            "Recipe": recipe,
        }
        if buff_stat:
            row["BuffStat"] = buff_stat
            row["BuffDelta"] = buff_delta
            row["BuffDuration"] = buff_duration
        return row

    return [
        food("Food_GrilledMeat", "Heal", 800.0, {"Ing_RawMeat": 2}),
        food("Food_HeartyStew", "HealPercent", 0.40,
             {"Ing_RawMeat": 2, "Ing_Mushroom": 2, "Ing_Rice": 1}),
        food("Food_RevivalBroth", "Revive", 0.25,
             {"Ing_Fish": 2, "Ing_Berry": 2, "Ing_Rice": 1}),
        food("Food_ATKSkewer", "StatBuff", 0.0,
             {"Ing_RawMeat": 3, "Ing_Berry": 1},
             buff_stat="ATKPercent", buff_delta=0.12, buff_duration=300.0),
        food("Food_CritBerryTart", "StatBuff", 0.0,
             {"Ing_Berry": 3, "Ing_Rice": 2},
             buff_stat="CritRate", buff_delta=0.08, buff_duration=300.0),
    ]


# -------------------------------------------------------- DT_Shop_General

def shop_general():
    def stock(name, item_id, price, currency="Mora", amount=-1):
        return {"Name": name, "ItemId": item_id, "Price": price,
                "Currency": currency, "Stock": amount}

    return [
        # Bahan masak — tak terbatas, murah
        stock("Shop_RawMeat", "Ing_RawMeat", 80),
        stock("Shop_Rice", "Ing_Rice", 40),
        stock("Shop_Mushroom", "Ing_Mushroom", 60),
        stock("Shop_Berry", "Ing_Berry", 60),
        stock("Shop_Fish", "Ing_Fish", 100),
        # Material penguat — stok harian (ResetStock)
        stock("Shop_WeaponOre", "Mat_WeaponOre", 500, amount=10),
        stock("Shop_MysticOre", "Item_MysticOre", 1200, amount=5),
        stock("Shop_HeroWit", "Item_HeroWit", 4000, amount=3),
        # Tukar sisa gacha (Paimon-shop style)
        stock("Shop_HeroWit_Dust", "Item_HeroWit", 10, currency="Stardust", amount=10),
        stock("Shop_WeeklyRelic_Glitter", "Mat_WeeklyRelic", 20, currency="Starglitter", amount=1),
    ]


# --------------------------------------------------------- DT_Expeditions

def expeditions():
    def exp(name, display, hours, ar_req, mora, rewards):
        return {
            "Name": name,
            "DisplayName": display,
            "DurationHours": hours,
            "ARRequirement": ar_req,
            "MoraReward": mora,
            "ItemRewards": [{"ItemId": i, "Count": c} for i, c in rewards],
        }

    return [
        exp("Exp_MoraRun_Short", "Patrol Dataran", 4, 1, 5000, [("Ing_RawMeat", 2)]),
        exp("Exp_MoraRun_Long", "Ekspedisi Dagang", 20, 5, 30000, [("Ing_Rice", 4)]),
        exp("Exp_OreRun", "Tambang Pegunungan", 8, 5, 2000,
            [("Mat_WeaponOre", 4), ("Item_MysticOre", 2)]),
        exp("Exp_Flameherb", "Panen Lembah Api", 8, 8, 1500, [("Mat_Flameherb", 6)]),
        exp("Exp_Frostbloom", "Panen Puncak Salju", 8, 8, 1500, [("Mat_Frostbloom", 6)]),
        exp("Exp_Stormfruit", "Panen Dataran Badai", 8, 8, 1500, [("Mat_Stormfruit", 6)]),
        exp("Exp_EliteHunt", "Perburuan Elite", 12, 12, 8000,
            [("Mat_SlimeCore", 4), ("Item_HeroWit", 1)]),
    ]


# ------------------------------------------------------------- DT_Banners

def banners():
    # Pool bersama roster saat ini. 5* standar: Claymore_Flame.
    pool_4star = ["Char_Yukine", "Char_Shiden", "Catalyst_Frost",
                  "Polearm_Storm", "Bow_Gale", "Sword_Flameforged"]
    pool_3star = ["Sword_Iron"]

    return [
        {
            "Name": "Banner_Standard",
            "BannerID": "Banner_Standard",
            "BannerName": "Wanderlust Invocation",
            "BannerType": "Standard",
            "Pool5StarStandard": ["Claymore_Flame"],
            "Pool4Star": pool_4star,
            "Pool3Star": pool_3star,
        },
        {
            "Name": "Banner_Beginner",
            "BannerID": "Banner_Beginner",
            "BannerName": "Beginner's Wish",
            "BannerType": "Beginner",
            "Featured4Star": ["Char_Yukine"],   # guaranteed pull ke-10
            "Pool5StarStandard": ["Claymore_Flame"],
            "Pool4Star": pool_4star,
            "Pool3Star": pool_3star,
        },
        {
            "Name": "Banner_Limited_Kagari",
            "BannerID": "Banner_Limited_Kagari",
            "BannerName": "Flamebound Ballad",
            "BannerType": "LimitedCharacter",
            "Featured5Star": ["Char_Kagari"],
            "Featured4Star": ["Char_Shiden", "Sword_Flameforged", "Bow_Gale"],
            "Pool5StarStandard": ["Claymore_Flame"],  # lose 50/50
            "Pool4Star": pool_4star,
            "Pool3Star": pool_3star,
            "StartDate": "2026.07.01-00.00.00",
            "EndDate": "2026.07.22-00.00.00",
        },
        {
            "Name": "Banner_Weapon_v1",
            "BannerID": "Banner_Weapon_v1",
            "BannerName": "Epitome of the Flame",
            "BannerType": "LimitedWeapon",
            "Featured5Star": ["Claymore_Flame"],
            "Featured4Star": ["Catalyst_Frost", "Polearm_Storm"],
            "Pool5StarStandard": ["Claymore_Flame"],
            "Pool4Star": pool_4star,
            "Pool3Star": pool_3star,
            "StartDate": "2026.07.01-00.00.00",
            "EndDate": "2026.07.22-00.00.00",
        },
    ]


if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)
    write("DT_Items.json", items())
    write("DT_Weapons.json", weapons())
    write("DT_Characters.json", characters())
    write("DT_ArtifactSets.json", artifact_sets())
    write("DT_EnemyStats.json", enemy_stats())
    write("DT_Consumables.json", consumables())
    write("DT_Shop_General.json", shop_general())
    write("DT_Expeditions.json", expeditions())
    write("DT_Banners.json", banners())

    # Validasi silang: semua ItemId yang dirujuk harus terdefinisi di DT_Items.
    known = {r["Name"] for r in items()}
    refs = []
    refs += [i for r in consumables() for i in r["Recipe"]]
    refs += [r["ItemId"] for r in shop_general()]
    refs += [i for r in enemy_stats() for i in r["MaterialDrops"]]
    refs += [m["ItemId"] for r in expeditions() for m in r["ItemRewards"]]
    refs += [r["Name"] for r in consumables()]
    unknown = sorted(set(refs) - known)
    if unknown:
        raise SystemExit(f"ItemId tidak terdefinisi di DT_Items: {unknown}")
    print("cross-reference OK")
