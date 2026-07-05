# Bagian 14 — Damage System (Interface + Floating Numbers)

Satu sistem damage untuk semua: player, enemy, barang pecah. Kuncinya:
**Blueprint Interface** ([Modul 04](../04-blueprint-lanjutan.md)).

## 14A. Interface BPI_Damageable

1. Klik kanan Content Browser → Blueprints → **Blueprint Interface** →
   `BPI_Damageable`.
2. Functions:
   - `TerimaDamage` — Input: `DamageAmount` (Float), `DamageType` (Name)
   - `AmbilHealth` — Output: `CurrentHP` (Float), `MaxHP` (Float)

> ⚠️ Jangan namai `TakeDamage` — bentrok dengan function bawaan engine
> di Actor (bikin error/warning membingungkan). Nama sendiri = aman.

## 14B. Implement di Karakter

1. `BP_ThirdPersonCharacter` → toolbar **Class Settings** → Details →
   **Implemented Interfaces → Add** → `BPI_Damageable`.
2. Variabel baru: `CurrentHP` (Float, 100), `MaxHP` (Float, 100).
3. Panel My Blueprint → Interfaces → double-click **TerimaDamage**:

```
[Event TerimaDamage] (DamageAmount, DamageType)
   ─▶ [Set CurrentHP] = [Clamp] (CurrentHP - DamageAmount, 0, MaxHP)
   ─▶ [ResetCombo]                          ← kena hit = combo putus (13C)
   ─▶ [Branch: CurrentHP <= 0]
        True ─▶ [Mati]  ← custom event: Print "MATI" dulu; nanti respawn
        False ─▶ (opsional: play montage hit reaction)
```

4. **AmbilHealth** (function, ada Return node): sambungkan CurrentHP &
   MaxHP ke output.

### Kirim damage dari serangan (sambungan Bagian 13D)

Ganti Print String "KENA!" di `DoAttackTrace`:

```
[Break Hit Result] → Hit Actor
   ─▶ [TerimaDamage (Message)]      ← PENTING: versi "Message" (amplop ✉)
        Target: Hit Actor
        Damage Amount: 20
        Damage Type: "Physical"
```

**(Message)** = kirim ke actor apa pun; yang implement interface merespons,
yang tidak, diam. Tanpa cast — chest, enemy, barrel semua bisa didamage
dengan node yang sama.

## 14C. Floating Damage Number

### Widget

1. **Widget Blueprint** → `W_DamageNumber`:
   - Hierarchy: hapus Canvas → ganti root **Size Box** (biar ringkas) →
     child **Text Block** → rename `TxtDamage`, font 28 bold putih,
     centang **Is Variable** ✓
2. Tab **Animations** (jendela bawah) → **+ Animation** → `FloatUp`:
   - Pilih TxtDamage → + Track → **Transform**: keyframe Translation Y
     `0 → -80` (0s → 0.8s)
   - + Track → **Color and Opacity**: Alpha `1 → 0`
3. Graph → **Event Construct**:

```
[Event Construct] ─▶ [Play Animation] FloatUp
   ─▶ [Delay 1.0] ─▶ [Remove from Parent]
```

4. Function publik `SetDamage` (Input: Float): `TxtDamage → SetText`
   pakai [Floor] angka → To Text.

### Spawn di posisi musuh

Custom event `TampilkanDamage` di karakter (dipanggil dari `DoAttackTrace`
setelah TerimaDamage, input: Amount + Location):

```
[Create Widget] W_DamageNumber
   ─▶ [SetDamage] (Amount)
   ─▶ [Add to Viewport]
   ─▶ [Project World to Screen]  (Player Controller, Location + (0,0,100))
   ─▶ [Set Position in Viewport] (Screen Position hasil project)
```

Serang musuh → angka putih muncul, naik, hilang. RPG feel ✓.

> Versi produksi (warna per elemen, crit kuning, scale) —
> `aether-realm-ue5` `UDamageNumberWidget` (C++). Konsep persis sama.

## ✅ CHECKPOINT

- [ ] Interface: serangan bisa damage APA PUN yang implement (tes: implement
      di BP_Chest → peti bisa "dipukul mati")
- [ ] HP berkurang, 0 = event Mati
- [ ] Angka damage melayang di posisi target

➡️ [Bagian 15 — Enemy Sederhana](15-enemy-sederhana.md)
