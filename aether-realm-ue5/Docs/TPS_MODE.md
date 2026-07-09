# Mode TPS — Aim Over-the-Shoulder + Projectile

C++ selesai: `UAimModeComponent` (Character/) + `AAimedProjectile` (Combat/).
Dokumen ini = langkah wiring editor.

## Arsitektur

```
IA_Aim (hold) ──► AimModeComponent.EnterAimMode()
                    ├─ kamera: arm 160 + offset bahu (interp via sistem existing)
                    ├─ FOV 65 (SetAimMode — sudah ada dari Phase 2)
                    ├─ strafe: bUseControllerRotationYaw, jalan 200
                    └─ bAiming replicated ──► AnimBP pose (bIsAiming, AimPitch)
IA_Fire ──► FireShot(BP_ArrowProjectile, Params, Spread)
              └─ ServerFireShot RPC ─► spawn AAimedProjectile (server)
                    └─ overlap musuh ─► Shooter CombatComponent.DealDamage
                                          (talent + crit + elemental reaction penuh)
```

## Langkah Editor

1. **Komponen**: BP_PlayerCharacter → Add Component → `AimModeComponent`.
2. **Input** (IMC_Default):
   - `IA_Aim` (hold, RMB / LT): Started → `EnterAimMode`; Completed → `ExitAimMode`.
   - `IA_Fire` (LMB / RT saat aim): `IsAiming?` → `FireShot`.
   - `IA_SwapShoulder` (Q saat aim): `ToggleShoulder`.
   - `IA_Sprint` saat aim: panggil `ExitAimMode` dulu (aim = jalan pelan).
3. **Projectile BP**: child `AAimedProjectile` → `BP_Proj_Arrow`
   (mesh panah + trail Niagara; gravity 1.0 untuk arc fisik) dan
   `BP_Proj_Bolt` (bolt elemen catalyst; gravity 0.05 default).
   Implement `OnImpact` → spawn VFX hit (pakai `AVFXManager`).
4. **Params contoh** (aimed shot bow, ala charged shot Genshin):
   `SkillMultiplier 1.2, Element = elemen karakter, GaugeUnits 1,
   ICDTag "AimedShot", TalentSource NormalAttack, Spread 0` —
   hip-fire cepat: `Multiplier 0.4, Spread 4`.
5. **Crosshair**: WBP_Crosshair (dot + ring). Bind visibility ke
   `OnAimModeChanged` (add ke viewport saat aim). Titik bidik presisi UI:
   `GetAimPoint` → ProjectWorldToScreen.
6. **AnimBP**: state Aim (bIsAiming) → blend space strafe
   (Speed × Direction) + Aim Offset pakai `AimPitch` (-90..90).
   Simulated proxy co-op otomatis benar (bAiming replicated).

## Keputusan Desain

- **Damage lewat `DealDamage`** — aimed shot dapat crit, talent scaling,
  elemental reaction, set bonus, resonance. Bukan sistem damage paralel.
- **Server-authoritative**: klien kirim origin+arah via RPC; server tolak
  origin > 3 m dari karakter (anti teleport-shot), spawn & hit di server.
- **Friendly fire off**: projectile hanya mengenai tag `Enemy`.
- **Aim ditolak saat climb/glide/swim** — konsisten aturan traversal.
- **Spread deterministik** dari 2 angka random (pure static) — bisa dites;
  distribusi merata per-luas cone (sqrt), tepi cone tercapai di rand=1.
- Existing scroll-zoom & FOV lerp DIPAKAI ULANG (SetCameraZoomTarget /
  SetAimMode) — tidak ada dua sistem kamera yang berebut.

## Test

`AetherRealm.Meta.AimSpread` — unit length, dalam cone (grid 11×11),
tepi cone tercapai, zero-dir aman.
