# Fondasi Lintas Ilmu untuk Game yang Melekat — Teori → Kode

Lanjutan `GAME_LONGEVITY_PATTERNS.md` (pola industri). Dokumen ini turun satu
lapis: **teori dari berbagai bidang ilmu** tentang kenapa manusia ketagihan,
mengingat, dan kembali — dan bagaimana tiap teori diterjemahkan jadi sistem
di codebase ini.

**Catatan jujur dulu:** tidak ada formula "game of the century". Game
sekelas itu = prinsip benar × eksekusi konten bertahun-tahun × timing/luck.
Yang BISA dikontrol dari kode: menumpuk prinsip yang terbukti secara
empiris, lalu mengeksekusinya lebih konsisten dari kompetitor. Itu yang
dikerjakan di sini. Satu catatan etika juga: banyak teori di bawah dipakai
industri buat manipulasi (dark pattern). Posisi project ini: pakai untuk
*memperdalam pengalaman*, bukan memeras dompet/waktu — game premium Steam,
bukan F2P predatory.

---

## 1. Psikologi Kognitif

### 1a. Flow (Csikszentmihalyi) — keseimbangan tantangan × skill

Flow = keadaan fokus total saat kesulitan ≈ kemampuan. Terlalu mudah = bosan,
terlalu sulit = cemas. Karakteristik: goal jelas, feedback instan, waktu
terasa hilang. Game yang menjaga pemain di "flow channel" = pemain lupa jam.

**→ Kode: ✅ `UPacingDirectorSubsystem`** (pass sebelumnya) — stress score +
state machine BuildUp/Peak/Relax = flow channel yang menyesuaikan diri:
pemain kewalahan dapat napas (Relax, mercy loot), pemain dominan dapat
tekanan (Peak). Ini implementasi flow paling literal yang bisa dilakukan
sistem spawn/pacing.

### 1b. Zeigarnik Effect — open loop menempel di kepala

Bluma Zeigarnik (1927): tugas yang BELUM selesai diingat jauh lebih kuat
daripada yang selesai. Otak menahan "tension" untuk loop terbuka — alasan
cliffhanger serial TV bekerja, dan alasan quest log yang menggantung bikin
pemain balik besok.

**→ Kode: ✅ BARU pass ini — "unresolved threads" di
`USessionChronicleSubsystem`.** Boss yang sempat dilawan tapi kabur/belum
tumbang, domain yang dimasuki tapi belum clear → tercatat sebagai *thread
terbuka*. Epilog sesi (lihat 1c) menutup dengan cliffhanger dari thread
terbuka terbaru: "Raja Badai masih menunggumu di puncak." Loop sengaja
dibiarkan menganga — otak pemain yang menagih sisanya.

### 1c. Peak-End Rule (Kahneman & Fredrickson) — ingatan ≠ pengalaman

Nobel laureate Daniel Kahneman: manusia menilai pengalaman BUKAN dari
rata-rata keseluruhan, tapi dari **momen paling intens (peak)** dan
**bagaimana ia berakhir (end)**. Durasi hampir diabaikan ("duration
neglect"). Sesi 3 jam yang datar kalah memorable dari sesi 40 menit dengan
satu clutch epik yang ditutup manis.

**→ Kode: ✅ BARU pass ini — epilog sesi di `USessionChronicleSubsystem`.**
Sistem merekam momen intens sepanjang sesi (dari `OnHighlightMoment`
pacing director + boss slain + player fallen), lalu `BuildSessionEpilogue()`
menyusun: top-3 peak + momen terakhir + cliffhanger. UI tinggal render saat
pemain save/quit — **sesi selalu ditutup dengan mengenang puncaknya**,
bukan dengan menu mati. Ingatan yang dibawa pulang pemain = versi terbaik
sesinya.

## 2. Neurosains

### 2a. Reward Prediction Error (Schultz) — dopamin = kejutan, bukan hadiah

Neuron dopamin menembak bukan saat menerima reward, tapi saat reward
MELEBIHI prediksi (positive prediction error). Reward yang bisa diprediksi
100% = respons dopamin nol. Ini dasar variable-ratio reinforcement — dan
dasar kenapa gacha/loot acak bekerja.

**→ Kode: ✅ sudah ada** — wish system (pity + 50/50), artifact substat
acak, drop chance. **Ditambah pass ini:** momen chronicle sendiri bersifat
variable — pemain tak tahu kapan aksi mereka "layak dicatat sejarah", jadi
notifikasi "momen terekam" adalah micro-reward tak terduga.

### 2b. Reward-modulated memory encoding — momen ber-reward dienkode lebih kuat

Riset memory: kejadian yang berdekatan dengan reward/dopamin dienkode
hipokampus lebih kuat (reward-modulated plasticity). Konsekuensi desain:
kalau mau pemain MENGINGAT game lu, pastikan puncak emosional diberi
penanda yang jelas — perayaan, slow-mo, sting musik — tepat di momennya.

**→ Kode: ✅ `OnHighlightMoment`** (pacing pass) sekarang punya konsumen
nyata: selain BP slow-mo/sting, momen di-persist ke chronicle. Penanda +
penyimpanan = dua lapis konsolidasi memori.

### 2c. Self-Reference Effect — informasi tentang DIRI diingat paling kuat

Efek memori paling robust di literatur: materi yang dikaitkan ke diri
sendiri diingat jauh lebih baik daripada materi netral. Cerita TENTANG
pemain > cerita yang ditonton pemain.

**→ Kode: ✅ BARU — inti `USessionChronicleSubsystem`:** game menulis
memoar pemain, bukan lore NPC. "Hari ke-12: kau menumbangkan Raja Badai
saat HP tinggal 8%." Chronicle lifetime (persist di save) = autobiografi
yang tumbuh — tiap entri adalah cerita-tentang-diri yang menempel di
memori jauh lebih kuat dari cutscene mana pun.

## 3. Ekonomi Perilaku

### 3a. Loss aversion (Kahneman & Tversky) — kehilangan 2× lebih sakit

Prospect theory: rugi terasa ±2× lebih kuat dari untung setara. Industri
memakainya buat daily streak yang menghukum absen. **Posisi kami: dipakai
TERBATAS** — daily commission memberi bonus, tak pernah mencabut progres.
Chronicle tak pernah "hangus". (Belgia/Belanda sudah membatasi mekanik
gacha — jaga sisi legal-etis, lihat GAME_LONGEVITY_PATTERNS.)

### 3b. Endowment & IKEA effect — milik sendiri bernilai lebih

Barang terasa lebih berharga karena MILIKKU / karena AKU yang membuatnya.
**→ Chronicle = endowment murni:** memoar itu unik per pemain, tak bisa
di-generate ulang, tumbuh dari keputusan mereka sendiri. (Masa depan:
biarkan pemain menamai build/senjata — IKEA effect murah.)

## 4. Narratologi

"Story of play" > "story in game" (emergent narrative — alasan orang cerita
soal run Rimworld/Dwarf Fortress mereka). Struktur epilog sesi mengikuti
kishōtenketsu mini: momen-momen (ki-shō) → puncak (ten) → penutup +
gantungan (ketsu). Chronicle mengubah gameplay emergent jadi NARASI yang
bisa diceritakan ulang — bahan cerita ke teman = viral loop organik
(nyambung ke pola clip-worthy di GAME_LONGEVITY_PATTERNS §2c).

## 5. Sosiologi (arah berikutnya, belum kode)

Social proof & shared identity: memoar yang bisa di-share (export image
"kartu kenangan sesi") = konten sosial buatan game sendiri. Butuh UI/render
pipeline — catat sebagai kandidat pass berikutnya, bukan pass ini.

---

## 6. Yang diimplementasi pass ini: `USessionChronicleSubsystem`

**Satu kalimat:** *game yang menulis memoar perjalananmu dan menutup tiap
sesi di puncaknya.*

`UGameInstanceSubsystem` (hidup lintas level, ikut save):

| Fitur | Teori | API |
|---|---|---|
| Rekam momen intens (clutch, chain, boss phase/slain, fallen) | 2b, 2c | `RecordMoment(Type, ContextId, Location, Intensity)` |
| Thread terbuka (boss belum tumbang dst) | 1b Zeigarnik | `OpenThread` / `ResolveThread` |
| Epilog sesi: top-3 peak + momen akhir + cliffhanger | 1c Peak-End | `BuildSessionEpilogue()` |
| Memoar lifetime, persist di save, di-cap & di-prune | 2c, 3b | `GetLifetimeChronicle()`, export/import di `OpenWorldSaveGame` |
| Notifikasi "momen terekam" (micro-reward variable) | 2a | `OnMomentRecorded` delegate |

Sumber input otomatis (tanpa BP wiring): `UPacingDirectorSubsystem`
meneruskan highlight-nya, `AEnemyBoss` buka thread saat phase pertama &
resolve saat tumbang, `ACharacterBase` catat kematian pemain. Pemilihan
top-moment = fungsi statik murni (`SelectTopMoments`) + automation test —
pola sama `ComputeStress`/`ComputePhaseIndex`.

UI yang perlu dibuat di editor nanti: layar epilog saat save/quit, halaman
"Memoar" di menu (baca `GetLifetimeChronicle()`), toast momen terekam.
Semua data-only dari C++ (FName type + context), teks dilokalisasi di
UI — disiplin ANTISIPASI #8.

---

## Sumber

- [Gamedeveloper — Cognitive Flow: The Psychology of Great Game Design](https://www.gamedeveloper.com/design/cognitive-flow-the-psychology-of-great-game-design)
- [GameDesignSkills — Designing a Game's Flow](https://gamedesignskills.com/game-design/game-flow/)
- [Wikipedia — Peak–end rule](https://en.wikipedia.org/wiki/Peak%E2%80%93end_rule)
- [NN/g — The Peak–End Rule: How Impressions Become Memories](https://www.nngroup.com/articles/peak-end-rule/)
- [Yu-kai Chou — Peak-End Rule: Kahneman's Memory Heuristic](https://yukaichou.com/behavioral-analysis/peak-end-rule-kahneman-experience-design/)
- [Psychology of Games — Zeigarnik Effect and Quest Logs](https://www.psychologyofgames.com/2013/03/the-zeigarnik-effect-and-quest-logs/)
- [Medium — The Zeigarnik Effect in Video Game Design](https://medium.com/@milijanakomad/product-design-and-psychology-the-zeigarnik-effect-in-video-game-design-81cb97133af7)
- [Neurosity — Reward Prediction Error: The Dopamine Surprise Signal](https://neurosity.co/guides/reward-prediction-error-dopamine)
- [PMC — Trial-by-Trial Modulation of Associative Memory Formation by Reward Prediction Error](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5309218/)
- [bioRxiv — Positive reward prediction errors strengthen incidental memory encoding](https://www.biorxiv.org/content/10.1101/327445.full.pdf)
