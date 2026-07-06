# Bagian 32 — Battle Pass · *lanjutan*

Progression musiman: naik level BP dari misi → klaim hadiah free/premium.
Data-heavy, logic sederhana.

## 32A. Data Battle Pass

1. **Structure** `S_BPLevel`: `Level` (int), `EXPRequired` (int),
   `FreeReward` (S_ItemStack), `PremiumReward` (S_ItemStack).
2. **Data Table** `DT_BattlePass` — 50 baris (level 1-50).
3. Variables (GameInstance/save):
   - `BPEXP` (int), `BPLevel` (int, 1)
   - `HasPremiumPass` (bool)
   - `BPSeason` (int)
   - `ClaimedFree` (Array int), `ClaimedPremium` (Array int) — level yang sudah diklaim

```
[AddBPEXP] (Amount)
   BPEXP += Amount
   [While BPEXP >= DT_BattlePass[BPLevel].EXPRequired AND BPLevel < 50]
      BPEXP -= EXPRequired
      BPLevel += 1
      [Notif "Battle Pass Level Up!"]
```

## 32B. Misi Daily & Weekly

1. **Structure** `S_BPMission`: `MissionID` (Name), `Type` (Name Daily/
   Weekly/Seasonal), `Description` (Text), `ObjectiveType` (Name),
   `TargetCount` (int), `BPEXP` (int).
2. **Data Table** `DT_BPMissions`.
3. Progress (save): `MissionProgress` (Map Name→int), `ClaimedMissions` (Array Name).

**Daily** (4/hari, reset jam 04:00 — cek tanggal seperti [Bagian 17](17-quest-system.md)
daily commission):
- Login, selesai 1 daily commission, masak 1 makanan, buka 1 chest — @100 EXP

**Weekly** (reset Senin):
- 10 daily commission, habiskan 100 stamina, bunuh 20 enemy, clear 3 domain — @500 EXP

Lapor progress: reuse pola `LaporProgress` — event gameplay (kill/cook/chest)
panggil `LaporMisiBP(ObjectiveType, count)` → cari misi cocok → progress++.
Selesai → tombol klaim → `AddBPEXP`.

## 32C. UI Battle Pass

`W_BattlePass`:
```
BATTLE PASS - Season 1        sisa: 21h 14h
[LV1][LV2][LV3]...[LV50]   ← scroll horizontal, tiap level 2 reward
 FREE  FREE  FREE            (atas = free, bawah = premium)
 PREM  PREM  PREM
Level 15   EXP 450/1000  [████████░░]
── Daily ──  ☑Login +100  ☐Commission +100
── Weekly ── ☐10 Commission +500 (7/10)
[Beli Premium Pass - $9.99]
```

- Track level: Horizontal ScrollBox, tiap slot `W_BPRewardSlot` (icon +
  free/premium + status locked/claimable/claimed)
- Progress bar EXP level sekarang
- List misi dengan checkbox + tombol klaim
- Tombol beli premium (IAP — [Bagian catatan], atau debug set `HasPremiumPass=true`)

## 32D. Klaim Reward

```
[ClaimReward] (Level, bPremium)
   [Branch: BPLevel >= Level?] False → return (belum unlock)
   [Branch: sudah di Claimed list?] True → return
   [Branch: bPremium AND NOT HasPremiumPass?] True → return (butuh premium)
   [Grant item] dari DT_BattlePass[Level].(Free/Premium)Reward
   [Add Level ke Claimed(Free/Premium)]
   [Update UI]
```

## ✅ CHECKPOINT

- [ ] Misi selesai → klaim → BP EXP naik → level up di threshold
- [ ] Reward free bisa diklaim, premium terkunci tanpa premium pass
- [ ] Daily reset harian, weekly reset Senin
- [ ] Klaim 2× di-block

➡️ [Bagian 33 — Polish & Juice](33-polish-juice.md)
