#!/usr/bin/env python3
"""Generate leveling DataTable JSON untuk import ke UE5.

Output (Content/Data/):
  DT_CharacterAscension.json  (FAscensionCostRow, key: <CharId>_<Phase>)
  DT_WeaponAscension.json     (FAscensionCostRow, key: <WeaponId>_<Phase>)
  DT_TalentCost.json          (FTalentCostRow,   key: <CharId>_<Talent>_<TargetLevel>)

Formula di sini = satu-satunya sumber angka. Ubah balance di file ini,
jalankan ulang, re-import JSON di editor (kanan-klik DataTable > Reimport).
"""

import json
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "Content", "Data")

# Level cap per phase ascension (index = phase yang sedang di-unlock).
PHASE_CAPS = [20, 40, 50, 60, 70, 80]

# CharId -> (gem, local specialty, talent book) sesuai elemen (ART_A).
CHARACTERS = {
    "Char_Kagari": ("Mat_PyroGem", "Mat_Flameherb", "Mat_TalentBook_Ember"),
    "Char_Yukine": ("Mat_CryoGem", "Mat_Frostbloom", "Mat_TalentBook_Frost"),
    "Char_Shiden": ("Mat_ElectroGem", "Mat_Stormfruit", "Mat_TalentBook_Storm"),
}

# WeaponId -> rarity. Row DT_Weapons (PHASE10) + Polearm_Storm untuk Shiden.
WEAPONS = {
    "Sword_Iron": 3,
    "Catalyst_Frost": 4,
    "Polearm_Storm": 4,
    "Claymore_Flame": 5,
}


def mat(item_id, count):
    return {"ItemId": item_id, "Count": count}


def character_ascension_rows():
    rows = []
    for char_id, (gem, herb, _book) in CHARACTERS.items():
        gem_counts = [1, 3, 6, 9, 12, 20]
        herb_counts = [3, 10, 20, 30, 45, 60]
        for phase in range(6):
            materials = [
                mat(gem, gem_counts[phase]),
                mat(herb, herb_counts[phase]),
            ]
            # Drop musuh: tier common (gel) phase 0-2, tier rare (core) phase 3-5.
            if phase <= 2:
                materials.append(mat("Mat_SlimeGel", 3 + phase * 12))   # 3/15/27
            else:
                materials.append(mat("Mat_SlimeCore", 6 * (phase - 2)))  # 6/12/18
            # Boss material mulai phase 1.
            if phase >= 1:
                materials.append(mat("Mat_BossCore", 2 + (phase - 1) * 3))  # 2/5/8/11/14
            rows.append({
                "Name": f"{char_id}_{phase}",
                "Phase": phase,
                "RequiredLevel": PHASE_CAPS[phase],
                "MoraCost": 20000 + 20000 * phase,
                "Materials": materials,
            })
    return rows


def weapon_ascension_rows():
    rows = []
    for weapon_id, rarity in WEAPONS.items():
        for phase in range(6):
            materials = [
                mat("Mat_WeaponOre", (phase + 1) * (rarity - 1)),
                mat("Mat_SlimeGel", (phase + 1) * 3),
            ]
            if phase >= 3:
                materials.append(mat("Mat_WeaponCrystal", (phase - 2) * (rarity - 2)))
            rows.append({
                "Name": f"{weapon_id}_{phase}",
                "Phase": phase,
                "RequiredLevel": PHASE_CAPS[phase],
                "MoraCost": (rarity - 2) * 5000 * (phase + 1),
                "Materials": materials,
            })
    return rows


def talent_cost_rows():
    # Index 0 = naik ke level 2, dst (target 2..10).
    mora = [5000, 10000, 15000, 20000, 25000, 40000, 60000, 80000, 100000]
    books = [2, 3, 4, 6, 8, 10, 12, 14, 16]
    gels = [4, 6, 8, 10, 12]            # target 2-6
    cores = [4, 6, 9, 12]               # target 7-10
    weekly = {8: 1, 9: 1, 10: 2}        # weekly boss relic, endgame only

    rows = []
    talents = ["NormalAttack", "ElementalSkill", "ElementalBurst"]
    for char_id, (_gem, _herb, book) in CHARACTERS.items():
        for talent in talents:
            for target in range(2, 11):
                i = target - 2
                materials = [mat(book, books[i])]
                if target <= 6:
                    materials.append(mat("Mat_SlimeGel", gels[i]))
                else:
                    materials.append(mat("Mat_SlimeCore", cores[target - 7]))
                if target in weekly:
                    materials.append(mat("Mat_WeeklyRelic", weekly[target]))
                rows.append({
                    "Name": f"{char_id}_{talent}_{target}",
                    "TargetLevel": target,
                    "MoraCost": mora[i],
                    "Materials": materials,
                })
    return rows


def write(filename, rows):
    path = os.path.join(OUT_DIR, filename)
    with open(path, "w") as f:
        json.dump(rows, f, indent=2)
        f.write("\n")
    print(f"{filename}: {len(rows)} rows")


if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)
    write("DT_CharacterAscension.json", character_ascension_rows())
    write("DT_WeaponAscension.json", weapon_ascension_rows())
    write("DT_TalentCost.json", talent_cost_rows())
