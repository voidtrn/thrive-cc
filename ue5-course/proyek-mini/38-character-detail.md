# Bagian 38 — Character Detail (Secondary Motion, Wetness, IK, Wajah) · *super polish*

Detail kecil yang bikin karakter terasa "hidup & mahal". Semua opsional —
kerjakan setelah game inti solid.

## 38A. Secondary Motion (rambut & baju)

Physics dasar sudah ([Bagian 07](07-rapikan-karakter-anime.md)). Naik level:
- **Idle motion**: rambut/baju gerak halus saat diam (napas, angin sepoi) —
  KawaiiPhysics punya "Wind" param; atau tambah gaya sinus kecil ke bone
- **Beda per state**: rambut lebih "terbang" saat glide, tertekan saat jatuh
  cepat, lebih liar saat sprint → ubah physics param (stiffness/gravity
  scale KawaiiPhysics) berdasarkan `bSedangGlide`/`bSedangSprint` di ABP
- **Angin dunia**: Wind Directional Source aktor → KawaiiPhysics baca →
  rambut ikut arah angin global

## 38B. Wetness System

Basah saat hujan/renang:
```
[Cek: di air ATAU weather Rain?]
   True → [Set Wetness param naik cepat ke 1.0]
   False → [Wetness turun perlahan ke 0 dalam 5-10 detik]  (mengering)
```
- **Material**: param `Wetness` (dynamic material instance) → albedo ×0.85,
  roughness turun (specular naik), + droplet normal overlay. Konsisten
  dengan MPC weather ([ART_D](../../aether-realm-ue5/Docs/ART_D_ENVIRONMENT.md))
- **Rambut**: saat basah, naikkan damping physics (gerak lebih berat)

## 38C. Foot IK & Ground Adaptation

Kaki nempel sempurna di tanah miring (Control Rig — [Modul 07](../07-animasi.md)):
- **Foot placement**: sphere trace tiap kaki ke tanah, offset kaki + putar
  telapak ikut normal permukaan → di lereng, kaki tidak menembus/melayang
- **Pelvis adjust**: turunkan pelvis = min ketinggian kedua kaki (di tangga/
  lereng badan ikut miring natural)
- **Hand IK** saat climb: tangan nempel ke dinding
- Detail ekstra (jari kaki nekuk di tepi jurang) = nice-to-have, skip untuk v1

> Control Rig "Basic Foot IK" template UE5 sudah 80% jadi — pakai itu.

## 38D. Ekspresi Wajah & Lip Sync

Butuh morph target / blend shape (dari VRoid sudah ada — [ART_A](../../aether-realm-ue5/Docs/ART_A_CHARACTERS.md)):

**Ekspresi by state** (ABP → set morph target weight):
| State | Ekspresi |
|---|---|
| Idle | blink random (timer 3-6s), senyum tipis |
| Combat | alis turun, mata fokus |
| Kena hit | mata terpejam, ekspresi sakit (0.3s) |
| Low HP | lelah, napas (dada naik-turun) |
| Burst | mata glow (emissive), penuh power |

**Lip sync** (saat dialog):
- Simple: morph A/I/U/E/O di-cycle acak selama teks jalan (cukup meyakinkan
  untuk indie)
- Proper: plugin (Oculus LipSync / MetaHuman) analisa audio → viseme. Mahal,
  skip untuk v1.

## Prioritas realistis (solo dev)

| Fitur | Worth it v1? |
|---|---|
| Foot IK slope | ✅ ya — kelihatan banget kalau tidak ada |
| Secondary motion state-based | ✅ murah, dampak besar |
| Blink + ekspresi combat | ✅ murah |
| Wetness | 🟡 kalau ada hujan/air |
| Lip sync proper | ❌ v2 — pakai simple A/I/U/E/O dulu |

## ✅ CHECKPOINT

- [ ] Kaki nempel di lereng (foot IK)
- [ ] Rambut beda saat glide vs sprint
- [ ] Blink random + ekspresi berubah saat combat/hit
- [ ] (opsional) basah saat hujan, mengering perlahan

➡️ [Bagian 39 — Audio Next-Level](39-audio-nextlevel.md)
