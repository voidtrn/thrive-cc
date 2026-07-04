# PHASE 1 — Setup di Unreal Editor

Repo ini berisi semua yang bisa dibuat di luar editor: `.uproject`, Config, dan C++ source.
Sisanya (`.uasset`/`.umap`) wajib dibuat di editor. Ikuti urutan di bawah.

## 0. Generate & compile

1. Klik kanan `MyGame.uproject` → **Generate Visual Studio project files**
2. Buka `.sln`, build configuration **Development Editor**, lalu buka editor.
3. Editor akan mengenali class: `OpenWorldGameMode`, `OpenWorldGameState`,
   `OpenWorldPlayerController`, `OpenWorldPlayerState`, `OpenWorldGameInstance`,
   `InputConfig`, `OpenWorldSaveGame`.

## 1A. Content Browser

Struktur folder `Content/` sudah ada di repo (Characters/Player-Enemy-NPC, Maps,
Blueprints, UI, Data, VFX, Audio, Materials, Textures). Editor langsung menampilkannya.

Buat Blueprint child untuk assignment asset:

| Blueprint | Parent | Lokasi |
|---|---|---|
| `BP_OpenWorldGameMode` | `OpenWorldGameMode` | Content/Blueprints |
| `BP_OpenWorldPC` | `OpenWorldPlayerController` | Content/Blueprints |

Lalu di **Project Settings → Maps & Modes**: set Default GameMode = `BP_OpenWorldGameMode`,
PlayerController = `BP_OpenWorldPC`. (GameState/PlayerState/GameInstance sudah di-set dari C++/ini.)

## 1B. World Partition Landscape

1. **File → New Level → Open World** → save sebagai `Content/Maps/L_OpenWorld`.
2. **Landscape Mode** (Shift+2) → buat landscape:
   - Section Size: `63x63 quads`
   - Sections Per Component: `2x2`
   - Number of Components: `8x8`
   - Overall Resolution: **1009 x 1009** ✓
   - Scale default 100 → total ±1km x 1km ✓
3. **World Settings → World Partition Setup**:
   - Grid cell size: **12800** (128m)
   - Loading range: 25600 (2 cell) untuk awal — tuning nanti
   - Enable Streaming: ✓
4. **Window → World Partition → Data Layers**, buat Data Layer Assets (di Content/Data):
   - `DL_Terrain`, `DL_Foliage`, `DL_Buildings`, `DL_Props`, `DL_Enemies`, `DL_Collectibles`
   - Semua Runtime type, initial state Activated (kecuali `DL_Enemies` bisa Loaded untuk spawner control).
5. **Auto material landscape** — buat di Content/Materials:
   - `M_Landscape_Master`: Landscape Layer Blend node dengan 5 layer:
     `Grass`, `Dirt`, `Rock`, `Sand`, `Snow`
   - Auto rules: slope > 45° → Rock (pakai `SlopeMask` dari World Aligned Normal),
     altitude > threshold → Snow. Sisanya paint manual.
   - Buat Landscape Layer Info (Weight-Blended) per layer saat paint pertama.
6. **Level Instance untuk dungeon**: buat level terpisah `Content/Maps/LI_Dungeon_01`,
   lalu di open world tempatkan via **Level Instance** actor. Interior tidak ikut
   World Partition grid — di-load saat pemain masuk portal.

## 1C. Enhanced Input Assets

Semua dibuat di `Content/Data/Input/`.

### Input Actions

| Asset | Value Type | Catatan |
|---|---|---|
| `IA_Move` | Axis2D (Vector2D) | WASD |
| `IA_Look` | Axis2D (Vector2D) | Mouse XY |
| `IA_Jump` | Digital (bool) | |
| `IA_Sprint` | Digital | |
| `IA_Dodge` | Digital | |
| `IA_NormalAttack` | Digital | |
| `IA_ChargedAttack` | Digital | Trigger: **Hold** (0.35s) |
| `IA_ElementalSkill` | Digital | |
| `IA_ElementalBurst` | Digital | |
| `IA_Interact` | Digital | |
| `IA_Swap1` … `IA_Swap4` | Digital | 4 asset terpisah |
| `IA_OpenMap` | Digital | |
| `IA_OpenInventory` | Digital | |
| `IA_OpenCharacter` | Digital | |
| `IA_OpenWish` | Digital | |
| `IA_OpenJournal` | Digital | |
| `IA_Pause` | Digital | |
| `IA_Glide` | Digital | |

### Input Mapping Contexts + binding default

**IMC_Default** (exploration + combat):

| Action | Key | Modifier/Trigger |
|---|---|---|
| IA_Move | W/A/S/D | Swizzle YXZ (W/S), Negate (S, A) |
| IA_Look | Mouse XY | Negate Y |
| IA_Jump | Space | |
| IA_Sprint | Left Shift | |
| IA_Dodge | Left Shift (Tap) atau Left Alt | pisahkan dari Sprint via trigger Tap vs Hold |
| IA_NormalAttack | LMB | |
| IA_ChargedAttack | LMB | Hold 0.35s |
| IA_ElementalSkill | E | |
| IA_ElementalBurst | Q | |
| IA_Interact | F | |
| IA_Swap1–4 | 1 / 2 / 3 / 4 | |
| IA_OpenMap | M | |
| IA_OpenInventory | B | |
| IA_OpenCharacter | C | |
| IA_OpenWish | F3 | |
| IA_OpenJournal | J | |
| IA_Pause | Escape | |
| IA_Glide | Space (saat airborne — dicek di karakter, bukan di IMC) | |

**IMC_UI**: IA_Pause (Escape = close), navigasi UI pakai CommonUI/UMG default.

**IMC_Gliding** (overlay priority 1): IA_Move (steering), IA_Look, IA_Glide (Space = cancel).

**IMC_Swimming** (overlay priority 1): IA_Move, IA_Look, IA_Jump (naik), IA_Sprint (dive/fast swim).

**IMC_Dialog**: IA_Interact (next dialog), IA_Pause (skip/close).

### DA_InputConfig

1. Content/Data/Input → klik kanan → **Miscellaneous → Data Asset** → pilih `InputConfig`.
2. Nama: `DA_InputConfig`. Assign semua IA_* ke slot masing-masing.
3. Buka `BP_OpenWorldPC` → assign:
   - `InputConfig` = `DA_InputConfig`
   - `IMC_Default/UI/Gliding/Swimming/Dialog` = asset IMC masing-masing.

### Cara pakai switch context (dari Blueprint/C++)

```
// Buka menu inventory:
PC->SetInputContextMode(EInputContextMode::UI);
// Mulai gliding (dipanggil dari character movement):
PC->SetInputContextMode(EInputContextMode::Gliding);
// Balik normal:
PC->SetInputContextMode(EInputContextMode::Default);
```

Gliding/Swimming = overlay (IMC_Default tetap hidup, priority lebih tinggi menimpa).
UI/Dialog = modal (IMC_Default dilepas, cursor muncul).

## Verifikasi Phase 1 selesai

- [ ] Project compile tanpa error, editor kebuka
- [ ] `L_OpenWorld` pakai World Partition, landscape 1009x1009, cell 128m
- [ ] 6 Data Layers dibuat
- [ ] 22 Input Action + 5 IMC + DA_InputConfig ter-assign di BP_OpenWorldPC
- [ ] PIE: pawn default bisa possess, log `LogAetherRealm` muncul
- [ ] Ganti `SetInputContextMode` via console/BP → cursor & mapping berubah

Lanjut **Phase 2**: character movement + combat foundation.
