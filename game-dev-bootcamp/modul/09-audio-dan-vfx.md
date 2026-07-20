# Modul 09 — Audio (MetaSounds) & VFX (Niagara)

> **Target modul:** game-mu tidak lagi sunyi dan datar — suara reaktif dan efek visual yang menjual aksi.

## 9.1 Kenapa Audio & VFX = 50% Game Feel

Tes buta: matikan suara game favoritmu — rasanya mati separuh. Pukulan tanpa suara + partikel = menyentuh udara. Audio & VFX adalah **feedback**: memberi tahu pemain "aksimu berarti".

🔥 **Unpopular opinion:** pemula menghabiskan 90% waktu di grafis mesh/tekstur, 0% di audio. Padahal telinga lebih cepat menghakimi "murahan" daripada mata. Game dengan grafis sederhana + audio niat terasa premium (bukti: banyak indie hits).

## 9.2 Dasar Audio di UE 5.8

**Rantai aset:**
- **Sound Wave** — file audio mentah (.wav yang di-import).
- **MetaSound Source** — audio prosedural/logika (standar UE5, pengganti Sound Cue lama).
- **Sound Class** — kategori (SFX, Music, Voice) untuk pengaturan volume grup.
- **Sound Attenuation** — aturan 3D: makin jauh makin pelan, oklusi, spasialisasi.

**Memainkan suara:**
- `Play Sound 2D` — UI/musik (tanpa posisi).
- `Play Sound at Location` — sekali di titik dunia (ledakan).
- `Audio Component` di Actor — suara mengikuti objek, bisa start/stop (mesin mobil, jerbak api unggun).

**MetaSounds singkat:** node graph untuk audio — seperti Blueprint tapi untuk sinyal suara. Kasus wajib pemula: **variasi**. Suara langkah yang sama diulang = robotik. MetaSound: node **Random (Array Get)** memilih 1 dari 5 wav langkah + **Random pitch** ±5% → hidup. Template siap pakai ada saat klik kanan → MetaSound Source.

**Langkah kaki (praktik gabungan Modul 07):** Anim Notify di frame kaki menapak → event di karakter → Play Sound at Location (MetaSound langkah). 

**Mixing dasar:**
- Sound Class: `Master → {Music, SFX, UI, Ambience}` + **Sound Mix** untuk slider volume di settings.
- ⚠️ Loudness: -6 dB headroom; jangan semua suara keras — dinamika membuat momen besar terasa besar.
- **Ambience** murah tapi berdampak: 1 loop angin/kota + beberapa suara acak (burung, tetesan) = dunia hidup.

## 9.3 VFX dengan Niagara

*Niagara* = sistem partikel UE5. Partikel = banyak titik kecil bergerak sesuai aturan → api, asap, percikan, sihir, hujan, debu.

**Struktur:**
```
Niagara System (NS_)   ← yang kamu taruh di dunia
└── Emitter            ← satu "pemancar" (api punya emitter: lidah api + bara + asap)
    └── Module         ← aturan per-tahap: Spawn / Initialize / Update / Render
```

**Membuat efek pertama (hit spark):**
1. Klik kanan → Niagara System → **New system from template** → pilih **Fountain** → `NS_HitSpark`.
2. Buka. Panel kiri = stack module per emitter. Ubah:
   - **Spawn Burst Instantaneous** (ganti Spawn Rate): Count 30 → percikan sekali muncul.
   - **Initialize Particle:** Lifetime 0.3–0.6; Color oranye terang (nilai >1 untuk glow/bloom); Size kecil acak.
   - **Add Velocity in Cone** — arah percikan.
   - **Gravity Force** + **Drag** — jatuh alami.
3. Pakai: saat serangan kena (notify Modul 07) → **Spawn System at Location** `NS_HitSpark` di titik hit.

**Template bawaan** (Fountain, Ribbon, Mesh, GPU sprites) = titik mulai semua efek umum. Bedah, ubah, pelajari.

**Efek umum & resep singkat:**
| Efek | Kunci |
|------|-------|
| Api | 2–3 emitter: flame sprite (SubUV animasi) + glow + asap |
| Trail pedang | Ribbon renderer mengikuti socket senjata |
| Hujan | GPU particles + collision plane |
| Muzzle flash | Burst + light renderer (partikel memancarkan cahaya) |
| Portal sihir | Mesh renderer + material panner |

⚠️ **Performa:** partikel = pembunuh FPS diam-diam. Aturan: lifetime sependek mungkin, jumlah sekecil yang masih terlihat bagus, **GPU emitter** untuk jumlah besar, hindari banyak partikel transparan menumpuk memenuhi layar (*overdraw* — dibahas Modul 11).

## 9.4 Polish Stack: Juice!

Satu aksi (pukulan kena) versi "juicy" = kombinasi kecil-kecil:
1. Suara impact (variasi pitch) ✚
2. Partikel spark ✚
3. Hit stop 0,05 dtk ✚
4. Camera shake halus ✚
5. Flash material musuh ✚
6. Angka damage muncul (widget component)

Masing-masing 15 menit kerja. Bersama = game terasa 10× lebih mahal. Ini disebut *juice* — pelajari video "Juice it or lose it" (link di referensi).

## Latihan Modul 09 — Audio-Visual Pass Capstone

1. Ambil SFX gratis (freesound.org, Sonniss GDC bundle — link di referensi): langkah, serangan, kena pukul, koin, UI click, ambience, 1 musik.
2. MetaSound langkah kaki dengan random variation + notify.
3. Combat penuh juice: 6 langkah stack di atas untuk serangan kena.
4. `NS_HitSpark` + efek kematian musuh (dissolve/burst).
5. Ambience level + musik menu & gameplay (Sound Class + slider volume di pause menu).
6. Playtest A/B: rekam gameplay sebelum vs sesudah modul ini. Tunjukkan ke orang — dengarkan reaksinya.

## Checklist Paham

- [ ] Aku paham rantai SoundWave → MetaSound → Attenuation → Sound Class.
- [ ] Suara berulang di game-ku punya variasi random.
- [ ] Aku bisa membuat & memodifikasi Niagara system dari template.
- [ ] Aku tahu resep juice stack dan menerapkannya minimal di satu aksi.
- [ ] Aku sadar biaya performa partikel.

➡️ Lanjut: [Modul 10 — Multiplayer & Networking](10-multiplayer-networking.md)
