# Bagian 40 — Living World (Foliage, Cuaca, AI Cerdas, Persistence) · *super polish*

Dunia yang terasa hidup & bereaksi. Empat sistem.

## 40A. Interaksi Foliage

- **Rumput terbelah saat lewat**: RenderTarget top-down kecil ikut player →
  karakter "gambar" (brush) ke RT → material rumput baca RT → WPO tekan +
  bend arah gerak → balik perlahan (RT fade). ([ART_D](../../aether-realm-ue5/Docs/ART_D_ENVIRONMENT.md))
- **Semak goyang** saat sprint lewat (overlap → impulse ke physics/WPO)
- **Kelopak bunga berhamburan** saat kena serangan (Niagara burst di lokasi hit)

## 40B. Wind & Time-Reactive Environment

**Wind detail**: bukan 1 arah — gust + swirl + calm. Wind Directional Source
+ perlin noise intensitas. Pohon besar sway lambat, ranting kecil cepat
(mask by height di material). Rumput = wave pattern (offset phase per posisi).

**Golden hour & waktu** (dari `ADayNightController` C++):
- Sunrise: oranye hangat, bayangan panjang, burung mulai
- Sunset: langit ungu-oranye, fireflies muncul ([ART_B](../../aether-realm-ue5/Docs/ART_B_VFX.md))
- Night: bintang gradual, bulan bergerak

**Reaksi cuaca** (dari `AWeatherController` C++):
- Sebelum hujan: awan gelap, angin kencang, daun beterbangan
- Saat hujan: basah + puddle + ambient berubah ([Bagian 38](38-character-detail.md) wetness)
- Setelah: masih wet beberapa saat, pelangi kalau siang
- Salju: akumulasi di objek (material blend `SnowAmount` overtime)

## 40C. Enemy AI Lebih Cerdas

Naik dari state machine dasar ([Bagian 15](15-enemy-sederhana.md)) — **pakai
Behavior Tree** untuk yang kompleks:

| Perilaku | Cara |
|---|---|
| **Investigate** | dengar suara → pergi cek lokasi (bukan langsung tau posisi) — pakai AIPerception Hearing (sudah di `AEnemyAIController` C++) |
| **Flanking** | grup enemy ambil posisi mengepung (EQS — Environment Query System pilih titik samping player) |
| **Retreat + call help** | HP rendah → kabur + alert teman (team aggro sudah di C++) |
| **Dodge/Parry** | elite: saat player attack windup terdeteksi → roll/block (chance-based) |
| **Rage** | teman mati → +damage/+speed (bind ke OnDied teman) |
| **Faction fight** | Hilichurl vs Slime saling serang → player manfaatkan (target selection: cek faction tag, bukan cuma "player") |

> AI cerdas = **Behavior Tree + EQS** (Modul lanjutan). Track ini pakai state
> machine sederhana; ini peta upgrade-nya. `aether-realm-ue5` Docs/PHASE3
> punya layout BT lengkap.

## 40D. World Persistence

Dunia "ingat" aksi player (simpan di save):
- Rumput terbakar → gosong sementara → tumbuh lagi (timer / daily reset)
- Chest dibuka, oculus diambil → **permanen** (sudah C++: `OpenedChests`,
  `CollectedOculi`)
- Batu hancur → hancur sampai daily reset
- NPC ingat: dialog berubah setelah quest selesai (kondisi `QuestCompleted`
  di dialog — sudah [Bagian 25](25-dialog-bercabang.md))

## Prioritas realistis

| Fitur | Worth v1? |
|---|---|
| Time/weather reactive (pakai C++ yang ada) | ✅ |
| Chest/oculus/NPC persistence | ✅ sudah ada |
| Grass bend player | 🟡 keren, sedang effort |
| Investigate AI (hearing) | ✅ C++ sudah, tinggal BT |
| Flanking/EQS/faction | ❌ v2 — kompleks |

## ✅ CHECKPOINT

- [ ] Golden hour + fireflies malam
- [ ] Hujan → basah → mengering, salju akumulasi
- [ ] Enemy investigate suara (bukan wallhack)
- [ ] Chest/oculus/NPC state persist setelah save

➡️ [Bagian 41 — Systems Depth](41-systems-depth.md)
