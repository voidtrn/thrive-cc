# Bagian 16 — Skill Element (E): Pyro Slash

Tekan **E** = tebasan api AOE ke depan, damage 2×, cooldown 6 detik.
Elemen pertama game-mu. 🔥

## 16A. Input

1. `IA_Skill` (Digital) + mapping **E** di IMC_Default.

## 16B. VFX Pyro (Niagara)

1. Folder `VFX/Pyro` → klik kanan → FX → **Niagara System** →
   template **Directional Burst** (semburan ke satu arah — pas untuk slash;
   kalau tidak ada di list versi-mu, pakai **Omnidirectional Burst** lalu
   kecilkan cone velocity) → `NS_PyroSlash`.
2. Edit emitter:
   - **Spawn Burst Instantaneous**: Count 50
   - **Initialize Particle**: Lifetime 0.4-0.6; Sprite Size 30-80;
     **Color**: oranye HDR `(10, 2.5, 0.3)` — nilai >1 = glow
   - **Add Velocity**: arah +X (depan), speed 400-800, cone angle 25°
   - **Scale Color**: kurva alpha 1→0; RGB oranye→merah gelap
   - Renderer → material additive (`M_smoke_subUV` starter oke)
3. Preview kanan — harus seperti semburan api pendek.

## 16C. Logic Skill

Variabel di `BP_ThirdPersonCharacter`:

| Nama | Type | Default |
|---|---|---|
| `SkillCooldown` | Float | 6.0 |
| `SkillTimer` | Float | 0 |
| `bCanUseSkill` | Boolean | true |

### Handler

```
[EnhancedInputAction IA_Skill: Started]
   ─▶ [Branch: bCanUseSkill AND (NOT bIsAttacking)]
        True ─▶ [DoSkill]
        False ─▶ (bunyi "blip" gagal — opsional)
```

### Custom event `DoSkill`

```
[DoSkill]
   [Set bCanUseSkill = false]
   [Set SkillTimer = SkillCooldown]
   │
   [Play Montage] (animasi tebasan — pakai salah satu anim combo dulu, atau
                   download "spell cast" dari Mixamo)
   │
   [Spawn System at Location]              ← Niagara
      System: NS_PyroSlash
      Location: [GetActorLocation] + [GetActorForwardVector] × 100
      Rotation: [GetActorRotation]         ← semburan ikut hadap karakter
   │
   [Sphere Trace Multi By Channel]         ← MULTI: kena BANYAK musuh (AOE)
      Start: GetActorLocation
      End: Start + Forward × 400
      Radius: 200
   │
   [For Each Loop] (Out Hits)
      ─▶ [Break Hit Result] → Hit Actor
      ─▶ [TerimaDamage (Message)]  Amount: 40 (2× normal), Type: "Pyro"
      ─▶ [TampilkanDamage] (Bagian 14 — warnai oranye kalau mau: tambah
          input warna di W_DamageNumber)
```

> Trace **Multi** + For Each = beda dengan serangan biasa (single).
> Skill = AOE, kena semua yang di area. Dedup tidak perlu untuk latihan.

### Cooldown (Event Tick)

```
[Event Tick]
   ─▶ [Branch: NOT bCanUseSkill]
        True:
          [Set SkillTimer = SkillTimer - Delta Seconds]
          [Branch: SkillTimer <= 0] True ─▶ [Set bCanUseSkill = true]
```

(Alternatif 1-node: setelah set false → `[Delay 6.0]` → set true. Tapi versi
timer bisa ditampilkan di HUD — makanya kita pakai ini.)

## 16D. Cooldown di HUD

1. `W_HUD` → kanan bawah: **Image** (icon skill — kotak oranye dulu) +
   **Text Block** di atasnya (countdown) + **Progress Bar** overlay
   (Fill gelap semi-transparan, **Bar Fill Type: Bottom to Top**).
2. Bind Progress Bar Percent:

```
[Get Owning Player Pawn] → [Cast] → SkillTimer ÷ SkillCooldown → Return
```

3. Bind Text: `SkillTimer > 0 ? [Ceil SkillTimer → ToText] : kosong`
   (node **Select Text** by Branch).

Play: E → semburan api + banyak musuh kedamage + icon gelap 6 detik turun
perlahan. Rasakan — ini loop combat Genshin versi mini. 

## 🏁 Progress track sejauh ini

Karakter anime ✓ sprint/stamina ✓ glide ✓ chest ✓ oculi ✓ combo ✓
damage system ✓ enemy AI ✓ skill elemen + cooldown HUD ✓

**= vertical slice mini-Genshin.** Serius, ini sudah lebih dari kebanyakan
project yang berhenti di tutorial.

## Lanjutan yang disarankan

1. Skill kedua: Cryo (warna biru, efek slow — set enemy MoveSpeed ×0.5
   selama 3 detik pakai Delay)
2. Burst (Q): butuh energy — variabel `Energy` yang naik tiap hit
   (tambah di `DoAttackTrace`), penuh = boleh Q
3. Bandingkan dengan versi produksi: `UAbilityBase` + `UCombatComponent` +
   `UElementalReactionSubsystem` di `aether-realm-ue5` — sistem reaksi
   elemen lengkap (Vaporize/Melt/Overload dst) sudah ada di sana

## ✅ CHECKPOINT FINAL

- [ ] E = VFX + AOE damage banyak musuh + montage
- [ ] Cooldown akurat: icon HUD + countdown + tidak bisa spam
- [ ] Skill diblokir saat sedang combo (bIsAttacking)
