# Modul 01 — Instalasi & Tur Editor

**Target:** UE 5.4 terpasang, project pertama kebuka, hafal nama & fungsi semua panel.

## 1. Instalasi

1. Download **Epic Games Launcher**: https://store.epicgames.com/download
2. Install → login/buat akun Epic.
3. Di launcher: tab **Unreal Engine** (sidebar kiri) → **Library** →
   klik `+` di "ENGINE VERSIONS" → pilih **5.4.x** → Install.
   - Klik **Options** sebelum install: centang *Starter Content*,
     *Templates and Feature Packs*. Target Platform lain boleh dihapus (hemat 30GB).
4. Tunggu (±40-90 menit tergantung internet). Sambil nunggu, baca sisa modul ini.

## 2. Bikin Project Pertama

1. Library → klik **Launch** pada 5.4.
2. Jendela **Unreal Project Browser** muncul:
   - Kategori kiri: pilih **Games**
   - Template: pilih **Third Person**
   - Kanan bawah: `Blueprint` (bukan C++ dulu), Target Platform `Desktop`,
     Quality `Maximum`, Starter Content ✓
   - Project Name: `Belajar01`, lokasi bebas (SSD!)
3. Klik **Create** → tunggu shader compile (pertama kali lama, wajar —
   "Compiling Shaders (2000+)" di kanan bawah).

## 3. Tur Editor — hafalkan peta ini

```
┌────────────────────────────────────────────────────────────────┐
│ ☰ Menu Bar   File Edit Window Tools Build Select Actor Help    │
├────────────────────────────────────────────────────────────────┤
│ 🔧 Toolbar   [Save] [Modes▾] [+Add] [Blueprints▾] [▶ Play]     │
├──────────┬─────────────────────────────────────┬───────────────┤
│          │                                     │               │
│ Place    │                                     │  OUTLINER     │
│ Actors*  │           VIEWPORT                  │  (daftar semua│
│          │      (dunia game 3D kamu)           │   objek level)│
│          │                                     ├───────────────┤
│          │                                     │  DETAILS      │
│          │                                     │  (properti    │
│          │                                     │   objek yang  │
│          │                                     │   dipilih)    │
├──────────┴─────────────────────────────────────┴───────────────┤
│ CONTENT DRAWER (Ctrl+Space) — semua file/asset project kamu    │
│ 📁 Content/ → folder berisi mesh, material, blueprint, dll     │
└────────────────────────────────────────────────────────────────┘
* Place Actors kadang tersembunyi: Window → Place Actors
```

**Fungsi tiap panel (hafalkan):**

| Panel | Fungsi | Analogi |
|---|---|---|
| **Viewport** | Melihat & mengedit dunia 3D | Kanvas |
| **Outliner** (kanan atas) | Daftar semua objek di level | Daftar isi |
| **Details** (kanan bawah) | Properti objek terpilih (posisi, material, dll) | Panel properti |
| **Content Drawer** (bawah, `Ctrl+Space`) | Semua asset project | File explorer |
| **Toolbar → Play (▶)** | Main game langsung di editor | Tombol test |

## 4. 🔨 PRAKTIK

1. Tekan `Ctrl+Space` → Content Drawer kebuka. Jelajahi folder
   `Content/ThirdPerson/` — lihat isinya (Blueprints, Maps).
2. Klik tombol **▶ Play** di toolbar (atau `Alt+P`). Kamu main sebagai
   karakter third person: `WASD` gerak, `Space` lompat, mouse kamera.
3. Tekan `Esc` untuk berhenti.
4. Di **Outliner**, klik objek `Floor` → lihat panel **Details** berubah
   menampilkan propertinya. Coba klik objek lain.
5. **Save**: `Ctrl+S` (biasakan sesering mungkin — UE bisa crash).

## 5. Istilah wajib (kartu hafalan)

| Istilah | Arti |
|---|---|
| **Level / Map** | Satu "dunia"/arena (file `.umap`) |
| **Actor** | SEMUA objek yang bisa ditaruh di level (lampu, kotak, karakter) |
| **Asset** | File di Content Drawer (mesh, texture, blueprint...) |
| **Blueprint (BP)** | Sistem coding visual — node disambung kabel |
| **PIE** | Play In Editor — tombol ▶ |

## ✅ CHECKPOINT

- [ ] Bisa buka Content Drawer, Outliner, Details tanpa mencari-cari
- [ ] Bisa Play dan Stop
- [ ] Paham beda Level, Actor, Asset

📖 Bergambar: [Unreal Editor Interface (docs resmi)](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-editor-interface)

➡️ Lanjut: [Modul 02 — Navigasi, Level, Actor](02-navigasi-level-actor.md)
