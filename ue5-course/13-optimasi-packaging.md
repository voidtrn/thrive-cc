# Modul 13 — Optimasi, Profiling, & Packaging

**Target:** tahu cara mengukur FPS drop, perbaikan standar, dan build game jadi `.exe`.

## 1. Aturan #1: UKUR dulu, jangan nebak

Console command (tekan `` ` `` saat Play):

| Command | Menampilkan |
|---|---|
| `stat fps` | FPS + ms per frame (60fps = 16.6ms budget) |
| `stat unit` | Pembagian: **Game** (CPU logika) / **Draw** (CPU render) / **GPU** |
| `stat gpu` | Rincian GPU per fitur (shadow, lumen, dll) |
| `stat particles` | Jumlah partikel hidup |

Diagnosa cepat dari `stat unit` — angka mana yang paling besar:

```
Game tinggi  → logika BP/C++ berat (Tick berlebihan? loop besar?)
Draw tinggi  → terlalu banyak objek unik (draw calls)
GPU tinggi   → resolusi/material/shadow/partikel berat
```

Tool visual: `Tools → Unreal Insights` (rekam & bedah frame per frame).

## 2. Perbaikan standar (urutan paling sering berhasil)

**CPU (Game):**
1. **Matikan Tick** yang tidak perlu: BP Class Defaults → `Start with Tick
   Enabled` ✗. Ganti dengan Timer/Event. (Penyebab #1 game pemula lambat.)
2. `Get All Actors of Class` di Tick = dosa besar. Cache sekali di BeginPlay.
3. Timer 0.2s cukup untuk logika yang tidak butuh per-frame (AI cek jarak).

**Draw calls:**
4. Gabungkan objek kecil: pilih banyak → `Tools → Merge Actors`.
5. **Instanced Static Mesh** untuk objek berulang (foliage otomatis ini).

**GPU:**
6. **LOD**: buka Static Mesh → Details → LOD Settings → Number of LODs 3-4
   → Apply. Otomatis mesh jauh = versi ringan.
7. Texture kegedean: buka texture → Maximum Texture Size 1024/2048.
8. Shadow: DirectionalLight → Dynamic Shadow Distance turunkan (3000-5000).
9. Material translucent bertumpuk (overdraw) → kurangi partikel transparan besar.
10. `r.ScreenPercentage 75` — render resolusi lebih rendah, upscale (TSR).

**Budget referensi project 60fps mid-range:**
`aether-realm-ue5/Docs/PHASE9_PRODUCTION.md` — draw calls < 2000, tris < 2M.

## 3. Packaging — jadi .exe

1. **Set default map**: Project Settings → Maps & Modes → Game Default Map.
2. `Platforms (toolbar) → Windows → Package Project` → pilih folder output.
   (Kalau abu-abu: install SDK lewat prompt yang muncul.)
3. Konfigurasi:
   - **Development**: masih ada console & debug — untuk testing
   - **Shipping**: final, bersih, kecil — untuk rilis
   (Project Settings → Packaging → Build Configuration)
4. Tunggu (10-60 menit pertama kali) → folder `Windows/` berisi
   `NamaGame.exe` → kirim ke teman, jalan tanpa UE. 🎉

Masalah umum:

| Gejala | Solusi |
|---|---|
| Map kosong/hitam saat dibuka | Game Default Map belum di-set |
| Gagal cook | Lihat Output Log → cari `Error:` pertama (biasanya asset rusak/reference putus) |
| Ukuran raksasa | Packaging → `Use Pak File` ✓ + `Create compressed cooked packages` ✓; hapus konten tak terpakai (`Tools → Audit → Asset Audit`) |

## 4. 🔨 PRAKTIK

1. Buka level pulau modul 09 → `stat unit` → catat angka. Spawn 200 kotak
   berputar (modul 10) → lihat Game time naik → matikan tick mereka → bandingkan.
2. Kasih LOD ke mesh pohon → `stat fps` sebelum/sesudah dari kejauhan.
3. Package Development build → mainkan .exe di luar editor.
4. **Tantangan**: bikin FPS drop parah dengan sengaja (5000 partikel? 500
   lampu shadow?) lalu temukan penyebabnya lewat `stat gpu` seolah tidak tahu.
   Skill diagnosa = skill paling mahal.

## ✅ CHECKPOINT

- [ ] Bisa baca `stat unit` dan tunjuk biang kerok
- [ ] Hafal 3 perbaikan CPU + 3 GPU
- [ ] Punya .exe hasil package sendiri

📖 [Packaging (docs)](https://dev.epicgames.com/documentation/en-us/unreal-engine/packaging-unreal-engine-projects)

➡️ [Modul 14 — CAPSTONE: aether-realm-ue5](14-capstone-aether-realm.md)
