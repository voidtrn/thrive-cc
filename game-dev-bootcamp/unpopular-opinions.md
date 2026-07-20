# 🔥 Unpopular Opinions — Yang Jarang Dikatakan di Tutorial

> Pendapat dari lapangan. Boleh tidak setuju — tapi pertimbangkan dulu, karena tiap poin lahir dari kuburan proyek gagal.

## Tentang Belajar

### 1. Tutorial hell lebih berbahaya daripada tidak belajar sama sekali
Menonton 200 jam tutorial memberi ilusi kemampuan. Kamu merasa paham — sampai membuka proyek kosong dan lumpuh. Rasio sehat: **1 jam nonton : 3 jam praktik tanpa nonton**. Kalau kamu tidak bisa membuat ulang isi tutorial dari ingatan + dokumentasi, kamu belum belajar apa-apa.

### 2. "Belajar C++ dulu baru Unreal" adalah nasihat yang membunuh semangat
Jalur klasik "kuasai bahasa dulu" membuat orang berhenti di pointer sebelum pernah merasakan membuat game. Blueprint dulu → rasakan serunya → C++ menyusul SAAT kamu sudah punya alasan nyata memakainya. Motivasi adalah sumber daya paling langka pemula — jangan dibakar di linked list.

### 3. Game jam lebih berharga daripada kursus mana pun
48 jam memaksa scope kecil, keputusan cepat, dan SELESAI. Satu game jam mengajarkan lebih banyak soal shipping daripada 6 bulan kursus. Ikuti Ludum Dare / GMTK Jam sebelum merasa "siap" — tidak ada yang pernah siap.

### 4. Kamu tidak butuh matematika hebat untuk mulai (tapi vektor wajib)
Kalkulus? Nanti saja. Tapi dot product & cross product dipakai SETIAP HARI (musuh di depan/belakang? seberapa sejajar arah?). Belajar 2 konsep itu saja dulu, sisanya menyusul saat dibutuhkan.

## Tentang Engine & Teknis

### 5. Bikin engine sendiri = hobi valid, strategi bisnis bunuh diri
<a name="bikin-engine-sendiri"></a>"Real programmer bikin engine sendiri" — kata orang yang tidak pernah rilis game. Membuat engine mengajarkan banyak; MERILIS GAME mengajarkan lebih banyak + membayar tagihan. Kecuali engine ADALAH produkmu, pakai UE/Godot/Unity dan selesaikan game.

### 6. Blueprint bukan "kode kelas dua"
Sebagian game komersial sukses nyaris full Blueprint. Bottleneck proyekmu hampir pasti desain & konten, bukan kecepatan eksekusi VM Blueprint. Pindah ke C++ karena profiler bilang begitu, bukan karena gengsi Reddit.

### 7. Grafis realistis adalah jebakan untuk indie
Lumen + Nanite menggoda pemula mengejar fotorealisme — lalu game-mu dibandingkan langsung dengan output studio 500 orang, dan kalah. Art style OKE yang KONSISTEN (cel-shade, low-poly, pixel-hybrid) menang melawan realisme setengah jadi, lebih murah diproduksi, dan lebih mudah dikenali di thumbnail. Thumbnail = marketing.

### 8. Fitur multiplayer akan membunuh game pertamamu
"Kayak Valheim tapi..." Stop. Multiplayer menggandakan-lipat tiga biaya SEMUA fitur, dan komunitas kosong di launch = mati (masalah telur-ayam server sepi). Single-player dulu. Titik.

### 9. Kebanyakan optimasi pemula adalah pemborosan waktu
Pemula mengoptimasi yang terasa "boros" (micro-optimization Blueprint) sambil menaruh 40 lampu shadow dinamis di satu ruangan. Profiler dulu (`stat unit`), intuisi belakangan. Dan: game yang belum seru tidak perlu 120 FPS.

## Tentang Produksi

### 10. Scope-mu masih 5× kebesaran — ya, setelah kamu mengecilkannya juga
Aturan praktis yang menyakitkan: perkiraan waktumu × 3 = realistis. Fitur yang kamu anggap "kecil" (inventory! dialog! save di mana saja!) masing-masing adalah subsistem berminggu-minggu. Potong sampai terasa "terlalu kecil" — itu baru ukuran yang benar.

### 11. Game design document 50 halaman = prokrastinasi berkostum kerja
Tidak ada yang membacanya, dan halaman 30 sudah basi saat prototype pertama jadi. GDD hidup 5–10 halaman + prototype yang bisa dimainkan > tome suci 50 halaman. Dokumen melayani game, bukan sebaliknya.

### 12. Playtest bukan menanyakan "seru nggak?"
Teman akan bilang "seru kok" karena sopan. Amati TANGAN dan WAJAH mereka: di mana mereka nyasar, kapan mereka mengecek HP, kapan mereka menguap. Data = perilaku, bukan opini. Dan playtester yang bingung TIDAK PERNAH salah — desainmu yang gagal berkomunikasi.

### 13. Crunch adalah kegagalan perencanaan, bukan lencana kehormatan
Industri meromantisasi lembur. Kenyataan: setelah minggu-minggu 60 jam, output per jam ANJLOK dan bug bertambah — kamu membayar bunga atas kode buruk yang ditulis kelelahan. Scope realistis + potong fitur > crunch.

## Tentang Bisnis

### 14. Game bagus TIDAK menjual dirinya sendiri
Mitos paling mahal di indie dev. Steam menerima 14.000+ game/tahun; "build it and they will come" adalah survivorship bias dari 0,1% yang viral. Marketing dimulai hari pertama, dan pemilihan genre adalah keputusan marketing terbesarmu.

### 15. Passion project-mu mungkin harus jadi game ketiga, bukan pertama
Game impianmu butuh skill yang belum kamu punya dan reputasi yang belum kamu bangun. Rilis 1–2 game kecil dulu: belajar shipping, bangun audiens, kumpulkan modal — LALU kerjakan magnum opus dengan peluru cukup. Menyerahkan game impian ke tangan pemula (dirimu yang sekarang) justru menzaliminya.

### 16. Harga murah tidak membuat game-mu lebih laku
$2.99 tidak menjual lebih banyak dari $9.99 untuk game yang sama — dia hanya memberi sinyal "murahan", memotong margin diskon masa depan, dan menarik pembeli paling cerewet. Hargai kerjamu; diskon adalah alat, bukan identitas.

### 17. Sebagian besar nasihat gamedev di internet ditulis orang yang belum pernah rilis game
Termasuk, secara statistik, sebagian dokumen ini 😄. Filter semua nasihat (juga ini) lewat: "apakah penulisnya pernah mengalami konsekuensi dari nasihat ini?" Postmortem developer yang benar-benar rilis (tersedia banyak di GDC Vault) > hot take forum.

---

*Setuju? Tidak setuju? Bagus — berarti kamu berpikir. Uji semuanya di proyekmu sendiri.*
