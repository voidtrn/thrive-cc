# SECTION D — Environment Art

## D1. Art Style Guide

**Arah:** anime-inspired fantasy, painterly, vibrant.
Referensi: Genshin Impact, Breath of the Wild, Tales series.

Prinsip:
1. **Stylized > realistic** — tidak ada texture photoreal; semua hand-painted
   feel (soft gradient, brush stroke terlihat)
2. Vibrant tapi tidak oversaturated (saturation cap ±80%, value range lebar)
3. **Silhouette jelas** — landmark & enemy terbaca dari 200m
4. Atmospheric perspective — `SkyAtmosphere` aerial perspective + fog:
   objek jauh bergeser biru/pucat (sudah gratis dari config Phase 1)
5. Konsistensi cel-shading: environment pakai `M_Terrain_Anime`/`M_Prop_Anime`
   (band lebih halus dari karakter — Phase 2)

### Palette per Region

**Region 1 — Meadow/Forest (starter):**
| Elemen | Hex |
|---|---|
| Grass | `#7CB342`, `#8BC34A` |
| Bark / Leaves | `#5D4037` / `#388E3C` |
| Rocks | `#8D6E63`, `#A1887F` |
| Flowers accent | kuning, putih, pink |
| Sky siang / sunset | `#87CEEB` / `#FF7F50` |

**Region 2 — Mountain/Cliff:**
Rocks `#78909C` `#90A4AE` · Snow `#ECEFF1` · Pine `#2E7D32` · Sky `#90CAF9`

**Region 3 — Lake/Coast:**
Water shallow/deep `#42A5F5`/`#1565C0` · Sand `#FFECB3` `#FFE082` ·
Coastal rock `#8D6E63` · Coral accent pink/oranye

Scope catatan (Phase 9): **1 region dulu** — Region 2 & 3 palette disiapkan
untuk post-launch, atau jadi sub-biome kecil di dalam 1km² (utara berbukit
bersalju tipis, tenggara danau) supaya variety tanpa nambah luas.

## D2. Landscape Material

`M_Landscape_Master` (auto-material, extend dari Phase 1):

**Layer (bawah → atas):**
1. **Dirt/Soil** — base default
2. **Grass** — auto di area flat (slope < 30°)
3. **Rock** — auto slope > 45° (World Aligned slope mask, transisi blend 30-45°)
4. **Sand** — dekat water body (paint manual + height blend rendah)
5. **Snow** — elevation Z > threshold (param `SnowHeight`), blend noise di tepi

**Per layer:**
- Albedo 1024-2048 tileable (hand-painted style — Substance/Mixer preset
  stylized atau beli pack "stylized textures")
- Normal map (subtle — anime style jangan bumpy berlebihan)
- Roughness (flat-ish, variasi dikit)
- **Height map** untuk height-blend antar layer (transisi natural, bukan alpha lerp)

**Anti-repetisi (wajib untuk 1km²):**
- Macro variation: noise texture skala besar (0.001 UV) multiply albedo ±10%
- Distance tiling switch: dekat 1x, jauh 0.2x UV (lerp by depth) — pola tile
  hilang dari jauh
- Layer `Wetness` dari MPC_Weather (Phase 4): roughness turun + albedo gelap 15%

**Grass & foliage:**
- Landscape Grass Type di layer Grass: static mesh rumput (cross-plane,
  vertex color gradient gelap bawah→terang atas), density 2-3 per m²,
  cull 40m (Phase 9 budget)
- Wind: material `SimpleGrassWind` node, intensity dari param global
  (naikkan saat Thunderstorm — konsisten ART_B)
- Interaksi karakter: bend via `VertexNormalWS` + player position param
  (opsional polish)

**Blending (node setup `M_Landscape_Master`):**
- **Height-based blend**: Landscape Layer Blend mode `Height Blend`, plug
  height map tiap layer — rumput "tumbuh" di sela batu, bukan fade linear
- **Triplanar**: layer Rock pakai World Aligned Texture (XYZ projection,
  blend sharpness 4) — slope curam tidak stretch
- **Macro variation**: noise 0.0005-0.001 UV, multiply albedo 0.9-1.1
- **Distance blend**: `lerp(detail 1x UV, macro 0.2x UV, depth fade 3000-8000)`

**Fitur tambahan:**
- Wetness: Collection Param `MPC_Weather.Wetness` (C++ Phase 4) →
  albedo ×0.85, roughness -0.3, spec naik — di SEMUA layer
- Snow accumulation: param global `SnowAmount` — lerp ke snow texture di
  permukaan world-normal-up (dot(N, up) > 0.7); winter event/region tinggi
- Puddle: decal reflective di flat spot + opacity × Wetness
- Grass tint: `absolute world position` → noise → subtle hue shift per lokasi

## D3. Foliage

### Trees
1. Pipeline: Blender **Sapling Tree Gen** (gratis) atau SpeedTree
2. Budget: hero 5-8k tris / mid 2-4k / background 500-1k + billboard LOD akhir
3. Leaf cluster atlas 2048², bark tileable; material cel-shaded + **fake SSS**:
   `TwoSidedSign` × warm color di backface (daun tembus cahaya anime style)
4. Wind: SimpleGrassWind (leaf) + trunk sway subtle (WPO sine × height mask)
5. Varian per region: oak (kanopi bulat), pine (konikal), cherry blossom
   (pink, VFX petal `NS_AmbientLeaves` varian), dead tree (area spooky),
   **giant ancient tree = landmark** (satu, custom sculpt, visible dari mana pun)

### Grass & Ground Cover
- Jenis: short grass, tall grass, wildflower, wheat; 4-8 tris per clump,
  **alpha-tested** (masked — bukan translucent, mahal)
- Placement: Landscape Grass Type (auto di layer) + Foliage Painter (manual accent)
- Density LOD: full < 20m, sparse 20-40m, cull 40m
- Wind: SimpleGrassWind + per-instance random phase (`PerInstanceRandom`)
- **Interaksi flatten**: RenderTarget top-down kecil ikut player — karakter
  gambar ke RT (brush), material grass baca RT → WPO tekan + bend arah gerak;
  fade trail 2-3s (RT persistence)
- Tint per instance ±10% via `PerInstanceRandom` → hue lerp
- Flowers: wildflower scatter warna random; field flower dense di POI;
  **glowing flower** malam (emissive × night param dari `OnDayPhaseChanged`)

### Rocks & Props
- Small 100-300 tris scatter / boulder 500-1k cluster / formation landmark 2-5k
- Material share dengan landscape rock layer + **moss overlay**:
  `dot(WorldNormal, Up)` mask → moss texture di permukaan atas
- Props: bench/fence/lamp/sign; crate & barrel **breakable** (Geometry
  Collection sederhana atau swap mesh + `NS_WoodBreak`); campfire/torch
  (`NS_Campfire` ART_B); ruins modular kit: pillar utuh/patah, archway, wall ×3

## D4. Lighting & Post Processing

### Lights (L_OpenWorld)

| Actor | Setting |
|---|---|
| **DirectionalLight** (sudah dirotasi `ADayNightController`) | Intensity 10-12 lux day / 0.5-1 night (C++ interp); Temperature 5500K day, night pakai `NightTint` C++; **CSM**: distance 3000, 4 cascade; Volumetric/light shaft ✓ (god rays) |
| **SkyLight** | Real Time Capture ✓ (recapture on phase change — C++); intensity 1.0 |
| **SkyAtmosphere** | Rayleigh default Earth, Mie slight haze, planet radius 6371 |
| **ExponentialHeightFog** (di-drive `AWeatherController`) | base density 0.02, falloff 0.05, warna biru muda day / biru gelap night; Volumetric Fog ✓ |

### Post Process Volume (Infinite Extent, bareng PP_AnimeStyle Phase 2)

| Setting | Nilai |
|---|---|
| Exposure | Auto histogram, min 0.5 / max 2.0 |
| Bloom | Intensity 0.675, threshold 1.0, **Convolution** (soft anime bloom) |
| Chromatic Aberration | 0.05 |
| Vignette | 0.2 |
| Color Grading | Saturation 1.1, Contrast 1.05, shadow warm + highlight cool tint, custom anime LUT (buat di Photoshop dari neutral LUT + grade screenshot) |
| AO | GTAO, intensity 0.5, radius 100 |
| SSR | Medium — air & wet surface |
| Motion Blur | 0.3, per-object |

**Checklist environment pass per area:**
- [ ] Silhouette test: matikan texture (unlit abu) — komposisi masih terbaca?
- [ ] Landmark visible dari waypoint terdekat (navigasi tanpa map)
- [ ] Warna region konsisten palette; accent (bunga/collectible) kontras
- [ ] Cel-shading band tidak banding aneh di terrain (Bands 6-8)
- [ ] 60fps di titik terpadat (kota/hutan lebat) — `stat gpu`
