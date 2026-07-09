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
    # Lore collectible: Serpihan Jurnal Veyra (STORY_ACT1.md) — teks isi
    # jurnal di description, dibaca dari inventory UI.
    journal = [
        "Hari pertama di Sidra. Ley line di sini bernyanyi — Yukine kecil pasti suka mendengarnya.",
        "Anomali di sektor timur. Arus TIDAK melemah alami. Ada polanya. Ada niatnya.",
        "Dewan menolak laporanku. 'Terlalu spekulatif.' Keluargaku juga dibilang begitu, dulu, sebelum Malam Hampa.",
        "Aku menemukan sigil di bawah shrine. Bukan peninggalan — BARU. Seseorang menggambar ulang luka lama.",
        "Mereka menyebut diri Ordo Lubang Bayang. Kukira monster. Ternyata orang-orang yang kehilangan, sepertiku.",
        "Argumen mereka cacat. Tapi malam ini aku tidak bisa menemukan di mana cacatnya.",
        "Kalau dunia bisa dihampakan semudah itu... mungkin bukan Hampa yang salah. Mungkin dunianya yang rapuh.",
        "Yukine mengirim surat. Tidak kubalas. Dia akan mencariku — anak itu terlalu pintar. Kuharap terlambat.",
        "Aku berhenti menulis 'mereka'. Mulai malam ini: 'kami'.",
        "Jurnal terakhir. Kalau kau membaca ini, Yukine — jangan ikuti aku. Atau ikuti, dan buktikan cacat argumenku. Kumohon.",
    ]
    for i, text in enumerate(journal, start=1):
        rows.append(item(f"Lore_Journal_{i}", f"Serpihan Jurnal Veyra {i}/10",
                         text, "QuestItem", "FourStar", 1))
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


# -------------------------------------------------------- DT_Achievements

def achievements():
    def ach(name, display, desc, stat_key, target, primogems):
        return {
            "Name": name,
            "DisplayName": display,
            "Description": desc,
            "StatKey": stat_key,
            "TargetCount": target,
            "PrimogemReward": primogems,
        }

    # Tier bertingkat per stat key (key kanonis di-wire C++ — lihat
    # AchievementTypes.h). Reward 5/10/20 ala Genshin.
    rows = []
    tiers = [
        # (stat_key, judul dasar, deskripsi, [(target, primogem)...])
        ("Stat_EnemiesDefeated", "Pemburu", "Kalahkan {n} musuh.",
         [(10, 5), (100, 10), (500, 20)]),
        ("Stat_ChestsOpened", "Pemburu Harta", "Buka {n} chest.",
         [(10, 5), (50, 10), (200, 20)]),
        ("Stat_OculiCollected", "Kolektor Oculus", "Kumpulkan {n} oculus.",
         [(10, 5), (40, 10), (65, 20)]),
        ("Stat_WaypointsUnlocked", "Penjelajah", "Aktifkan {n} waypoint.",
         [(5, 5), (15, 10)]),
        ("Stat_WishesMade", "Penggenggam Takdir", "Lakukan {n} wish.",
         [(10, 5), (100, 10)]),
        ("Stat_ReactionsTriggered", "Ahli Elemen", "Picu {n} elemental reaction.",
         [(50, 5), (500, 10), (2000, 20)]),
        ("Stat_ExpeditionsClaimed", "Komandan", "Selesaikan {n} expedition.",
         [(5, 5), (25, 10)]),
        ("Stat_ResinSpent", "Pekerja Keras", "Habiskan {n} resin.",
         [(400, 5), (2000, 10)]),
    ]
    roman = ["I", "II", "III"]
    for stat_key, title, desc, steps in tiers:
        for i, (target, gems) in enumerate(steps):
            rows.append(ach(
                f"Ach_{stat_key.removeprefix('Stat_')}_{i + 1}",
                f"{title} {roman[i]}",
                desc.format(n=target),
                stat_key, target, gems))

    # Secret achievements (easter egg — lihat Docs/EASTER_EGGS.md).
    # BP lapor Stat_SecretsFound saat easter egg ditemukan; UI sembunyikan
    # deskripsi sampai unlocked ("???").
    rows += [
        ach("Ach_Secret_First", "…Apa Itu Tadi?", "Temukan 1 rahasia tersembunyi.",
            "Stat_SecretsFound", 1, 10),
        ach("Ach_Secret_Hunter", "Mata Elang", "Temukan 4 rahasia tersembunyi.",
            "Stat_SecretsFound", 4, 20),
        ach("Ach_Secret_All", "Tidak Ada yang Luput", "Temukan semua 7 rahasia.",
            "Stat_SecretsFound", 7, 40),
        ach("Ach_Secret_Journal", "Cacat dalam Argumen", "Kumpulkan 10 Serpihan Jurnal Veyra.",
            "Stat_JournalsCollected", 10, 40),
    ]
    return rows


# -------------------------------------------------- DT_ReputationRewards

def reputation_rewards():
    def rep(region, level, display, mora, rewards):
        return {
            "Name": f"{region}_{level}",  # row key dibaca UReputationSubsystem
            "DisplayName": display,
            "RequiredLevel": level,
            "MoraReward": mora,
            "ItemRewards": [{"ItemId": i, "Count": c} for i, c in rewards],
        }

    # Region awal "Starter" (= GI CurrentRegion default), level 2-10.
    return [
        rep("Starter", 2, "Warga Baru", 20000, [("Ing_Rice", 10)]),
        rep("Starter", 3, "Kenalan Kota", 0, [("Item_MysticOre", 5)]),
        rep("Starter", 4, "Teman Warga", 30000, [("Mat_WeaponOre", 10)]),
        rep("Starter", 5, "Sahabat Kota", 0, [("Item_HeroWit", 3)]),
        rep("Starter", 6, "Pelindung", 40000, [("Mat_SlimeCore", 10)]),
        rep("Starter", 7, "Pahlawan Lokal", 0, [("Item_HeroWit", 5)]),
        rep("Starter", 8, "Legenda Kota", 50000, [("Mat_WeaponCrystal", 5)]),
        rep("Starter", 9, "Penjaga Region", 0, [("Item_HeroWit", 8)]),
        rep("Starter", 10, "Kehormatan Tertinggi", 100000, [("Mat_WeeklyRelic", 2)]),
    ]


# ---------------------------------------------------- DT_Dialogue_* (Act 1)
# FDialogueNode rows. Node pertama SELALU "Start". Teks Indonesia dulu —
# retrofit FText/String Table saat localization pass (course Bagian 36).

def _node(name, speaker, text, next_node="", choices=None, actions=None, left=True):
    row = {
        "Name": name,
        "SpeakerName": speaker,
        "bPortraitLeft": left,
        "DialogueText": text,
    }
    if next_node:
        row["NextNodeID"] = next_node
    if choices:
        row["Choices"] = choices
    if actions:
        row["Actions"] = actions
    return row


def _choice(text, next_node):
    return {"ChoiceText": text, "NextNodeID": next_node}


def _action(atype, target="", amount=1):
    a = {"Type": atype, "Amount": amount}
    if target:
        a["TargetID"] = target
    return a


def dialogue_opening():
    """Q1 — Kagari bangun di kaki Statue. Nada: misteri + humor ringan."""
    return [
        _node("Start", "???", "...bangun. Bangun! Apinya jangan padam dulu.", "K1"),
        _node("K1", "Kagari", "Ugh... kepala rasanya kayak habis dilempar dari langit. Tunggu — tangan siapa ini? Kenapa NYALA?!", "K2"),
        _node("K2", "Kagari", "Oke. Tenang. Tangan terbakar tapi tidak sakit. Itu... normal, kan? Pasti normal.", "C1"),
        _node("C1", "Kagari", "(Api di telapak tangan bergoyang, seolah menjawab.)", choices=[
            _choice("\"Kamu... barusan ngomong?\"", "V1"),
            _choice("(Diam, coba padamkan apinya.)", "V1B"),
        ]),
        _node("V1", "???", "Statue tidak menjawab. Tapi arus di bawah lembah ini nyaris kering — dan kau, penyala kecil, satu-satunya yang masih membara.", "V2"),
        _node("V1B", "???", "Percuma. Api itu bukan di tanganmu — api itu KAMU. Dan lembah ini hampir padam.", "V2"),
        _node("V2", "???", "Pergilah ke desa di timur. Kalau lembah ini pucat sepenuhnya, apimu ikut padam... dan kau tidak akan pernah tahu siapa dirimu.", "K3"),
        _node("K3", "Kagari", "Desa. Timur. Jangan padam. Siap. ...Semoga di sana ada yang jual sarung tangan tahan api.",
              actions=[_action("StartQuest", "Q_A1_Terbangun")]),
    ]


def dialogue_yukine():
    """Q3 — rekrut Yukine di perpustakaan. Nada: dingin-lucu, scholar."""
    return [
        _node("Start", "Yukine", "Perpustakaan tutup. Kecuali kau membawa sampel anomali ley line, silakan keluar lewat pintu yang sama dengan masukmu.", "K1"),
        _node("K1", "Kagari", "Sampel? Yang kubawa cuma tangan menyala. Hitungan sampel bukan?", "Y1"),
        _node("Y1", "Yukine", "...Menarik. Duduk. Jangan sentuh apa pun. Terutama buku. TERUTAMA buku.", "Y2", left=False),
        _node("Y2", "Yukine", "Api tanpa bahan bakar, tanpa luka bakar. Kalau teoriku benar, kau bukan membawa pecahan Aether. Kau — spesimen — ADALAH pecahannya.", "C1", left=False),
        _node("C1", "Kagari", "(Dia menatapmu seperti menatap soal ujian.)", choices=[
            _choice("\"Namaku Kagari, bukan 'spesimen'.\"", "Y3"),
            _choice("\"Pecahan? Jelaskan pelan-pelan.\"", "Y3B"),
        ]),
        _node("Y3", "Yukine", "Akan kucatat: 'Spesimen keberatan dipanggil spesimen.' Baik, Kagari. Mentorku menghilang saat meneliti hal yang persis sama denganmu.", "Y4", left=False),
        _node("Y3B", "Yukine", "Pelan-pelan butuh enam jam dan tiga papan tulis. Versi cepat: ley line lembah ini disedot sesuatu, dan energimu sejenis dengan yang dicuri.", "Y4", left=False),
        _node("Y4", "Yukine", "Kesepakatan: aku ikut kau ke lapangan, kau jadi... instrumen pengukurku yang bisa jalan. Bawakan tiga Flameherb dari lereng — kita mulai dari sana.", "K2", left=False),
        _node("K2", "Kagari", "Instrumen yang bisa jalan DAN bisa masak. Kau tidak akan menyesal.",
              actions=[_action("ReportTalkObjective", "NPC_Yukine")]),
    ]


def dialogue_shiden():
    """Q5 — pengakuan Shiden setelah ambush. Nada: berat, pilihan bermakna."""
    return [
        _node("Start", "Shiden", "...Berhenti. Sebelum kalian melangkah lagi — penyergapan tadi bukan kebetulan. Mereka tahu rutemu karena aku yang memberi tahu.", "Y1"),
        _node("Y1", "Yukine", "Kau — sejak kapan? Penjaga bayaran yang 'kebetulan' selalu lewat. Tentu saja. Data-nya konsisten dari awal.", "S1", left=False),
        _node("S1", "Shiden", "Ordo menjanjikan desaku dipulihkan dari Hampa. Tadi aku dengar komandan mereka tertawa — desaku MEREKA yang hampakan. Untuk merekrutku.", "S2"),
        _node("S2", "Shiden", "Aku tidak minta maaf dengan kata-kata. Tombakku, sisanya hidupku — itu penawarannya. Terima atau bunuh aku di sini.", "C1"),
        _node("C1", "Kagari", "(Semua menunggumu.)", choices=[
            _choice("\"Orang yang dibohongi bukan pengkhianat. Ikut kami.\"", "F1"),
            _choice("\"Aku tidak percaya kau. Tapi tombakmu boleh ikut.\"", "F2"),
        ]),
        _node("F1", "Shiden", "...Hn. Jangan buat aku menyesali ini.", "END"),
        _node("F2", "Shiden", "Adil. Kepercayaan dibayar darah, bukan kata. Akan kubayar.", "END"),
        _node("END", "Yukine", "Catatan lapangan: party bertambah satu variabel tidak stabil. ...Selamat bergabung, Stormchaser.",
              left=False, actions=[_action("ReportTalkObjective", "NPC_Shiden")]),
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
    write("DT_Achievements.json", achievements())
    write("DT_ReputationRewards.json", reputation_rewards())
    write("DT_Banners.json", banners())
    write("DT_Dialogue_A1_Opening.json", dialogue_opening())
    write("DT_Dialogue_A1_Yukine.json", dialogue_yukine())
    write("DT_Dialogue_A1_Shiden.json", dialogue_shiden())

    # Validasi dialog: semua NextNodeID/choice target harus node yang ada.
    for label, nodes in [("Opening", dialogue_opening()),
                         ("Yukine", dialogue_yukine()),
                         ("Shiden", dialogue_shiden())]:
        ids = {n["Name"] for n in nodes}
        for n in nodes:
            targets = [n.get("NextNodeID")] + [c["NextNodeID"] for c in n.get("Choices", [])]
            for t in targets:
                if t and t not in ids:
                    raise SystemExit(f"Dialog {label}: node '{n['Name']}' menunjuk '{t}' yang tidak ada")
    print("dialogue graph OK")

    # Validasi silang: semua ItemId yang dirujuk harus terdefinisi di DT_Items.
    known = {r["Name"] for r in items()}
    refs = []
    refs += [i for r in consumables() for i in r["Recipe"]]
    refs += [r["ItemId"] for r in shop_general()]
    refs += [i for r in enemy_stats() for i in r["MaterialDrops"]]
    refs += [m["ItemId"] for r in expeditions() for m in r["ItemRewards"]]
    refs += [m["ItemId"] for r in reputation_rewards() for m in r["ItemRewards"]]
    refs += [r["Name"] for r in consumables()]
    unknown = sorted(set(refs) - known)
    if unknown:
        raise SystemExit(f"ItemId tidak terdefinisi di DT_Items: {unknown}")
    print("cross-reference OK")
