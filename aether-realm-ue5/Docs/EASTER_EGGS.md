# Easter Eggs & Rahasia — Desain + Wiring

7 rahasia dunia + 1 meta-collectible. Semua pakai infrastruktur yang SUDAH
ada: BP panggil `UAchievementSubsystem::Report(this, "Stat_SecretsFound")`
saat ditemukan (achievement `Ach_Secret_*` unlock otomatis), simpan flag di
`GI->CollectedItemIds` supaya tidak double-count. UI achievement: tampilkan
"???" untuk baris secret sampai unlocked.

Prinsip: rahasia terbaik = **terlihat sebelum ditemukan** (pemain lewat 10×,
sadar di ke-11) dan **cerita, bukan cuma loot**.

| # | Nama | Desain | Wiring |
|---|---|---|---|
| 1 | **Kamar Developer** | Pintu tersembunyi di balik air terjun kecil dekat desa. Isi: ruangan kayu, 3 kursi, papan berisi "roadmap" in-world (meta-humor), chest kecil. | Trigger volume di balik mesh air terjun → Report + buka chest event |
| 2 | **Empat Jamur Sejajar** | 4 jamur di hutan membentuk barisan tidak wajar. Interact berurutan dari terkecil → muncul slime TOPI JAMUR jinak yang joget. Membunuhnya = 1 mora + rasa bersalah. | InteractObject counter di BP level; urutan benar → spawn `Slime_Pyro_T1` dengan tag `Friendly` + montage joget |
| 3 | **"Left 4 Bread"** | Di dapur NPC koki (side quest Q_W2): 4 roti tersusun rapi menghadap pintu, dan pisau roti menancap di talenan membentuk logo tertentu. Interact → Kagari: "...kenapa roti-roti ini terasa seperti tim yang solid?" | Interact prop → dialog 1 baris + Report. Homage L4D2 — juga alasan Game Director ada |
| 4 | **Statue Tengah Malam** | Berdoa di Statue of the Seven TEPAT jam 00:00-00:10 in-game → suara misterius dari opening bicara SATU baris tambahan per act. | BP Statue cek `AOpenWorldGameState` world time saat interact → dialog node rahasia |
| 5 | **Batu Mancing** | Batu di danau bentuknya persis ikan. Lempar (plunge attack ke air dekat batu) → batu "terpancing" melompat, drop `Ing_Fish` ×3. | Overlap volume + cek `IsPlunging()` → spawn item + Report |
| 6 | **Puncak Tertinggi** | Titik tertinggi region (climb brutal, stamina pas-pasan) tidak ada apa-apa... kecuali pemandangan, satu bunga `Mat_Frostbloom` emas (visual unik), dan angka "①⓪⓪" terukir kecil — 100 tahun Malam Hampa. | Trigger volume di puncak → Report + item |
| 7 | **Nama di Kredit Batu Nisan** | Makam di quest `Q_W1_SuratTerakhir` punya deretan nisan kecil; nama-namanya = kontributor proyek (in-world memorial, respectful). Baca semua 5 → Report. | Interact counter → Report |
| ★ | **Serpihan Jurnal Veyra** (10) | Lore collectible utama — lihat `STORY_ACT1.md`. Chest tersembunyi + lokasi sulit. Kumpul 10 → `Ach_Secret_Journal` + dialog ekstra boss fight. | Tiap pickup: `AddItem(Lore_Journal_N)` + `Report(this, "Stat_JournalsCollected")` |

## Aturan Penempatan

1. Minimal 1 rahasia visible dari jalur quest utama (jamur #2) — mengajari
   pemain "dunia ini menyimpan sesuatu", sisanya baru boleh brutal.
2. Jangan gate progress di balik rahasia. Reward = cerita/kosmetik/snack.
3. Rahasia #4 (tengah malam) sengaja butuh sistem day/night yang sudah ada —
   pemain yang menemukan pasti cerita ke orang (marketing gratis).
