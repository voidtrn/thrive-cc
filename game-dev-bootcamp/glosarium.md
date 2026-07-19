# 📖 Glosarium — Istilah Asing Dijelaskan Bahasa Manusia

> Urut alfabet. Istilah di-*miringkan* dalam modul merujuk ke sini.

## A–B

| Istilah | Arti |
|---------|------|
| **AAA (triple-A)** | Game budget raksasa dari studio besar (GTA, Call of Duty). Lawannya: indie. |
| **Actor** | Objek apa pun yang bisa ditaruh di level UE (benda, lampu, karakter, trigger). |
| **AIController** | "Otak" yang mengendalikan Pawn non-pemain. |
| **Alpha** | Milestone: semua fitur ada tapi masih kasar/bug. |
| **Anim Notify** | Penanda di timeline animasi yang memicu event (suara langkah, cek pukulan). |
| **Animation Blueprint (ABP)** | Logika pemilih & pencampur animasi karakter. |
| **Animation Montage** | Wadah animasi untuk aksi terpicu (serangan, roll) + section/combo. |
| **ARPU** | Average Revenue Per User — rata-rata pendapatan per pemain. |
| **Asset** | Setiap file konten game: model, tekstur, suara, Blueprint, dll. |
| **Attenuation** | Aturan melemahnya suara berdasarkan jarak/arah. |
| **Baking (lighting)** | Pra-hitung cahaya jadi tekstur (era pra-Lumen). |
| **Behavior Tree (BT)** | Struktur pohon keputusan AI: selector, sequence, task, decorator. |
| **Beta** | Milestone: konten lengkap, fokus perbaikan bug & balancing. |
| **Blackboard** | "Memori" AI — kumpulan variabel yang dibaca/ditulis Behavior Tree. |
| **Blend Space** | Pencampur animasi berdasar parameter (kecepatan/arah) → transisi mulus. |
| **Blockout / Greybox** | Versi level dari kotak polos untuk uji gameplay sebelum dipercantik. |
| **Blueprint (BP)** | Bahasa pemrograman visual UE (node + kabel). |
| **Build** | Versi game yang dikompilasi & dipaketkan untuk dimainkan di luar editor. |

## C–D

| Istilah | Arti |
|---------|------|
| **Capsule art** | Gambar sampul game di toko (Steam). Penentu klik pertama. |
| **Cast (Blueprint)** | Mengubah anggapan tipe objek ("anggap Actor ini adalah BP_Pintu"). |
| **Collision** | Sistem deteksi tabrakan/sentuhan antar objek. |
| **Component** | Kepingan kemampuan yang dipasang ke Actor (mesh, audio, kamera, custom). |
| **Content Browser** | Panel penjelajah semua aset proyek. |
| **Cook / Cooking** | Konversi aset editor ke format platform target saat packaging. |
| **CPI** | Cost Per Install — biaya iklan per satu unduhan (mobile UA). |
| **Crunch** | Lembur ekstrem menjelang deadline. Berbahaya & sering tanda manajemen buruk. |
| **DAU / MAU** | Daily/Monthly Active Users — pemain aktif harian/bulanan. |
| **Decorator** | Kondisi pada cabang Behavior Tree ("jalankan hanya bila…"). |
| **Dedicated server** | Server game tanpa tampilan yang berjalan di mesin cloud. |
| **Delta time (DeltaSeconds)** | Waktu sejak frame sebelumnya; pengali agar logika bebas dari FPS. |
| **Devlog** | Log/berita perkembangan development untuk publik. |
| **DLC** | Downloadable Content — konten tambahan berbayar/gratis pasca rilis. |
| **Draw call** | Satu perintah CPU ke GPU untuk menggambar; terlalu banyak = lambat. |
| **DX12 / Vulkan / Metal** | API grafis modern (Windows/Linux/macOS) yang dipakai renderer. |

## E–G

| Istilah | Arti |
|---------|------|
| **Early Access** | Rilis berbayar saat game belum selesai; dana + feedback massal. |
| **EOS** | Epic Online Services — layanan online gratis Epic (lobby, matchmaking). |
| **EULA** | End User License Agreement — perjanjian lisensi (mis. syarat royalti UE). |
| **Event Dispatcher** | Mekanisme siaran: satu objek mengumumkan, banyak pendengar bereaksi. |
| **F2P (Free-to-Play)** | Model gratis main, uang dari pembelian dalam game. |
| **FPS (frames per second)** | Jumlah gambar per detik. Juga: First-Person Shooter. Konteks menentukan. |
| **Frame budget** | Jatah waktu per frame (16,67 ms untuk 60 FPS). |
| **FText / FString / FName** | Tiga tipe teks UE: UI+lokalisasi / manipulasi / ID cepat. |
| **GAS** | Gameplay Ability System — framework resmi skill/buff/atribut kompleks. |
| **Game feel / Juice** | Sensasi enak dari feedback kecil: getar, suara, partikel, hit stop. |
| **Game loop** | Siklus abadi input → update → render. |
| **GameMode / GameState** | Aturan main (server) / data match tersebar (semua). |
| **GC (Garbage Collector)** | Pembersih memori otomatis UE untuk UObject. |
| **GDD** | Game Design Document — dokumen desain game. [Template](templates/gdd-template.md). |
| **Gizmo** | Panah/lingkaran alat geser-putar-skala di viewport. |
| **Greybox** | = Blockout. |
| **Gross / Net revenue** | Pendapatan kotor / setelah potongan (toko, pajak, refund). |

## H–L

| Istilah | Arti |
|---------|------|
| **Hard / Soft reference** | Rujukan aset yang ikut ter-load selalu / hanya saat diminta. |
| **Hit stop** | Jeda mikro saat pukulan kena — rasa "berat". |
| **Hook** | Alasan 3-detik orang tertarik pada game-mu. |
| **HUD** | Heads-Up Display — info di layar saat main (health, ammo). |
| **IAP** | In-App Purchase — pembelian dalam aplikasi. |
| **IK (Inverse Kinematics)** | Perhitungan sendi otomatis agar tangan/kaki mencapai target (kaki napak tangga). |
| **Instance (Material Instance)** | Variasi murah material induk; ubah parameter tanpa kompilasi ulang. |
| **Iterasi** | Siklus buat → uji → perbaiki → ulang. |
| **Landmark** | Objek besar khas untuk orientasi pemain. |
| **Level / Map** | Satu "panggung" dunia game (.umap). |
| **Lerp (linear interpolation)** | Menghitung nilai antara A dan B (transisi halus). |
| **Listen server** | Pemain yang merangkap server (host co-op). |
| **Live ops** | Operasi pasca rilis: update, event, ekonomi, komunitas. |
| **LOD** | Level of Detail — versi mesh lebih sederhana untuk jarak jauh (Nanite mengotomasi ini). |
| **LTV** | Lifetime Value — total pendapatan rata-rata dari satu pemain. |
| **Lumen** | Sistem pencahayaan global real-time UE5. |

## M–P

| Istilah | Arti |
|---------|------|
| **Material** | "Cat pintar" permukaan: warna, kilap, tekstur, logika shader. |
| **Mekanik** | Aturan interaksi inti (lompat, tembak, tukar, bangun). |
| **MetaHuman** | Alat Epic untuk membuat manusia digital fotorealistik. |
| **MetaSounds** | Sistem audio prosedural node-based UE5. |
| **Milestone** | Titik capaian besar terjadwal (prototype, alpha, beta, gold). |
| **Mixamo** | Layanan Adobe: auto-rig + animasi gratis. |
| **Nanite** | Sistem geometri virtual UE5 — detail nyaris tanpa batas poligon. |
| **NavMesh** | "Karpet" tak terlihat penanda area yang bisa dilalui AI. |
| **Niagara** | Sistem partikel/VFX UE5. |
| **Node** | Kotak logika dalam Blueprint/Material/MetaSound. |
| **Object pooling** | Memakai ulang objek alih-alih spawn/destroy berulang (hemat CPU). |
| **Outliner** | Panel daftar semua Actor dalam level. |
| **Overdraw** | Piksel digambar berkali-kali (partikel transparan menumpuk) — mahal di GPU. |
| **Packaging** | Proses membungkus proyek jadi build yang bisa dimainkan. |
| **Pacing** | Ritme naik-turun intensitas pengalaman. |
| **Pawn / Character** | Tubuh fisik yang dikendalikan (Character = Pawn + gerakan siap pakai). |
| **PIE** | Play In Editor — mode main langsung di editor. |
| **Pitch deck** | Presentasi singkat untuk meyakinkan publisher/investor. |
| **PlayerController / PlayerState** | Kehendak pemain / data pemain yang publik. |
| **Playtest** | Menguji game pada pemain sungguhan dan mengamati. |
| **Polycount** | Jumlah poligon model 3D. |
| **Post Process** | Efek layar akhir: exposure, bloom, color grading. |
| **Press kit** | Paket media siap pakai untuk jurnalis/kreator. |
| **Prototype** | Versi kasar cepat untuk menguji "apakah ini seru?". |

## Q–S

| Istilah | Arti |
|---------|------|
| **QA** | Quality Assurance — pengujian sistematis mencari bug. |
| **Recoup** | Publisher mengambil kembali dana advance dari revenue sebelum bagi hasil. |
| **Redirector** | Penunjuk sisa saat aset dipindah; rapikan dengan Fix Up Redirectors. |
| **Replication** | Penyalinan otomatis state dari server ke client. |
| **RepNotify** | Event yang menyala di client saat nilai replikasi tiba. |
| **Retention (D1/D7/D30)** | % pemain yang kembali setelah 1/7/30 hari. |
| **Revenue share** | Pembagian pendapatan (Steam 30%, publisher 20–50%). |
| **RHI** | Render Hardware Interface — lapisan abstraksi API grafis. |
| **Rigging** | Memasang rangka tulang + kontrol pada model 3D. |
| **Roadmap** | Rencana fitur/update yang dipublikasikan. |
| **RPC** | Remote Procedure Call — memanggil fungsi di mesin lain (Server/Client/Multicast). |
| **Scalability** | Preset kualitas grafis (Low–Epic). |
| **Scope / Scope creep** | Cakupan proyek / pembengkakan fitur diam-diam — pembunuh proyek #1. |
| **Shader** | Program kecil di GPU penentu rupa piksel/vertex. |
| **Skeletal / Static Mesh** | Model bertulang (karakter) / model diam (batu, gedung). |
| **Skinning** | Mengikat kulit model ke tulang. |
| **Soft launch** | Rilis terbatas di negara kecil untuk uji metrik. |
| **Spaghetti (code/graph)** | Logika kusut saling silang — sulit dirawat. |
| **State machine** | Diagram keadaan & transisi (idle → lari → lompat). |

## T–Z

| Istilah | Arti |
|---------|------|
| **TArray / TMap** | Struktur data list / kamus milik UE (pengganti std::vector/map). |
| **Tick** | Fungsi yang berjalan setiap frame. Kuat, mahal, sering disalahgunakan. |
| **Timeline (Blueprint)** | Node penghasil nilai berubah selama durasi (animasi properti). |
| **Transform** | Posisi + rotasi + skala objek. |
| **Trailer** | Video promosi. Aturan: gameplay dalam 5 detik pertama. |
| **TSR / DLSS / FSR** | Teknologi upscaling — render kecil, tampil besar & tajam. |
| **UA (User Acquisition)** | Mendatangkan pemain lewat iklan berbayar. |
| **UMG** | Unreal Motion Graphics — sistem UI UE. |
| **UObject / UCLASS / UPROPERTY / UFUNCTION** | Fondasi & makro reflection C++ Unreal. |
| **Vertical slice** | Satu potongan kecil game dengan kualitas final — bukti kualitas. |
| **VFX** | Visual Effects — efek visual (partikel, distorsi). |
| **Viewport** | Jendela 3D tempat melihat & mengedit dunia. |
| **Virtual machine (Blueprint VM)** | Penerjemah yang mengeksekusi node Blueprint. |
| **W-8BEN** | Form pajak AS untuk penerima pembayaran non-AS (Steam dkk.). |
| **Wishlist** | Daftar keinginan Steam — mata uang marketing indie. |
| **World Partition** | Sistem streaming otomatis dunia besar UE5. |
