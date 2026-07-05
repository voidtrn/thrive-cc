# Modul 09 — World Building: Landscape, Foliage, Lighting

**Target:** bikin pulau kecil: terrain di-sculpt, rumput-pohon, matahari + kabut, intro World Partition.

## 1. Landscape

1. Level baru: `File → New Level → Open World` (otomatis World Partition +
   sky). Save `L_Pulau`.
2. Mode selector di toolbar (dropdown `Select`) → **Landscape** (`Shift+2`).
3. Tab **Manage** → New: biarkan default (505×505) untuk latihan → **Create**.
4. Tab **Sculpt** — kuas membentuk tanah:

| Tool | Fungsi |
|---|---|
| Sculpt | Naikkan (Ctrl = turunkan) |
| Smooth | Haluskan |
| Flatten | Ratakan ke ketinggian titik awal klik |
| Ramp | Bikin jalan/lereng antara 2 titik |
| Erosion/Noise | Detail natural |

Brush Size/Falloff/Strength di panel atas. **Bikin: 2 bukit + 1 lembah +
1 area datar untuk "desa".**

> Angka project sungguhan (1km², 128m cell) ada di
> `aether-realm-ue5/Docs/PHASE1_SETUP.md`.

## 2. Landscape Material sederhana

1. Material `M_Terrain`: 2 Texture Sample (rumput + batu; ambil dari
   Starter Content `T_Ground_Grass_D`, `T_Rock_Slate_D`).
2. Node **Landscape Layer Blend** → + 2 layer: `Rumput`, `Batu`
   (Weight-Blended) → colok texture masing-masing → ke Base Color.
3. Assign material ke landscape (Details landscape → Landscape Material).
4. Mode Landscape → tab **Paint** → buat Layer Info (klik + di tiap layer →
   Weight-Blended) → kuas paint batu di lereng, rumput di datar.

(Auto-material by slope — versi pro-nya di project, `ART_D_ENVIRONMENT.md`.)

## 3. Foliage — rumput & pohon

1. Mode selector → **Foliage** (`Shift+3`).
2. `+ Foliage` → drag Static Mesh (Starter Content: `SM_Bush`; pohon
   gratis: Megascans/Fab) ke daftar.
3. Klik mesh di daftar → atur **Density**, Scale Min/Max (0.8-1.2 biar
   variatif) → kuas cat di landscape. `Shift+klik` = hapus.
4. Performa: pilih mesh foliage → **Cull Distance** Max 15000 (jauh = hilang).

## 4. Lighting open world (resep standar)

Level Open World sudah punya semua — kenali di Outliner:

| Actor | Peran | Setting kunci |
|---|---|---|
| **DirectionalLight** | Matahari | Intensity ~10 lux; rotasi = jam (drag pitch = sunset!) |
| **SkyAtmosphere** | Langit fisik | Warna langit ikut sudut matahari otomatis |
| **SkyLight** | Cahaya ambient dari langit | Real Time Capture ✓ |
| **VolumetricCloud** | Awan 3D | — |
| **ExponentialHeightFog** | Kabut jarak | Density 0.02; Volumetric Fog ✓ = god rays |
| **PostProcessVolume** | Filter layar | Infinite Extent ✓; Bloom/Exposure/Saturasi |

**🔨 Coba**: putar DirectionalLight pitch ke -10° → golden hour instan.
Tambah PostProcessVolume → Color Grading → Saturation 1.2 → dunia lebih hidup.
(Day/night otomatis = kode `ADayNightController` di project.)

## 5. World Partition — konsep singkat

Dunia besar dipotong grid; hanya cell dekat player yang dimuat:

```
┌───┬───┬───┬───┐
│   │ ▒ │ ▒ │   │   ▒ = loaded (dekat player ☺)
├───┼───┼───┼───┤   kosong = unloaded (hemat memori)
│ ▒ │ ☺ │ ▒ │   │
├───┼───┼───┼───┤
│   │ ▒ │ ▒ │   │
└───┴───┴───┴───┘
```

- Otomatis aktif di level Open World. Lihat: `Window → World Partition`.
- Editor: shift+drag region di minimap WP → load/unload area kerja.
- Actor besar (landmark) → Details → **Is Spatially Loaded ✗** (selalu ada).

## 6. 🔨 PRAKTIK gabungan

1. Pulau: bukit, lembah, pantai (paint layer pasir kalau mau — layer ke-3).
2. Hutan kecil 2 jenis mesh + rumput.
3. Sore hari: matahari rendah + fog oranye tipis + bloom.
4. Taruh arena combat modul 08 di area datar → pulau kamu ada gameplay-nya.
5. **Tantangan**: bikin jalan setapak pakai Landscape **Ramp** + paint
   layer dirt, dari pantai ke puncak bukit.

## ✅ CHECKPOINT

- [ ] Sculpt + paint landscape lancar
- [ ] Foliage dengan density & cull distance
- [ ] Bisa set mood lighting (siang/sore) manual
- [ ] Paham konsep World Partition

📖 [Landscape (docs)](https://dev.epicgames.com/documentation/en-us/unreal-engine/landscape-outdoor-terrain-in-unreal-engine)

➡️ [Modul 10 — C++ Dasar](10-cpp-dasar.md)
