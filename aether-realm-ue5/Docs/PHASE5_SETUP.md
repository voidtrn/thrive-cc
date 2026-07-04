# PHASE 5 — Gacha / Wish System (langkah editor)

C++ selesai: `UWishSystem` (GameInstance subsystem), `WishTypes.h`
(FBannerData, FBannerPityState, FWishResult), currency + persistence penuh.

---

## 5A. Banner Setup

1. `Content/Data/DT_Banners` — Row Struct: **BannerData**.
2. Row contoh:

| RowName | Type | Featured5Star | Featured4Star | Pool | Tanggal |
|---|---|---|---|---|---|
| Beginner | Beginner | — | `Noelle` (slot 0 = guaranteed pull-10) | 4*/3* standar | kosong |
| Standard | Standard | — | — | semua 5* standar + 4* + 3* | kosong |
| Limited_v1 | LimitedCharacter | `Char_Pyro5` | 3 nama 4* | 5* standar utk lose 50/50 | Start/End (21 hari) |
| Weapon_v1 | LimitedWeapon | 2 nama weapon | 3 nama 4* | 5* weapon standar | Start/End |

Aturan yang sudah otomatis di C++:
- Beginner: cap 20 pull total, 10-pull = **8 Fate**, pull ke-10 guaranteed `Featured4Star[0]`
- Standard: no rate-up, pity 75/90
- LimitedCharacter: 50/50 + guarantee setelah kalah, 4* rate-up 50% + guarantee, pity 75/90
- LimitedWeapon: 75% featured, **Epitomized Path** (`SetEpitomizedTarget`, 2 poin = guaranteed), pity 65/80
- Pity carry over antar banner **tipe sama** (disimpan per `EBannerType`)

## 5B. Rates — sudah C++ (konstanta di `WishSystem.h`)

| Param | Nilai |
|---|---|
| 5* base | 0.6% |
| 4* base | 5.1% (guarantee tiap 10) |
| Soft pity | +6%/pull mulai pull 75 (weapon: 65) |
| Hard pity | 90 = 100% (weapon: 80) |

### Pull Animation (UMG + Level Sequence)

1. `WBP_WishScreen`: banner art, tombol Wish×1 / Wish×10, counter pity
   (`GetPityState`), fate balance.
2. Klik Wish → `WishSystem->Pull(BannerRow, Count)` → dapat `TArray<FWishResult>`
   → tentukan meteor tertinggi (ada 5* → emas; 4* → ungu; else biru).
3. `LS_WishMeteor` (Level Sequence, 3 varian):
   - Screen fade gelap → meteor jatuh (Niagara trail) → impact flash
   - Biru: cepat (2.5s). Ungu: 3s. Emas: 4s, lebih besar + slow-mo dikit
   - **Trick rahasia ketahuan**: warna meteor = rarity tertinggi hasil pull
4. Tombol Skip: muncul setelah `Delay(2.0)` → jump ke results.
5. `WBP_WishResults`: reveal satu per satu (klik = next), card flip animation,
   glow border per rarity, badge "NEW" kalau `!bDuplicate`,
   footer `+2 Starglitter` dll dari field result.

## 5C. Currency — sudah C++

| Currency | Sumber | Pakai |
|---|---|---|
| Primogems | quest/chest/achievement/daily (sudah: chest Phase 4) + IAP | `ConvertPrimogemsToFates` 160:1 |
| Acquaint Fate | exchange, reward | Standard + Beginner |
| Intertwined Fate | exchange, BP, reward | Limited |
| Starglitter | dup 4* (+2) / dup 5* (+10) | `ExchangeStarglitterForFate` 5:1, shop |
| Stardust | 3* pull (+15) | `ExchangeStardustForFate` 75:1, **limit 5/bulan** (auto-reset) |

Shop UI: `WBP_PaimonBargains` — tab Starglitter (fates, karakter bulanan,
material) + tab Stardust (fates limited, material). Panggil fungsi exchange
subsystem, disable tombol via return false.

### IAP (Steam Wallet)

- Steamworks: In-App Purchases → definisikan paket genesis crystal
  (60/300/980/1980/3280/6480) via Microtransaction API (ISteamMicroTxn)
- Flow: buy → Steam overlay approve → callback → `GI->Primogems += Amount`
  → `AutoSave()`
- Perlu `OnlineSubsystemSteam` plugin + Web API server callback untuk produksi.
  Prototype: tombol debug tambah primogems.

## Checklist Phase 5

- [ ] DT_Banners berisi 4 banner, wish screen tampil per banner
- [ ] Pull 1x & 10x potong fate benar (beginner 10-pull = 8)
- [ ] Statistik: ~90 pull selalu dapat 5* (hard pity), 4* tiap ≤10
- [ ] 50/50: kalah → berikutnya pasti featured
- [ ] Epitomized: pilih target, 2x meleset → ke-3 pasti target
- [ ] Beginner mati setelah 20 pull, pull-10 = Noelle
- [ ] Dup 4*/5* kasih starglitter 2/10, 3* kasih stardust 15
- [ ] Stardust→fate mentok 5/bulan, reset bulan baru
- [ ] Meteor emas muncul kalau (dan hanya kalau) ada 5*
- [ ] Pity tersimpan di save, lanjut antar session
