# Bagian 29 — Elemental Reaction Lengkap · *lanjutan*

> Nomor lanjut dari 28 (track sebelumnya kepakai s/d 28). Ini bikin
> sistem reaksi elemen — jantung combat Genshin. Bagian tersulit di track;
> ambil pelan.

## Realita duluan

Reaksi elemen itu **kompleks**: directional (Pyro→Hydro ≠ Hydro→Pyro),
ada aura coexist (Electro-Charged), core (Bloom), aura state (Quicken).
Versi Blueprint di sini **disederhanakan** biar bisa diikuti. Versi lengkap
& benar sudah ada di C++ produksi: `UElementalReactionSubsystem`
(`aether-realm-ue5/Docs/PHASE3_SETUP.md`) — 16 reaksi, ICD, gauge decay.
Kalau serius, pelajari yang itu; bagian ini untuk **paham konsepnya**.

## 29A. Data Reaksi

1. **Enum** `EElement`: None, Pyro, Hydro, Cryo, Electro, Anemo, Geo, Dendro.
2. **Enum** `EReaction`: None, Vaporize, Melt, Freeze, Superconduct,
   Overload, ElectroCharged, Swirl, Crystallize, Burning, Bloom,
   Hyperbloom, Burgeon, Quicken, Spread, Aggravate.
3. **Data Table** `DT_Reactions` (Row `S_Reaction`): `Trigger` (EElement),
   `Aura` (EElement), `Reaction` (EReaction), `Multiplier` (Float), `Effect`
   (Name). Isi tabel sesuai matrix (Pyro+Hydro=Vaporize 1.5, Hydro+Pyro=
   Vaporize 2.0, dst).

> **Directional**: bikin baris terpisah Trigger vs Aura. Multiplier beda.
> Anemo/Geo "any": buat baris Anemo+Pyro, Anemo+Hydro, dst (4 baris) —
> lebih eksplisit daripada wildcard di Blueprint.

## 29B. Sistem (AC_Elemental)

Actor Component `AC_Elemental` di **semua karakter + enemy**:

Variables: `AuraElement` (EElement, None), `AuraGauge` (Float 0-4),
`ICDMap` (Map: EElement→Float, timer per elemen).

```
[ApplyElement] (Attacker, Element, Gauge)
   // ICD: elemen sama cuma "nempel" tiap 2.5s
   [Branch: waktu - ICDMap[Element] < 2.5?] True → return (masih cooldown)
   [Set ICDMap[Element] = waktu sekarang]
   │
   [Branch: AuraElement == None?]
     True  → [Set AuraElement = Element, AuraGauge = Gauge]   (nempel aura)
     False → [TriggerReaction(AuraElement, Element, Attacker)]
```

```
[TriggerReaction] (Aura, Trigger, Attacker)
   [Cari DT_Reactions: Trigger==Trigger AND Aura==Aura]
   [Branch: ketemu?] False → return
   [Hitung damage reaksi]:
      BaseDmg = 17 × LevelAttacker × koefisien   (approx kurva)
      ReactionDmg = BaseDmg × (1 + EMBonus) × Multiplier
   [Owner (enemy) TerimaDamage(ReactionDmg)]        ← interface Bagian 14
   [SpawnReactionVFX(Reaction, Location)]           ← 29C
   [PlayReactionSound(Reaction)]                    ← 29D
   [TerapkanEfek(Effect)]:  Freeze→hentikan gerak 3s, Overload→knockback,
                            Superconduct→-40% RES 12s, dst
   [Reset aura] (kecuali ElectroCharged/Quicken yang coexist)
```

EM Bonus: `2.78 × EM / (EM + 1400)` untuk amp (Vaporize/Melt),
`16 × EM / (EM + 2000)` untuk transformative. (Persis rumus C++.)

## 29C. Reaction VFX

Niagara per reaksi (`NS_Reaction_<Nama>`) — sebagian besar sudah dibahas di
[Modul 12](../12-audio-vfx.md) + `Docs/ART_B_VFX.md`:

| Reaksi | Visual |
|---|---|
| Vaporize | steam burst putih |
| Melt | api + pecahan es |
| Freeze | kristal es tumbuh |
| Superconduct | petir cyan + es |
| Overload | ledakan merah + knockback |
| ElectroCharged | petir biru berkedip |
| Swirl | angin hijau, warna aura terserap |
| Crystallize | kristal amber dari tanah |
| Burning | api DOT |
| Bloom/Hyperbloom/Burgeon | biji hijau → ledak / misil / AOE besar |

```
[SpawnReactionVFX] (Reaction, Location)
   [Switch on EReaction] → Spawn NS yang sesuai
   Scale ∝ damage (reaksi besar = VFX besar), auto-destroy 2s
```

## 29D. Reaction Sound

`[PlayReactionSound]` — Switch on EReaction → Play Sound at Location,
volume ∝ damage, attenuation 500-3000. Vaporize=steam hiss, Melt=ice crack+
fire whoosh, Overload=explosion bass, dst (MetaSound random var — Modul 12).

## Efek khusus (ringkas)

- **Freeze**: set enemy movement disabled 3s (+EM). Blunt/claymore hit = Shatter bonus
- **Overload**: AOE + LaunchCharacter knockback
- **Superconduct**: flag -40% physical RES 12s (kurangi DEF efektif di TerimaDamage)
- **ElectroCharged**: DOT — timer 1s ×2 tick, kedua aura tetap ada
- **Bloom**: spawn `BP_DendroCore` (biji, meledak 6s) → +Electro=Hyperbloom (misil homing), +Pyro=Burgeon (AOE besar)
- **Quicken**: set flag Quicken 7s → hit Dendro=Spread, hit Electro=Aggravate (flat bonus)

## ✅ CHECKPOINT

- [ ] Pyro ke musuh ber-Hydro → Vaporize, damage ×1.5, VFX steam
- [ ] Hydro ke musuh ber-Pyro → Vaporize ×2.0 (directional beda!)
- [ ] Freeze menghentikan musuh; Overload knockback
- [ ] ICD: spam Pyro tidak trigger reaksi tiap hit (jeda 2.5s)
- [ ] EM lebih tinggi → damage reaksi lebih besar

> **Sangat disarankan** bandingkan dengan `UElementalReactionSubsystem` C++ —
> di situ semua edge case (coexist, core, aura) ditangani benar.

➡️ [Bagian 30 — Dungeon Multi-Room](30-dungeon-multiroom.md)
