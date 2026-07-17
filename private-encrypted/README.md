# Private — Encrypted

Folder ini berisi dokumen **pribadi** yang sengaja dienkripsi. Isinya tidak untuk publik.

## Isi

| File | Keterangan |
|------|------------|
| `analisis-lengkap.md.enc` | Dokumen pribadi terenkripsi (AES-256-CBC, PBKDF2, 200k iterasi, salted). |

## Cara membuka (dekripsi)

Butuh **passphrase** (dikirim terpisah, TIDAK disimpan di repo ini).

```bash
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 \
  -in analisis-lengkap.md.enc \
  -out analisis-lengkap.md \
  -pass pass:'PASSPHRASE_DI_SINI'
```

Ganti `PASSPHRASE_DI_SINI` dengan passphrase yang diberikan. Hasilnya file `analisis-lengkap.md` yang bisa dibaca.

Alternatif (passphrase diminta interaktif, tidak masuk shell history):

```bash
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 \
  -in analisis-lengkap.md.enc -out analisis-lengkap.md
# lalu ketik passphrase saat diminta
```

## Catatan keamanan

- Passphrase **tidak** ada di repo. Tanpa passphrase, file tidak bisa dibuka.
- Repo ini public → ciphertext bisa disalin siapa saja. Keamanan bergantung penuh pada kerahasiaan passphrase.
- Ciphertext yang sudah ter-push tersimpan di git history secara permanen (termasuk fork/mirror), walau file dihapus di commit berikutnya.
- Setelah dekripsi, jangan commit file plaintext-nya. `.gitignore` sudah mengabaikan file `.md` hasil dekripsi di folder ini.
