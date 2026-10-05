/**
 * CogniFlow - Pusat Materi & Trik Cepat Kognitif (Bite-Sized Cheat Sheets)
 * Berisi katalog rumus cepat deret numerik dan kaidah logika silogisme deduktif.
 */

window.CogniFlowMaterials = [
    // ==========================================
    // KATEGORI 1: DERET BILANGAN (NUMERIK)
    // ==========================================
    {
        id: "mat_deret_lompat",
        category: "series",
        title: "Trik Pola Lompat (Alternating Series)",
        badge: "Paling Sering Keluar",
        summary: "Ciri khas deret yang nilainya naik-turun selang-seling (fluktuatif). Lebih dari 80% bertipe lompat 1 atau 2 angka.",
        rule: "Pisahkan deret menjadi 2 jalur independen: Deret Suku Ganjil (posisi 1, 3, 5, 7) dan Deret Suku Genap (posisi 2, 4, 6, 8).",
        example: {
            question: "6, 60, 10, 58, 14, 56, ...",
            solution: "Jalur Ganjil: 6 (+4) -> 10 (+4) -> 14 (+4) -> 18\nJalur Genap: 60 (-2) -> 58 (-2) -> 56 (-2) -> 54\nJawaban untuk suku ke-7 adalah 18."
        },
        tips: "Jika angka berikutnya melonjak tinggi lalu anjlok, jangan cari selisih ke tetangga sebelahnya! Langsung lompat 1 angka ke depan."
    },
    {
        id: "mat_deret_bertingkat",
        category: "series",
        title: "Trik Pola Bertingkat (Tingkat 2 & 3)",
        badge: "Standar SKD & TPA",
        summary: "Beda antar suku pertama tidak beraturan, namun selisih dari beda tersebut membentuk deret aritmatika konstan.",
        rule: "Hitung selisih antar suku berdekatan (Tingkat 1). Jika belum tetap, hitung selisih dari selisih tersebut (Tingkat 2).",
        example: {
            question: "8, 13, 23, 38, 58, ...",
            solution: "Beda Tingkat 1: +5, +10, +15, +20, ...\nBeda Tingkat 2: Selalu bertambah konstan +5.\nMaka beda berikutnya adalah +25.\n58 + 25 = 83."
        },
        tips: "Pola bertingkat sering digunakan jika deret bergerak monoton naik atau monoton turun dengan percepatan yang konsisten."
    },
    {
        id: "mat_deret_fibonacci",
        category: "series",
        title: "Trik Deret Fibonacci & Akumulasi",
        badge: "Pola Klasik",
        summary: "Suatu suku didapatkan dari hasil penjumlahan suku-suku sebelumnya.",
        rule: "Suku ke-n = Suku (n-1) + Suku (n-2). Perhatikan variasi: ada juga yang menjumlahkan 3 suku berturut-turut (Tribonacci).",
        example: {
            question: "1, 4, 5, 9, 14, 23, ...",
            solution: "1 + 4 = 5\n4 + 5 = 9\n5 + 9 = 14\n9 + 14 = 23\n14 + 23 = 37."
        },
        tips: "Ciri khas Fibonacci: Angka di awal terasa kecil dan lambat, lalu tiba-tiba melesat seiring akumulasi suku sebelumnya."
    },
    {
        id: "mat_deret_tabel_kuadrat",
        category: "series",
        title: "Tabel Hafalan Cepat Kuadrat (1² - 25²)",
        badge: "Wajib Dihafal",
        summary: "Menghemat 15-30 detik pengerjaan tanpa perlu coret-coret menghitung perkalian manual.",
        rule: "Hafalkan angka patokan ini:\n• 1²=1 | 2²=4 | 3²=9 | 4²=16 | 5²=25\n• 6²=36 | 7²=49 | 8²=64 | 9²=81 | 10²=100\n• 11²=121 | 12²=144 | 13²=169 | 14²=196 | 15²=225\n• 16²=256 | 17²=289 | 18²=324 | 19²=361 | 20²=400\n• 21²=441 | 22²=484 | 23²=529 | 24²=576 | 25²=625",
        example: {
            question: "121, 144, 169, 196, ...",
            solution: "Deret kuadrat: 11², 12², 13², 14², maka berikutnya 15² = 225."
        },
        tips: "Sering dimodifikasi menjadi (n² ± 1) atau (n² ± n), misalnya: 0, 3, 8, 15, 24 (yaitu n² - 1)."
    },
    {
        id: "mat_deret_kubik_prima",
        category: "series",
        title: "Tabel Kubik & Deret Bilangan Prima",
        badge: "Pencegah Jebakan",
        summary: "Bilangan prima dan kubik sering mengecoh peserta karena terlihat tidak memiliki pola selisih yang logis.",
        rule: "• Kubik: 1³=1, 2³=8, 3³=27, 4³=64, 5³=125, 6³=216, 7³=343, 8³=512, 9³=729, 10³=1000.\n• Prima: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53.",
        example: {
            question: "2, 3, 5, 7, 11, 13, 17, ...",
            solution: "Bukan deret ganjil (karena ada 2 dan tidak ada 9, 15). Ini adalah deret bilangan prima murni. Suku berikutnya adalah 19."
        },
        tips: "Hati-hati angka 1 dan 9: 1 bukan bilangan prima, dan 9 bukan bilangan prima (karena habis dibagi 3)."
    },
    {
        id: "mat_deret_alfabet",
        category: "series",
        title: "Metode EJOTY untuk Deret Huruf",
        badge: "Rumus Kilat Alfabet",
        summary: "Konversi cepat posisi huruf abjad ke angka dalam hitungan 2 detik tanpa menulis A-Z di kertas.",
        rule: "Hafalkan patokan kelipatan 5:\nE = 5\nJ = 10\nO = 15\nT = 20\nY = 25",
        example: {
            question: "C, F, I, L, O, ...",
            solution: "C(3), F(6), I(9), L(12), O(15) -> Pola +3.\nSuku berikutnya: 15 + 3 = 18. Karena T = 20, maka 18 = R."
        },
        tips: "Jika mencari huruf 'S', ingat T=20, maka S persis sebelum T (19). Jika mencari 'K', ingat J=10, maka K=11."
    },

    // ==========================================
    // KATEGORI 2: SILOGISME & PENALARAN LOGIS
    // ==========================================
    {
        id: "mat_syl_kuantor_partikular",
        category: "syllogism",
        title: "Kaidah Kuantor Partikular (Semua vs Sebagian)",
        badge: "Kaidah Emas #1",
        summary: "Aturan mutlak jika ada premis universal ('semua/setiap') bertemu premis partikular ('beberapa/sebagian/sementara/ada').",
        rule: "Universal + Partikular = WAJIB Partikular.\nJika ada satu saja premis yang memuat kata 'sebagian / beberapa / sementara / ada', maka kesimpulan HARUS diawali dengan partikular.",
        example: {
            question: "P1: Semua PNS kementerian pusat wajib apel bendera.\nP2: Beberapa staf Ditjen Pajak adalah PNS kementerian pusat.",
            solution: "Kesimpulan: Beberapa staf Ditjen Pajak wajib apel bendera."
        },
        tips: "Coret opsi jawaban yang diawali kata 'Semua...' jika salah satu premisnya memakai kata 'beberapa/sebagian'!"
    },
    {
        id: "mat_syl_hukum_negasi",
        category: "syllogism",
        title: "Kaidah Hukum Negasi (Positif vs Negatif)",
        badge: "Kaidah Emas #2",
        summary: "Aturan jika premis afirmatif (positif) bertemu dengan premis negatif ('tidak / bukan').",
        rule: "1. Positif + Negatif = Kesimpulan WAJIB Negatif ('tidak / bukan').\n2. Negatif + Negatif = TIDAK DAPAT DITARIK KESIMPULAN VALID.",
        example: {
            question: "P1: Semua atlet memiliki stamina tinggi.\nP2: Badu bukan orang yang memiliki stamina tinggi.",
            solution: "Kesimpulan: Badu bukan atlet."
        },
        tips: "Jika Anda melihat dua premis yang keduanya memuat kata 'tidak / bukan', langsung pilih opsi 'Tidak dapat ditarik kesimpulan'!"
    },
    {
        id: "mat_syl_dua_partikular",
        category: "syllogism",
        title: "Kaidah Dua Partikular (Sebagian + Sebagian)",
        badge: "Jebakan Terbanyak",
        summary: "Apa yang terjadi jika kedua premis sama-sama diawali kata 'sebagian / beberapa'?",
        rule: "Partikular + Partikular = TIDAK DAPAT DITARIK KESIMPULAN.\nDua himpunan bagian tidak menjamin adanya irisan pasti yang dapat digeneralisasi.",
        example: {
            question: "P1: Beberapa dosen menguasai bahasa Jerman.\nP2: Beberapa dosen adalah peneliti biologi.",
            solution: "Kesimpulan: Tidak dapat ditarik kesimpulan valid (belum tentu dosen yang bisa bahasa Jerman adalah peneliti biologi)."
        },
        tips: "Jangan menghubung-hubungkan dua premis 'sebagian' berdasarkan logika kira-kira di dunia nyata. Kaidah silogisme melarangnya!"
    },
    {
        id: "mat_syl_ponens_tollens",
        category: "syllogism",
        title: "Modus Ponens & Modus Tollens (Jika P maka Q)",
        badge: "Logika Implikasi",
        summary: "Fondasi penalaran kondisional (sebab-akibat) yang selalu keluar di TKDA BUMN dan SKD CPNS.",
        rule: "1. Modus Ponens:\n   • Premis 1: P -> Q\n   • Premis 2: P terjadi\n   • Kesimpulan: Q pasti terjadi\n\n2. Modus Tollens:\n   • Premis 1: P -> Q\n   • Premis 2: ~Q (akibat TIDAK terjadi)\n   • Kesimpulan: ~P (sebab pasti TIDAK terjadi)",
        example: {
            question: "P1: Jika debit air meluap, pintu tanggul dibuka.\nP2: Pintu tanggul tidak dibuka.",
            solution: "Bentuk: P -> Q, ~Q terjadi. Berdasarkan Modus Tollens, kesimpulannya: Debit air tidak meluap (~P)."
        },
        tips: "Hukum Tollens: Jika akibat batal, maka penyebabnya pasti tidak terjadi."
    },
    {
        id: "mat_syl_cacat_logika",
        category: "syllogism",
        title: "Falasi Logika (Affirming Consequent & Denying Antecedent)",
        badge: "Tingkat Mahir (HOTS)",
        summary: "Dua cacat logika paling mematikan yang sering mengecoh peserta memilih kesimpulan keliru.",
        rule: "1. Affirming the Consequent (Salah):\n   P -> Q, Q terjadi, lalu disimpulkan P. (SALAH! Akibat bisa timbul dari sebab lain).\n\n2. Denying the Antecedent (Salah):\n   P -> Q, ~P terjadi, lalu disimpulkan ~Q. (SALAH! Tidak ada jaminan Q batal jika penyebab lain bisa memicunya).",
        example: {
            question: "P1: Jika hujan lebat turun, halaman rumput basah.\nP2: Halaman rumput basah.",
            solution: "Kesimpulan: Tidak dapat ditarik kesimpulan valid. (Rumput basah bisa karena disiram selang air, bukan karena hujan lebat)."
        },
        tips: "Jika Anda menemukan premis sebab-akibat (P->Q) lalu premis kedua membenarkan akibat (Q) atau menolak sebab (~P), jawabannya selalu 'Tidak dapat ditarik kesimpulan valid'!"
    },
    {
        id: "mat_syl_de_morgan",
        category: "syllogism",
        title: "Hukum De Morgan (Negasi Majemuk DAN / ATAU)",
        badge: "Penentu Skor Tinggi",
        summary: "Cara membalikkan pernyataan majemuk yang memakai kata hubung 'DAN' serta 'ATAU'.",
        rule: "1. Negasi dari (A DAN B) adalah: ~A ATAU ~B\n   (Cukup salah satu yang gugur untuk membatalkan keduanya).\n\n2. Negasi dari (A ATAU B) adalah: ~A DAN ~B\n   (Keduanya harus sama-sama gugur).",
        example: {
            question: "P1: Jika pelamar fasih bahasa Inggris ATAU memiliki sertifikasi IT, ia diundang wawancara.\nP2: Pelamar tidak diundang wawancara.",
            solution: "Akibat ditolak (~Q), maka prasyarat (P) harus dinegasikan:\nNegasi dari (Inggris ATAU IT) = Tidak fasih bahasa Inggris DAN tidak memiliki sertifikasi IT."
        },
        tips: "Ingat prinsip saklar: 'DAN' berbalik jadi 'ATAU', 'ATAU' berbalik jadi 'DAN' saat dinegasikan."
    }
];
