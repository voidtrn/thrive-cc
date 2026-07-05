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

**Checklist environment pass per area:**
- [ ] Silhouette test: matikan texture (unlit abu) — komposisi masih terbaca?
- [ ] Landmark visible dari waypoint terdekat (navigasi tanpa map)
- [ ] Warna region konsisten palette; accent (bunga/collectible) kontras
- [ ] Cel-shading band tidak banding aneh di terrain (Bands 6-8)
- [ ] 60fps di titik terpadat (kota/hutan lebat) — `stat gpu`
