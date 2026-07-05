# Bagian 23 — Inventory UI (Grid + Detail)

Tas barang: grid item, klik = detail, sortir, filter. Widget-heavy tapi
polanya kepakai di mana-mana (shop, artifact, wish result).

## 23A. Data Item

1. **Structure** `S_ItemStack`: `ItemID` (Name), `Count` (Integer).
2. **Data Asset** `ItemDataAsset` (parent PrimaryDataAsset): `ItemID`,
   `DisplayName` (Text), `Description` (Text), `Icon` (Texture2D),
   `Rarity` (Integer 1-5), `Category` (Enum: Material/Food/Weapon/Quest).
3. **Data Table** `DT_Items` ATAU folder Data Asset per item — pilih salah
   satu (Data Table lebih ringkas untuk item sederhana).
4. Inventory disimpan di karakter/GameInstance: `Inventory` (Array of
   S_ItemStack) — tambah item = cari ID, kalau ada Count++, kalau tidak Add.

## 23B. Widget Slot Item

`W_ItemSlot` (dipakai berulang di grid):

```
┌────────┐  - Border (warna by rarity: 3★ biru/4★ ungu/5★ emas)
│  🖼️    │  - Image Icon
│      x5│  - Text Count (kanan bawah)
└────────┘  - Button (transparan, full slot) → OnClicked
```

Variables (Expose on Spawn ✓): `ItemID` (Name), `Count` (Integer).
Function `Setup`: baca DT_Items → set icon, warna border
(`UUIStatics::GetRarityColor` di project, atau Select node manual).

## 23C. Grid Inventory

`W_Inventory`:

1. **Wrap Box** (atau **Uniform Grid Panel**) di tengah — wadah slot.
2. Event `RefreshGrid` (Input: kategori filter):

```
[RefreshGrid]
   [Clear Children] (Wrap Box)
   [For Each Inventory (S_ItemStack)]
      [Get item data DT_Items by ItemID]
      [Branch: Category cocok filter? (atau filter = All)]
        True:
          [Create Widget W_ItemSlot]
          [Setup] (ItemID, Count)
          [bind OnClicked → TampilkanDetail(ItemID)]
          [Add Child ke Wrap Box]
```

3. **Tab kategori** (atas): tombol All/Material/Food/Weapon → set filter →
   RefreshGrid.

## 23D. Sortir & Filter

Sebelum For Each di RefreshGrid, urutkan array salinan:

| Sortir | Cara (BP) |
|---|---|
| Rarity | Array item → **Sort** by rarity (bikin function bandingkan, atau pakai plugin; sederhana: 3 pass bucket by rarity) |
| Nama | Sort by DisplayName A-Z |
| Terbaru | simpan urutan acquire, sort by index |

Filter = kondisi Branch di loop (sudah di 23C). Toggle button set variabel
`FilterKategori`, panggil RefreshGrid.

> Node Sort array butuh sedikit kerja di BP murni. Trik pemula: simpan
> Inventory sudah terurut saat menambah item (insert di posisi benar),
> jadi grid tinggal tampil. Atau naik ke C++ (Modul 10) untuk Sort proper.

## 23E. Panel Detail

`W_ItemDetail` (muncul saat klik slot):
- Icon besar, nama, rarity bintang, deskripsi
- Tombol aksi by kategori: Food → "Makan" (heal), Weapon → "Equip"
  (Bagian 24), Material → cuma info

```
[TampilkanDetail] (ItemID)
   [Get item data] → set semua field
   [Branch kategori] → tampilkan tombol aksi yang relevan
   [Play PopIn animation]
```

## 23F. Buka/Tutup Inventory

1. `IA_Inventory` (Digital) + key **B** atau **Tab**.
2. Handler di karakter:

```
[IA_Inventory: Started]
   [Branch: inventory terbuka?]
     False → Create W_Inventory + Add to Viewport + RefreshGrid(All)
              + Set Input Mode UI Only + Show Cursor
     True  → Remove + Set Input Mode Game Only + Hide Cursor
```

> Jangan lupa balikin input mode (bug klasik — Bagian 17).

## ✅ CHECKPOINT

- [ ] Grid menampilkan item + count + border rarity
- [ ] Tab kategori memfilter
- [ ] Klik slot = detail muncul
- [ ] B buka/tutup, input mode balik benar

> Versi produksi: 6 tab, `FItemDefRow` + `UI/InventoryTypes.h`,
> `aether-realm-ue5/Docs/PHASE7_SETUP.md`.

➡️ [Bagian 24 — Weapon & Artifact](24-weapon-artifact.md)
