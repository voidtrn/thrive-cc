# Modul 05 — Mesh, Texture, & Material

**Target:** import model 3D, paham PBR, bikin master material + instance, intro cel-shading.

## 1. Konsep

| Istilah | Arti |
|---|---|
| **Static Mesh** | Model 3D diam (batu, rumah) |
| **Skeletal Mesh** | Model 3D bertulang (karakter — modul 07) |
| **Texture** | Gambar 2D yang "dibungkus" ke model |
| **Material** | Resep: cara permukaan bereaksi ke cahaya (pakai texture + math) |
| **UV** | Peta cara texture dibungkus ke mesh |

**PBR (Physically Based Rendering)** — 4 input utama material:

```
Base Color  → warna dasar
Metallic    → 0 = non-logam, 1 = logam
Roughness   → 0 = mengkilap kaca, 1 = kusam
Normal      → tekstur "palsu" detail permukaan (bump)
```

## 2. Material Editor

Content Drawer → klik kanan → **Material** → `M_Latihan` → double-click:

```
[Texture Sample]──RGB──▶┌───────────────┐
[Constant 0.0]──────────▶ Metallic       │
[Constant 0.8]──────────▶ Roughness   M_Latihan (node hasil, kanan)
[Texture Sample(N)]─────▶ Normal        │
                         └───────────────┘
```

- Klik kanan graph = search node. `1` + klik = Constant, `3` + klik =
  Constant3Vector (warna), `T` + klik = Texture Sample.
- **Apply & Save** (kiri atas) → drag material ke mesh di level.

## 3. Master Material + Instance (workflow pro)

Jangan bikin material baru per objek. Bikin 1 **master** dengan **parameter**,
lalu **Material Instance** per variasi (murah, edit realtime):

1. Di `M_Latihan`: klik kanan node Constant3Vector → **Convert to Parameter**
   → nama `WarnaDasar`. Roughness juga → param `Kekasaran`.
2. Content Drawer: klik kanan `M_Latihan` → **Create Material Instance** →
   `MI_Merah`. Double-click → centang param → geser nilai. Instan, tanpa
   compile ulang.

> Project aether-realm: `M_Character_Anime` = master, tiap karakter cuma MI.

## 4. Import Mesh dari luar

1. Punya file `.fbx`/`.obj` (contoh: export dari Blender, atau asset gratis
   [Quixel Megascans — gratis untuk UE](https://quixel.com/megascans)).
2. Content Drawer → tombol **Import** (atau drag file ke Content Drawer).
3. Dialog FBX: Static Mesh — biarkan default; **Generate Missing Collision** ✓.
4. Texture: import PNG/TGA → sambungkan di material.

## 5. Intro Cel-Shading (gaya anime)

Prinsip: buang gradasi halus cahaya → jadikan 2-4 "band" (pita) warna.

Cara paling sederhana (unlit-style, cukup untuk paham konsep):

```
[VertexNormalWS]──┐
                  ├─[Dot]──[Ceil ×N /N]───▶ lerp(WarnaGelap, WarnaTerang)──▶ Emissive
[LightVector*]────┘         (posterize)
```

Praktisnya di project ini: shading via **Material Function** `MF_CelShading`
(sudah didesain di `aether-realm-ue5/Docs/PHASE2_SETUP.md` — lengkap dengan
HLSL siap paste). Modul 14 akan membedahnya. Sekarang cukup paham:
**posterize hasil dot(Normal, ArahCahaya) = banding anime**.

## 6. 🔨 PRAKTIK

1. Bikin `M_Master` dengan param: `WarnaDasar` (vector), `Kekasaran` (scalar),
   `Metalik` (scalar).
2. Bikin 3 instance: `MI_EmasKilap` (metallic 1, rough 0.2, kuning),
   `MI_KaretMerah` (metallic 0, rough 0.9), `MI_PlastikBiru`.
3. Terapkan ke 3 sphere di arena, taruh dekat lampu — amati beda pantulan.
4. Download 1 asset Megascans (batu) → import → taruh di level.
5. **Tantangan**: bikin material lava — Base Color oranye + node **Panner**
   ke Texture Sample (texture noise) + colokkan juga ke **Emissive** biar nyala.

## ✅ CHECKPOINT

- [ ] Paham 4 input PBR
- [ ] Master + instance workflow lancar
- [ ] Import FBX + texture sukses
- [ ] Paham konsep posterize untuk cel-shading

📖 [Materials (docs)](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-materials)

➡️ [Modul 06 — Karakter & Input](06-karakter-dan-input.md)
