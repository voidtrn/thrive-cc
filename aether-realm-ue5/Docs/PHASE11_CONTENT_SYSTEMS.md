# PHASE 11 — Content Systems: Consumable, Shop, Domain

C++ selesai: `UBuffComponent` (buff stat sementara), `UConsumableComponent`
+ `ConsumableTypes.h` (food/potion/cooking), `UShopComponent` (merchant
buy/sell), `ADomainChallenge` (arena wave-based).

---

## 11A. Buff + Consumable + Cooking

### Buff (UBuffComponent)

Pasang di `BP_PlayerCharacter`. Buff = delta stat sementara, revert akurat
saat expire (delta dicatat, bukan recompute). BuffId sama = refresh durasi.

```
Buff->ApplyBuff("Food_ATK", EArtifactStat::ATK, 50, 30)   // +50 ATK, 30s
```
UI buff aktif: bind `OnBuffsChanged` → icon + timer.

### Consumable (UConsumableComponent)

Pasang di player. `DT_Consumables` (Row **ConsumableDefRow**):

| RowName | Effect | Magnitude | Buff… | Recipe |
|---|---|---|---|---|
| Potion_Heal | Heal | 500 | — | — |
| Feast_HP | HealPercent | 0.4 | — | {Daging:3, Sayur:2} |
| Elixir_Revive | Revive | 0.5 | — | {Bunga:2} |
| Food_ATK | StatBuff | — | ATK +50, 30s | {Daging:2, Rempah:1} |

- `UseConsumable(ItemId)`: cek inventory → efek ke karakter aktif → kurangi 1.
  Revive hanya untuk karakter mati; buff lewat BuffComponent.
- `CookItem(ItemId)`: cek bahan Recipe di inventory → kurangi bahan →
  tambah 1 hasil. `CanCook` untuk enable tombol.

Wiring: menu inventory (Phase 7 / course Bagian 23) tombol "Makan" →
`UseConsumable`; meja masak (interact) → UI resep → `CookItem`.

## 11B. Shop / Merchant

`UShopComponent` di `BP_NPC_Merchant`, assign `DT_Shop_Xxx`
(Row **ShopItemRow**: ItemId, Price, Currency Mora/Primogem/Starglitter/
Stardust, Stock -1=infinite).

- `BuyItem(ItemId, qty)`: cek stok + currency → bayar → tambah item → kurangi stok
- `SellItem(ItemId, qty, unitMoraValue)`: kurangi item → +Mora (× SellRatio 0.3)
- `ResetStock()`: panggil dari daily reset (bind ke commission reset Phase 6)
- UI: `WBP_Shop` — list barang dari table, harga + ikon currency, tombol
  Beli (disable kalau `GetRemainingStock`==0 atau currency kurang), tab Jual

## 11C. Domain Challenge (arena wave)

`ADomainChallenge` (place di level dungeon / Level Instance):
- `Waves` (array): tiap wave = map `{EnemyClass → jumlah}`
- `TimeLimit` (detik), `WaveDelay` antar gelombang
- `StartDomain()`: dari portal/interact. Spawn wave 0 → semua mati → wave
  berikut (jeda WaveDelay) → semua wave clear → `OnDomainCleared` (BP:
  spawn chest/grant reward). Waktu habis → Failed, musuh sisa dihapus.
- Bind `OnStateChanged` (Idle/Active/Cleared/Failed) + `OnWaveChanged`
  (index/total) untuk UI: timer + "Wave 2/3".

Alur Genshin: waypoint domain → interact portal → `StartDomain` → combat →
clear → reward chest. Loot pakai artifact/weapon (Phase 10).

### Setup domain

1. Buat Level Instance `LI_Domain_01` (interior — Phase 1).
2. Place `ADomainChallenge`, atur SpawnArea box + isi Waves (drag BP enemy
   class + jumlah).
3. Portal BP: interact → `DomainChallenge->StartDomain()`.
4. `WBP_DomainHUD`: bind timer + wave + state (Cleared = layar reward).

## Checklist Phase 11

- [ ] Makan potion → HP naik; food buff → ATK naik 30s lalu balik
- [ ] Masak: bahan cukup → dapat hasil, bahan kurang → gagal
- [ ] Beli di merchant: Mora berkurang, item masuk, stok turun
- [ ] Jual item → dapat Mora
- [ ] Domain: 3 wave, timer jalan, clear semua → reward, timeout → gagal
