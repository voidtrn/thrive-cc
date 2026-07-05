# PHASE 7 — UI/Menu System (langkah editor)

C++ selesai: `UMainHUDWidget` (data binding HUD), `UPartyManagerComponent`
(swap system), `FCharacterDefRow` (DT_Characters), `AMinimapCaptureActor`,
`UUIStatics` (rarity color, resonance, settings), inventory/artifact types,
map pins (max 99), wish history (6 bulan).

---

## 7A. HUD (`WBP_MainHUD`, parent: **MainHUDWidget**)

Semua data sudah BlueprintPure — bind langsung, tanpa cast:

| Elemen layout | Binding |
|---|---|
| Party HP bars (kiri atas, 4 slot) | `GetPartyMemberHUD(0-3)`: Name/Icon/HPFraction/bActive/bAlive. Slot aktif = highlight border |
| Minimap (kanan atas, bulat) | Image → material `M_MinimapMask` (lihat 7C) |
| Crosshair dot | Image statis center |
| Quest tracker (kiri bawah) | `GetTrackedQuestName()` + `GetTrackedQuestObjective()` ("0/3 Hilichurls" otomatis) |
| Skill icon [E] | radial progress `GetSkillCooldownFraction()` (material radial mask) |
| Burst icon [Q] | ring energy `GetBurstEnergyFraction()`, glow saat `IsBurstReady()` |
| Stamina wheel | `GetStaminaFraction()`, visible = `ShouldShowStaminaBar()` (muncul hanya saat kepakai — gaya Genshin) |
| Character icons 1-4 (kanan bawah) | icon dari `GetPartyMemberHUD`, klik → `PartyManager->SwapToSlot(i)` |

### Party swap wiring

1. `BP_OpenWorldPC`: Add Component → **PartyManagerComponent**, assign
   `CharacterTable` = DT_Characters.
2. DT_Characters (Row Struct **CharacterDefRow**): row name = CharacterID
   (`Hero_Sword`, `Mage_Fire`), isi class BP karakter + icon + portrait.
3. GameMode BP BeginPlay → `PartyManager->InitializeParty()`.
4. Bind `IA_Swap1-4` → `SwapToSlot(0-3)`. Swap preserve HP/energy per
   karakter (GameInstance), velocity carry (swap di udara smooth),
   cooldown 1s, karakter mati tidak bisa di-swap (revive di statue).

## 7B. Menu Screens (ESC → `WBP_PauseRoot`, tab switcher)

Semua buka via `PC->SetInputContextMode(UI)`, tutup balik `Default`.

| Screen | Data source C++ |
|---|---|
| **Character** | stats langsung dari `ACharacterBase` properti; artifacts: `GI->OwnedArtifacts` filter `EquippedCharacter`; talents/constellation = Phase 8 |
| **Inventory** | `GI->InventoryItems` (map id→count) + DT_Items (`FItemDefRow`) untuk icon/rarity/category; tab = filter `EItemCategory`; border color `UUIStatics::GetRarityColor` |
| **Map** | fullscreen: capture kedua (ortho besar) atau tekstur peta statis; waypoint `AWaypoint` semua actor → klik `TeleportHere`; pins `GI->AddMapPin` (max 99 otomatis) |
| **Wish** | Phase 5 — banner list DT_Banners, history `GI->WishHistory` (sudah auto-prune 6 bulan) |
| **Party Setup** | edit `GI->SavedPartyCharacterIds` (4 slot, drag-drop dari owned list = `GI->OwnedWishItems` filter karakter); resonance display `UUIStatics::GetPartyResonances` |
| **Journal** | Phase 6 — `QuestManager->GetActiveQuests()` dst |
| **Battle Pass** | skip dulu (spec: kalau sempat) |
| **Settings** | `GI->GameSettings` + `UUIStatics::ApplyGraphicsSettings`; audio: SoundMix override per class; keybind: Enhanced Input User Settings (UE 5.3+) `IEnhancedInputSubsystemInterface::AddPlayerMappedKey` |

## 7C. Detail Spesifik

### Character screen 3D preview

1. Level kecil terpisah ATAU spawn di depan kamera: `ACharacterPreviewStage`
   (BP saja cukup): SkeletalMesh + 2 SpotLight (key hangat kiri-atas, rim
   biru belakang) + SceneCapture2D → RT_CharPreview 1024x1024.
2. UMG: Image sample RT. Mouse drag = rotate mesh yaw; scroll = FOV/jarak.
3. Idle anim loop di preview mesh; weapon socket attach terlihat.

### Inventory grid

- WrapBox / UniformGrid, tiap item = `WBP_ItemSlot` (Button + Image icon +
  border `GetRarityColor` + count text)
- Right click → detail popup; drag-drop equip pakai UMG `OnDragDetected`
- Sort: array items → sort by Rarity/Level/Type/Name di BP sebelum populate
- Filter: toggle buttons set flag → re-populate

### Minimap

1. Buat `RT_Minimap` (Render Target 512x512).
2. Place `AMinimapCaptureActor` di level, assign RT. Follow player +
   capture 15fps sudah C++. Zoom: scroll → `SetZoom()`.
3. Material `M_MinimapMask` (UI domain): sample RT, **RadialGradientExponential**
   sebagai opacity mask (bulat), rotasi UV = player yaw
   (`GetPlayerCameraManager → GetCameraRotation.Yaw` via dynamic material param).
4. Icons overlay: canvas di atas image — posisi = (WorldPos - PlayerPos)
   diputar yaw, skala per OrthoWidth. Warna: enemy merah, NPC hijau,
   quest kuning, waypoint biru.

## Checklist Phase 7

- [ ] HUD: 4 HP bar update, slot aktif highlight, klik icon = swap
- [ ] Swap 1-4 instan, HP/energy karakter kebawa, velocity smooth, mati ke-block
- [ ] Skill [E] radial cooldown muter, [Q] ring energy + glow ready
- [ ] Stamina wheel muncul saat sprint/climb/glide, hilang saat penuh
- [ ] Quest tracker "0/3" update realtime
- [ ] Minimap bulat rotate ikut player, zoom scroll, icon berwarna
- [ ] Inventory 6 tab, border rarity, sort & filter
- [ ] Map fullscreen: klik waypoint = teleport, pin max 99
- [ ] Party setup: drag-drop, resonance tampil (2 Pyro = Fervent Flames dst)
- [ ] Settings apply: quality preset + volume + keybind remap persist
