# Bagian 33 — Polish & Juice (Efek Visual & Feel) · *lanjutan*

"Juice" = detail kecil yang bikin game terasa hidup & mahal. Bukan fitur
baru — memperkuat yang sudah ada. Ini yang membedakan prototype dari produk.

> Beberapa sudah dibahas: hit stop & camera shake & vignette [Bagian 21](21-polish-qol.md),
> footstep [Modul 12](../12-audio-vfx.md), damage number [Bagian 14](14-damage-system.md).
> Bagian ini melengkapi.

## 33A. Loading Screen

`W_LoadingScreen`: progress bar + tips text (rotasi random) + artwork.

```
[Sebelum Open Level]
   Create W_LoadingScreen + Add to Viewport
   [Open Level (async — pakai "Load Level Instance" atau level streaming
    untuk progress asli; Open Level biasa tidak kasih progress)]
   [Setelah loaded] → fade out loading screen
```

> Progress bar asli butuh **async loading** (Level Streaming / Async Load
> Primary Asset). `Open Level` biasa = layar beku. Untuk demo, fake progress
> bar 0→100 dengan Timeline 1-2s sudah cukup meyakinkan.

## 33B. Item Glow per Rarity

Material `M_ItemGlow` (di item dunia sebelum dipickup):
```
Emissive = WarnaRarity × (0.5 + 0.5 × Sin(Time × PulseSpeed))
```
| Rarity | Warna | Pulse | Ekstra |
|---|---|---|---|
| 3★ | biru | lambat | — |
| 4★ | ungu | medium | light beam ke atas |
| 5★ | emas | cepat | beam + partikel trail |

`PulseSpeed` & warna param → Material Instance per rarity (Bagian 24).

## 33C. Screen Effects

| Efek | Trigger | Cara |
|---|---|---|
| Damage vignette | HP < 30% | ✅ Bagian 21 — tambah pulse "heartbeat" (opacity sine) + suara low-freq |
| Burst flash | cast Burst | screen flash warna elemen 0.2s (UMG image full-screen fade) + chromatic aberration (post-process) + slow-mo 0.1s (`Set Global Time Dilation`) |
| Low stamina | stamina < 20% | desaturasi ringan (post-process Saturation lerp) + vignette abu |
| Heal | saat heal | tint hijau/hangat sebentar + sparkle partikel pinggir |

Post-process runtime: **Post Process Volume** → dynamic material, atau
`Camera → PostProcessSettings` di-set dari BP (Weight + Saturation dst).

## 33D. Particle Polish

| Momen | Partikel |
|---|---|
| Glide | trail putih di belakang sayap (Ribbon) |
| Sprint | dust trail di kaki (spawn saat speed > 500) |
| Dash | afterimage (snapshot mesh translucent ×3 fade — [Bagian ART_B]) |
| Footstep per surface | grass=daun, dirt=debu, stone=spark, water=cipratan, snow=puff (anim notify + surface trace — Modul 12) |
| Impact per weapon | sword=spark, claymore=rock fragment, polearm=wind slash |

## 33E. Sound Polish

- **Ambient detail**: burung random 5-30s, angin continuous+gust, air by
  jarak, daun rustle saat lewat pohon (Modul 12)
- **UI**: hover tick, click chime, cancel blip, notif sparkle, level-up
  fanfare, achievement sting
- **Combat**: whoosh pitch ±5% (anti-repetitif), impact volume ∝ damage,
  kill "ding" ekstra, low HP heartbeat + napas berat

## Prinsip juice (yang paling penting)

1. **Feedback tiap aksi**: klik, pukul, ambil — semua harus ada respons
   visual+audio dalam 1-2 frame
2. **Anticipation & follow-through**: telegraph sebelum, recovery sesudah
3. **Layering**: 1 event = beberapa efek kecil (spark + shake + sound +
   number) → terasa "berbobot"
4. **Jangan berlebihan**: shake halus > shake mual; efek mendukung, bukan
   mendistraksi

## Playtest juice

Rekam gameplay 30 detik. Tonton tanpa suara: apakah tiap aksi kelihatan
jelas hasilnya? Lalu tonton dengan mata tertutup: apakah tiap aksi terdengar?
Kalau dua-duanya ya → juice cukup.

## 🎓 Track proyek-mini benar-benar tamat (Bagian 7-33)

Dari rapikan karakter VRoid sampai action RPG open world dengan combat,
elemental reaction lengkap, boss, quest, dialog bercabang, inventory, gear,
party swap, minimap, domain multi-room, co-op-ready, battle pass, dan polish.

**Kamu sudah punya blueprint lengkap sebuah game.** Sisanya: eksekusi,
konten, rilis. Naik ke C++: [Modul 14 Capstone](../14-capstone-aether-realm.md)
— bandingkan semua ini dengan versi produksi `aether-realm-ue5`.

## ✅ CHECKPOINT FINAL

- [ ] Loading screen antar level
- [ ] Item glow per rarity + beam 4★/5★
- [ ] Burst flash + slow-mo, low HP heartbeat vignette
- [ ] Trail glide/sprint/dash, footstep per surface
- [ ] Setiap aksi punya feedback visual + audio
