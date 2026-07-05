# Modul 02 — Navigasi Viewport, Level, & Actor

**Target:** gerak bebas di viewport, menaruh & mengatur objek dengan presisi.

## 1. Navigasi Viewport (latih sampai refleks)

| Input | Aksi |
|---|---|
| **Klik kanan (tahan) + WASD** | Terbang seperti FPS ← cara utama |
| Klik kanan + mouse | Lihat sekeliling |
| Klik kanan + `Q`/`E` | Turun / naik |
| Scroll (saat klik kanan) | Ubah kecepatan terbang |
| `F` (objek terpilih) | Fokus/zoom ke objek ← sering banget dipakai |
| `Alt + klik kiri drag` | Orbit sekitar objek fokus |

## 2. Transform: Move, Rotate, Scale

Pilih objek di viewport, lalu:

| Tombol | Mode | Gizmo yang muncul |
|---|---|---|
| `W` | **Move** | 3 panah (merah X, hijau Y, biru Z) |
| `E` | **Rotate** | 3 lingkaran |
| `R` | **Scale** | 3 kotak |

```
        Z (biru, atas)
        │
        │
        └────── Y (hijau, kanan)
       ╱
      X (merah, depan)        ← sumbu UE: Z selalu ke ATAS
```

- Drag panah = geser di 1 sumbu. Drag kotak kuning tengah = bebas.
- **Snap**: ikon magnet di kanan atas viewport — grid 10cm/50cm untuk
  penempatan rapi. `End` = jatuhkan objek ke lantai.
- Angka presisi: panel **Details → Transform** ketik manual.
- **Duplikat**: `Alt + drag` gizmo, atau `Ctrl+D`. Hapus: `Delete`.

## 3. Menaruh Actor

Cara 1: **Toolbar → tombol `+ Add`** (ikon kubus+) → Shapes → Cube.
Cara 2: **Content Drawer** → drag asset apa pun ke viewport.
Cara 3: **Window → Place Actors** → panel pencarian semua tipe actor.

Actor penting yang harus dicoba sekarang:

| Actor | Ada di | Fungsi |
|---|---|---|
| Cube/Sphere (Shapes) | + Add → Shapes | Objek dasar |
| **Point Light** | + Add → Lights | Lampu bohlam |
| **Directional Light** | + Add → Lights | Matahari (sudah ada di level) |
| **Player Start** | Place Actors | Titik spawn player |

## 4. 🔨 PRAKTIK — bikin arena mini

1. `File → New Level → Basic` → save sebagai `L_Arena` (`Ctrl+S`).
2. Taruh **Cube**, ratakan jadi lantai: Details → Scale `(20, 20, 0.5)`,
   Location `(0, 0, 0)`.
3. Bikin 4 dinding: duplikat cube (`Alt+drag`), scale & posisikan.
4. Taruh 2 **Point Light** di sudut; Details → ubah **Intensity** &
   **Light Color** (klik kotak warna).
5. Taruh **Player Start** di tengah (panah biru = arah hadap spawn).
6. **▶ Play** → kamu spawn di arena. (Karakter default dari template.)
7. Tantangan: bikin tangga dari 5 cube menuju "panggung".

## 5. Konsep: Level & World Settings

- 1 project bisa banyak level. Ganti default saat Play:
  `Edit → Project Settings → Maps & Modes → Editor Startup Map / Game Default Map`.
- **World Settings** (`Window → World Settings`): setting khusus level ini —
  nanti dipakai untuk GameMode (modul 11).

## ✅ CHECKPOINT

- [ ] Terbang di viewport tanpa mikir
- [ ] `W/E/R` + snap + `F` fokus lancar
- [ ] Arena mini jadi & bisa dimainkan

📖 Bergambar: [Viewport Controls (docs resmi)](https://dev.epicgames.com/documentation/en-us/unreal-engine/viewport-controls-in-unreal-engine)

➡️ [Modul 03 — Blueprint Dasar](03-blueprint-dasar.md)
