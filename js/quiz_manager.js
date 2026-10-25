/**
 * 📦 QUIZ & MODULE MANAGER
 * Mengelola katalog multi-materi (Mission Hub), memuat bank soal aktif,
 * dan menyimpan kuis-kuis baru hasil generate AI secara permanen.
 */

window.NETWORK_SECURITY_BUILTIN_QUESTIONS = [
    {
        "id": 1,
        "type": "mcq",
        "difficulty": "Easy",
        "points": 5,
        "q": "Seorang siswa menghubungkan ponsel pintar miliknya ke perangkat smartwatch dan earbuds nirkabel menggunakan koneksi Bluetooth untuk mendengarkan musik saat berolahraga. Berdasarkan cakupan wilayahnya, skala jaringan yang terbentuk pada aktivitas tersebut adalah...",
        "options": [
            "Local Area Network (LAN)",
            "Wide Area Network (WAN)",
            "Personal Area Network (PAN)",
            "Metropolitan Area Network (MAN)"
        ],
        "answer": 2,
        "explanation": "Koneksi Bluetooth antarperangkat pribadi berjarak beberapa meter merupakan skala Personal Area Network (PAN).",
        "hint": "Perhatikan jangkauan perangkat yang hanya beberapa meter di sekitar tubuh pengguna pribadi."
    },
    {
        "id": 2,
        "type": "tf",
        "difficulty": "Easy",
        "points": 5,
        "caseStudy": "Perhatikan pernyataan teknis mengenai media transmisi kabel tembaga berikut.",
        "q": "Kabel Unshielded Twisted Pair (UTP) dan Shielded Twisted Pair (STP) sama-sama menggunakan konektor RJ-45 pada kedua ujung kabelnya untuk dapat dihubungkan ke port perangkat jaringan seperti Switch atau kartu jaringan (NIC).",
        "options": [
            "BENAR",
            "SALAH"
        ],
        "answer": 0,
        "explanation": "Baik kabel UTP (Unshielded) maupun STP (Shielded) sama-sama menggunakan konektor standar RJ-45 di kedua ujungnya.",
        "hint": "Ingat kembali jenis konektor standar 8-pin yang dipasang pada ujung kabel Twisted Pair."
    },
    {
        "id": 3,
        "type": "mcq",
        "difficulty": "Easy",
        "points": 5,
        "q": "Saat pengguna mengetikkan alamat www.sekolah.com pada peramban web, terdapat layanan direktori internet yang bertugas menerjemahkan nama situs tersebut menjadi deretan angka alamat IP (seperti 142.250.190.46) agar komputer dapat menemukan lokasi server tujuan. Sistem yang dimaksud adalah...",
        "options": [
            "Domain Name System (DNS)",
            "Network Interface Card (NIC)",
            "Wireless Access Point (WAP)",
            "Shielded Twisted Pair (STP)"
        ],
        "answer": 0,
        "explanation": "DNS (Domain Name System) bekerja sebagai buku telepon internet yang menerjemahkan nama domain ke alamat IP.",
        "hint": "Layanan ini dianalogikan sebagai 'buku telepon raksasa' internet yang mencocokkan nama domain dengan deretan angka IP."
    },
    {
        "id": 4,
        "type": "mcq",
        "difficulty": "Medium",
        "points": 5,
        "q": "Di sebuah laboratorium komputer yang terdiri atas 25 unit PC, teknisi memutuskan untuk mengganti perangkat penghubung Hub menjadi Switch guna mengoptimalkan performa lalu lintas data lokal. Alasan teknis utama yang mendasari keputusan teknisi tersebut adalah...",
        "options": [
            "Switch mampu mengubah sinyal digital menjadi gelombang analog untuk saluran telepon.",
            "Switch menyebarkan seluruh paket data ke semua port secara acak dalam waktu bersamaan.",
            "Switch menghubungkan jaringan lokal laboratorium langsung dengan jaringan berskala global.",
            "Switch meneruskan paket data langsung ke alamat perangkat tujuan secara spesifik dan terarah."
        ],
        "answer": 3,
        "explanation": "Switch bersifat cerdas karena meneruskan frame data langsung ke port alamat tujuan spesifik, bukan broadcast ke semua arah seperti Hub.",
        "hint": "Bandingkan analogi 'tukang pos pintar yang tahu alamat spesifik' dengan 'orang yang berteriak ke semua arah'."
    },
    {
        "id": 5,
        "type": "tf",
        "difficulty": "Medium",
        "points": 5,
        "caseStudy": "Analisis karakteristik ketahanan jalur pada Topologi Jaringan.",
        "q": "Pada jaringan yang menerapkan Topologi Ring (Cincin), apabila salah satu simpul komputer atau jalur kabel penghubungnya mengalami kerusakan total, maka aliran komunikasi data pada komputer lainnya di jaringan tersebut sama sekali tidak akan terganggu.",
        "options": [
            "BENAR",
            "SALAH"
        ],
        "answer": 1,
        "explanation": "Pada Topologi Ring, data mengalir melingkar satu arah; jika satu node/kabel putus, seluruh jaringan akan terganggu.",
        "hint": "Bayangkan jalur melingkar satu arah di mana setiap perangkat menjadi jembatan bagi perangkat berikutnya."
    },
    {
        "id": 6,
        "type": "checkbox",
        "maxSelect": 4,
        "difficulty": "Medium",
        "points": 5,
        "q": "Sebuah perusahaan perbankan ingin mengintegrasikan jaringan beberapa kantor cabangnya yang tersebar di berbagai gedung dalam satu wilayah kota yang sama (skala MAN). Pilihlah semua karakteristik infrastruktur yang tepat untuk skala jaringan tersebut!",
        "options": [
            "Menggunakan topologi Point-to-Point dengan transmisi nirkabel Bluetooth jarak pendek.",
            "Memanfaatkan media transmisi kabel Fiber Optik berkecepatan tinggi untuk jalur antargedung.",
            "Menerapkan rancangan topologi Mesh atau Star guna menghubungkan jaringan LAN tiap gedung.",
            "Menghubungkan jaringan lintas benua dan samudra menggunakan konstelasi satelit orbit bumi."
        ],
        "answer": [1, 2],
        "explanation": "Jaringan skala kota (MAN) umumnya menggunakan transmisi Fiber Optik/UTP dengan topologi Mesh atau Star antargedung di satu kota.",
        "hint": "Evaluasi kebutuhan transmisi dan topologi untuk menghubungkan beberapa gedung di dalam satu kota."
    },
    {
        "id": 7,
        "type": "mcq",
        "difficulty": "Hard",
        "points": 5,
        "q": "Sebuah pabrik manufaktur hendak memasang jaringan kabel lokal di ruang produksi yang dipenuhi mesin las dan motor listrik berdaya tinggi. Demi menghemat anggaran awal, teknisi tetap memilih memasang kabel UTP standar dibandingkan kabel STP. Dampak teknis yang paling mungkin terjadi akibat keputusan tersebut adalah...",
        "options": [
            "Konektor RJ-45 pada ujung kabel menjadi meleleh karena tidak kompatibel dengan kartu jaringan.",
            "Transmisi data sering rusak akibat interferensi gelombang elektromagnetik dari mesin produksi.",
            "Kecepatan aliran paket data meningkat dua kali lipat karena kabel tidak dibebani pelindung foil.",
            "Sinyal listrik di dalam kawat tembaga otomatis berubah menjadi pulsa cahaya secara permanen."
        ],
        "answer": 1,
        "explanation": "Kabel UTP tidak memiliki lapisan pelindung logam (foil/anyaman), sehingga rentan terhadap interferensi elektromagnetik dari mesin berat.",
        "hint": "Perhatikan perbedaan fungsi lapisan pelindung foil logam antara kabel Unshielded (UTP) dan Shielded (STP)."
    },
    {
        "id": 8,
        "type": "mcq",
        "difficulty": "Hard",
        "points": 5,
        "q": "Sebuah gedung sekolah 3 lantai memiliki 3 laboratorium komputer di mana masing-masing laboratorium menggunakan Switch tersendiri. Ketiga Switch tersebut dihubungkan secara hierarkis (Topologi Tree) ke satu server pusat di ruang guru. Jika kabel utama yang menghubungkan server pusat ke Switch lantai 2 terputus, kondisi yang akan terjadi pada jaringan sekolah adalah...",
        "options": [
            "Seluruh komputer di lantai 1, 2, dan 3 mengalami kelumpuhan jaringan secara bersamaan.",
            "Komputer di lantai 2 terputus dari server pusat namun tetap bisa berkomunikasi antarsesama PC lantai 2.",
            "Komputer di lantai 1 dan 3 kehilangan koneksi lokal tetapi masih dapat mengakses server pusat.",
            "Jaringan di lantai 2 otomatis berpindah ke topologi Ring tanpa memerlukan perangkat tambahan."
        ],
        "answer": 1,
        "explanation": "Pada Topologi Tree, putusnya jalur cabang ke Switch lantai 2 hanya memutus koneksi lantai 2 ke pusat; LAN internal di dalam lantai 2 tetap aktif karena Switch lantai 2 masih menyala.",
        "hint": "Analisis sifat hierarki cabang pohon: apakah cabang lokal masih terhubung ke Switch di ruangannya sendiri?"
    },
    {
        "id": 9,
        "type": "mcq",
        "difficulty": "Hard",
        "points": 5,
        "q": "Seorang pengguna rumahan membeli Router dan Switch spesifikasi tinggi, lalu menghubungkan semua komputer di rumahnya menggunakan kabel UTP. Namun, ia tidak memasang Modem pada jalur kabel koaksial/telepon yang masuk dari tiang penyedia layanan internet (ISP). Mengapa jaringan di rumah tersebut tetap gagal mengakses internet?",
        "options": [
            "Sinyal analog dari jaringan luar tidak diterjemahkan menjadi sinyal digital bagi perangkat lokal.",
            "Switch menolak meneruskan paket data apabila tidak ada gelombang radio Wi-Fi di ruangan.",
            "Router hanya dapat berfungsi apabila seluruh komputer menggunakan kabel serat kaca (Fiber Optik).",
            "Alamat IP pada komputer lokal otomatis terhapus ketika terhubung ke dalam topologi Star."
        ],
        "answer": 0,
        "explanation": "Modem (Modulator-Demodulator) wajib ada sebagai penerjemah untuk mengubah sinyal analog dari jalur penyedia internet menjadi sinyal digital bagi perangkat lokal.",
        "hint": "Ingat peran perangkat 'Penerjemah' sinyal antara jalur ISP luar dengan jaringan lokal."
    },
    {
        "id": 10,
        "type": "checkbox",
        "maxSelect": 4,
        "difficulty": "Hard",
        "points": 5,
        "q": "Dalam proyek pembangunan tulang punggung internet bawah laut yang menghubungkan pulau-pulau di Indonesia (skala WAN), para insinyur jaringan memilih menggunakan kabel Fiber Optik dibandingkan kabel Koaksial. Pilihlah semua keunggulan teknis yang mendasari pilihan insinyur tersebut!",
        "options": [
            "Mengandalkan konduktor tembaga tunggal di bagian tengah yang dilindungi isolator plastik tebal.",
            "Mengirimkan data menggunakan pulsa cahaya berkecepatan tinggi melalui untaian serat kaca tipis.",
            "Memiliki kapasitas transmisi tertinggi dan kebal terhadap gangguan gelombang elektromagnetik.",
            "Membutuhkan arus listrik tegangan tinggi di sepanjang inti serat kaca untuk memperkuat sinyal."
        ],
        "answer": [1, 2],
        "explanation": "Fiber Optik mentransmisikan pulsa cahaya melalui serat kaca tipis, tidak menggunakan arus listrik, berkapasitas tertinggi, dan kebal interferensi elektromagnetik.",
        "hint": "Fokus pada karakteristik fisik serat kaca dan media rambat cahaya pada kabel Fiber Optik."
    },
    {
        "id": 11,
        "type": "tf",
        "difficulty": "Hard",
        "points": 5,
        "caseStudy": "Skenario Troubleshooting Navigasi Jaringan (DNS & IP Address).",
        "q": "Seorang administrator jaringan mencoba mengakses server web dengan mengetikkan alamat IP 142.250.190.46 secara langsung pada bilah alamat peramban saat server DNS sedang mengalami gangguan total. Karena server DNS sedang mati, maka halaman situs web pada alamat IP tersebut pasti gagal dibuka oleh komputer.",
        "options": [
            "BENAR",
            "SALAH"
        ],
        "answer": 1,
        "explanation": "SALAH. DNS hanya bertugas menerjemahkan nama domain (seperti google.com) ke alamat IP. Jika pengguna sudah mengetikkan alamat IP secara langsung, komputer dapat langsung menghubungi server tujuan tanpa memerlukan DNS.",
        "hint": "Apakah komputer masih butuh 'buku telepon' jika nomor tujuannya (Alamat IP) sudah diketik secara langsung?"
    },
    {
        "id": 12,
        "type": "mcq",
        "difficulty": "Hard",
        "points": 5,
        "q": "Seorang siswa sedang duduk di kafe dan terhubung ke jaringan Wi-Fi publik gratis tanpa kata sandi. Di sudut ruangan, seorang peretas menjalankan program penganalisis jaringan untuk memantau dan mencegat paket data yang lewat di jaringan Wi-Fi tersebut secara diam-diam tanpa mengirimkan pesan atau program apa pun ke perangkat korban. Jenis ancaman keamanan yang sedang terjadi adalah...",
        "options": [
            "Penyebaran Malware berjenis Ransomware untuk mengunci dokumen pribadi milik korban.",
            "Manipulasi psikologis melalui teknik Phising menggunakan halaman login palsu.",
            "Tindakan Sniffing berupa penyadapan pasif terhadap lalu lintas data pada jaringan terbuka.",
            "Perusakan fisik perangkat keras Access Point menggunakan gelombang elektromagnetik."
        ],
        "answer": 2,
        "explanation": "Tindakan memantau atau menyadap lalu lintas paket data yang melintas pada jaringan secara diam-diam untuk mencegat informasi rahasia disebut Sniffing.",
        "hint": "Bedakan antara program jahat, penipuan pesan palsu, dan penyadapan lalu lintas data di jalur jaringan."
    },
    {
        "id": 13,
        "type": "mcq",
        "difficulty": "Hard",
        "points": 5,
        "q": "Saat proses pengiriman data nilai rapor digital dari komputer guru ke server akademik, seorang peretas berhasil mencegat paket data di tengah jalur transmisi dan mengubah nilai Informatika seorang siswa dari 74 menjadi 96 sebelum data tersebut tersimpan di server. Pilar utama keamanan jaringan yang telah dilanggar secara langsung dalam insiden ini adalah...",
        "options": [
            "Availability (Ketersediaan Layanan)",
            "Integrity (Keutuhan dan Keaslian Data)",
            "Confidentiality (Kerahasiaan Akses)",
            "Authentication (Verifikasi Identitas)"
        ],
        "answer": 1,
        "explanation": "Pilar Integrity (Integritas) menjamin bahwa data tetap utuh, akurat, dan tidak diubah atau dimodifikasi tanpa izin di tengah jalan.",
        "hint": "Pilar manakah dari CIA-A yang memastikan data tidak diedit atau dimanipulasi di tengah jalur pengiriman?"
    },
    {
        "id": 14,
        "type": "mcq",
        "difficulty": "Hard",
        "points": 5,
        "q": "Sepuluh menit menjelang pelaksanaan ujian akhir sekolah berbasis komputer, server portal ujian tiba-tiba dibanjiri jutaan lalu lintas permintaan akses palsu secara serentak hingga server mengalami down (lumpuh) dan tidak dapat diakses oleh seluruh siswa yang berhak mengikuti ujian. Insiden serangan ini secara langsung melumpuhkan pilar keamanan...",
        "options": [
            "Authentication (Verifikasi Identitas)",
            "Confidentiality (Kerahasiaan Akses)",
            "Integrity (Keutuhan dan Keaslian Data)",
            "Availability (Ketersediaan Layanan)"
        ],
        "answer": 3,
        "explanation": "Pilar Availability (Ketersediaan) menjamin jaringan dan layanan server selalu siap sedia (tidak down) bagi pengguna yang berhak ketika diperlukan.",
        "hint": "Perhatikan dampak utama serangan: layanan web sekolah menjadi lumpuh (down) saat dibutuhkan ujian."
    },
    {
        "id": 15,
        "type": "checkbox",
        "maxSelect": 4,
        "difficulty": "Hard",
        "points": 5,
        "q": "Seorang staf keuangan menerima pesan surat elektronik (email) yang mengatasnamakan pihak bank resmi. Email tersebut berisi tautan situs web tiruan yang mendesak korban segera memasukkan username, password, dan kode OTP dengan alasan pembaruan sistem. Setelah data dimasukkan, saldo rekening korban langsung dikuras oleh pelaku. Pilihlah semua analisis yang benar terkait kasus tersebut!",
        "options": [
            "Pelaku menggunakan rekayasa sosial berupa teknik Phising untuk memancing informasi sensitif korban.",
            "Kebocoran kredensial username dan password menyebabkan runtuhnya pertahanan pilar Authentication.",
            "Insiden ini turut melanggar pilar Confidentiality karena data rahasia nasabah jatuh ke pihak tidak sah.",
            "Serangan tersebut murni disebabkan oleh putusnya kabel Fiber Optik pada jaringan penyedia internet."
        ],
        "answer": [0, 1, 2],
        "explanation": "Tautan palsu merupakan teknik Phising (1), pencurian kredensial merusak verifikasi identitas/Authentication (2), dan bocornya informasi rahasia melanggar Confidentiality (3).",
        "hint": "Analisis kaitan antara trik penipuan pesan palsu dengan pilar-pilar keamanan CIA-A yang berhasil ditembus."
    },
    {
        "id": 16,
        "type": "mcq",
        "difficulty": "Hard",
        "points": 5,
        "caseStudy": "HOTS — Analisis & Evaluasi Topologi Jaringan Kritis vs Reguler.",
        "q": "Sebuah rumah sakit merancang dua segmen jaringan berbeda: (1) Ruang Unit Gawat Darurat (UGD) yang menghubungkan 6 monitor pemantau detak jantung pasien kritis dengan syarat mutlak: tidak boleh ada kegagalan komunikasi sedikit pun meskipun satu atau dua jalur kabel putus, dan anggaran biaya bukan masalah; (2) Ruang Administrasi yang menghubungkan 30 komputer staf dengan anggaran terbatas, mudah dikelola, dan jika satu PC staf rusak maka PC lain tetap berjalan normal. Kombinasi topologi paling tepat untuk Ruang UGD dan Ruang Administrasi secara berturut-turut adalah...",
        "options": [
            "Topologi Bus untuk Ruang UGD dan Topologi Ring untuk Ruang Administrasi.",
            "Topologi Mesh untuk Ruang UGD dan Topologi Star untuk Ruang Administrasi.",
            "Topologi Star untuk Ruang UGD dan Topologi Bus untuk Ruang Administrasi.",
            "Topologi Ring untuk Ruang UGD dan Topologi Mesh untuk Ruang Administrasi."
        ],
        "answer": 1,
        "explanation": "Ruang UGD membutuhkan keandalan mutlak dengan banyak jalur cadangan (Topologi Mesh), sedangkan Ruang Administrasi membutuhkan efisiensi biaya dan kemudahan pengelolaan dengan pusat Switch (Topologi Star).",
        "hint": "Cocokkan kebutuhan redundansi tinggi tanpa kompromi di UGD dan efisiensi pengelolaan terpusat di ruang staf."
    },
    {
        "id": 17,
        "type": "mcq",
        "difficulty": "Hard",
        "points": 5,
        "caseStudy": "HOTS — Perancangan Arsitektur Infrastruktur Jaringan.",
        "q": "Sebuah perusahaan teknologi memiliki dua gedung kantor yang berjarak 250 meter dan dipisahkan oleh jalan raya. Di dalam tiap gedung, karyawan dituntut bermobilitas tinggi menggunakan laptop sambil berpindah ruang rapat. Namun, server basis data di Gedung A dan Gedung B harus terhubung dengan kecepatan sangat tinggi, stabil, dan tahan terhadap interferensi petir/cuaca luar ruangan. Solusi arsitektur infrastruktur yang paling optimal adalah...",
        "options": [
            "Kabel UTP tanpa pelindung untuk jalur antargedung dan konektor Bluetooth untuk laptop karyawan.",
            "Gelombang Wi-Fi untuk jalur antargedung dan kabel Koaksial kaku untuk setiap laptop karyawan.",
            "Kabel Fiber Optik untuk jalur utama antargedung dan Access Point (Wi-Fi) untuk laptop di dalam ruangan.",
            "Perangkat Hub untuk penghubung antargedung dan kabel STP dengan konektor RJ-45 untuk ponsel karyawan."
        ],
        "answer": 2,
        "explanation": "Jalur antargedung 250 meter di luar ruangan wajib menggunakan Fiber Optik karena berkecepatan cahaya dan kebal petir/elektromagnetik, sedangkan mobilitas karyawan di dalam gedung dilayani oleh Access Point (Wi-Fi).",
        "hint": "Pertimbangkan media transmisi yang tahan gangguan elektromagnetik/petir untuk luar ruangan dan fleksibilitas gerak di dalam ruangan."
    },
    {
        "id": 18,
        "type": "checkbox",
        "maxSelect": 4,
        "difficulty": "Hard",
        "points": 5,
        "caseStudy": "HOTS — Audit Keamanan Perangkat Keras Jaringan Lokal.",
        "q": "Di sebuah perpustakaan umum, seluruh komputer pengunjung masih dihubungkan ke satu perangkat Hub model lama menggunakan kabel jaringan. Suatu hari, seorang peretas mencolokkan laptopnya ke salah satu port kosong pada Hub tersebut. Mengapa arsitektur jaringan perpustakaan ini sangat rentan membocorkan privasi pengunjung, dan langkah mitigasi apa yang tepat?",
        "options": [
            "Hub menyebarkan paket data secara broadcast ke seluruh port sehingga lalu lintas data semua pengunjung otomatis mengalir ke laptop peretas.",
            "Peretas dapat melakukan Sniffing dengan mudah untuk menangkap kata sandi atau data pribadi pengunjung yang dikirim tanpa enkripsi.",
            "Mengganti perangkat Hub menjadi Switch akan membatasi pengiriman paket data hanya menuju port alamat perangkat yang dituju.",
            "Mengganti konektor RJ-45 dengan kabel Koaksial pada Hub tersebut akan otomatis mengaktifkan fitur enkripsi anti-sadap."
        ],
        "answer": [0, 1, 2],
        "explanation": "Sifat broadcast pada Hub mengalirkan semua trafik ke seluruh port termasuk port peretas (1) sehingga sangat rawan disadap/Sniffing (2); solusinya adalah mengganti Hub dengan Switch yang meneruskan paket secara spesifik (3).",
        "hint": "Hubungkan cara kerja broadcast pada Hub dengan celah penyadapan (Sniffing) serta solusi perangkat penggantinya."
    },
    {
        "id": 19,
        "type": "tf",
        "difficulty": "Hard",
        "points": 5,
        "caseStudy": "HOTS — Evaluasi Kasus Privasi Digital & Keamanan Jaringan Publik.",
        "q": "Seorang siswa mengaktifkan pengaman biometrik sidik jari dan kata sandi berlapis pada ponselnya (memenuhi pilar Authentication). Namun, saat berada di bandara, ia terhubung ke Wi-Fi publik gratis tanpa pengamanan untuk mengirim foto KTP, alamat rumah, nomor telepon, serta menyalakan lokasi GPS real-time secara publik. Karena layar ponselnya sudah dikunci dengan sidik jari, maka privasi digital siswa tersebut dijamin sepenuhnya aman dari ancaman Sniffing maupun penyalahgunaan data.",
        "options": [
            "BENAR",
            "SALAH"
        ],
        "answer": 1,
        "explanation": "SALAH. Kunci sidik jari hanya mengamankan akses fisik ke layar ponsel, tetapi data pribadi yang dikirim melalui Wi-Fi publik terbuka tetap dapat dicegat di udara melalui Sniffing atau disalahgunakan pihak luar.",
        "hint": "Apakah kunci layar ponsel melindungi paket data ketika sudah keluar melintas di udara pada jaringan Wi-Fi publik?"
    },
    {
        "id": 20,
        "type": "mcq",
        "difficulty": "Hard",
        "points": 5,
        "caseStudy": "HOTS — Sintesis Insiden Serangan Siber Berlapis.",
        "q": "Sebuah rumah sakit mengalami rentetan serangan siber dalam satu pagi: (1) Pukul 08.00, seorang staf mengklik tautan email palsu yang menyamar sebagai portal Kementerian Kesehatan dan memasukkan akun resminya; (2) Pukul 09.00, peretas masuk menggunakan akun staf tersebut lalu menginstal program jahat yang mengenkripsi (mengunci) seluruh basis data rekam medis dan meminta uang tebusan; (3) Pukul 10.00, sistem pendaftaran pasien lumpuh total dan tidak dapat diakses oleh dokter maupun pasien. Korelasi yang tepat antara ancaman pukul 08.00, ancaman pukul 09.00, dan pilar keamanan yang lumpuh pada pukul 10.00 adalah...",
        "options": [
            "Sniffing — Phising — Confidentiality",
            "Phising — Malware (Ransomware) — Availability",
            "Malware (Virus) — Sniffing — Integrity",
            "Phising — Sniffing — Authentication"
        ],
        "answer": 1,
        "explanation": "Pukul 08.00 adalah penipuan tautan palsu (Phising); Pukul 09.00 adalah program jahat pengunci data tebusan (Malware Ransomware); Pukul 10.00 adalah lumpuhnya ketersediaan layanan bagi pengguna berhak (Availability).",
        "hint": "Urutkan jenis serangan dari email penyamaran (08.00), program pengunci data (09.00), hingga lumpuhnya layanan sistem (10.00)."
    }
];

const QuizManager = {
    MODULES_STORAGE_KEY: 'detektif_fakta_all_modules_v2',
    ACTIVE_MODULE_KEY: 'detektif_fakta_active_module_id',
    CUSTOM_QUIZ_DATA_PREFIX: 'detektif_fakta_quiz_data_',

    // Modul Penilaian Harian Baru (Infrastruktur Jaringan & Keamanan Digital)
    NETWORK_SECURITY_MODULE: {
        id: 'modul_jaringan_keamanan',
        title: 'Penilaian Harian: Infrastruktur Jaringan & Keamanan Digital',
        category: 'Jaringan Komputer & Internet (JKI)',
        icon: '🛡️',
        badge: 'Penilaian Harian',
        description: 'Evaluasi 20 butir soal Infrastruktur Jaringan Komputer, Topologi, Media Transmisi, DNS, dan Keamanan Siber (CIA-A) Kelas X.',
        questionCount: 20,
        kkm: 80,
        difficulty: '3 Mudah • 3 Biasa • 9 Susah • 5 HOTS',
        dataFile: 'bank_soal/modul_jaringan_keamanan.json',
        isDefault: true,
        createdAt: '2026-10-25T08:00:00Z'
    },

    // Modul bawaan aplikasi (Detektif Fakta)
    DEFAULT_MODULE: {
        id: 'modul_detektif_fakta',
        title: 'Misi Detektif Fakta: Uji Validitas Data',
        category: 'Literasi Digital & Komputasional',
        icon: '🕵️',
        badge: 'Misi Utama',
        description: 'Investigasi keabsahan data, identifikasi hoaks, dan penalaran lateral untuk siswa kelas X.',
        questionCount: 20,
        kkm: 80,
        difficulty: 'Campuran (Easy - Hard)',
        isDefault: true,
        createdAt: '2026-09-01T08:00:00Z'
    },

    /**
     * Mengambil daftar semua modul yang tersedia (Default + Hasil Buatan Guru)
     */
    async getAllModules() {
        let stored = localStorage.getItem(this.MODULES_STORAGE_KEY);
        let list = [];
        if (stored) {
            try {
                list = JSON.parse(stored);
            } catch (e) {
                list = [];
            }
        }

        let updated = false;
        const hasDefault = list.some(m => m.id === this.DEFAULT_MODULE.id);
        if (!hasDefault) {
            list.unshift(this.DEFAULT_MODULE);
            updated = true;
        }

        const hasNetwork = list.some(m => m.id === this.NETWORK_SECURITY_MODULE.id);
        if (!hasNetwork) {
            list.unshift(this.NETWORK_SECURITY_MODULE);
            updated = true;
        }

        if (updated) {
            this.saveModulesList(list);
        }

        return list;
    },

    saveModulesList(modulesList) {
        localStorage.setItem(this.MODULES_STORAGE_KEY, JSON.stringify(modulesList));
    },

    getActiveModuleId() {
        return localStorage.getItem(this.ACTIVE_MODULE_KEY) || this.NETWORK_SECURITY_MODULE.id;
    },

    setActiveModuleId(id, broadcast = true) {
        localStorage.setItem(this.ACTIVE_MODULE_KEY, id);
        if (broadcast && typeof saveCloudSharedState === 'function') {
            saveCloudSharedState({ activeModuleId: id });
        }
    },

    /**
     * Memuat soal-soal untuk modul yang sedang aktif
     */
    async loadQuestionsForModule(moduleId) {
        const targetId = moduleId || this.getActiveModuleId();
        const storedKey = this.CUSTOM_QUIZ_DATA_PREFIX + targetId;
        const raw = localStorage.getItem(storedKey);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                const qs = parsed.questions || parsed;
                if (Array.isArray(qs) && qs.length > 0) {
                    window.quizData = qs;
                    return qs;
                }
            } catch (e) {
                console.error("Gagal parse soal custom:", e);
            }
        }

        if (targetId === this.NETWORK_SECURITY_MODULE.id) {
            try {
                const res = await fetch('bank_soal/modul_jaringan_keamanan.json');
                if (res.ok) {
                    const data = await res.json();
                    if (data && Array.isArray(data.questions) && data.questions.length > 0) {
                        window.quizData = data.questions;
                        return data.questions;
                    }
                }
            } catch (e) {
                console.warn("Fetch modul_jaringan_keamanan.json gagal, menggunakan fallback bawaan:", e);
            }
            if (Array.isArray(window.NETWORK_SECURITY_BUILTIN_QUESTIONS)) {
                window.quizData = window.NETWORK_SECURITY_BUILTIN_QUESTIONS;
                return window.NETWORK_SECURITY_BUILTIN_QUESTIONS;
            }
        }

        if (!targetId || targetId === this.DEFAULT_MODULE.id) {
            try {
                const res = await fetch('bank_soal/modul_detektif_fakta.json');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.questions && data.questions.length > 0) {
                        window.quizData = data.questions;
                        return data.questions;
                    }
                }
            } catch (e) {
                console.warn("Fetch file json lokal gagal, menggunakan fallback bawaan:", e);
            }

            if (Array.isArray(window.DEFAULT_BUILTIN_QUESTIONS) && window.DEFAULT_BUILTIN_QUESTIONS.length > 0) {
                window.quizData = window.DEFAULT_BUILTIN_QUESTIONS;
                return window.DEFAULT_BUILTIN_QUESTIONS;
            }
            return window.quizData || [];
        }

        return window.quizData || [];
    },

    /**
     * Menyimpan butir soal yang diedit melalui Editor Bank Soal (G-Form)
     */
    saveQuestionsForModule(moduleId, questions) {
        if (!moduleId) return false;
        const storedKey = this.CUSTOM_QUIZ_DATA_PREFIX + moduleId;
        let pkg = {};
        const raw = localStorage.getItem(storedKey);
        if (raw) {
            try { pkg = JSON.parse(raw); } catch (e) { pkg = {}; }
        }
        pkg.id = moduleId;
        pkg.questions = questions;
        localStorage.setItem(storedKey, JSON.stringify(pkg));

        if (this.getActiveModuleId() === moduleId) {
            window.quizData = questions;
        }
        return true;
    },

    /**
     * Menyimpan kuis baru buatan Guru (dari generator AI atau import)
     */
    async saveNewModule(quizPackage) {
        if (!quizPackage || !quizPackage.questions || quizPackage.questions.length === 0) {
            throw new Error("Paket kuis tidak valid atau tidak memiliki butir soal!");
        }

        const moduleId = quizPackage.id || ('modul_' + Date.now());
        const newModuleMeta = {
            id: moduleId,
            title: quizPackage.title || 'Materi Baru',
            category: quizPackage.category || 'Materi Ajar Guru',
            icon: quizPackage.icon || '📚',
            badge: 'Materi AI',
            description: quizPackage.description || `Kuis evaluasi dengan ${quizPackage.questions.length} butir soal.`,
            questionCount: quizPackage.questions.length,
            kkm: parseInt(quizPackage.kkm || 80, 10),
            difficulty: quizPackage.difficulty || 'Campuran',
            isDefault: false,
            hasRemedialPool: Array.isArray(quizPackage.remedialQuestions) && quizPackage.remedialQuestions.length > 0,
            remedialCount: (quizPackage.remedialQuestions || []).length,
            uploadedAt: Date.now(),
            createdAt: new Date().toISOString()
        };

        localStorage.setItem(this.CUSTOM_QUIZ_DATA_PREFIX + moduleId, JSON.stringify(quizPackage));

        const all = await this.getAllModules();
        const existingIdx = all.findIndex(m => m.id === moduleId);
        if (existingIdx >= 0) {
            all[existingIdx] = newModuleMeta;
        } else {
            all.push(newModuleMeta);
        }
        this.saveModulesList(all);

        saveCloudModule(quizPackage);
        return newModuleMeta;
    },

    /**
     * Menghapus modul custom buatan guru
     */
    async deleteModule(moduleId) {
        if (moduleId === this.DEFAULT_MODULE.id || moduleId === this.NETWORK_SECURITY_MODULE.id) {
            throw new Error("Modul bawaan utama tidak dapat dihapus!");
        }
        localStorage.removeItem(this.CUSTOM_QUIZ_DATA_PREFIX + moduleId);
        let all = await this.getAllModules();
        all = all.filter(m => m.id !== moduleId);
        this.saveModulesList(all);
        if (this.getActiveModuleId() === moduleId) {
            this.setActiveModuleId(this.NETWORK_SECURITY_MODULE.id);
        }

        deleteCloudModule(moduleId);
        return true;
    },

    /**
     * Sinkronisasi modul dari Cloud Supabase ke perangkat yang sedang aktif (Mobile / Desktop)
     */
    async syncCloudModulesList(cloudRows) {
        if (!Array.isArray(cloudRows) || cloudRows.length === 0) return;
        const all = await this.getAllModules();
        let changed = false;

        cloudRows.forEach(row => {
            const pkg = row.wrong_questions;
            if (!pkg || !pkg.id || !Array.isArray(pkg.questions)) return;

            const localKey = this.CUSTOM_QUIZ_DATA_PREFIX + pkg.id;
            if (!localStorage.getItem(localKey)) {
                localStorage.setItem(localKey, JSON.stringify(pkg));
            }

            if (!all.some(m => m.id === pkg.id)) {
                all.push({
                    id: pkg.id,
                    title: pkg.title || 'Materi Baru',
                    category: pkg.category || 'Materi Ajar Guru',
                    icon: pkg.icon || '📚',
                    badge: pkg.badge || 'Materi AI Cloud',
                    description: pkg.description || `Kuis evaluasi dengan ${pkg.questions.length} butir soal.`,
                    questionCount: pkg.questions.length,
                    kkm: parseInt(pkg.kkm || 80, 10),
                    difficulty: pkg.difficulty || 'Campuran',
                    isDefault: false,
                    hasRemedialPool: Array.isArray(pkg.remedialQuestions) && pkg.remedialQuestions.length > 0,
                    remedialCount: (pkg.remedialQuestions || []).length,
                    uploadedAt: pkg.uploadedAt || Date.now(),
                    createdAt: pkg.createdAt || new Date().toISOString()
                });
                changed = true;
            }
        });

        if (changed) {
            this.saveModulesList(all);
        }
    }
};

window.QuizManager = QuizManager;

async function saveCloudModule(pkg) {
    if (!pkg || !pkg.id) return;
    try {
        const cfg = typeof getSupabaseConfig === 'function' ? getSupabaseConfig() : { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_ANON_KEY, table: 'quiz_results' };
        const rowName = '__MODULE__' + pkg.id;
        const baseUrl = `${cfg.url.replace(/\/$/, '')}/rest/v1/${cfg.table || 'quiz_results'}`;

        const patchRes = await fetch(`${baseUrl}?student_name=eq.${encodeURIComponent(rowName)}`, {
            method: 'PATCH',
            headers: {
                'apikey': cfg.key,
                'Authorization': 'Bearer ' + cfg.key,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                wrong_questions: pkg,
                quiz_date: new Date().toLocaleDateString('id-ID')
            })
        });
        const patchData = await patchRes.json();

        if (!Array.isArray(patchData) || patchData.length === 0) {
            await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'apikey': cfg.key,
                    'Authorization': 'Bearer ' + cfg.key,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    student_name: rowName,
                    student_class: '__MODULE_DATA__',
                    score: 100,
                    correct_count: (pkg.questions || []).length,
                    total_questions: (pkg.questions || []).length,
                    wrong_questions: pkg,
                    duration: '0',
                    time_str: '00:00',
                    quiz_date: new Date().toLocaleDateString('id-ID')
                })
            });
        }
    } catch (e) {
        console.warn('Gagal unggah modul ke Cloud:', e.message);
    }
}
window.saveCloudModule = saveCloudModule;

async function deleteCloudModule(moduleId) {
    if (!moduleId) return;
    try {
        const cfg = typeof getSupabaseConfig === 'function' ? getSupabaseConfig() : { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_ANON_KEY, table: 'quiz_results' };
        const rowName = '__MODULE__' + moduleId;
        const targetUrl = `${cfg.url.replace(/\/$/, '')}/rest/v1/${cfg.table || 'quiz_results'}?student_name=eq.${encodeURIComponent(rowName)}`;
        await fetch(targetUrl, {
            method: 'DELETE',
            headers: {
                'apikey': cfg.key,
                'Authorization': 'Bearer ' + cfg.key
            }
        });
    } catch (e) { }
}
window.deleteCloudModule = deleteCloudModule;