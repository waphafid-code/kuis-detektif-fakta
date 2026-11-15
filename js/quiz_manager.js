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



window.HKI_CULTURE_BUILTIN_QUESTIONS = [
    {
        "id": 1,
        "type": "mcq",
        "difficulty": "Easy",
        "points": 5,
        "q": "Sebuah sekolah mengembangkan platform digital yang berisi dokumentasi manuskrip, adat istiadat, seni, bahasa, dan permainan rakyat. Platform tersebut dapat diakses masyarakat dari berbagai daerah. Berdasarkan konsep digitalisasi budaya, kegiatan tersebut menunjukkan bahwa teknologi digital berfungsi untuk ....",
        "options": [
            "Menggantikan aktivitas kebudayaan yang dilakukan masyarakat.",
            "Membatasi penyebaran informasi budaya kepada kelompok tertentu.",
            "Mengubah seluruh kebudayaan menjadi produk teknologi modern.",
            "Mendokumentasikan, mengelola, menyimpan, dan memperkenalkan kebudayaan.",
            "Mengurangi keterlibatan masyarakat dalam pelestarian kebudayaan."
        ],
        "answer": 3,
        "explanation": "Digitalisasi budaya bertujuan mendokumentasikan, mengelola, menyimpan, menyebarluaskan, dan memperkenalkan kekayaan budaya melalui media digital tanpa menggantikan praktik aslinya.",
        "hint": "Fokus pada peran teknologi sebagai media dokumentasi, penyimpanan, dan pengenalan warisan budaya secara luas."
    },
    {
        "id": 2,
        "type": "mcq",
        "difficulty": "Easy",
        "points": 5,
        "q": "Sebuah lembaga kebudayaan ingin mengintegrasikan data kebudayaan dari berbagai sumber, termasuk informasi yang diperoleh melalui Urun Daya masyarakat. Platform yang sesuai dengan contoh dalam materi adalah ....",
        "options": [
            "Budaya Kita.",
            "SPKT (Sistem Pendataan Kebudayaan Terpadu).",
            "Platform dokumentasi manuskrip.",
            "Sistem informasi warisan budaya.",
            "Platform pengenalan budaya digital."
        ],
        "answer": 1,
        "explanation": "SPKT (Sistem Pendataan Kebudayaan Terpadu) adalah platform integrasi data kebudayaan nasional yang memadukan berbagai sumber data termasuk partisipasi Urun Daya masyarakat.",
        "hint": "Ingat singkatan sistem terpadu resmi pemerintah untuk pendataan kebudayaan terintegrasi."
    },
    {
        "id": 3,
        "type": "mcq",
        "difficulty": "Easy",
        "points": 5,
        "q": "Sebuah perusahaan mengembangkan aplikasi pembayaran digital. Tim pengembang bertugas membuat program, melakukan pengujian, memperbaiki kesalahan, dan memelihara fitur aplikasi. Profesi yang paling sesuai dengan tanggung jawab tersebut adalah ....",
        "options": [
            "Web Developer.",
            "System Analyst.",
            "Programmer / Software Developer.",
            "Data Analyst.",
            "Database Administrator."
        ],
        "answer": 2,
        "explanation": "Programmer / Software Developer bertanggung jawab langsung menulis kode program, menguji, memperbaiki bug, dan memelihara fitur perangkat lunak aplikasi.",
        "hint": "Profesi ini bertugas mengonversi rancangan sistem menjadi baris kode program yang dapat dieksekusi komputer."
    },
    {
        "id": 4,
        "type": "mcq",
        "difficulty": "Medium",
        "points": 5,
        "q": "Sebelum membangun sistem akademik baru, sebuah sekolah meminta tenaga profesional untuk mengidentifikasi permasalahan administrasi, menganalisis kebutuhan pengguna, dan menyusun rancangan solusi bagi tim pengembang. Profesi yang menjalankan tanggung jawab tersebut adalah ....",
        "options": [
            "UI/UX Designer.",
            "Network Engineer.",
            "Cybersecurity Specialist.",
            "Database Administrator.",
            "System Analyst."
        ],
        "answer": 4,
        "explanation": "System Analyst bertugas menjembatani kebutuhan pengguna dengan tim teknis melalui analisis masalah, perumusan spesifikasi kebutuhan, dan perancangan arsitektur solusi sistem.",
        "hint": "Profesi ini menjadi analis utama kebutuhan alur kerja sistem sebelum diserahkan ke programmer."
    },
    {
        "id": 5,
        "type": "mcq",
        "difficulty": "Medium",
        "points": 5,
        "q": "Sebuah perusahaan smartphone memiliki beberapa aset yang perlu dilindungi. Perusahaan ingin melindungi nama dagang dan logo produknya, sekaligus menjaga resep internal yang tidak boleh diketahui pihak lain. Bentuk perlindungan yang tepat secara berurutan adalah ....",
        "options": [
            "Merek dan Rahasia Dagang.",
            "Hak Cipta dan Paten.",
            "Paten dan Desain Industri.",
            "Desain Industri dan Hak Cipta.",
            "Rahasia Dagang dan Merek."
        ],
        "answer": 0,
        "explanation": "Nama dagang dan logo dilindungi melalui rezim Merek (Trademark), sedangkan formula rahasia atau metode internal yang dirahasiakan dilindungi melalui Rahasia Dagang (Trade Secret).",
        "hint": "Nama dagang dan identitas visual dilindungi Merek; informasi bisnis bernilai komersial yang dirahasiakan dilindungi Rahasia Dagang."
    },
    {
        "id": 6,
        "type": "mcq",
        "difficulty": "Easy",
        "points": 5,
        "q": "Sebuah perusahaan mengalami gangguan konektivitas antarkomputer. Tenaga profesional yang bertugas memeriksa kinerja jaringan, merancang konektivitas, dan melakukan troubleshooting adalah ....",
        "options": [
            "Data Analyst.",
            "Network Engineer.",
            "System Analyst.",
            "AI/Machine Learning Engineer.",
            "Web Developer."
        ],
        "answer": 1,
        "explanation": "Network Engineer berfokus pada infrastruktur jaringan komunikasi data, instalasi perangkat routing/switching, pemantauan performa koneksi, serta penanganan masalah (troubleshooting) jaringan.",
        "hint": "Profesi ini mengurusi infrastruktur konektivitas kabel, nirkabel, dan lalu lintas komunikasi data antarkomputer."
    },
    {
        "id": 7,
        "type": "mcq",
        "difficulty": "Medium",
        "points": 5,
        "q": "Seorang siswa menemukan foto dokumentasi budaya di internet dan ingin menggunakannya dalam presentasi. Ia mengetahui bahwa foto tersebut memiliki pemilik dan ketentuan penggunaan. Tindakan yang paling mencerminkan etika digital adalah ....",
        "options": [
            "Menggunakan foto tersebut karena sudah tersedia untuk umum.",
            "Menghapus identitas pemilik agar presentasi terlihat lebih sederhana.",
            "Mengunggah kembali foto tersebut sebelum memeriksa ketentuan penggunaannya.",
            "Memeriksa izin penggunaan, mengikuti ketentuan karya, dan mencantumkan sumbernya.",
            "Menggunakan foto tersebut tanpa izin selama tidak memperoleh keuntungan."
        ],
        "answer": 3,
        "explanation": "Etika digital menuntut penghargaan terhadap karya orang lain dengan memverifikasi lisensi izin pakai, mematuhi batas penggunaan, dan memberikan atribusi sumber yang jelas.",
        "hint": "Prinsip dasar etika digital adalah menghormati hak cipta pemilik dengan izin dan pencantuman sumber."
    },
    {
        "id": 8,
        "type": "mcq",
        "difficulty": "Easy",
        "points": 5,
        "q": "Seorang profesional bertugas mengumpulkan data transaksi, membersihkan data, mencari pola pembelian, dan menyajikan hasilnya melalui dashboard. Profesi yang paling tepat untuk pekerjaan tersebut adalah ....",
        "options": [
            "System Analyst.",
            "Database Administrator.",
            "Data Analyst.",
            "Programmer / Software Developer.",
            "Cybersecurity Specialist."
        ],
        "answer": 2,
        "explanation": "Data Analyst bertugas mengolah dataset mentah, melakukan pembersihan data (data cleaning), menemukan pola atau wawasan statistik, dan memvisualisasikannya ke dasbor untuk pengambilan keputusan.",
        "hint": "Profesi ini berfokus pada analisis pola data historis dan penyajian grafik visual informasi."
    },
    {
        "id": 9,
        "type": "checkbox",
        "maxSelect": 5,
        "difficulty": "Medium",
        "points": 5,
        "q": "Sebuah pemerintah daerah memanfaatkan teknologi digital untuk memperkenalkan kebudayaan daerah kepada generasi muda. Berdasarkan manfaat transformasi digital dalam materi, kegiatan tersebut dapat memberikan manfaat berupa .... (Pilih semua jawaban yang benar)",
        "options": [
            "Memperluas jangkauan pengenalan budaya.",
            "Mengurangi kebutuhan dokumentasi kebudayaan.",
            "Mendukung kegiatan pembelajaran.",
            "Mendorong kreativitas dalam pembuatan konten budaya.",
            "Menghilangkan peran masyarakat dalam pelestarian budaya."
        ],
        "answer": [
            0,
            2,
            3
        ],
        "explanation": "Manfaat transformasi digital budaya mencakup: memperluas jangkauan sebaran budaya secara global, mendukung sarana edukasi pembelajaran interaktif, dan memantik kreativitas konten lokal.",
        "hint": "Pilih manfaat positif yang memperluas jangkauan, mengedukasi, dan menumbuhkan kreativitas seni budaya."
    },
    {
        "id": 10,
        "type": "checkbox",
        "maxSelect": 5,
        "difficulty": "Medium",
        "points": 5,
        "q": "Seorang kreator membuat konten tentang tradisi suatu komunitas. Ia ingin memastikan informasi yang disampaikan tetap bertanggung jawab dan menghormati pemilik budaya. Tindakan yang sesuai dengan panduan etika kreator budaya digital adalah .... (Pilih semua jawaban yang benar)",
        "options": [
            "Mengambil dokumentasi pribadi masyarakat tanpa meminta izin.",
            "Memastikan informasi menggunakan sumber yang dapat dipercaya.",
            "Mengubah informasi sejarah agar lebih menarik perhatian.",
            "Mencantumkan sumber informasi yang digunakan.",
            "Menghormati masyarakat atau komunitas pemilik budaya."
        ],
        "answer": [
            1,
            3,
            4
        ],
        "explanation": "Etika kreator budaya digital mewajibkan validasi kebenaran informasi dari narasumber terpercaya, mencantumkan kredit sumber/atribusi, dan menjunjung tinggi kehormatan masyarakat adat pemilik budaya.",
        "hint": "Fokus pada prinsip kejujuran data, pencantuman atribusi, dan penghormatan martabat komunitas pemilik budaya."
    },
    {
        "id": 11,
        "type": "checkbox",
        "maxSelect": 5,
        "difficulty": "Hard",
        "points": 5,
        "q": "Sebuah perusahaan mengembangkan produk smartphone yang memiliki kode aplikasi, teknologi sensor sidik jari, logo, desain casing, dan resep internal perusahaan. Berdasarkan lima perlindungan HKI dalam materi, pasangan yang tepat adalah .... (Pilih semua jawaban yang benar)",
        "options": [
            "Kode aplikasi dilindungi melalui Hak Cipta.",
            "Logo produk dilindungi melalui Paten.",
            "Teknologi sensor sidik jari dilindungi melalui Paten.",
            "Desain casing dilindungi melalui Desain Industri.",
            "Resep internal perusahaan dilindungi melalui Rahasia Dagang."
        ],
        "answer": [
            0,
            2,
            3,
            4
        ],
        "explanation": "Kode aplikasi dilindungi Hak Cipta, inovasi teknologi sensor dilindungi Paten, bentuk estetika fisik casing dilindungi Desain Industri, dan formula rahasia dilindungi Rahasia Dagang. Logo dilindungi Merek (bukan Paten).",
        "hint": "Logo dilindungi rezim Merek, bukan Paten. Inovasi fungsi teknologi dilindungi Paten, dan bentuk fisik dilindungi Desain Industri."
    },
    {
        "id": 12,
        "type": "checkbox",
        "maxSelect": 5,
        "difficulty": "Medium",
        "points": 5,
        "q": "Sebuah tim teknologi sedang membangun aplikasi pembelajaran. Mereka melibatkan beberapa tenaga profesional dengan tanggung jawab berbeda. Pernyataan yang sesuai dengan tugas profesi Informatika dalam materi adalah .... (Pilih semua jawaban yang benar)",
        "options": [
            "UI/UX Designer merancang tampilan visual dan alur interaksi aplikasi.",
            "Network Engineer mengelola database siswa dan nilai akademik.",
            "AI/Machine Learning Engineer menyiapkan data serta melatih dan menguji model.",
            "Database Administrator melakukan backup dan recovery database.",
            "Cybersecurity Specialist bertugas membuat prototipe tampilan aplikasi."
        ],
        "answer": [
            0,
            2,
            3
        ],
        "explanation": "UI/UX Designer merancang antarmuka visual dan kenyamanan interaksi, AI Engineer melatih model cerdas, dan DBA mengelola keandalan data serta backup/recovery. Mengelola basis data adalah tugas DBA, bukan Network Engineer.",
        "hint": "Perhatikan pembagian tugas spesifik: UI/UX untuk desain pengalaman, AI Engineer untuk model data, dan DBA untuk keamanan penyimpanan basis data."
    },
    {
        "id": 13,
        "type": "checkbox",
        "maxSelect": 5,
        "difficulty": "Medium",
        "points": 5,
        "q": "Dalam sebuah tugas sekolah, seorang siswa menggunakan beberapa karya digital milik orang lain. Perilaku yang termasuk contoh pelanggaran HKI berdasarkan materi adalah .... (Pilih semua jawaban yang benar)",
        "options": [
            "Mencantumkan sumber foto yang digunakan.",
            "Mengakui karya orang lain sebagai hasil ciptaannya.",
            "Mengunggah ulang karya tanpa mematuhi ketentuan penggunaannya.",
            "Melakukan plagiasi tulisan tanpa mencantumkan sumber.",
            "Meminta izin kepada pemilik karya sebelum menggunakannya."
        ],
        "answer": [
            1,
            2,
            3
        ],
        "explanation": "Pelanggaran HKI mencakup plagiarisme (mengklaim ciptaan orang lain), re-upload ilegal tanpa mematuhi lisensi pemegang hak cipta, dan mencuri tulisan tanpa atribusi.",
        "hint": "Pilih tindakan tidak terpuji yang merampas hak moral pencipta atau mengabaikan aturan lisensi penggunaan."
    },
    {
        "id": 14,
        "type": "checkbox",
        "maxSelect": 5,
        "difficulty": "Hard",
        "points": 5,
        "q": "Dalam penggunaan karya digital, atribusi dan lisensi memiliki fungsi yang berbeda. Pernyataan yang benar mengenai kedua konsep tersebut adalah .... (Pilih semua jawaban yang benar)",
        "options": [
            "Atribusi menunjukkan asal informasi atau karya yang digunakan.",
            "Lisensi mengatur bagaimana orang lain diperbolehkan menggunakan karya.",
            "Pencantuman atribusi secara otomatis memberikan hak untuk menggunakan semua karya secara bebas.",
            "Ketentuan lisensi dapat mencakup larangan penggunaan untuk kepentingan komersial.",
            "Atribusi dapat diabaikan apabila karya digunakan untuk kepentingan pendidikan."
        ],
        "answer": [
            0,
            1,
            3
        ],
        "explanation": "Atribusi berfungsi memberikan kredit/pengakuan asal karya, sedangkan lisensi adalah izin hukum mengenai cara pemanfaatan karya (termasuk batasan non-komersial). Atribusi tidak otomatis menggugurkan ketentuan lisensi.",
        "hint": "Atribusi = identitas asal karya; Lisensi = izin hukum syarat pemanfaatan (misalnya lisensi Non-Commercial)."
    },
    {
        "id": 15,
        "type": "tf",
        "difficulty": "Easy",
        "points": 5,
        "q": "Digitalisasi budaya membantu masyarakat mendokumentasikan, menyimpan, mengelola, menyebarluaskan, dan memperkenalkan kebudayaan melalui teknologi digital.",
        "options": [
            "BENAR",
            "SALAH"
        ],
        "answer": 0,
        "explanation": "Pernyataan BENAR. Transformasi digital memberikan sarana terstruktur untuk preservasi jangka panjang dan promosi kekayaan budaya lokal.",
        "hint": "Cermati tujuan utama digitalisasi budaya sebagai upaya pelestarian dan penyebarluasan warisan leluhur."
    },
    {
        "id": 16,
        "type": "tf",
        "difficulty": "Easy",
        "points": 5,
        "q": "Web Developer bertugas mengembangkan situs web, sedangkan UI/UX Designer berfokus pada perancangan antarmuka dan pengalaman pengguna.",
        "options": [
            "BENAR",
            "SALAH"
        ],
        "answer": 0,
        "explanation": "Pernyataan BENAR. Web Developer mengimplementasikan fungsionalitas web, sedangkan UI/UX Designer mendesain estetika tampilan dan kenyamanan alur interaksi pengguna.",
        "hint": "Bandingkan fokus kerja teknis coding web dengan perancangan estetika antarmuka."
    },
    {
        "id": 17,
        "type": "tf",
        "difficulty": "Medium",
        "points": 5,
        "q": "Hak Cipta merupakan bentuk perlindungan yang digunakan untuk melindungi nama dagang dan logo agar dapat membedakan suatu produk dari produk lainnya.",
        "options": [
            "BENAR",
            "SALAH"
        ],
        "answer": 1,
        "explanation": "Pernyataan SALAH. Perlindungan hukum terhadap nama dagang, logo, dan simbol pembeda produk diatur dalam rezim Merek (Trademark), bukan Hak Cipta.",
        "hint": "Pikirkan rezim HKI yang khusus membedakan simbol merek dagang suatu barang dengan produk kompetitor."
    },
    {
        "id": 18,
        "type": "tf",
        "difficulty": "Easy",
        "points": 5,
        "q": "Database Administrator memiliki tanggung jawab dalam pengelolaan penyimpanan data, backup, recovery, dan pemantauan kinerja database.",
        "options": [
            "BENAR",
            "SALAH"
        ],
        "answer": 0,
        "explanation": "Pernyataan BENAR. Tugas utama DBA adalah memastikan ketersediaan, integritas, keamanan cadangan (backup), dan kecepatan akses basis data perusahaan.",
        "hint": "DBA adalah pengawal utama kesehatan dan keselamatan penyimpanan data sistem."
    },
    {
        "id": 19,
        "type": "tf",
        "difficulty": "Easy",
        "points": 5,
        "q": "Dalam membuat konten budaya digital, kreator perlu memvalidasi informasi, mencantumkan sumber, menjaga konteks asli, serta memperhatikan izin pribadi dan hak cipta.",
        "options": [
            "BENAR",
            "SALAH"
        ],
        "answer": 0,
        "explanation": "Pernyataan BENAR. Etika pembuatan konten edukasi budaya menuntut keaslian konteks sejarah, akurasi fakta, serta kepatuhan hukum hak cipta.",
        "hint": "Kreator bertanggung jawab terhadap kebenaran informasi dan penghormatan privasi komunitas adat."
    },
    {
        "id": 20,
        "type": "tf",
        "difficulty": "Medium",
        "points": 5,
        "q": "Jika suatu karya digital dapat diakses secara bebas melalui internet, karya tersebut otomatis boleh digandakan, diunggah ulang, dan digunakan untuk kepentingan komersial tanpa memperhatikan lisensi.",
        "options": [
            "BENAR",
            "SALAH"
        ],
        "answer": 1,
        "explanation": "Pernyataan SALAH. Aksesibilitas publik di internet tidak berarti materi tersebut berstatus domain publik atau bebas hak cipta. Penggunaan komersial wajib tunduk pada izin lisensi pencipta.",
        "hint": "Dapat dilihat secara gratis bukan berarti bebas dimanfaatkan untuk mencari keuntungan ekonomi."
    }
];

window.ETIKA_PRIVASI_BUILTIN_QUESTIONS = [
    {
        "id": 1,
        "type": "mcq",
        "difficulty": "Easy",
        "points": 5,
        "q": "Seorang siswa mengunggah video kegiatan sekolah ke media sosial. Beberapa bulan kemudian, video tersebut ditemukan kembali meskipun unggahan aslinya telah dihapus. Hal ini dapat terjadi karena ....",
        "options": [
            "Semua unggahan otomatis tersimpan selamanya di server sekolah.",
            "Penghapusan unggahan hanya berlaku untuk akun pembuatnya, bukan seluruh salinan yang sudah tersebar.",
            "Konten digital hanya dapat dihapus apabila pemilik akun menutup akunnya.",
            "Setiap konten yang pernah diunggah akan selalu muncul dalam hasil pencarian.",
            "Platform digital tidak menyediakan fitur penghapusan konten."
        ],
        "answer": 1,
        "explanation": "Sifat jejak digital (digital footprint) adalah mudah disalin dan disebarluaskan oleh pihak lain. Penghapusan di akun asli tidak otomatis menghapus salinan, tangkapan layar, atau unduhan yang telah disimpan orang lain.",
        "hint": "Pikirkan sifat jejak digital di mana konten yang pernah diunggah dapat diunduh atau dibagikan ulang oleh pengguna lain."
    },
    {
        "id": 2,
        "type": "mcq",
        "difficulty": "Easy",
        "points": 5,
        "q": "Di grup kelas beredar pesan WhatsApp yang menyatakan bahwa sekolah akan diliburkan besok. Pesan tersebut tidak mencantumkan sumber resmi. Seorang siswa ingin meneruskannya ke grup lain. Tindakan yang paling tepat adalah ....",
        "options": [
            "Meneruskan pesan dengan menambahkan keterangan bahwa informasi belum pasti.",
            "Menunggu teman lain memastikan informasi tersebut sebelum ikut menyebarkannya.",
            "Membagikan pesan karena berasal dari anggota grup kelas.",
            "Memeriksa pengumuman sekolah atau mengonfirmasi kepada guru sebelum membagikannya.",
            "Menghapus pesan tanpa perlu memeriksa kebenaran informasinya."
        ],
        "answer": 3,
        "explanation": "Prinsip verifikasi informasi digital adalah selalu menyaring sebelum membagikan (saring sebelum sharing) dengan memeriksa sumber primer atau otoritas resmi sekolah.",
        "hint": "Lakukan konfirmasi langsung ke pihak yang berwenang sebelum meneruskan informasi yang belum terbukti."
    },
    {
        "id": 3,
        "type": "mcq",
        "difficulty": "Easy",
        "points": 5,
        "q": "Seorang siswa menggunakan tanggal lahir sebagai kata sandi untuk email, Instagram, dan akun permainan. Suatu hari, salah satu akun mengalami kebocoran. Risiko utama dari kebiasaan tersebut adalah ....",
        "options": [
            "Akun lain berpotensi ikut diakses karena menggunakan kata sandi yang sama.",
            "Semua perangkat yang pernah digunakan otomatis mengalami kerusakan.",
            "Akun akan terkunci permanen setelah kata sandi diketahui orang lain.",
            "Data pada seluruh aplikasi otomatis terhapus dari perangkat.",
            "Pengguna tidak dapat mengganti kata sandi pada akun lainnya."
        ],
        "answer": 0,
        "explanation": "Praktik 'password reuse' (menggunakan kata sandi yang sama di banyak layanan) memicu efek domino serangan Credential Stuffing, di mana peretas menggunakan kredensial yang bocor untuk membobol seluruh akun lainnya.",
        "hint": "Jika satu kunci digunakan untuk semua pintu, saat kunci itu jatuh ke tangan orang jahat, semua pintu dapat dibuka."
    },
    {
        "id": 4,
        "type": "mcq",
        "difficulty": "Medium",
        "points": 5,
        "q": "Sebuah aplikasi sederhana meminta akses kamera, mikrofon, lokasi, dan daftar kontak sekaligus. Padahal, fungsi utama aplikasi tersebut hanya menampilkan catatan teks. Berdasarkan materi privasi digital, keputusan paling tepat adalah ....",
        "options": [
            "Memberikan seluruh izin agar aplikasi dapat bekerja tanpa gangguan.",
            "Mengizinkan akses selama aplikasi tersedia di toko aplikasi resmi.",
            "Menonaktifkan koneksi internet setiap kali membuka aplikasi.",
            "Menghapus aplikasi tanpa memeriksa fungsi dan kebutuhannya.",
            "Menolak izin yang tidak relevan dan meninjau kebijakan serta fungsi aplikasi."
        ],
        "answer": 4,
        "explanation": "Prinsip privasi digital 'Least Privilege' mengajarkan agar pengguna hanya memberikan izin yang benar-benar relevan dengan fungsi utama aplikasi dan menolak izin berlebih yang mencurigakan.",
        "hint": "Aplikasi catatan teks tidak membutuhkan kamera atau mikrofon untuk sekadar menulis teks."
    },
    {
        "id": 5,
        "type": "mcq",
        "difficulty": "Medium",
        "points": 5,
        "q": "Seorang pengguna ingin mengelola banyak akun tanpa menggunakan kata sandi yang sama. Ia memilih Password Manager. Bagaimana mekanisme utama alat tersebut membantu pengguna?",
        "options": [
            "Menggantikan seluruh proses autentikasi dengan satu akun utama.",
            "Menyimpan seluruh kata sandi dalam catatan yang dapat dibuka publik.",
            "Menyimpan kata sandi akun lain dalam brankas digital terenkripsi yang dilindungi master password.",
            "Membagikan kata sandi secara otomatis kepada semua perangkat yang terhubung.",
            "Menghapus kata sandi lama setiap kali pengguna membuat akun baru."
        ],
        "answer": 2,
        "explanation": "Password Manager bekerja dengan mengenkripsi seluruh kata sandi unik pengguna ke dalam brankas digital aman (vault) yang hanya dapat dibuka menggunakan satu 'master password' yang kuat.",
        "hint": "Password Manager mengamankan brankas digital dengan enkripsi dan satu kunci utama (master password)."
    },
    {
        "id": 6,
        "type": "mcq",
        "difficulty": "Easy",
        "points": 5,
        "q": "Seseorang menerima pesan dari pihak yang mengaku sebagai petugas layanan digital. Orang tersebut meminta kode OTP dengan alasan akun akan diblokir jika kode tidak diberikan. Berdasarkan materi, tindakan yang paling tepat adalah ....",
        "options": [
            "Memberikan kode apabila pihak tersebut mengetahui nama lengkap pengguna.",
            "Menutup percakapan, tidak memberikan OTP, lalu memeriksa akun melalui aplikasi resmi.",
            "Meminta petugas tersebut mengirimkan kode OTP pengganti.",
            "Membagikan kode setelah memastikan nomor pengirim terlihat resmi.",
            "Mengirimkan tangkapan layar pesan kepada anggota grup untuk meminta kode."
        ],
        "answer": 1,
        "explanation": "Kode OTP (One-Time Password) bersifat sangat rahasia seperti PIN ATM dan tidak boleh diberikan kepada siapa pun, termasuk pihak yang mengaku sebagai petugas resmi. Ini adalah taktik rekayasa sosial (social engineering).",
        "hint": "Petugas resmi tidak pernah meminta kode OTP; jangan pernah bagikan OTP kepada pihak mana pun."
    },
    {
        "id": 7,
        "type": "mcq",
        "difficulty": "Medium",
        "points": 5,
        "q": "Seorang pengguna telah menggunakan kata sandi yang kuat dan mengaktifkan 2FA. Namun, ia membagikan alamat rumah, lokasi harian, dan informasi keluarga secara terbuka. Kondisi tersebut menunjukkan bahwa ....",
        "options": [
            "Akun sudah sepenuhnya terlindungi karena memiliki dua lapisan autentikasi.",
            "Informasi pribadi tidak lagi berisiko karena kata sandi sulit ditebak.",
            "Pengaturan privasi tidak diperlukan selama perangkat memiliki kunci layar.",
            "Keamanan akun dan privasi merupakan hal yang berbeda dan harus dijaga bersamaan.",
            "Penggunaan 2FA secara otomatis membatasi orang lain melihat informasi pribadi."
        ],
        "answer": 3,
        "explanation": "Keamanan (Security) berfokus pada pencegahan akses ilegal ke sistem/akun, sedangkan Privasi (Privacy) berfokus pada pengendalian persebaran data pribadi pengguna. Keduanya merupakan domain berbeda yang wajib dijaga bersamaan.",
        "hint": "Akun yang aman dari peretasan tetap bisa mengalami kebocoran privasi jika penggunanya oversharing informasi pribadi."
    },
    {
        "id": 8,
        "type": "mcq",
        "difficulty": "Medium",
        "points": 5,
        "q": "Seorang pengguna mendapatkan notifikasi bahwa akun media sosialnya masuk dari perangkat yang tidak dikenal. Ia juga menemukan beberapa pesan terkirim tanpa sepengetahuannya. Urutan tindakan yang paling sesuai dengan materi adalah ....",
        "options": [
            "Mengabaikan notifikasi dan menunggu sampai akun kembali normal.",
            "Menghapus aplikasi, membuat akun baru, lalu membagikan informasi login kepada teman.",
            "Membuka tautan dalam notifikasi, memasukkan kata sandi, dan menunggu konfirmasi.",
            "Mengganti nama akun, menghapus seluruh unggahan, dan menonaktifkan koneksi internet.",
            "Membuka layanan resmi, mengganti kata sandi dari perangkat tepercaya, mengeluarkan sesi asing, dan mengaktifkan 2FA."
        ],
        "answer": 4,
        "explanation": "Langkah mitigasi pembajakan akun (account takeover) adalah segera login melalui kanal resmi, ganti kata sandi dengan yang baru dan kuat, putuskan seluruh sesi login asing (logout other devices), lalu aktifkan 2FA.",
        "hint": "Langkah pemulihan akun: amankan kata sandi baru, putuskan sesi perangkat tak dikenal, dan pasang 2FA."
    },
    {
        "id": 9,
        "type": "checkbox",
        "maxSelect": 5,
        "difficulty": "Medium",
        "points": 5,
        "q": "Sebuah konten digital dapat berbentuk informasi, karya, maupun media interaktif. Berdasarkan materi, contoh bentuk konten digital ditunjukkan oleh .... (Pilih semua jawaban yang benar)",
        "options": [
            "Artikel dan komentar pada platform digital.",
            "Foto, poster, dan infografis.",
            "Perangkat keras komputer dan kabel jaringan.",
            "Podcast dan rekaman suara.",
            "Polling, kuis, dan permainan digital."
        ],
        "answer": [
            0,
            1,
            3,
            4
        ],
        "explanation": "Bentuk konten digital meliputi teks (artikel, komentar), gambar (foto, infografis), audio (podcast), dan media interaktif (polling, kuis). Perangkat keras dan kabel adalah infrastruktur fisik, bukan konten digital.",
        "hint": "Pilih bentuk media digital informasi dan interaksi (teks, gambar, audio, dan interaktif), kecuali perangkat keras fisik."
    },
    {
        "id": 10,
        "type": "checkbox",
        "maxSelect": 5,
        "difficulty": "Medium",
        "points": 5,
        "q": "Seorang siswa menemukan unggahan yang berisi informasi mengejutkan mengenai kondisi sekolah. Ia belum mengetahui siapa pembuatnya dan apakah informasi tersebut benar. Sebelum membagikannya, tindakan yang tepat adalah .... (Pilih semua jawaban yang benar)",
        "options": [
            "Memeriksa identitas pembuat dan kredibilitas sumber.",
            "Melihat apakah informasi memiliki tanggal dan bukti pendukung.",
            "Memastikan apakah media lain juga mengonfirmasi informasi tersebut.",
            "Membagikannya terlebih dahulu agar orang lain dapat membantu memeriksa.",
            "Mempertimbangkan dampak informasi terhadap orang lain dan keutuhan konteksnya."
        ],
        "answer": [
            0,
            1,
            2,
            4
        ],
        "explanation": "Verifikasi informasi sebelum disebarkan mencakup cek kredibilitas sumber, validasi tanggal dan bukti, cek silang dengan media terpercaya, serta pertimbangan etika dampak informasi. Jangan pernah menyebarkan info yang belum terverifikasi.",
        "hint": "Semua tindakan verifikasi sumber, bukti, konfirmasi silang, dan dampak etika adalah benar, kecuali membagikannya sebelum terbukti."
    },
    {
        "id": 11,
        "type": "checkbox",
        "maxSelect": 5,
        "difficulty": "Medium",
        "points": 5,
        "q": "Sebuah kelompok siswa menemukan beberapa konten yang beredar di media sosial. Berdasarkan kategori konten berisiko dalam materi, contoh yang termasuk konten negatif adalah .... (Pilih semua jawaban yang benar)",
        "options": [
            "Tutorial pembelajaran yang membantu siswa memahami materi.",
            "Ujaran yang mengajak orang membenci kelompok tertentu.",
            "Penyebaran identitas dan informasi pribadi seseorang tanpa izin (doxing).",
            "Informasi resmi mengenai kegiatan beasiswa sekolah.",
            "Konten perundungan yang mempermalukan seseorang melalui media digital."
        ],
        "answer": [
            1,
            2,
            4
        ],
        "explanation": "Konten negatif berisiko meliputi ujaran kebencian (hate speech), doxing (penyebaran data pribadi tanpa izin), dan cyberbullying (perundungan siber). Tutorial edukatif dan beasiswa adalah konten positif.",
        "hint": "Pilih konten yang memicu kebencian, melanggar privasi orang lain, atau mempermalukan seseorang."
    },
    {
        "id": 12,
        "type": "checkbox",
        "maxSelect": 5,
        "difficulty": "Medium",
        "points": 5,
        "q": "Seorang siswa ingin memperkuat keamanan akun digitalnya. Ia memiliki akun email, media sosial, dan permainan daring. Tindakan yang sesuai dengan materi keamanan digital adalah .... (Pilih semua jawaban yang benar)",
        "options": [
            "Menggunakan kata sandi panjang, unik, dan sulit ditebak.",
            "Menggunakan satu kata sandi agar seluruh akun lebih mudah diingat.",
            "Mengaktifkan autentikasi dua langkah pada akun penting.",
            "Menyimpan semua kata sandi dalam catatan terbuka di ponsel.",
            "Memanfaatkan Password Manager tepercaya untuk mengelola kata sandi."
        ],
        "answer": [
            0,
            2,
            4
        ],
        "explanation": "Praktik keamanan digital yang baik adalah membuat kata sandi yang panjang dan unik untuk tiap akun, mengaktifkan 2FA, dan mengelolanya melalui Password Manager terenkripsi.",
        "hint": "Pilih kebiasaan baik: kata sandi unik, 2FA aktif, dan penggunaan Password Manager."
    },
    {
        "id": 13,
        "type": "checkbox",
        "maxSelect": 5,
        "difficulty": "Hard",
        "points": 5,
        "q": "Sebuah aplikasi meminta akses terhadap beberapa informasi dan fitur pada smartphone pengguna. Berdasarkan prinsip privasi digital, pernyataan yang benar adalah .... (Pilih semua jawaban yang benar)",
        "options": [
            "Akses kamera dapat dibutuhkan oleh aplikasi yang memiliki fitur mengambil foto atau video.",
            "Setiap aplikasi seharusnya memperoleh akses lokasi secara permanen.",
            "Izin mikrofon dapat diperlukan ketika aplikasi memiliki fitur perekaman suara atau panggilan.",
            "Akses kontak perlu dipertimbangkan berdasarkan fungsi aplikasi.",
            "Pengguna dapat meninjau dan mengubah izin aplikasi melalui pengaturan smartphone."
        ],
        "answer": [
            0,
            2,
            3,
            4
        ],
        "explanation": "Izin hardware (kamera, mikrofon, kontak) harus relevan dengan fungsionalitas aplikasi dan dapat ditinjau ulang di pengaturan ponsel. Tidak ada aplikasi yang seharusnya diberikan akses lokasi permanen tanpa alasan yang jelas.",
        "hint": "Aplikasi hanya boleh diberi izin sesuai fungsinya, dan pengguna memegang kendali penuh di pengaturan ponsel."
    },
    {
        "id": 14,
        "type": "checkbox",
        "maxSelect": 5,
        "difficulty": "Hard",
        "points": 5,
        "q": "Seorang pengguna ingin memastikan bahwa akun digitalnya tidak sedang digunakan oleh pihak lain. Berdasarkan materi pemeriksaan keamanan akun, tindakan yang tepat adalah .... (Pilih semua jawaban yang benar)",
        "options": [
            "Memeriksa perangkat, perkiraan lokasi, dan waktu aktivitas login.",
            "Mengabaikan kode OTP yang masuk tanpa diminta karena tidak berbahaya.",
            "Memeriksa apakah ada pesan yang terkirim tanpa sepengetahuannya.",
            "Memastikan email dan nomor pemulihan masih dapat digunakan.",
            "Mengeluarkan perangkat yang tidak dikenal dari sesi login akun."
        ],
        "answer": [
            0,
            2,
            3,
            4
        ],
        "explanation": "Audit keamanan akun mencakup inspeksi perangkat login aktif, mendeteksi aktivitas mencurigakan (pesan terkirim sendiri), memastikan kontak pemulihan aktif, dan memutus sesi perangkat tak dikenal. Kode OTP yang masuk tiba-tiba menandakan ada pihak yang sedang mencoba membobol akun.",
        "hint": "Periksa riwayat sesi perangkat, kontak pemulihan, aktivitas pesan, dan log out sesi asing."
    },
    {
        "id": 15,
        "type": "tf",
        "difficulty": "Easy",
        "points": 5,
        "q": "Konten digital dapat berupa teks, gambar, audio, video, dan konten interaktif. Setiap bentuk konten tersebut dapat memberikan pengaruh terhadap cara seseorang memperoleh informasi dan mengambil keputusan.",
        "options": [
            "BENAR",
            "SALAH"
        ],
        "answer": 0,
        "explanation": "Pernyataan BENAR. Konten multimedia digital membentuk persepsi, wawasan, serta memengaruhi pengambilan keputusan pengguna di era informasi.",
        "hint": "Pikirkan dampak konten informasi digital terhadap opini dan tindakan pembacanya."
    },
    {
        "id": 16,
        "type": "tf",
        "difficulty": "Easy",
        "points": 5,
        "q": "Sebuah konten yang memiliki banyak penonton dan dibagikan berulang kali dapat langsung dianggap sebagai informasi yang benar karena telah mendapat perhatian masyarakat.",
        "options": [
            "BENAR",
            "SALAH"
        ],
        "answer": 1,
        "explanation": "Pernyataan SALAH. Jumlah tayangan (views) atau viralitas suatu konten bukan indikator kebenaran. Banyak hoaks dan disinformasi sengaja dibuat viral untuk menarik perhatian.",
        "hint": "Viralitas tidak sama dengan validitas; kabar bohong sering kali menyebar lebih cepat daripada fakta."
    },
    {
        "id": 17,
        "type": "tf",
        "difficulty": "Easy",
        "points": 5,
        "q": "Penggunaan kata sandi yang sama pada email, media sosial, dan akun permainan dapat meningkatkan risiko karena kebocoran satu akun dapat mengancam akun lainnya.",
        "options": [
            "BENAR",
            "SALAH"
        ],
        "answer": 0,
        "explanation": "Pernyataan BENAR. Penggunaan kata sandi seragam menimbulkan kerentanan berantai jika salah satu basis data layanan diretas.",
        "hint": "Ingat konsep bahaya daur ulang kata sandi (password reuse)."
    },
    {
        "id": 18,
        "type": "tf",
        "difficulty": "Easy",
        "points": 5,
        "q": "Autentikasi dua langkah bekerja dengan menambahkan pemeriksaan identitas setelah pengguna memasukkan kata sandi, sehingga kata sandi saja tidak cukup untuk memberikan akses.",
        "options": [
            "BENAR",
            "SALAH"
        ],
        "answer": 0,
        "explanation": "Pernyataan BENAR. 2FA (Two-Factor Authentication) mewajibkan lapisan verifikasi kedua (seperti SMS, aplikasi autentikator, atau biometrik) selain kata sandi.",
        "hint": "Dua langkah berarti memerlukan dua faktor verifikasi yang berbeda untuk dapat login."
    },
    {
        "id": 19,
        "type": "tf",
        "difficulty": "Medium",
        "points": 5,
        "q": "Privasi digital berfokus pada kemampuan mengendalikan informasi pribadi, sedangkan keamanan digital berfokus pada perlindungan akun dan akses dari pihak yang tidak berwenang.",
        "options": [
            "BENAR",
            "SALAH"
        ],
        "answer": 0,
        "explanation": "Pernyataan BENAR. Privasi adalah kendali atas data diri, sedangkan keamanan adalah perlindungan teknis terhadap akses tidak sah.",
        "hint": "Bandingkan hak mengendalikan data pribadi (privasi) dengan pertahanan teknis akun (keamanan)."
    },
    {
        "id": 20,
        "type": "tf",
        "difficulty": "Easy",
        "points": 5,
        "q": "Apabila sebuah aplikasi meminta izin lokasi, kamera, mikrofon, dan kontak, pengguna harus menyetujui seluruh permintaan tersebut agar aplikasi dapat berjalan dengan optimal, meskipun izin tersebut tidak berkaitan dengan fungsinya.",
        "options": [
            "BENAR",
            "SALAH"
        ],
        "answer": 1,
        "explanation": "Pernyataan SALAH. Pengguna berhak dan dianjurkan untuk menolak izin yang tidak relevan demi mencegah penyalahgunaan data pribadi.",
        "hint": "Jangan memberikan izin akses data jika tidak diperlukan oleh fitur aplikasi tersebut."
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
    // Modul Penilaian Harian Baru: Teknologi Digital, Profesi, Budaya & HKI
    HKI_CULTURE_MODULE: {
        id: 'modul_hki_profesi_budaya',
        title: 'Penilaian Harian: Teknologi Digital, Profesi Informatika, Budaya & HKI',
        category: 'Dampak Sosial Informatika (DSI)',
        icon: '⚖️',
        badge: 'Penilaian Harian Baru',
        description: 'Evaluasi 20 butir soal Teknologi Digital, Profesi Informatika, Digitalisasi Budaya, Etika Kreator, Lisensi, dan Hak Kekayaan Intelektual (HKI) Kelas X.',
        questionCount: 20,
        kkm: 80,
        difficulty: 'Campuran (8 PG • 6 PG Kompleks • 6 Benar/Salah)',
        dataFile: 'bank_soal/modul_hki_profesi_budaya.json',
        isDefault: true,
        createdAt: '2026-11-15T08:00:00Z'
    },

        // Modul Penilaian Harian Baru: Etika, Privasi, dan Keamanan Digital
    ETIKA_PRIVASI_MODULE: {
        id: 'modul_etika_privasi_keamanan',
        title: 'Penilaian Harian: Etika, Privasi, dan Keamanan Digital',
        category: 'Dampak Sosial Informatika (DSI)',
        icon: '🔒',
        badge: 'Penilaian Harian Baru',
        description: 'Evaluasi 20 butir soal Jejak Digital, Etika Konten, Privasi Informasi, Kata Sandi Kuat, 2FA/OTP, dan Penanganan Insiden Keamanan Akun Kelas X.',
        questionCount: 20,
        kkm: 80,
        difficulty: 'Campuran (8 PG • 6 PG Kompleks • 6 Benar/Salah)',
        dataFile: 'bank_soal/modul_etika_privasi_keamanan.json',
        isDefault: true,
        createdAt: '2026-11-15T09:00:00Z'
    },

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

        // Pastikan urutan kanonikal:
        // Index 0: Modul 1 (Penilaian Harian: Jaringan & Keamanan) - Modul Utama Ujian
        // Index 1: Modul 2 (Misi Detektif Fakta)
        // Index 2+: Modul tambahan buatan guru
        const customModules = (Array.isArray(list) ? list : []).filter(
            m => m && m.id !== this.DEFAULT_MODULE.id && m.id !== this.NETWORK_SECURITY_MODULE.id && m.id !== this.HKI_CULTURE_MODULE.id && m.id !== this.ETIKA_PRIVASI_MODULE.id
        );

        const orderedList = [
            this.NETWORK_SECURITY_MODULE,
            this.DEFAULT_MODULE,
            this.HKI_CULTURE_MODULE,
            this.ETIKA_PRIVASI_MODULE,
            ...customModules
        ];

        this.saveModulesList(orderedList);
        return orderedList;
    },

    saveModulesList(modulesList) {
        localStorage.setItem(this.MODULES_STORAGE_KEY, JSON.stringify(modulesList));
    },

    getActiveModuleId() {
        try {
            const examMode = localStorage.getItem('quizmaster_active_exam_module_mode');
            if (examMode && examMode !== 'all') {
                return examMode;
            }
        } catch(e) {}
        return localStorage.getItem(this.ACTIVE_MODULE_KEY) || this.NETWORK_SECURITY_MODULE.id;
    },

    setActiveModuleId(id, broadcast = false) {
        if (!id) return;
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

                        if (targetId === this.ETIKA_PRIVASI_MODULE.id) {
            try {
                const res = await fetch('bank_soal/modul_etika_privasi_keamanan.json');
                if (res.ok) {
                    const data = await res.json();
                    if (data && Array.isArray(data.questions) && data.questions.length > 0) {
                        window.quizData = data.questions;
                        return data.questions;
                    }
                }
            } catch (e) {
                console.warn('Fetch modul_etika_privasi_keamanan.json gagal, menggunakan fallback bawaan:', e);
            }
            if (Array.isArray(window.ETIKA_PRIVASI_BUILTIN_QUESTIONS)) {
                window.quizData = window.ETIKA_PRIVASI_BUILTIN_QUESTIONS;
                return window.ETIKA_PRIVASI_BUILTIN_QUESTIONS;
            }
        }

        if (targetId === this.HKI_CULTURE_MODULE.id) {
            try {
                const res = await fetch('bank_soal/modul_hki_profesi_budaya.json');
                if (res.ok) {
                    const data = await res.json();
                    if (data && Array.isArray(data.questions) && data.questions.length > 0) {
                        window.quizData = data.questions;
                        return data.questions;
                    }
                }
            } catch (e) {
                console.warn('Fetch modul_hki_profesi_budaya.json gagal, menggunakan fallback bawaan:', e);
            }
            if (Array.isArray(window.HKI_CULTURE_BUILTIN_QUESTIONS)) {
                window.quizData = window.HKI_CULTURE_BUILTIN_QUESTIONS;
                return window.HKI_CULTURE_BUILTIN_QUESTIONS;
            }
        }

        if (targetId === this.NETWORK_SECURITY_MODULE.id || targetId === 'modul_keamanan_jaringan') {
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