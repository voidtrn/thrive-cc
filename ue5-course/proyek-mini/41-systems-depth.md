# Bagian 41 — Systems Depth (Crafting, Photo Mode, Housing, Events) · *super polish*

Sistem tambahan yang memperdalam gameplay. Pilih yang cocok — tidak semua wajib.

## 41A. Crafting

Cooking sudah ([Bagian 28](28-cooking-shop.md) / `UConsumableComponent` C++).
Perluas pola yang sama:
- **Alchemy**: material → potion (buff sementara) — sama seperti cooking,
  DT beda
- **Forge**: ore → weapon ascension material
- **Crafting table** di kota/base (interact → UI resep)

**Recipe unlock**: dari quest/chest/beli, atau auto-unlock saat dapat
material pertama. Simpan `UnlockedRecipes` (Array Name) di save.

> Semua crafting = pola identik: DT resep (bahan→hasil) + cek inventory +
> konsumsi + produksi. Reuse `CookItem` C++, ganti tabel.

## 41B. Photo Mode

Fitur community favorit (gratis marketing — orang share screenshot):
```
[TogglePhotoMode]
   [Set Global Time Dilation 0]      ← freeze game
   [Spawn free-orbit camera] (detach dari player, kontrol WASD+mouse)
   [Hide HUD]
   UI: slider FOV, Depth of Field (aperture), Exposure, Filter (LUT),
       toggle Hide Character, pilih pose (set anim frame)
   [Take Screenshot] → node "High Res Screenshot" → save ke folder
   [Exit] → time dilation 1, restore camera + HUD
```
Node kunci: `Execute Console Command "HighResShot 2"` (2× resolusi) atau
`Take High Res Screenshot`. Post-process (DoF/exposure) via dynamic PP.

## 41C. Housing (Serenitea Pot mini)

Skala kecil realistis:
- 1 area kecil bisa di-decorate (level terpisah / instance)
- **Furniture**: item dari quest/craft/beli → mode placement
- **Placement**: grid-based (snap) lebih mudah dari free. Ghost preview →
  konfirmasi → spawn actor furniture → simpan transform di save
- Teman visit (co-op — [Bagian 31](31-coop-multiplayer.md)) — advanced

> Housing = **scope besar**. Untuk v1 solo dev: SKIP atau versi super minimal
> (taruh beberapa furniture di 1 spot). Post-launch feature.

## 41D. In-Game Events (Framework)

```
[EventManager] (Game Instance Subsystem / Actor)
   [BeginPlay / daily check]
      [Get server time] (Steam time / FDateTime::UtcNow)
      [For Each event di DT_Events]
         [Branch: sekarang antara StartDate & EndDate?]
           True → aktifkan konten event (quest/domain/banner khusus)
           False → nonaktif
```
- Event banner: login saat event = hadiah (cek tanggal login)
- Event quest/domain: konten sementara
- Event currency: kumpul → tukar item limited (shop event — pola [Bagian 28](28-cooking-shop.md))

## Prioritas realistis

| Sistem | Worth v1? |
|---|---|
| Crafting (reuse cooking) | ✅ murah, nambah depth |
| Photo Mode | ✅ **ya** — marketing gratis, effort sedang |
| Events framework | 🟡 kalau mau live-service |
| Housing | ❌ v2 — scope besar |

## ✅ CHECKPOINT

- [ ] Crafting alchemy/forge jalan (reuse pola cooking)
- [ ] Photo mode: freeze, free cam, hide UI, screenshot
- [ ] (opsional) event aktif/nonaktif by tanggal

➡️ [Bagian 42 — Live Service & Tech](42-liveservice-tech.md)
