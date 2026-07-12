# Elemental Resonance System

Party-wide passive buff dari komposisi elemen party (Genshin spec 5).

## Arsitektur

`UResonanceComponent` di `AOpenWorldPlayerController` (scope party).
- Sumber elemen: `DT_Characters` (`FCharacterDefRow.Element`) via `CharacterTable`.
- Trigger: `AOpenWorldPlayerController::OnPossess` → `RefreshResonances()`.
  Meng-cover spawn awal + tiap party swap (swap = Possess karakter baru).
- Efek stat lewat progression (`Recalculate` fold `ResonanceATKPercent/HPPercent/EMFlat`)
  + field `CharacterBase` (`StaminaCostMultiplier`, `FlatRESBonus`).
- Efek kondisional di-expose sebagai query (dibaca sistem lain / BP).

## Tabel resonance

| Komposisi | Resonance | Efek | Implementasi |
|---|---|---|---|
| 2 Pyro | Fervent Flames | +25% ATK | `ResonanceATKPercent` → bucket ATK% |
| 2 Hydro | Soothing Water | +25% Max HP | `ResonanceHPPercent` → bucket HP% |
| 2 Cryo | Shattering Ice | +15% crit vs frozen | query `GetCritRateVsFrozenBonus` |
| 2 Electro | High Voltage | energy dari reaction | query `IsHighVoltageActive` |
| 2 Anemo | Impetuous Winds | −15% stamina cost | `StaminaCostMultiplier = 0.85` |
| 2 Geo | Enduring Rock | +15% shield strength | query `GetShieldStrengthBonus` |
| 2 Dendro | Sprawling Greenery | +50 EM | `ResonanceEMFlat` → Flat EM |
| 4 beda | Protective Canopy | +15% semua RES | `FlatRESBonus = 0.15` |

Multiple resonance bisa aktif bersamaan (party of 4).

## Integrasi ke sistem lain (kondisional)

- **Shattering Ice**: ✅ wired — `UDamageCalculator::CalculateDamage` cek
  `Victim->IsFrozen()`, tambah `GetCritRateVsFrozenBonus()` ke crit rate lewat
  `Attacker->GetController()` → `AOpenWorldPlayerController::GetResonance()`.
  Attacker non-player (gak punya controller tipe itu) no-op aman.
- **Enduring Rock**: ✅ wired — `ResonanceComponent.cpp` set
  `Shield->ExtraShieldStrength` langsung (lihat `UShieldComponent`).
- **High Voltage**: ⚠️ **masih belum di-hook**. `IsHighVoltageActive()` query
  ada tapi 0 caller. Beda dari 2 di atas — ini butuh keputusan desain yang
  gak ke-spec di sini (berapa energy per reaction, reaction mana yang
  trigger, ada cooldown apa gak), jadi sengaja gak ditebak asal comot pas
  pass ini. Kalau mau digarap: tentuin dulu angka pastinya, baru hook di
  `UElementalReactionSubsystem::ResolveReaction` (Electro-Charged/
  Superconduct branch) panggil `CombatComponent::GainEnergyParticles` ke
  instigator.

## Setup editor

1. Assign `CharacterTable` = `DT_Characters` di BP_OpenWorldPlayerController
   (atau di CDO komponen).
2. Pastikan tiap row `DT_Characters` punya `Element` benar.
3. Test: console `ShowResonance` — log resonance aktif.

## Catatan

- `OnPossess` server-authority. Single-player OK. Co-op: resonance per-client
  butuh replikasi party composition (sudah ada di GameInstance, tinggal panggil
  refresh di client saat swap).
