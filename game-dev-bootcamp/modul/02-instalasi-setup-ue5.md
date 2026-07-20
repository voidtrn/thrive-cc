# Modul 02 — Instalasi & Setup Unreal Engine 5.8

> **Target modul:** UE 5.8 terinstal, proyek pertama terbuka, version control jalan, dan editor tidak nge-lag.

## 2.1 Cek Hardware Dulu

| Komponen | Minimal | Rekomendasi |
|----------|---------|-------------|
| CPU | 4-core (Ryzen 5 / i5) | 8-core+ (Ryzen 7/9, i7/i9) |
| RAM | 16 GB | 32–64 GB |
| GPU | GTX 1660 / RX 5600 (SM5) | RTX 3070+ / RX 6800+ (SM6 untuk Nanite/Lumen penuh) |
| Storage | SSD SATA 150 GB kosong | NVMe 500 GB+ (WAJIB SSD — HDD menyiksa) |
| OS | Windows 10 64-bit | Windows 11 / macOS terbaru / Ubuntu 22.04+ |

⚠️ Editor UE (untuk *develop*) jauh lebih berat daripada game hasil *build*. Spek di atas untuk development, bukan untuk main.

## 2.2 Langkah Instalasi (Step by Step)

### Langkah 1 — Epic Games Launcher
1. Buka https://www.unrealengine.com/download
2. Unduh **Epic Games Launcher**, instal, login akun Epic (buatan Modul 00).

### Langkah 2 — Instal Engine
1. Di Launcher: tab **Unreal Engine** → **Library**.
2. Klik **+** di "ENGINE VERSIONS" → pilih **5.8.x** (angka terakhir = *hotfix*, ambil terbaru).
3. Klik **Options** sebelum instal — hemat puluhan GB:
   - ✅ **Starter Content** (aset latihan)
   - ✅ **Templates and Feature Packs**
   - ✅ **Engine Source** (nanti berguna saat C++ — boleh skip dulu jika disk sempit)
   - ❌ Target platform yang tidak dipakai (Android/iOS/Linux) — bisa ditambah nanti
4. Instal ke SSD. Tunggu (30–90 menit tergantung koneksi).

### Langkah 3 — Untuk Jalur C++ (Wajib Mulai Modul 05, boleh disiapkan sekarang)
- **Windows:** instal **Visual Studio 2022 Community** (gratis) dengan *workload* **"Game development with C++"** — centang komponen: MSVC, Windows SDK, .NET, **Unreal Engine installer integration**.
- **macOS:** Xcode terbaru dari App Store.
- 💡 Editor kode alternatif: **JetBrains Rider** (berbayar, terbaik untuk UE) atau VS Code.

### Langkah 4 — Buat Proyek Pertama
1. Launch engine → jendela **Project Browser** muncul.
2. Pilih kategori **Games** → template **Third Person**.
3. Setting:
   - **Blueprint** (bukan C++ — dulu)
   - **Target Platform:** Desktop
   - **Quality Preset:** Maximum
   - ✅ Starter Content
4. Nama proyek: `BootcampSandbox` (tanpa spasi!). Lokasi: SSD.
5. **Create** → tunggu *shader compiling* pertama (lama, sekali saja, sabar ☕).

### Langkah 5 — Verifikasi
- Tekan tombol **Play** (▶️) di toolbar. Karakter bisa jalan (WASD) dan lompat (Space)? **Instalasi sukses.** Esc untuk berhenti.

## 2.3 Setting Editor Penting (Lakukan Sekali, Nikmati Selamanya)

Buka **Edit → Editor Preferences**:

| Setting | Nilai | Alasan |
|---------|-------|--------|
| Loading & Saving → Auto Save | ✅, interval 10 menit | UE bisa crash. Serius. |
| Performance → Use Less CPU when in Background | ❌ jika sering alt-tab saat kompilasi shader | Biar kompilasi jalan terus |
| Source Code → Editor | Visual Studio 2022 / Rider | Untuk fase C++ |

**Edit → Project Settings**:

| Setting | Nilai |
|---------|-------|
| Description → Project Name/Company | Isi identitasmu |
| Maps & Modes → Default Maps | Pastikan map yang benar |

### Jika PC-mu Berat Menjalankan Editor
- **Settings (kanan atas viewport) → Engine Scalability Settings → Medium/Low.** Ini hanya kualitas tampilan editor, bukan kualitas game rilismu.
- Matikan *real-time viewport* saat tidak perlu: klik ikon ▼ di viewport → hilangkan centang **Realtime** (atau Ctrl+R).
- Console command `r.ScreenPercentage 70` menurunkan resolusi render internal.

## 2.4 Struktur Folder Proyek — Kenali Rumahmu

```
BootcampSandbox/
├── BootcampSandbox.uproject   ← file proyek, dobel-klik untuk buka
├── Content/                   ← SEMUA aset game (.uasset). Folder terpenting.
├── Config/                    ← file .ini pengaturan proyek
├── Saved/                     ← autosave, log, backup   → JANGAN commit ke git
├── Intermediate/              ← file hasil generate     → JANGAN commit
├── DerivedDataCache/          ← cache shader            → JANGAN commit
└── (Source/, Binaries/ muncul saat proyek C++)
```

⚠️ **Jangan pernah** memindah/rename file `Content/` lewat Windows Explorer — selalu lewat **Content Browser** di editor, karena aset saling mereferensi via path (*redirector*).

## 2.5 Version Control Sejak Hari Pertama

*Version control* = mesin waktu untuk proyekmu. Tanpa ini, satu crash/salah hapus bisa memusnahkan berminggu kerja.

**Pilihan:**
- **Git + Git LFS** — gratis, standar industri software. LFS wajib karena aset game = file biner besar.
- **Perforce** — standar studio AAA (server sendiri; gratis ≤5 user).
- **Diversion / Anchorpoint** — alternatif modern ramah artist.

**Setup Git cepat (Windows, dari folder proyek):**

```bash
git init
git lfs install
# Ambil .gitignore & .gitattributes khusus UE dari referensi modul ini
git add .
git commit -m "Initial commit: BootcampSandbox UE 5.8"
```

`.gitignore` minimal untuk UE:

```gitignore
Saved/
Intermediate/
DerivedDataCache/
Binaries/
Build/
.vs/
*.sln
```

`.gitattributes` minimal (LFS untuk aset biner):

```gitattributes
*.uasset filter=lfs diff=lfs merge=lfs -text
*.umap filter=lfs diff=lfs merge=lfs -text
*.fbx filter=lfs diff=lfs merge=lfs -text
*.png filter=lfs diff=lfs merge=lfs -text
*.wav filter=lfs diff=lfs merge=lfs -text
```

💡 Editor UE punya integrasi source control bawaan: **Revision Control** (ikon kanan bawah) → sambungkan ke Git/Perforce → kamu bisa lihat status file langsung di Content Browser.

## 2.6 Troubleshooting Instalasi Umum

| Gejala | Penyebab | Solusi |
|--------|----------|--------|
| "DX12 is not supported" | GPU/driver lama | Update driver; atau Project Settings → Platforms → Windows → Default RHI: DX11 (kehilangan Nanite/Lumen) |
| Shader compiling ribuan & lama | Normal di proyek baru | Tunggu sekali; berikutnya cepat (cache di DerivedDataCache) |
| Editor crash saat buka | Driver GPU / overclock | Update driver, matikan OC, hapus folder `Saved/` & `Intermediate/` lalu buka lagi |
| Launcher gagal unduh | Koneksi/proxy | Ganti DNS (1.1.1.1), matikan VPN, coba jam sepi |
| Fan laptop meraung | Editor memang berat | Scalability Low + Realtime off + ruangan ber-AC 😅 |

## Latihan Modul 02

1. Instal UE 5.8 + buat proyek `BootcampSandbox` dari template Third Person.
2. Play, jalan-jalankan karakter, ubah Scalability, rasakan bedanya.
3. Inisialisasi Git + LFS di folder proyek, commit pertama.
4. Buka `Saved/Logs/` — lihat file log. (Kebiasaan membaca log = superpower debugging.)

## Checklist Paham

- [ ] UE 5.8 terinstal dan proyek Third Person jalan.
- [ ] Aku tahu folder mana yang boleh/tidak boleh di-commit.
- [ ] Version control aktif dengan LFS.
- [ ] Aku tahu cara meringankan editor di PC kentang.

➡️ Lanjut: [Modul 03 — Mengenal Editor UE5](03-mengenal-editor-ue5.md)
