# Bagian 42 — Live Service & Technical Excellence · *super polish*

IAP, accessibility, anti-cheat, analytics. Bagian "bisnis & profesional".

## 42A. Accessibility (JANGAN di-skip)

Sering diabaikan, padahal **memperluas pasar + etis + Steam menghargainya**.

**Colorblind mode**: post-process filter Deuteranopia/Protanopia/Tritanopia,
ATAU biarkan pemain custom warna UI/elemen. Element icon jangan cuma beda
warna — beda **bentuk** juga (Pyro teardrop, Cryo snowflake) supaya kebaca
tanpa warna.

**Difficulty options**:
| | Enemy HP | Enemy DMG | Bantuan |
|---|---|---|---|
| Easy | -30% | -30% | lebih banyak hint |
| Normal | standar | standar | — |
| Hard | +50% | +50% | AI lebih baik |

Implementasi: multiplier global di `TerimaDamage` (enemy) & saat enemy
attack. Simpan di settings.

**Subtitle + caption**: dialog full subtitle (sudah [Bagian 25](25-dialog-bercabang.md)),
plus **sound caption** untuk tuli: `[Langkah kaki]`, `[Ledakan]`,
`[Musuh terdeteksi]` — text muncul saat SFX penting main.

**Full remapping**: keyboard + controller rebind (Enhanced Input User
Settings, UE 5.3+ `IEnhancedInputSubsystemInterface::AddPlayerMappedKey`).

## 42B. IAP (kalau F2P)

Steam Microtransaction: primogem pack ($0.99-$99.99), Welkin $4.99/30hari,
BP premium $9.99, starter pack.

> **Teknis penting**: `ISteamMicroTxn` butuh **web server backend** untuk
> callback transaksi — bukan client-only. Steam Inventory Service (item JSON
> di Steamworks) lebih sederhana. **Untuk solo dev: pertimbangkan premium
> $19.99 daripada F2P** ([PHASE8](../../aether-realm-ue5/Docs/PHASE8_RELEASE.md) 8D) —
> F2P butuh live-ops konstan + backend.

## 42C. Anti-Cheat (basic)

Single-player: tidak perlu (cheat cuma rugiin diri sendiri). **Co-op/online**:
- **Server-authoritative** (sudah prinsip di `aether-realm-ue5`): server
  validasi damage masuk akal, speed ≤ max, skill tidak sebelum cooldown,
  posisi tidak teleport ajaib
- Integritas file: **Steam VAC** atau **Easy Anti-Cheat** (EAC gratis untuk
  UE) — opsional, aktifkan kalau kompetitif

## 42D. Analytics (opt-in, anonim)

Data untuk balancing:
- Playtime, di mana sering mati, karakter populer, quest sering di-drop,
  gacha pull rate real
- Tool: Unreal Analytics provider, atau kirim event ke backend/GameAnalytics
  (gratis tier)
- **Wajib opt-in + anonim** (GDPR/privasi) — tanya izin, jangan diam-diam

Gunakan: patch balance, fix area terlalu susah (banyak mati), tambah konten
di area populer.

## Prioritas realistis

| Fitur | Worth v1? |
|---|---|
| Difficulty options | ✅ mudah, dampak besar |
| Subtitle + colorblind-safe icon | ✅ murah, etis |
| Full remapping | ✅ Enhanced Input support |
| Analytics opt-in | 🟡 berguna kalau serius live |
| IAP | ❌ hindari solo — premium lebih realistis |
| Anti-cheat | ❌ hanya kalau online kompetitif |

## ✅ CHECKPOINT

- [ ] Difficulty Easy/Normal/Hard mengubah HP/DMG enemy
- [ ] Subtitle + sound caption
- [ ] Icon elemen kebaca tanpa warna (bentuk beda)
- [ ] Keybind rebind jalan

➡️ [Bagian 43 — Post-Launch Roadmap](43-postlaunch-roadmap.md)
