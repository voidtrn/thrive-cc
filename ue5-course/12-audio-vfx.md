# Modul 12 — Audio & VFX (Niagara)

**Target:** partikel api + hit spark sendiri, suara dengan variasi, ambience.

## PART A — Niagara (VFX)

### 1. Struktur

```
Niagara SYSTEM (NS_...)  ← yang ditaruh di level/di-spawn
  └─ EMITTER (bisa >1)   ← 1 "pancuran" partikel
       └─ MODULE bertumpuk (dieksekusi atas→bawah):
            Emitter Update  → Spawn Rate (berapa/detik)
            Particle Spawn  → posisi lahir, ukuran, warna, umur
            Particle Update → gravitasi, gaya, warna berubah, mati
            Render          → Sprite / Mesh / Ribbon
```

### 2. 🔨 Api unggun

1. Content Drawer → klik kanan → FX → **Niagara System** → "New system
   from template" → **Fountain** → `NS_Api`.
2. Double-click. Panel tengah = stack module. Ubah jadi api:
   - **Spawn Rate**: 60
   - **Initialize Particle**: Lifetime 0.8; Sprite Size 25-40 (random);
     Color: oranye `(5, 1.5, 0.1)` — nilai >1 = glow/HDR
   - **Add Velocity**: arah Z 80-150, buang cone lebar (Velocity Strength kecil)
   - **Gravity Force**: hapus (api tidak jatuh) — klik kanan module → delete
   - **Scale Color**: kurva alpha 1 → 0 (fade mati); kurva RGB oranye → merah gelap
   - **Scale Sprite Size**: kurva 1 → 0.3 (mengecil ke atas)
3. Render → Sprite Renderer → Material: `M_smoke_subUV` (starter) atau bikin
   material additive sendiri (Blend Mode **Additive**, texture soft circle → Emissive).
4. Drag `NS_Api` ke level + **Point Light** oranye → api unggun.

### 3. 🔨 Hit spark (dipanggil dari BP)

1. Template **Omnidirectional Burst** → `NS_HitSpark`: Spawn Burst 15,
   lifetime 0.3, warna kuning HDR, size 5-10, velocity keluar 300-600.
2. System Properties → pastikan tidak looping (1 shot).
3. Di BP saat serangan kena (modul 08):

```
[Sphere Trace kena] → [Spawn System at Location]
   System: NS_HitSpark, Location: [Break Hit Result → Impact Point]
```

Combat langsung terasa 2× lebih enak. Ini yang disebut "game feel".

### 4. Ribbon (trail pedang) — konsep

Renderer **Ribbon** = pita menyambung antar partikel. Spawn per frame di
posisi socket pedang → jejak tebasan. (Setup lengkap:
`aether-realm-ue5/Docs/ART_B_VFX.md` — `NS_Pyro_SwordTrail`.)

## PART B — Audio

### 1. Dasar

- Import `.wav` (drag ke Content Drawer).
- **Play Sound 2D** (UI/musik) vs **Play Sound at Location** (3D, ada jarak).
- **Sound Attenuation** asset = aturan jarak (dekat keras, jauh hilang):
  klik kanan → Audio → Sound Attenuation → assign saat play.

### 2. Variasi anti-bosan: MetaSound

1 suara diulang = robotik. Solusi:

1. Klik kanan → Audio → **MetaSound Source** → `MS_Footstep`.
2. Dalam graph: node **Random Get (Wave Asset)** → array 4 sample langkah →
   **Wave Player** → Output. + node **Random (float)** 0.95-1.05 → pin
   Pitch Shift.
3. Tiap play = sample acak + pitch acak. (Project: `UFootstepComponent`
   C++ sudah handle pemanggilan + deteksi permukaan.)

### 3. Musik & crossfade sederhana

- Musik loop: import wav → Details → Looping ✓ → Play Sound 2D di BeginPlay
  level (atau: **Ambient Sound** actor di level).
- Ganti musik combat: 2 Audio Component di BP → **Fade Out** satu +
  **Fade In** lainnya (node ada di Audio Component).
  (Versi rapi = `UMusicManagerSubsystem` C++ di project.)

### 4. Ambience

**Ambient Sound** actor + attenuation: suara sungai di sungai, angin di
bukit. Taruh beberapa → dunia hidup.

## 🔨 PRAKTIK gabungan

1. Api unggun komplit: NS_Api + light flicker (BP: Timeline → intensity) +
   suara api loop (Ambient Sound + attenuation radius 800).
2. Hit spark + suara pukulan (MetaSound 3 variasi) di combat modul 08.
3. Koin: partikel kilau + "ting!" pitch acak saat diambil.
4. **Tantangan**: hujan — Niagara: spawn box besar di atas player,
   partikel jatuh cepat, mesh renderer garis tipis; + suara hujan loop.

## ✅ CHECKPOINT

- [ ] Paham stack Spawn/Update/Render Niagara
- [ ] Api + hit spark jalan dari BP
- [ ] MetaSound random sample + pitch
- [ ] Game kamu bersuara & bercahaya

📖 [Niagara (docs)](https://dev.epicgames.com/documentation/en-us/unreal-engine/creating-visual-effects-in-niagara-for-unreal-engine) · [MetaSounds (docs)](https://dev.epicgames.com/documentation/en-us/unreal-engine/metasounds-in-unreal-engine)

➡️ [Modul 13 — Optimasi & Packaging](13-optimasi-packaging.md)
