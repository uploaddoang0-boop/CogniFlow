# CogniFlow 🧠

> **Platform Latihan Kognitif & Tes Logika Adaptif**  
> Didesain khusus untuk persiapan tes seleksi **CPNS (SKD/TIU), TPA Bappenas, Tes BUMN (FHCI), UTBK, dan Psikotes Rekrutmen**.

![PWA Ready](https://img.shields.io/badge/PWA-Ready-10B981?style=flat-square)
![Vanilla JS](https://img.shields.io/badge/Stack-Vanilla%20JS%20%7C%20CSS3-6366F1?style=flat-square)
![Dark Mode](https://img.shields.io/badge/Theme-Ergonomic%20Dark%20Mode-0A0E17?style=flat-square)
![Offline First](https://img.shields.io/badge/Offline-Ready%20%28SW%29-F59E0B?style=flat-square)
![WCAG](https://img.shields.io/badge/Accessibility-WCAG%202.2%20Compliant-38BDF8?style=flat-square)

---

## 📌 Tentang Project

**CogniFlow** adalah aplikasi web progresif (PWA) yang dirancang untuk melatih kecepatan, akurasi, dan ketajaman berpikir logis dalam memecahkan dua instrumen tes penalaran kognitif paling krusial:
1. **Deret Bilangan (Numerical Series):** Pola aritmatika, geometri, pola bertingkat, pola lompat/alternating, deret Fibonacci, kombinasi aljabar, dan pola kuadrat/kubik.
2. **Silogisme Deduktif (Logical Deductions):** Modus Ponens, Modus Tollens, Silogisme Hipotetis/Disyungtif, serta penalaran kategori kuantor Universal vs. Partikular.

Aplikasi ini dibangun mengedepankan **Cognitive Load Theory** dan **Ergonomi Dark Mode** untuk sesi belajar intensif tanpa membuat mata lelah (*anti-halation*).

---

## ✨ Fitur-Fitur Unggulan

### 1. 🎯 Mode Latihan Bebas & Simulasi Ujian Adaptif
- **Simulasi Ujian (Dengan Batasan Waktu):** Paket 20 soal dengan batas waktu 60 detik per soal, proporsi kesulitan terstandarisasi (10% Level 1, 20% Level 2, 35% Level 3, 20% Level 4, 15% Level 5), dilengkapi rekapitulasi performa dan evaluasi jawaban.
- **Latihan Bebas (Infinite Practice):** Latihan tanpa tekanan waktu dengan pembahasan analitis langsung terbuka seketika setelah menjawab.

### 2. 💡 Pusat Materi & Trik Cepat (Bite-Sized Cheat Sheets)
- **Akses Fleksibel:** Tersedia langsung di hub menu Latihan, via tombol aksi **"💡 Trik Cepat"** di header kuis, maupun tautan di bawah pembahasan soal.
- **Katalog Ringkas & Aplikatif:**
  - *Trik Pola Lompat (Alternating Series)*
  - *Trik Pola Bertingkat (Tingkat 2 & 3)*
  - *Tabel Hafalan Cepat Kuadrat ($1^2 - 25^2$) & Kubik ($1^3 - 10^3$)*
  - *Trik Konversi Alfabet `EJOTY`*
  - *Kaidah Kuantor Partikular ("Sebagian / Beberapa")*
  - *Kaidah Premis Negatif ("Tidak / Bukan")*
  - *Kaidah Silogisme Dua Partikular*
  - *Tabel Kebenaran Modus Ponens, Tollens, & Hipotetis*

### 3. ✏️ Digital Scratchpad (Canvas Coret-Coret Terintegrasi)
- Coretan perhitungan cepat langsung di atas layar tanpa memerlukan kertas fisik atau kalkulator eksternal.
- Overlay semi-transparan yang memungkinkan pengguna tetap membaca teks soal di baliknya saat mencoret.
- Dilengkapi alat **Pen**, **Eraser**, dan **Clear All**, serta mendukung *PointerEvents* mulus untuk layar sentuh ponsel/stylus maupun mouse desktop.

### 4. 🎨 Ergonomic Dark Mode & Tipografi Presisi
- Menggunakan palet ramah mata **Deep Midnight Slate** (`#0A0E17`, `#121826`) yang mencegah efek *halation* (pendaran cahaya yang melelahkan mata).
- **Tabular Figures:** Deret angka disajikan dengan font monospaced **JetBrains Mono** berjarak ritmis dan kartu angka individual (*Number Stream Chips*).
- **Structured Premise Cards:** Premis silogisme disajikan dalam blok terpisah (*Premis Mayor* vs. *Premis Minor*), menghapus kebingungan teks panjang.

### 5. ⌨️ Aksesibilitas Keyboard Lengkap (Hotkeys)
Didesain untuk simulasi ujian desktop (CAT BKN / Seleksi Komputer):

| Tombol | Aksi |
| :---: | :--- |
| `A`, `B`, `C`, `D` atau `1`, `2`, `3`, `4` | Memilih opsi jawaban |
| `Space` / `Enter` | Melanjutkan ke soal berikutnya (mode latihan) |
| `C` atau `W` | Buka / Tutup Digital Scratchpad (Coretan) |
| `T` atau `M` | Buka / Tutup Drawer Pusat Trik & Materi |
| `Esc` | Menutup drawer/modal aktif atau konfirmasi keluar sesi |

### 6. 🔊 Psikoakustik Halus & Kontrol Suara
- Generator nada harmonis berbasis Web Audio API (*Soft Sine Wave*) yang memberikan afirmasi positif saat benar dan nada tumpul lembut saat salah.
- Tombol **Mute / Unmute** instan di header yang statusnya tersimpan di `localStorage`.

### 7. 📱 PWA & Offline-First
- Didukung oleh `manifest.json` dan `sw.js` (Service Worker).
- Bank soal berbasis JSON lokal yang dapat diakses penuh meski tanpa koneksi internet.

---

## 📂 Struktur File Project

```plaintext
CogniFlow Remake/
├── CogniFlow.svg           # Logo vektor resmi aplikasi
├── README.md               # Dokumentasi utama proyek
├── index.html              # Struktur markup semantik, token CSS, dan styling responsif
├── app.js                  # Engine kuis, manajemen state, timer, audio synthesizer, & controller
├── materials.js            # Database pustaka rumus dan trik cepat logika numerik/silogisme
├── manifest.json           # Konfigurasi PWA (Web App Manifest)
├── sw.js                   # Service Worker untuk caching dan akses offline
├── Remake plan/            # Dokumen PRD dan blueprint arsitektur sistem
│   └── cogniflow_prd_and_execution_plan.md
│
└── Bank Soal (JSON Datasets):
    ├── latihan_deret.json       # Dataset soal latihan deret angka
    ├── latihan_silogisme.json   # Dataset soal latihan silogisme deduktif
    ├── test_deret.json          # Dataset paket ujian deret angka
    └── test_silogisme.json      # Dataset paket ujian silogisme deduktif
```

---

## 🚀 Cara Menjalankan Aplikasi

Karena aplikasi ini memuat database soal lokal dalam format `.json` menggunakan AJAX/`fetch()`, jalankan menggunakan **Local HTTP Server** (bukan langsung membuka file via `file://`).

### Opsi 1: Menggunakan VS Code Live Server (Direkomendasikan)
1. Buka folder proyek di **Visual Studio Code**.
2. Pasang ekstensi **Live Server** (oleh Ritwick Dey).
3. Klik kanan pada `index.html` dan pilih **"Open with Live Server"**.
4. Aplikasi akan terbuka di browser Anda (biasanya pada `http://127.0.0.1:5500/`).

### Opsi 2: Menggunakan Python
Buka terminal pada direktori proyek, lalu jalankan:
```bash
# Python 3
python -m http.server 8000
```
Buka browser dan akses: `http://localhost:8000`

### Opsi 3: Menggunakan Node.js (`npx serve`)
```bash
npx -y serve .
```

---

## 🛠️ Desain Token & Konvensi Warna

| Token CSS | Hex Value | Penggunaan |
| :--- | :---: | :--- |
| `--bg-canvas` | `#0A0E17` | Latar belakang dasar kanvas aplikasi |
| `--bg-surface` | `#121826` | Permukaan kartu (*card surface*) |
| `--bg-surface-elevated` | `#1A2338` | Elemen melayang, chip angka, dan modal |
| `--accent-primary` | `#6366F1` | Aksen utama (Electric Indigo) untuk tombol dan fokus |
| `--accent-gold` | `#F59E0B` | Aksen sekunder (Amber Gold) untuk target `?` dan trik cepat |
| `--success-base` | `#10B981` | Indikator jawaban benar (Emerald Green) |
| `--error-base` | `#EF4444` | Indikator jawaban salah & waktu habis (Rose Red) |
| `--text-primary` | `#F1F5F9` | Teks utama anti-silau (*Off-White*) |

---

## 📄 Lisensi & Kontribusi

Project ini dikembangkan untuk kebutuhan pembelajaran dan pengasahan logika mandiri. Bebas digunakan, dimodifikasi, dan didistribusikan untuk keperluan edukasi.