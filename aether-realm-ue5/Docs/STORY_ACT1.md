# Story Bible — Act 1: "Bara yang Tersisa"

Konten naratif region Starter. Dialogue data siap-import ada di
`Content/Data/DT_Dialogue_*.json` (engine dialogue Phase 6). Quest = Data
Asset di editor — spec lengkap per quest di bawah, tinggal copy field.

---

## Premise Dunia

**Aether Realm** — dunia yang ditopang "Aether", arus energi elemen yang
mengalir lewat ley line. Seratus tahun lalu, bencana **Malam Hampa**
(The Hollowing) memutus sebagian ley line: wilayah yang terputus jadi
**Hampa** — tanah abu-abu tanpa elemen, tempat monster "Kosong" lahir.

Region Starter, **Lembah Sidra**, adalah region perbatasan: separuh subur,
separuh mulai memucat. Penduduk menyembah **Statue of the Seven** yang
menjaga sisa arus Aether.

## Konflik Inti Act 1

Ley line Lembah Sidra melemah — bukan alami, ada yang MENYEDOTNYA.
Pelakunya: **Ordo Lubang Bayang** (The Hollow Order), kultus yang percaya
Malam Hampa adalah "pemurnian" dan ingin mengulangnya. Dalang lokal:
**Veyra**, mantan scholar — mentor Yukine dulu.

## Karakter

### Kagari — "Flamebound Wanderer" (protagonis, Pyro/Sword)
- Bangun tanpa ingatan di kaki Statue, tangan kanannya menyala api yang
  tak membakarnya. **Misteri gantung Act 1**: api Kagari = pecahan Aether
  murni — alasan Ordo memburunya.
- Arc Act 1: dari "siapa aku?" → "apa pun aku, orang-orang ini butuh bantuan."
- Suara: energik, blak-blakan, humor cepat. Sering bicara ke apinya sendiri.

### Yukine — "Frostveil Scholar" (Cryo/Catalyst, join Q3)
- Scholar perpustakaan Sidra, meneliti anomali ley line. Menolak percaya
  mentornya (Veyra) hilang begitu saja.
- Arc: dari buku → lapangan; dari pemuja mentor → menghadapi kenyataan
  mentornya jadi musuh.
- Suara: kalem, presisi, sarkasme halus. Panggil Kagari "spesimen".

### Shiden — "Stormchaser Vanguard" (Electro/Polearm, join Q5)
- Penjaga bayaran yang muncul "kebetulan" tiap Kagari dalam bahaya.
  **Twist Q5**: Shiden mata-mata Ordo — direkrut lewat janji menyembuhkan
  desanya yang di-Hampa-kan. Berbalik saat tahu Ordo yang MEMBUAT desanya
  begitu. Join party setelah pengakuan.
- Suara: irit kata, kering. Aksi > omongan.

### Veyra — antagonis Act 1
- Scholar terbaik generasinya; kehilangan keluarga saat Malam Hampa,
  berkesimpulan: dunia yang bisa dihampakan tidak pantas dipertahankan.
- BUKAN kartun jahat: tiap dialognya separuh benar. Boss fight Act 1
  finale (domain "Jantung Ley Line") — kabur setelah kalah, hook Act 2.

## Quest Chain Act 1 (Archon Quest)

Spec siap copy ke UQuestDataAsset (`Content/Data/Quests/`). Semua
`QuestType = ArchonQuest`. Reward AR EXP sengaja besar — chain ini yang
mendorong World Level.

| # | QuestID | Nama | Prereq | AR | Steps (ringkas) | Rewards |
|---|---|---|---|---|---|---|
| 1 | `Q_A1_Terbangun` | Terbangun di Abu | — (bAutoStart) | 1 | Dialogue opening (`DT_Dialogue_A1_Opening`) → GoToLocation desa → TalkToNPC `NPC_Elder` | 500 mora, 40 AR EXP |
| 2 | `Q_A1_ApiKecil` | Api Kecil | Q1 | 1 | KillEnemy `Slime_Pyro_T1` ×5 (tutorial combat) → InteractObject `Obj_LeyShrine_1` (shrine pucat pertama — foreshadow) | 800 mora, primogem 40, 60 AR EXP |
| 3 | `Q_A1_Scholar` | Scholar & Spesimen | Q2 | 2 | GoToLocation perpustakaan → dialogue rekrut Yukine (`DT_Dialogue_A1_Yukine`) → CollectItem `Mat_Flameherb` ×3 (sampel ley line) | Yukine join (BP grant), 60 AR EXP |
| 4 | `Q_A1_JejakHampa` | Jejak Hampa | Q3 | 3 | GoToLocation zona pucat → KillEnemy `Mitachurl_T2` ×1 (mini-boss "Kosong" pertama) → InteractObject `Obj_HollowSigil` | primogem 60, 100 AR EXP |
| 5 | `Q_A1_Pengkhianat` | Penjaga Bermuka Dua | Q4 | 4 | Wait 5s (ambush scripted — Director spawn) → dialogue pengakuan Shiden (`DT_Dialogue_A1_Shiden`) → pilihan: maafkan/tolak (dua-duanya join, beda flavor) | Shiden join, 100 AR EXP |
| 6 | `Q_A1_JantungLey` | Jantung Ley Line | Q5 | 5 | CompleteDomain `Domain_LeyHeart` (boss Veyra) → dialogue penutup | primogem 300, Item_HeroWit ×5, 200 AR EXP |

**Catatan wiring**: `PreStepDialogueNode`/`PostStepDialogueNode` isi row
pertama tiap tabel dialog (selalu `Start`). Party join via BP di
post-quest event (PartyManagerComponent).

## Side Quest (WorldQuest, 3 buah — worldbuilding)

| QuestID | Nama | Hook |
|---|---|---|
| `Q_W1_SuratTerakhir` | Surat yang Tak Terkirim | Hantu(?) minta antar surat ke makam — perkenalkan lore Malam Hampa dari sisi rakyat kecil |
| `Q_W2_KokiGila` | Resep Legendaris | Koki NPC minta 3 bahan → unlock resep `Food_CritBerryTart` (wiring: reward item) |
| `Q_W3_PemburuBadai` | Yang Mengejar Petir | Bocah fan Shiden minta bukti "Stormchaser" nyata — komedi, humanisasi Shiden |

## Lore Collectible

10 **"Serpihan Jurnal Veyra"** tersebar (chest tersembunyi + puncak sulit).
Tiap serpihan = FItemDefRow `Lore_Journal_1..10` + text. Baca berurutan =
kisah Veyra dari scholar idealis → kultis. Kumpul 10 → achievement rahasia
(`Ach_Secret_Journal`) + dialog ekstra saat boss fight (Veyra ragu sesaat —
setup redemption Act 3).

## Prinsip Penulisan

1. **Cerita utama pendek, dunia yang bercerita.** 6 quest utama saja;
   sisanya environmental storytelling (zona pucat makin dekat desa tiap act).
2. **Villain separuh benar.** Pemain harus sesekali setuju dengan Veyra.
3. **Party = konflik internal**, bukan cheerleader: Yukine vs Shiden dingin
   sampai Act 2 (Shiden pernah bohongi mentornya... dan dia).
4. **Dialog pendek.** Max 3 kalimat per node. Ini game action, bukan VN.
5. **Pilihan = flavor + memory kecil** (disimpan `LifetimeStats` key
   `Choice_*`), bukan branching mahal — tapi PANGGIL BALIK di Act 2
   (NPC ingat) = ilusi konsekuensi yang murah dan efektif.
