# Bagian 39 — Audio Next-Level (Dynamic Music, Spatial, Ambient) · *super polish*

Audio yang reaktif & imersif. Musik sudah punya state machine C++
([MusicManager](../../aether-realm-ue5/Docs/PHASE11_CONTENT_SYSTEMS.md) /
[Bagian 12](../12-audio-vfx.md)). Ini naik ke layering & spatial.

## 39A. Dynamic Music — Vertical Layering

Beda dari crossfade (ganti lagu): **layering** = satu lagu, beberapa stem
(track) yang nyala-mati/naik-turun volume.

Cara di **MetaSounds** (paling cocok):
1. Buat MetaSound Source `MS_Exploration` dengan 5 **Wave Player** paralel
   (pad, strings, woodwinds, brass, percussion) — semua sinkron, mulai bareng.
2. Input param `Intensity` (0-1) → atur volume tiap layer:
   - 0.0-0.2: cuma pad
   - 0.4: + strings
   - 0.6: + woodwinds ... dst
3. Dari BP: hitung intensity (kecepatan gerak, dekat bahaya, ketinggian) →
   set param → layer masuk mulus tanpa jeda.

**Combat**: 4 layer (tension/action/climax/victory) by jumlah enemy + HP.
**Leitmotif**: tiap karakter tema pendek 5s → putar saat swap ke karakter itu
/ burst (one-shot di atas musik utama).

> Vertical layering butuh **stem terpisah** dari komposer (minta di-export
> per instrumen, bukan 1 file mixdown). Brief ini ke komposer dari awal.

## 39B. Spatial Audio 3D

- **Attenuation asset**: tiap Play Sound at Location → assign attenuation
  (jarak dekat keras, jauh hilang). Enable **Spatialization** (HRTF untuk
  headphone — arah suara jelas).
- **Reverb by area**: Audio Volume dengan Reverb Effect berbeda per zona —
  gua (echo panjang), hutan (diffuse), kota (slapback). Auto-blend saat pindah.
- **Occlusion**: attenuation → enable Occlusion → suara di balik tembok jadi
  muffled + low-pass otomatis.
- **Doppler**: enable di attenuation → skill/proyektil lewat = pitch shift
  (whoosh) otomatis.

## 39C. Ambient Detail Realistis

- **Burung call & response**: bukan chirp acak — 2 MetaSound, satu "call"
  lalu delay → "response" dari lokasi lain. Terasa hidup.
- **Angin gust system**: base wind loop + gust layer (volume naik-turun via
  LFO/perlin) → tidak monoton.
- **Per lingkungan**: hutan (daun rustle terus, beda per pohon), gua (drip
  stalaktit + echo langkah), kota (percakapan jauh gibberish + lonceng + wind
  chime).
- **Reaktif player**: daun rustle saat lewat dekat semak/pohon (overlap
  trigger → play rustle).

## Prioritas realistis

| Fitur | Worth v1? |
|---|---|
| Attenuation + HRTF | ✅ wajib — murah, imersif |
| Reverb per area | ✅ mudah (Audio Volume) |
| Ambient layer + day/night | ✅ |
| Vertical music layering | 🟡 kalau punya stem dari komposer |
| Occlusion/Doppler | 🟡 nice, sedikit setup |
| Bird call-response | ❌ v2 polish |

## ✅ CHECKPOINT

- [ ] Suara punya arah (HRTF) + hilang dengan jarak
- [ ] Reverb beda gua vs hutan vs terbuka
- [ ] Musik intensity naik saat dekat bahaya/combat (layer, bukan cut)
- [ ] Ambient beda siang/malam & per zona

➡️ [Bagian 40 — Living World](40-living-world.md)
