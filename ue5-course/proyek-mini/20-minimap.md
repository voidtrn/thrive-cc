# Bagian 20 — Minimap

Peta bulat pojok kanan atas, muter ikut arah hadap, ada marker.

## 20A. Kamera Minimap (Scene Capture)

1. `BP_MinimapCamera` (Blueprint Actor):
   - **Scene Capture Component 2D** (root)
2. Settings Scene Capture (Details):

| Setting | Nilai | Kenapa |
|---|---|---|
| Projection Type | **Orthographic** | Peta datar, bukan perspektif |
| Ortho Width | 4000 | Luas area terlihat (kecil = zoom in) |
| Capture Source | Final Color (LDR) | Warna jadi |
| **Capture Every Frame** | **✗ OFF** | Hemat GPU besar-besaran |
| Rotation | Pitch **-90** | Lihat lurus ke bawah |

3. Event Graph:

```
[Event BeginPlay]
   [Set Timer by Event] 0.1s, Looping ✓ ─▶ [CaptureTick]

[CaptureTick]  (custom event)
   [Set Actor Location] = PlayerPawn Location + (0, 0, 3000)
   [Scene Capture → Capture Scene]        ← manual capture 10×/detik
```

4. Drag ke level.

## 20B. Render Target

1. Klik kanan → Textures → **Render Target** → `RT_Minimap` →
   Size X/Y **512**, Format RGBA8.
2. `BP_MinimapCamera` → Scene Capture → **Texture Target = RT_Minimap**.

Play sebentar → double-click RT_Minimap → isinya pemandangan atas. ✓

## 20C. Material Minimap Bulat

Material `M_Minimap` → **Material Domain: User Interface**:

```
[Texture Sample RT_Minimap] ──────────▶ Final Color
                                          ▲
[RadialGradientExponential] ──────────▶ Opacity
   Radius 0.5, Density 10                (tengah 1, tepi 0 = BULAT)
```

- Rotasi ikut player: sisipkan **CustomRotator** antara TexCoord dan
  Texture Sample — Rotation Angle dari scalar param `PlayerYaw`
  (0-1 = yaw/360).
- Border emas: Lerp hasil dengan warna emas pakai ring mask
  (RadialGradient kedua dikurangi yang pertama).

## 20D. Pasang di HUD

1. `W_HUD` → **Image** pojok kanan atas (Anchor kanan-atas), 180×180 →
   Brush → **M_Minimap** (bikin **Dynamic Material Instance** di Event
   Construct: `Image → Get Dynamic Material` → simpan).
2. Player indicator: **Image segitiga kecil** persis di tengah minimap
   (selalu tengah — dunia yang bergerak, bukan kamu).
3. Update rotasi — di `RefreshParty`-style timer atau Tick W_HUD:

```
[Get Player Camera Manager → Get Camera Rotation → Yaw] ÷ 360
   ─▶ [Set Scalar Parameter "PlayerYaw"] di Dynamic Material
```

## 20E. Marker di Minimap

Untuk tiap marker (quest kuning, enemy merah, waypoint biru):

1. Canvas Panel kecil di ATAS Image minimap → icon-icon kecil (Image 12×12).
2. Rumus posisi (function `WorldKeMinimap`, Input: WorldPos, Output: Vector2D):

```
Delta   = WorldPos - PlayerPos                      (pakai X,Y saja)
Skala   = RadiusMinimapPx / OrthoWidth×0.5          (90 / 2000)
X' =  Delta.X × Skala
Y' =  Delta.Y × Skala

— putar ikut yaw kamera —
Rad = -Yaw kamera (Degrees → Radians)
Xr = X'×cos(Rad) - Y'×sin(Rad)
Yr = X'×sin(Rad) + Y'×cos(Rad)

— clamp dalam lingkaran —
[Branch: panjang vektor > RadiusMinimapPx]
   True → [Normalize × RadiusMinimapPx]             (nempel tepi)

Return (Xr, Yr) → Set Position icon di canvas (offset dari tengah)
```

> Catatan sumbu: minimap kamera pitch -90 → world X = atas layar map.
> Kalau icon kebalik, tukar/negasikan X-Y — trial 2 menit, normal.

3. Sumber marker: quest → `MarkerSekarang` (Bagian 18); enemy →
   `Get All Actors of Class BP_Enemy` **di timer 0.5s, jangan Tick**;
   filter jarak < 2000.

## ✅ CHECKPOINT

- [ ] Minimap bulat + border, muter ikut kamera
- [ ] Capture 10 fps (bukan every frame) — cek `stat gpu` bedanya
- [ ] Marker quest kuning akurat; enemy merah muncul saat dekat
- [ ] Icon di luar jangkauan nempel di tepi lingkaran

> Versi produksi: `AMinimapCaptureActor` (C++, interval + zoom clamp) —
> logika persis sama.

➡️ [Bagian 21 — Polish & QoL](21-polish-qol.md)
