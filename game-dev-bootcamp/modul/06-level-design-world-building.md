# Modul 06 — Level Design & World Building (Nanite, Lumen, Landscape)

> **Target modul:** bisa merancang level yang enak dimainkan (desain) DAN membangunnya dengan tools UE5 modern (teknis).

## 6.1 Level Design ≠ Menaruh Objek Bagus

Level design = **merancang pengalaman pemain melalui ruang**. Pertanyaannya bukan "apa yang terlihat keren" tapi "apa yang pemain rasakan/lakukan di sini".

**Prinsip inti:**

| Prinsip | Artinya | Contoh |
|---------|---------|--------|
| **Guidance (bimbingan)** | Arahkan pemain tanpa panah GPS | Cahaya, warna kontras, landmark ("menara di kejauhan"), komposisi — *weenie* ala Disney |
| **Pacing (ritme)** | Selang-seling tegang & lega | Combat → koridor tenang → vista indah → combat |
| **Affordance** | Bentuk mengomunikasikan fungsi | Tepian kuning = bisa dipanjat (ledge marking) |
| **Risk vs reward** | Jalur berbahaya = hadiah lebih | Loot di sarang musuh opsional |
| **Landmark & orientasi** | Pemain selalu tahu "aku di mana" | Gunung/menara terlihat dari mana pun |

**Workflow profesional: BLOCKOUT DULU.**
1. *Blockout/greybox* — bangun level dari kubus abu-abu polos. Uji: seru? pacing enak? navigasi jelas?
2. Playtest & iterasi blockout (murah diubah!).
3. Baru *art pass* — ganti kubus dengan aset indah.

⚠️ Jebakan terbesar pemula: mempercantik dulu. Level indah yang membosankan = gagal. Level abu-abu yang seru = tinggal didandani.

## 6.2 Nanite — Geometri Tanpa Batas

*Nanite* = sistem geometri virtual UE5: engine otomatis menampilkan detail sesuai kebutuhan layar. Praktisnya: **kamu bisa memakai model jutaan poligon (fotogrametri/megascan) tanpa memikirkan *polycount* dan *LOD* manual.**

- Aktifkan: saat import mesh centang **Build Nanite**, atau klik kanan aset → Nanite → Enable.
- Cek visual: viewport → **View Mode → Nanite Visualization**.
- Batas Nanite (5.8): materi *masked/translucent* dan objek berdeformasi punya dukungan terbatas — cek dokumen resmi saat menemui edge case.
- 💡 **Quixel Megascans** (ribuan aset scan dunia nyata) tersedia via panel **Fab** — sumber aset berkualitas untuk latihan.

## 6.3 Lumen — Cahaya Global Real-Time

*Lumen* = *global illumination* dinamis: cahaya memantul realistis dan berubah real-time — tanpa *baking* (proses pra-hitung cahaya berjam-jam di era sebelumnya).

**Dasar lighting yang harus kamu kenal:**

| Jenis Lampu | Fungsi |
|-------------|--------|
| **Directional Light** | Matahari/bulan (arah, bukan posisi) |
| **Sky Light** | Cahaya ambient dari langit |
| **Point Light** | Bola cahaya (bohlam, obor) |
| **Spot Light** | Kerucut (senter, lampu panggung) |
| **Rect Light** | Panel (jendela, layar TV) |

- Mulailah dari **Env. Light Mixer** (Window → Env. Light Mixer): satu klik menambah matahari + langit + kabut atmosfer + awan.
- Mood cepat: ubah sudut Directional Light (golden hour = rendah + oranye), intensitas SkyLight, **Exponential Height Fog** untuk kedalaman.
- **Post Process Volume** (centang *Infinite Extent*): exposure, bloom, color grading, vignette — "filter Instagram" level-mu.
- ⚠️ Lumen butuh GPU SM6. Fallback di mesin lemah: Project Settings → Global Illumination → Screen Space (kualitas turun).

## 6.4 Landscape — Dunia Terbuka

Mode **Landscape** (toolbar Select Mode → Landscape):
1. **Manage → Create** — buat terrain (mulai 505×505; jangan serakah).
2. **Sculpt** — pahat: Sculpt (angkat/turunkan, tahan Shift untuk turun), Smooth (haluskan), Flatten (ratakan), Erosion (alami).
3. **Paint** — lukis material berlapis (rumput/tanah/batu) — butuh material landscape dengan *Layer Blend* (tutorial di referensi).
- **Foliage Mode:** semprot rumput/pohon ribuan instance dengan performa baik (*instancing*).
- **Water plugin** bawaan: sungai/danau/laut.

💡 Dunia besar? UE5 punya **World Partition** — level otomatis dipecah grid dan di-*stream* (dimuat saat pemain dekat). Aktif default di template Open World. Untuk capstone: TIDAK perlu — satu level biasa cukup.

## 6.5 Modeling & Aset: Dari Mana Datangnya Mesh?

- **Modeling Mode** bawaan UE5.8 — blockout, boolean, edit mesh ringan tanpa keluar editor.
- **Blender** (gratis) — standar de-facto indie untuk modeling serius. Export FBX/glTF → import UE.
- **Fab / Marketplace** — beli/ambil gratis. 🔥 *Memakai aset beli itu BUKAN curang* — studio pro melakukannya. Yang membedakan game-mu adalah desain & konsistensi art direction, bukan siapa yang membuat mesh batu.
- **Skala penting:** 1 Unreal Unit = 1 cm. Karakter manusia ± 180 uu. Pintu ± 210×90 uu. Selalu uji ruangmu dengan karakter — *metrics* yang salah terasa "aneh" walau tak terlihat salah.

## 6.6 Material Lanjutan: Master + Instance

Workflow benar (bukan 100 material terpisah):
1. Buat **Master Material** `M_Master_Env` dengan parameter: `BaseColorTex (Texture Param)`, `Tint (Vector Param)`, `RoughnessScale (Scalar Param)`.
2. Klik kanan → **Create Material Instance** → `MI_Batu`, `MI_Kayu`, dst.
3. Di instance, centang parameter → ubah nilai — **tanpa kompilasi shader ulang**, real-time.

Manfaat: konsistensi visual, iterasi kilat, performa shader terkendali.

## 6.7 Komposisi Visual Singkat

- **Rule of thirds** — objek penting di ⅓ layar.
- **Leading lines** — jalan/pagar/kabel mengarah ke tujuan.
- **Kontras nilai** — area penting lebih terang/gelap dari sekitar.
- **Siluet** — landmark harus terbaca bentuknya dari jauh.
- Referensi! Kumpulkan screenshot game/foto (PureRef gratis untuk moodboard).

## Latihan Modul 06 — Level Capstone v1

1. Rancang di kertas: denah level capstone — start, goal, 2 area combat, 1 secret, 1 landmark.
2. Blockout penuh dengan basic shapes + Modeling Mode. Grid snap!
3. Playtest blockout: minta 1 orang lain memainkan TANPA kamu memberi tahu arah. Dia tersesat? Perbaiki guidance (bukan pemainnya yang salah).
4. Lighting pass: Env Light Mixer + 3 lampu aksen + Post Process Volume.
5. Art pass area start saja (Megascans/Starter Content) — sisanya tetap blockout (sesuai jadwal produksi nyata!).
6. Buat 1 master material + 3 instance.

## Checklist Paham

- [ ] Aku bisa menjelaskan guidance, pacing, affordance dengan contoh.
- [ ] Aku blockout dulu, mempercantik belakangan.
- [ ] Aku paham apa yang Nanite & Lumen lakukan dan batasnya.
- [ ] Aku bisa setup lighting dasar + post process.
- [ ] Aku pakai master material + instance, dan skala 1uu = 1cm.

➡️ Lanjut: [Modul 07 — Karakter & Animasi](07-karakter-dan-animasi.md)
