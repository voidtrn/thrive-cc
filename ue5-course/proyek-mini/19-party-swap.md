# Bagian 19 — Party Swap (Ganti Karakter 1-4)

Fitur paling ikonik Genshin: tekan 1-4 = ganti karakter di tengah combat.

## Dua pendekatan (pilih sadar)

| | A. Ganti Mesh (track ini) | B. Possess pawn baru (produksi) |
|---|---|---|
| Cara | 1 karakter, tukar Skeletal Mesh + stats | Spawn pawn beda class, Controller pindah |
| Plus | Sederhana, semua logic tetap 1 BP | Tiap karakter beda class/skill/movement |
| Minus | Semua karakter share logic sama | Lebih kompleks |

Kita pakai **A** — cukup untuk beda visual + stats + elemen skill.
Versi B = `UPartyManagerComponent` di `aether-realm-ue5` (bedah di Modul 14).

## 19A. Data Karakter

1. **Structure** `S_CharacterData`:
   - `CharacterID` (Name), `CharacterName` (Text)
   - `CharacterMesh` (Skeletal Mesh — Object Reference)
   - `AnimBP` (Anim Instance — **Class** Reference) ← outline sering lupa;
     mesh beda skeleton = WAJIB ganti ABP juga
   - `Element` (Name), `Icon` (Texture 2D)
   - `BaseHP`, `BaseATK` (Float)
2. **Structure** `S_CharacterState` (kondisi runtime per karakter):
   - `CurrentHP` (Float), `SkillTimer` (Float)
3. Variables di `BP_ThirdPersonCharacter`:
   - `PartyMembers` (Array of S_CharacterData) — isi 2-4 karakter di
     Class Defaults (mesh: Manny, Quinn, VRoid-mu, dst)
   - `CharacterStates` (Array of S_CharacterState)
   - `CurrentPartyIndex` (Integer, 0)
4. **BeginPlay**: loop PartyMembers → isi CharacterStates default
   (CurrentHP = BaseHP masing-masing).

## 19B. Input

4 Input Action `IA_Swap1..4` (Digital) → IMC mapping key `1` `2` `3` `4`.

## 19C. Logic Swap

Custom event `SwapKarakter` (Input: `NewIndex` Integer):

```
[SwapKarakter]
   │
   ▼
[Branch: NewIndex == CurrentPartyIndex]  True → return (sudah aktif)
[Branch: NewIndex >= panjang PartyMembers] True → return (slot kosong)
[Branch: CharacterStates[NewIndex].CurrentHP <= 0] True → return (mati!)
   │
   ▼ — SIMPAN state karakter lama —
[Set Array Elem CharacterStates[CurrentPartyIndex]]
   CurrentHP = CurrentHP (var utama), SkillTimer = SkillTimer
   │
   ▼ — GANTI visual —
[Get Mesh → Set Skeletal Mesh Asset] = PartyMembers[NewIndex].CharacterMesh
[Get Mesh → Set Anim Instance Class] = PartyMembers[NewIndex].AnimBP
   │
   ▼ — MUAT state karakter baru —
[Set CurrentHP]  = CharacterStates[NewIndex].CurrentHP
[Set MaxHP]      = PartyMembers[NewIndex].BaseHP
[Set SkillTimer] = CharacterStates[NewIndex].SkillTimer  ← cooldown PER karakter
   │
   ▼
[Set CurrentPartyIndex = NewIndex]
[ResetCombo]                              ← combo putus saat ganti (13C)
[Spawn NS_SwapFlash di lokasi karakter]   ← Niagara burst putih singkat
[Play Sound "swap"]
```

Input handler: `IA_Swap1 Started → SwapKarakter(0)` … `IA_Swap4 → SwapKarakter(3)`.

> Kenapa simpan/muat state? Tanpa itu: swap = HP reset & cooldown hilang =
> exploit. Persis alasan yang sama dengan `PartyCharacterData` di project C++.

## 19D. UI Party di HUD

`W_HUD` → Horizontal Box kanan bawah, 4 slot `W_PartySlot` (bikin widget kecil):

```
┌──────┐  Isi W_PartySlot:
│ 🖼️   │  - Image (Icon karakter)
│ ▓▓▓░ │  - Progress Bar HP mini (merah)
│ [1]  │  - Text angka tombol
└──────┘  - Border (highlight kuning kalau aktif)
```

1. `W_PartySlot` variabel: `SlotIndex` (int, Expose on Spawn ✓).
2. Di `W_HUD` Event Construct: loop 0-3 → Create W_PartySlot →
   Add Child to Horizontal Box.
3. Update — function `RefreshParty` di W_HUD (dipanggil dari karakter tiap
   swap & tiap HP berubah — **jangan binding per-frame**, kebiasaan bagus):
   - Icon dari `PartyMembers[i].Icon`
   - HP bar dari `CharacterStates[i].CurrentHP / BaseHP`
   - Border kuning kalau `i == CurrentPartyIndex`
4. Klik slot = swap juga: Button di W_PartySlot → OnClicked →
   `SwapKarakter(SlotIndex)`.

## ✅ CHECKPOINT

- [ ] 1-4 ganti karakter, mesh + animasi ikut ganti
- [ ] HP & cooldown tersimpan per karakter (swap bolak-balik ≠ reset)
- [ ] Karakter HP 0 tidak bisa dipilih
- [ ] HUD: highlight aktif + 4 HP bar akurat

➡️ [Bagian 20 — Minimap](20-minimap.md)
