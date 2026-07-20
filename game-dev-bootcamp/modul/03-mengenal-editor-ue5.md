# Modul 03 — Mengenal Editor UE5: Rumah Barumu

> **Target modul:** hafal anatomi editor, lancar navigasi viewport, paham Actor & Component, dan bisa menyusun scene sederhana.

## 3.1 Anatomi Editor (Level Editor)

Saat proyek terbuka, kamu melihat 5 area utama:

```
┌────────────────────────────────────────────────────────────┐
│  Menu Bar + Toolbar (Save, Play ▶, Platforms, Settings)    │
├──────────┬──────────────────────────────┬──────────────────┤
│          │                              │  OUTLINER        │
│ (Place   │        VIEWPORT              │  (daftar semua   │
│  Actors  │   (jendela ke dunia 3D)      │   Actor di level)│
│  panel)  │                              ├──────────────────┤
│          │                              │  DETAILS         │
│          │                              │  (properti Actor │
│          │                              │   terpilih)      │
├──────────┴──────────────────────────────┴──────────────────┤
│  CONTENT DRAWER (Ctrl+Space) — semua aset proyek           │
└────────────────────────────────────────────────────────────┘
```

| Panel | Fungsi | Analogi |
|-------|--------|---------|
| **Viewport** | Melihat & mengedit dunia 3D | Jendela + tangan |
| **Outliner** | Daftar hierarki semua *Actor* di level | Daftar isi |
| **Details** | Properti objek terpilih | Panel setelan |
| **Content Browser/Drawer** | Semua *asset* proyek | File explorer khusus |
| **Place Actors** | Objek siap taruh (lampu, bentuk, volume) | Kotak mainan |

💡 Panel bisa di-drag, dilepas, disusun ulang. Rusak layout? **Window → Load Layout → Default Editor Layout**.

## 3.2 Navigasi Viewport (WAJIB SAMPAI REFLEK)

| Aksi | Cara |
|------|------|
| Lihat sekeliling | Klik-kanan tahan + gerak mouse |
| Terbang (mode FPS) | Klik-kanan tahan + WASD (E naik, Q turun) |
| Kecepatan terbang | Klik-kanan tahan + scroll |
| Orbit objek | F (fokus) lalu Alt + klik-kiri drag |
| Zoom | Scroll |
| Fokus ke objek terpilih | **F** ← shortcut paling berguna di seluruh UE |

**Manipulasi objek — hafalkan W/E/R:**

| Tombol | Mode | Fungsi |
|--------|------|--------|
| **W** | Translate | Geser posisi |
| **E** | Rotate | Putar |
| **R** | Scale | Ubah ukuran |
| **End** | Snap ke lantai | Jatuhkan objek ke permukaan |
| **Ctrl+D** | Duplicate | Gandakan (atau Alt+drag gizmo) |
| **Del** | Hapus | |

💡 *Snapping* (magnet grid) di kanan atas viewport: aktifkan untuk penempatan rapi — level design profesional hampir selalu pakai grid snap.

## 3.3 Konsep Fundamental: Level, Actor, Component

**Hierarki dunia UE:**

```
World (dunia game)
└── Level / Map (.umap)          ← satu "panggung"
    └── Actor                    ← SEGALA benda yang ada di level
        └── Component            ← kepingan kemampuan dalam Actor
```

- ***Actor*** = benda apa pun yang bisa ditaruh di level: kursi, lampu, kamera, karakter, bahkan yang tak terlihat (trigger zone, spawn point).
- ***Component*** = bagian penyusun Actor. Contoh Actor "Mobil": `StaticMeshComponent` (bodi), `AudioComponent` (mesin), `CameraComponent`, `BoxComponent` (deteksi tabrakan).
- Pola pikirnya **komposisi**: Actor = wadah, kemampuan = ditambah via component. Ini konsep desain paling penting di UE.

**Coba sekarang:**
1. Dari Place Actors, drag **Cube** ke viewport.
2. Lihat Outliner → cube muncul. Lihat Details → ada **Transform** (Location, Rotation, Scale) dan **Static Mesh Component**.
3. Ubah **Location Z** = 500, tekan Play → kubus melayang. Centang **Physics → Simulate Physics** di Details, Play lagi → kubus jatuh. Selamat, kamu baru memakai *physics engine*.

## 3.4 Content Browser & Tipe Asset

Tekan **Ctrl+Space**. Tipe aset yang akan sering kamu temui:

| Ikon/Tipe | Isi |
|-----------|-----|
| **Level/Map** (.umap) | Panggung/dunia |
| **Static Mesh** | Model 3D diam (batu, gedung) |
| **Skeletal Mesh** | Model 3D bertulang (karakter) — bisa dianimasikan |
| **Material** | "Cat" permukaan: warna, kilap, tekstur |
| **Texture** | Gambar 2D bahan material |
| **Blueprint Class** | Logika + objek (Modul 04) |
| **Sound Wave / MetaSound** | Audio |
| **Niagara System** | Efek partikel (api, asap) |

**Kebiasaan profesional sejak sekarang:**
- Struktur folder per fitur/tipe: `Content/Bootcamp/{Maps, Blueprints, Materials, Meshes, Audio}`.
- *Naming convention* standar industri: prefix per tipe — `SM_Batu` (Static Mesh), `M_Kayu` (Material), `MI_KayuTua` (Material Instance), `BP_Pintu` (Blueprint), `T_Batu_D` (Texture Diffuse), `SK_Hero` (Skeletal Mesh), `WBP_MainMenu` (Widget).
- ⚠️ Rename/pindah aset HANYA dari Content Browser (ingat Modul 02: *redirector*). Setelah banyak memindah, klik kanan folder → **Fix Up Redirectors**.

## 3.5 Material 101 (Rasa Pertama)

1. Content Browser → klik kanan → **Material** → nama `M_Merah`.
2. Dobel-klik → terbuka **Material Editor** (node graph pertamamu!).
3. Tahan **3** + klik di graph → node warna (Constant3Vector). Set merah.
4. Sambungkan ke pin **Base Color**. Tahan **1** + klik → constant, nilai 0.2 → sambung ke **Roughness** (makin kecil makin kilap).
5. **Save** → drag `M_Merah` dari Content Browser ke kubus di viewport.

Kubus merah mengkilap. Kamu baru menulis *shader* tanpa satu baris kode. 🎉

💡 Nanti kamu akan pakai **Material Instance** — variasi murah dari satu material induk — untuk workflow yang benar (dibahas Modul 06).

## 3.6 Play Mode: PIE vs Simulate

- **Play (Alt+P / PIE — Play In Editor):** kamu jadi pemain.
- **Simulate (Alt+S):** dunia berjalan, kamu kamera bebas — sempurna untuk mengamati AI/fisika.
- Saat Play, **F8** = *eject* (lepas dari karakter, jadi kamera bebas, bisa pilih & edit Actor live).
- ⚠️ Perubahan yang dibuat SAAT Play hilang ketika berhenti (kecuali pakai "Keep Simulation Changes" — klik kanan Actor). Jebakan klasik pemula: mengedit 15 menit dalam Play mode, semua lenyap.

## 3.7 Sepuluh Shortcut Emas

`F` fokus • `Ctrl+Space` content drawer • `W/E/R` gizmo • `End` snap lantai • `Ctrl+D` duplikat • `Alt+P` play • `F8` eject • `Ctrl+S` save (SERING!) • `Ctrl+Z` undo • `G` game view (sembunyikan ikon editor)

## Latihan Modul 03 — "Ruang Pertamamu"

Bangun diorama kecil dari Starter Content + basic shapes:
1. Buat level baru (**File → New Level → Basic**), simpan sebagai `Map_Latihan03`.
2. Bangun ruangan: lantai + 4 dinding (kubus di-scale, pakai grid snap).
3. Isi 5+ objek dari Starter Content (`Content/StarterContent/Props`), beri material berbeda.
4. Tambah lampu **Point Light**, atur warna & intensitas di Details.
5. Buat 1 material sendiri, terapkan.
6. Satu objek dengan Simulate Physics → Play → tabrak dengan karakter.
7. Commit ke git: `rtk git add . && rtk git commit -m "Latihan modul 03"`.

## Checklist Paham

- [ ] Navigasi viewport tanpa mikir (klik kanan + WASD, F, W/E/R).
- [ ] Aku bisa menjelaskan Level → Actor → Component.
- [ ] Aku paham tipe-tipe aset utama dan naming convention.
- [ ] Aku bisa membuat material sederhana dan menerapkannya.
- [ ] Aku tahu beda Play vs Simulate dan jebakan edit-saat-play.

➡️ Lanjut: [Modul 04 — Blueprint Visual Scripting](04-blueprint-visual-scripting.md)
