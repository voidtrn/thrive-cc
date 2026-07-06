# Bagian 36 — Localization (Multi-Bahasa) · *lanjutan*

Game dalam banyak bahasa: EN/JP/ID/CN/KR. Kunci: **jangan pernah tulis teks
langsung** — semua lewat sistem localization.

## Cara benar UE5: String Table + Localization Dashboard

Ada 2 lapis. Outline umum sering campur — ini yang benar:

1. **String Table** = kumpulan `Key → Source Text` (bahasa sumber, mis. EN).
   Ini yang di-referensi UI/BP.
2. **Localization Dashboard** (`Tools → Localization Dashboard`) = tool yang
   "gather" semua teks → generate file terjemahan (`.po`) per culture →
   translator isi → compile.

> Terjemahan **tidak** disimpan sebagai kolom di String Table. String Table
> cuma sumber. Terjemahan = per-culture di Dashboard. Ini beda dari
> gambaran "1 tabel banyak kolom bahasa".

## 36A. String Table

1. Klik kanan → Miscellaneous → **String Table** → `ST_GameText`.
2. Isi Key + Source String (EN):

| Key | Source (EN) |
|---|---|
| UI_Play | Play |
| UI_Settings | Settings |
| UI_QuestAccepted | Quest Accepted! |
| QT_Welcome | Welcome, Traveler! |

## 36B. Pakai di UI & BP

- **UMG Text**: jangan ketik teks. Details → Text → dropdown → **Bind to
  String Table** → pilih `ST_GameText` + Key.
- **Blueprint**: node **Get Text from String Table** (Table ID
  `/Game/.../ST_GameText`, Key `UI_QuestAccepted`) → Set Text.
- **FText everywhere**: variabel teks = `FText` (bukan FString) — FText yang
  localizable.

## 36C. Localization Dashboard (terjemahan)

1. `Tools → Localization Dashboard`.
2. Target `Game` → **Gather Text** (kumpulkan semua FText + String Table).
3. **+ New Culture**: tambah `ja`, `id`, `zh-Hans`, `ko`.
4. **Export** `.po` per culture → kasih ke translator → isi → **Import**.
   (Atau edit langsung di Dashboard's translation editor.)
5. **Compile Text** → generate `.locres` yang dipakai game.

## 36D. Pilih Bahasa (Settings)

`W_Settings` → dropdown bahasa:
```
[OnLanguageChanged] (CultureCode: "en"/"ja"/"id"/"zh-Hans"/"ko")
   [Set Current Culture] (node — target culture code)
   [Simpan preference ke save]
   (UI otomatis refresh karena Text terikat String Table)
```

Node: **Set Current Culture**. Simpan pilihan, apply saat BeginPlay.

## 36E. Hal yang sering kelupaan

- **Font glyph**: pastikan font support karakter JP/CN/KR (Noto Sans CJK).
  Font default UE tidak punya kanji → kotak-kotak. Set font fallback.
- **Text expansion**: Jerman/Rusia lebih panjang → UI harus fleksibel
  (auto-wrap, size to content), jangan fixed-width mepet.
- **Angka/tanggal**: `FText::AsNumber`/`AsDate` otomatis format per culture.
- **Voice**: audio per bahasa folder terpisah, pilih by culture (opsional,
  mahal — [Bagian ART_C]).

## ✅ CHECKPOINT

- [ ] Semua UI text dari String Table (nol hardcoded)
- [ ] Ganti bahasa di settings → UI berubah instan
- [ ] Font support glyph JP/CN (tidak kotak-kotak)
- [ ] Preference bahasa tersimpan antar sesi

➡️ [Bagian 37 — Steam Deck Optimization](37-steam-deck.md)
