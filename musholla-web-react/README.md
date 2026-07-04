# Musholla Web React

Website mushola: landing page publik + CMS admin. React 19, Vite 8, React Router 7, Bootstrap 5.

## Menjalankan

```bash
npm install
npm start        # dev server
npm run build    # production build ke dist/
```

Node >= 22 (lihat `.nvmrc`).

## Struktur

- **Landing page (`/`)** — jadwal sholat (auto dari API Aladhan/KEMENAG atau manual), running text pengumuman, info khatib Jumat, highlight kas, galeri, kegiatan rutin, kontak pengurus (klik WhatsApp), form usulan warga, footer alamat + Google Maps.
- **CMS (`/admin`)** — login multi-role:

| Role | Akses |
|---|---|
| `admin` / `admin123` | semua modul |
| `bendahara` / `bendahara123` | dashboard, ZIS, inventaris |
| `marbot` / `marbot123` | dashboard, konten, kegiatan |

Modul CMS: dashboard (statistik + log aktivitas + usulan warga), konten landing (pengumuman dengan expired otomatis, galeri, jadwal sholat, profil mushola), kegiatan (kajian, khatib & imam Jumat, kalender bulanan bisa dicetak), inventaris (kondisi + riwayat perbaikan), ZIS (panel kas + pengajuan bantuan dengan review), pengurus (struktur DKM + user login).

## Penyimpanan data

Semua data disimpan di `localStorage` (`src/helpers/store.js`) supaya bisa langsung demo tanpa backend. Untuk produksi, ganti isi `getDB`/`saveDB`/`update` dengan panggilan API — interface-nya sudah dipusatkan di satu file sehingga komponen tidak perlu diubah.

Password user juga tersimpan plaintext di localStorage — hanya untuk demo. Wajib pindah ke backend dengan hash password sebelum dipakai sungguhan.

## Integrasi web iuran

Set di `.env`:

```
VITE_IURAN_URL = 'https://iuran-anda.com'   # tombol Laporan Keuangan & link ZIS
VITE_IURAN_API = ''                          # endpoint API saldo kas (opsional)
VITE_PRAYER_CITY = 'Jakarta'                 # kota jadwal sholat otomatis
```
