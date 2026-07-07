# Cross-Check Menyeluruh — Gap, Pengembangan, Antisipasi

Hasil audit seluruh codebase + course. Jujur & prioritas.

---

## ✅ Yang sudah SOLID (tidak perlu khawatir)

- **Save/load simetris** — 37 field disimpan = dimuat semua (cek otomatis
  lolos; Timestamp memang metadata write-only)
- **Semua delegate handler = UFUNCTION** (9/9), replikasi include lengkap
- **Cross-link course & docs valid** — 0 link rusak
- **Formula damage/gacha** — ada automation test, kebukti benar
- **Audit sebelumnya** — 3 bug compile/logic sudah fixed (BUILD_NOTES)

## 🔧 FIXED pass ini (3 gap fungsional)

| Gap | Dampak sebelum | Fix |
|---|---|---|
| **DMG% + HealingBonus tidak nyampe ke damage** | Artifact `ElementalDMGBonus`/`HealingBonus` **percuma** — dihitung progression tapi tidak ditulis ke CharacterBase, DamageCalculator hardcode DmgBonus=1 | CharacterBase +2 field, progression menulisnya, CalculateDamage baca `1+ElementalDMGBonus`, Heal kali `1+HealingBonus` |
| **Transformative reaction bypass RES** | Overload/Superconduct/Bloom/EC-DOT tidak kena elemental RES musuh (harusnya kena) | Kali `ResMultiplier(GetResistance)` sebelum ApplyDamage |

---

## 🚧 GAP — perlu DIKEMBANGKAN (prioritas)

### P1 — SUDAH DIKERJAKAN ✅ (pass ini)

1. ~~**Enemy tidak bisa apply elemen ke player.**~~ → `AEnemyBase::AttackTarget()`
   (header+cpp) apply `Element` enemy via `ApplyElement` sebelum damage.
   Reaksi sekarang dua arah (player↔enemy). Anim notify BP enemy panggil ini.

2. ~~**Talent multiplier tidak otomatis ke damage.**~~ → `ETalentSource` +
   `FAttackParams::TalentSource`. `DealDamage` baca `GetTalents()` dari
   `UCharacterProgressionComponent`, kali `GetTalentMultiplier(level)` otomatis.
   Normal/Charged/Plunge di-set `NormalAttack`; skill/burst BP set sendiri.

3. ~~**Off-field energy 60% belum jalan.**~~ → `GainEnergyParticles` loop
   `PartyCharacterData`, non-aktif dapat `Energy * 0.6`. `RestoreCharacterState`
   clamp ke `MaxEnergy` saat swap-in.

### P2 — depth, bisa nyusul

4. **Set 4-piece effect & Constellation: hook ada, gameplay belum baca.**
   `GetActiveSetEffects()` & `GetConstellation()` di-expose, tapi tidak ada
   C++ yang bertindak atasnya. By design BP ability yang cek (mis. C2 →
   +1 skill charge). Perlu ditulis per karakter/set saat bikin kontennya.

5. **Superconduct -40% Physical RES debuff belum ada.** Reaksi jalan +
   damage, tapi efek debuff RES-nya tidak. → butuh sistem debuff bertimer
   di CharacterBase (mirip BuffComponent tapi negatif + per-element RES).

6. **Elemental DMG bonus tidak per-elemen.** `ElementalDMGBonus` sekarang
   flat semua elemen. Genshin: bonus per elemen (Pyro DMG% ≠ Cryo DMG%). →
   ganti jadi `TMap<EElement, float>` kalau mau akurat.

### P3 — konten, saat scaling

7. **Item ascension/level-up materials** belum ada sistem konsumsi
   (weapon/character ascension pakai material). Data ada (Rewards.Items),
   flow-nya belum.
8. **Talent level-up cost** (talent book + mora) belum ada.
9. **Artifact enhancement** (naik level artifact via EXP) belum ada.

---

## ⚠️ ANTISIPASI — yang akan menggigit nanti

1. **Belum pernah di-compile.** Harapkan error kecil build pertama
   (BUILD_NOTES). Ini risiko #1 — sisihkan sehari untuk first-compile fixing.

2. **Stat float polos, bukan GAS AttributeSet.** Sekarang OK. Tapi kalau
   buff/debuff makin banyak & stacking kompleks (shield, DOT, RES shred,
   conditional bonus) → float manual jadi kusut. Migrasi ke GAS
   AttributeSet + GameplayEffect saat itu terasa. ASC sudah terpasang =
   migrasi mulus.

3. **Climb custom movement tanpa `FSavedMove`.** Single-player mulus.
   Co-op: climb akan "karet"/desync di client. Wajib tambah SavedMove
   sebelum co-op serius.

4. **Damage number spawn actor + widget component per hit.** Kalau ratusan
   hit/detik (AOE besar, banyak musuh) → banyak alokasi. Pertimbangkan
   object pool damage number saat profiling nanti.

5. **`GetAllActorsWithTag("Enemy")` / `GetAllActorsOfClass`** dipakai di
   reaction AOE, plunge, cheat, minimap. Mahal kalau musuh banyak & dipanggil
   sering. Ganti ke overlap query / spatial grid saat musuh > 50.

6. **Timestamp save tidak dimuat** (sengaja) — tapi kalau nanti bikin UI
   "save slot list dengan tanggal", pastikan baca `Save->Timestamp` langsung
   dari file, bukan dari GameInstance.

7. **Wish 50/50 & pity antar-banner-tipe.** Sudah benar, tapi belum ada
   test untuk pity soft/hard (thresholds protected). Tambah friend test atau
   expose untuk validasi statistik sebelum rilis (gacha wajib benar — legal).

8. **Localization**: kalau text sudah terlanjur di-hardcode di BP yang dibuat
   nanti, retrofit mahal. Disiplin FText + String Table dari awal (course
   Bagian 36).

---

## Ringkasan angka

| | Jumlah |
|---|---|
| C++ class | 44 |
| Source file | 96 |
| Setup/review docs | 20 |
| Automation test | 2 file (5 test) |
| Gap fungsional fixed | 3 + P1 (3) |
| Gap tersisa (P2-P3) | 6 (terdaftar di atas) |

## Rekomendasi urutan garap berikutnya

1. **First-compile** di UE (fix error kecil) — sebelum apa pun
2. ~~**P1 gap** (enemy elemen, talent auto, off-field energy)~~ ✅ selesai
3. **First region playable** (course Bagian 26 flow) pakai cheat manager buat test
4. P2/P3 saat scaling konten
