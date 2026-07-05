# Bagian 28 — Cooking & Shop (Ekonomi) · *opsional lanjutan*

Ekonomi bikin loot & eksplorasi bermakna: bahan → masak makanan (heal/buff),
mora → beli barang. Menutup lingkaran "grinding → jadi kuat".

## 28A. Buff Sementara (fondasi food buff)

Sebelum cooking, butuh sistem buff. Di karakter:

Variables: `ActiveBuffs` (Array of struct `S_Buff{BuffID, StatType, Delta,
TimeRemaining}`).

```
[ApplyBuff] (BuffID, StatType, Delta, Duration)
   [RemoveBuff(BuffID)]            ← refresh, jangan menumpuk
   [Tambah stat ke karakter] (Switch StatType → ATK/DEF/dst += Delta)
   [Add S_Buff ke ActiveBuffs]

[Event Tick]
   [For Each ActiveBuffs]
      TimeRemaining -= Delta
      [Branch: <= 0] → [kurangi stat lagi (revert)] → Remove dari array
```

> **Kunci**: catat Delta yang persis ditambahkan, revert dengan angka sama.
> Jangan "hitung ulang" — beda 1 sumber saja bikin stat bocor. (Persis
> `UBuffComponent` C++.)

## 28B. Cooking

1. **DT_Consumables** (Bagian 23 item data, tambah kolom):
   - `Effect` (Enum: Heal / HealPercent / Revive / StatBuff)
   - `Magnitude` (Float)
   - `BuffStat`, `BuffDelta`, `BuffDuration` (untuk StatBuff)
   - `Recipe` (Map ItemID→Count — bahan mentah)
2. **Meja masak** `BP_CookingStation` (interact) → buka `W_Cooking`.
3. `W_Cooking`: list resep (item yang punya Recipe) → tiap baris tombol
   "Masak" (enable kalau bahan cukup):

```
[CanCook] (ItemID)
   [For Each bahan di Recipe]
      [Branch: inventory punya >= jumlah?] False → return false
   return true

[Masak] (ItemID)
   [Branch CanCook] False → gagal
   [For Each bahan] → kurangi dari inventory
   [Tambah 1 hasil ke inventory]
   [FX + suara "masak berhasil"]
```

4. Pakai makanan (dari inventory, Bagian 23 tombol "Makan"):

```
[UseConsumable] (ItemID)
   [Get DT_Consumables row]
   [Switch Effect]
     Heal        → Character.Heal(Magnitude)
     HealPercent → Character.Heal(MaxHP × Magnitude)
     Revive      → (kalau karakter mati) HP = MaxHP × Magnitude
     StatBuff    → ApplyBuff(ItemID, BuffStat, BuffDelta, BuffDuration)
   [Kurangi 1 dari inventory]
```

## 28C. Shop / Merchant

1. **DT_Shop_PakPedagang** (Row `S_ShopItem`): `ItemID`, `Price`,
   `Currency` (Enum Mora/Primogem), `Stock` (-1 = tak terbatas).
2. `BP_NPC_Merchant` (interact) → buka `W_Shop`.
3. `W_Shop` — tab **Beli**:

```
[For Each baris DT_Shop] → buat W_ShopSlot:
   icon + nama + harga + ikon currency
   tombol Beli:
     [Branch: currency cukup AND stok > 0]
       True: kurangi currency, +1 item inventory, stok -1
       False: disable / bunyi gagal
```

   tab **Jual**:
```
[For Each item inventory yang boleh dijual]
   tombol Jual → +Mora (harga × 0.3), kurangi item
```

4. Sumber Mora: drop musuh (Bagian 15 — tambah `+Mora` saat mati), reward
   quest (Bagian 17), buka chest.

## 28D. Rangkai ke Loop

```
Eksplorasi → bunuh musuh (drop bahan + mora) → masak (heal/buff)
   → lebih kuat di combat → boss/domain (loot gear + mora)
   → beli upgrade di shop → eksplorasi lebih jauh
```

Itu **gameplay loop ekonomi** lengkap. Tiap aktivitas memberi makan yang lain.

## ✅ CHECKPOINT

- [ ] Buff: makan food ATK → ATK naik → balik setelah durasi (tidak bocor)
- [ ] Masak: bahan cukup → dapat makanan; kurang → gagal
- [ ] Shop beli: currency turun, item masuk, stok berkurang
- [ ] Shop jual: item hilang, mora naik
- [ ] Musuh drop mora/bahan → nyambung ke masak & beli

> Versi produksi: `UBuffComponent` + `UConsumableComponent` +
> `UShopComponent` — `aether-realm-ue5/Docs/PHASE11_CONTENT_SYSTEMS.md`.

## 🎓 Track proyek-mini benar-benar tamat

28 bagian: dari rapikan karakter VRoid sampai action RPG open world dengan
combat, elemen, boss, quest, dialog, inventory, gear, party, minimap,
domain, ekonomi, save, polish. **Kamu sudah membangun game utuh di Blueprint.**

Naik level berikutnya: [Modul 14 — Capstone C++](../14-capstone-aether-realm.md).
