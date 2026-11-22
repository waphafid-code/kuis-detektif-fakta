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
            "Switch mampu mengubah sinyal digital menjadi gelombang analog untuk transmisi saluran telepon kabel.",
            "Switch menyebarkan seluruh paket data ke semua port secara acak dalam waktu bersamaan.",
            "Switch menghubungkan jaringan lokal laboratorium langsung dengan infrastruktur jaringan berskala global.",
            "Switch meneruskan data langsung ke alamat port tujuan secara spesifik."
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
        "answer": [
            1,
            2
        ],
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
            "Seluruh komputer di lantai 1, 2, dan 3 mengalami kelumpuhan total karena kegagalan pada simpul percabangan utama.",
            "Komputer lantai 2 terputus dari server pusat namun koneksi internal antarsesama PC lantai 2 tetap berfungsi normal.",
            "Komputer di lantai 1 dan 3 kehilangan koneksi lokal namun komunikasi data ke server pusat tetap berlangsung stabil.",
            "Jaringan di lantai 2 secara otomatis berpindah konfigurasi menjadi topologi Ring mandiri tanpa intervensi perangkat."
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
        "answer": [
            1,
            2
        ],
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
            "Penyebaran perangkat lunak jahat (Malware Ransomware) untuk menyandera dokumen penting milik korban.",
            "Rekayasa sosial melalui teknik Phising menggunakan halaman tiruan untuk memancing data rahasia korban.",
            "Aktivitas Sniffing berupa penyadapan pasif paket data pada jaringan terbuka.",
            "Perusakan fisik perangkat pemancar sinyal (Access Point) menggunakan interferensi gelombang elektromagnetik."
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
            "Pilar Availability (Menjamin ketersediaan layanan sistem bagi pengguna yang berhak).",
            "Pilar Integrity (Menjamin keutuhan data dan mencegah modifikasi tidak sah).",
            "Pilar Confidentiality (Menjamin kerahasiaan data agar tidak diakses pihak luar).",
            "Pilar Authentication (Menjamin pembuktian keabsahan identitas pihak pengirim data)."
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
        "answer": [
            0,
            1,
            2
        ],
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
            "Kabel UTP tanpa pelindung untuk jalur antargedung dan konektor nirkabel Bluetooth untuk laptop karyawan kantor.",
            "Gelombang Wi-Fi luar ruang untuk antargedung dan kabel Koaksial kaku untuk koneksi laptop karyawan di ruangan.",
            "Kabel Fiber Optik antargedung dan Access Point (Wi-Fi) untuk laptop di dalam gedung.",
            "Perangkat Hub untuk jalur antargedung dan kabel STP berpelindung untuk koneksi gawai karyawan di ruangan."
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
        "answer": [
            0,
            1,
            2
        ],
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
            "Penyadapan Sniffing — Serangan Phising — Kerahasiaan Data (Confidentiality)",
            "Phising — Malware (Ransomware) — Ketersediaan (Availability)",
            "Malware (Virus Komputer) — Sniffing — Keutuhan Data (Integrity)",
            "Phising — Penyadapan Sniffing — Keaslian Pengguna (Authentication)"
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
            "Menggantikan seluruh kegiatan kebudayaan fisik yang dilakukan masyarakat secara turun-temurun.",
            "Membatasi penyebaran informasi nilai tradisi agar hanya dinikmati oleh kelompok masyarakat tertentu.",
            "Mengubah seluruh warisan budaya daerah menjadi komoditas produk teknologi komersial modern.",
            "Mendokumentasikan, melestarikan, dan memperkenalkan kebudayaan ke masyarakat luas.",
            "Mengurangi keterlibatan langsung masyarakat lokal dalam merawat tradisi kesenian daerah mereka."
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
            "Budaya Kita: Portal Komunitas Pelestari Tradisi Terbuka.",
            "SPKT (Sistem Pendataan Kebudayaan Terpadu).",
            "SIWB (Sistem Informasi Warisan Budaya Nasional Terintegrasi).",
            "PDMD (Platform Dokumentasi Manuskrip dan Tradisi Daerah).",
            "PPBD (Portal Pengenalan Budaya Digital Berbasis Komunitas)."
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
            "Web Developer / Pengembang Antarmuka Web.",
            "System Analyst / Perancang Arsitektur Sistem.",
            "Programmer / Software Developer.",
            "Data Analyst / Spesialis Pengolah Pola Data.",
            "Database Administrator / Pengelola Basis Data."
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
            "UI/UX Designer / Perancang Interaksi Pengguna.",
            "Network Engineer / Arsitek Konektivitas Jaringan.",
            "Cybersecurity Specialist / Analis Keamanan Siber.",
            "Database Administrator / Pengelola Basis Data.",
            "System Analyst / Analis Kebutuhan Sistem."
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
            "Data Analyst / Analis Pola Data.",
            "Network Engineer / Teknisi Jaringan.",
            "System Analyst / Analis Kebutuhan Sistem.",
            "AI Engineer / Pengembang Model Kecerdasan.",
            "Web Developer / Pengembang Aplikasi Web."
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
            "Menggunakan foto tersebut secara bebas dengan anggapan seluruh materi di internet adalah domain publik.",
            "Menghapus tanda kepemilikan pencipta agar tampilan materi presentasi terlihat lebih rapi dan ringkas.",
            "Mengunggah ulang foto ke platform lain tanpa memverifikasi hak cipta dan ketentuan lisensi pemilik karya.",
            "Memeriksa izin lisensi karya dan mencantumkan sumber atribusinya.",
            "Menggunakan karya tanpa konfirmasi tertulis selama tujuannya tidak untuk memperoleh keuntungan finansial."
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
            "System Analyst / Analis Arsitektur Sistem.",
            "Database Administrator / Administrator Data.",
            "Data Analyst / Analis Pengolah Data.",
            "Programmer / Software Developer Perangkat Lunak.",
            "Cybersecurity Specialist / Spesialis Keamanan."
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
            "Seluruh rekaman unggahan digital secara otomatis tersimpan permanen di pusat server sekolah.",
            "Salinan konten telah diunduh, dibagikan ulang, atau disimpan oleh pengguna lain.",
            "Konten digital hanya dapat dibersihkan tuntas apabila pemilik menutup akunnya secara permanen.",
            "Setiap berkas yang pernah diunggah otomatis tersinkronisasi selamanya ke indeks pencarian publik.",
            "Penyedia platform media sosial tidak menyediakan fasilitas penghapusan bagi pengguna berstatus pelajar."
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
            "Meneruskan pesan ke grup lain dengan mencantumkan catatan tambahan bahwa kabar ini belum tentu benar.",
            "Menunggu teman lain memastikan kebenaran informasi tersebut sebelum memutuskan ikut menyebarkannya.",
            "Membagikan pesan ke forum lain karena informasi tersebut berasal dari rekan tepercaya di grup kelas.",
            "Mengonfirmasi kebenaran informasi langsung ke pihak sekolah atau guru.",
            "Menghapus pesan seketika tanpa perlu menelusuri kebenaran informasinya demi ketertiban komunikasi kelas."
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
            "Akun lain berisiko ikut dibobol karena menggunakan kata sandi yang sama.",
            "Perangkat gawai yang pernah digunakan login otomatis mengalami kerusakan sistem operasi yang parah.",
            "Seluruh akun media sosial akan langsung terkunci permanen oleh server pusat tanpa bisa dipulihkan.",
            "Data penting pada seluruh aplikasi perbankan otomatis terhapus secara permanen dari memori perangkat.",
            "Pengguna kehilangan hak administratif untuk memperbarui kata sandi pada layanan aplikasi lainnya."
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
            "Memberikan seluruh izin agar aplikasi catatan teks dapat bekerja optimal tanpa kendala notifikasi sistem.",
            "Mengizinkan seluruh akses selama aplikasi tersebut telah terdaftar resmi di toko aplikasi smartphone.",
            "Mematikan sambungan internet seluler setiap kali hendak membuka dan membaca berkas catatan pada aplikasi.",
            "Menolak izin berlebih yang tidak relevan dengan fungsi utama aplikasi.",
            "Menghapus aplikasi tanpa meninjau ulang pengaturan hak akses data yang sebenarnya dibutuhkan pengguna."
        ],
        "answer": 3,
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
            "Menggabungkan seluruh proses autentikasi login multi-aplikasi ke dalam satu akun profil publik terpadu.",
            "Menyimpan seluruh kata sandi dalam basis data catatan daring terbuka yang dapat disinkronkan secara bebas.",
            "Menyimpan kata sandi terenkripsi dalam brankas digital ber-master password.",
            "Membagikan kata sandi secara otomatis tanpa pengamanan ke semua perangkat yang terhubung dalam satu jaringan.",
            "Menghapus kata sandi akun lama secara berkala setiap kali pengguna mendaftarkan akun baru pada peramban web."
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
            "Memberikan kode OTP apabila penelepon dapat menyebutkan nama lengkap serta nomor kartu keluarga korban.",
            "Menutup kontak, menolak membagikan OTP, dan mengecek akun lewat kanal resmi.",
            "Meminta petugas tersebut mengirimkan kode verifikasi pengganti melalui jalur percakapan media sosial.",
            "Membagikan kode setelah memastikan nomor telepon penelepon menggunakan format kode area resmi perusahaan.",
            "Meneruskan tangkapan layar pesan ke forum grup percakapan daring untuk meminta konfirmasi keaslian kode."
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
            "Akun sudah sepenuhnya aman dari segala risiko kebocoran karena memiliki dua lapisan pengamanan ganda.",
            "Informasi pribadi tidak lagi mengandung ancaman kejahatan selama kata sandi sulit ditebak oleh orang lain.",
            "Pengaturan privasi tidak diperlukan lagi apabila gawai pengguna telah dilengkapi pemindai sidik jari.",
            "Keamanan akun dan privasi data adalah hal berbeda yang wajib dijaga bersama.",
            "Fitur 2FA secara otomatis menyaring orang lain agar tidak bisa melihat data pribadi yang diunggah publik."
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
            "Mengabaikan notifikasi tersebut dan menunggu sistem peladen aplikasi memulihkan akun secara otomatis.",
            "Menghapus aplikasi dari gawai, mendaftar akun baru, lalu membagikan kata sandi baru kepada rekan dekat.",
            "Mengeklik tautan dalam notifikasi asing tersebut dan memasukkan ulang kata sandi lama untuk konfirmasi.",
            "Mengganti nama profil, menghapus seluruh unggahan, dan mematikan koneksi data seluler pada perangkat.",
            "Ganti kata sandi di kanal resmi, putuskan sesi perangkat asing, dan pasang 2FA."
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


window.TRYOUT_TERPADU_BUILTIN_QUESTIONS = [
  {
    "id": 1,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M1",
    "topicName": "Literasi Digital & Ekosistem Periksa Fakta",
    "q": "Sebuah klaim kesehatan palsu menyebar secara masif lintas negara dalam hitungan jam dengan variasi narasi yang disesuaikan dengan bahasa lokal masing-masing negara. Agar proses verifikasi berjalan cepat tanpa mengulang investigasi dari nol di setiap wilayah, komponen ekosistem periksa fakta yang paling krusial diaktifkan adalah ....",
    "options": [
      "dukungan pendanaan dan perlindungan hukum dari institusi pemerintah setempat",
      "penghapusan otomatis seluruh unggahan serupa oleh administrator platform media sosial",
      "jaringan kolaboratif antarorganisasi periksa fakta untuk berbagi metode dan hasil riset",
      "penerbitan pedoman metodologi verifikasi kepada masyarakat umum melalui laman resmi",
      "pelaporan mandiri oleh pengguna individu melalui layanan pesan singkat pengaduan"
    ],
    "answer": 2,
    "explanation": "Jaringan kolaboratif memungkinkan organisasi periksa fakta saling berbagi metode, bukti, dan hasil verifikasi sehingga hoaks lintas wilayah tertangani efisien."
  },
  {
    "id": 2,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M1",
    "topicName": "Literasi Digital & Ekosistem Periksa Fakta",
    "q": "Seorang siswa menerima tautan artikel dari sebuah situs berita yang belum pernah dikenalnya. Artikel tersebut memuat kutipan pakar tanpa mencantumkan tautan rujukan asli. Langkah paling tepat yang mencerminkan penerapan keterampilan membaca lateral (lateral reading) oleh individu adalah ....",
    "options": [
      "membaca ulang seluruh isi artikel dari awal hingga akhir untuk mencari kesalahan tata bahasa",
      "membuka tab baru untuk menelusuri rekam jejak situs tersebut serta memeriksa konfirmasi di media kredibel lain",
      "memeriksa bagian halaman depan dan kolom profil redaksi yang tercantum di dalam situs yang sama",
      "meneruskan tautan artikel ke grup diskusi kelas agar teman lain ikut menilai kebenarannya",
      "menyimpan halaman artikel tersebut ke penyimpanan lokal sebelum memutuskan untuk membagikannya"
    ],
    "answer": 1,
    "explanation": "Membaca lateral (lateral reading) dilakukan dengan membuka sumber eksternal tepercaya untuk memverifikasi kredibilitas situs dan klaim secara silang."
  },
  {
    "id": 3,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M1",
    "topicName": "Literasi Digital & Ekosistem Periksa Fakta",
    "q": "Beberapa kelompok masyarakat menuduh lembaga pemeriksa fakta bersikap subjektif ketika melabeli suatu unggahan viral sebagai informasi menyesatkan. Dalam ekosistem periksa fakta, mekanisme utama yang digunakan organisasi periksa fakta untuk membuktikan objektivitas kesimpulannya adalah ....",
    "options": [
      "meminta lembaga pemerintah memblokir akses situs penyebar klaim tanpa perlu penjelasan publik",
      "merahasiakan sumber rujukan ahli agar tim pemeriksa terhindar dari tekanan warganet",
      "menyerahkan seluruh keputusan penetapan label hoaks kepada algoritma platform media sosial",
      "menerapkan transparansi dan metodologi dengan memublikasikan tahapan serta bukti proses verifikasi",
      "membatasi pemeriksaan hanya pada informasi yang telah dilaporkan oleh lebih dari seribu pengguna"
    ],
    "answer": 3,
    "explanation": "Transparansi dan metodologi menjamin publik dapat menelusuri langkah investigasi serta bukti objektif yang mendasari kesimpulan verifikasi."
  },
  {
    "id": 4,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M1",
    "topicName": "Literasi Digital & Ekosistem Periksa Fakta",
    "q": "Dalam kerja sama ekosistem periksa fakta, terdapat pembagian peran yang jelas antara organisasi periksa fakta dan platform media sosial. Ketika sebuah unggahan terindikasi mengandung misinformasi, bentuk kontribusi spesifik yang dijalankan oleh platform media sosial dan teknologi adalah ....",
    "options": [
      "menandai konten bermasalah tersebut dan mengarahkan pengguna menuju rujukan informasi terverifikasi",
      "menyusun laporan investigasi ilmiah mendalam untuk membantah setiap klaim yang beredar",
      "menyediakan anggaran hibah operasional tahunan bagi seluruh jaringan pemeriksa fakta independen",
      "menjatuhkan sanksi pidana siber kepada pemilik akun yang pertama kali mengunggah konten",
      "menyelenggarakan kurikulum pelatihan literasi media formal di seluruh sekolah menengah"
    ],
    "answer": 0,
    "explanation": "Platform media sosial dan teknologi bekerja sama menandai konten hoaks serta mengarahkan pengguna ke tautan informasi yang telah terverifikasi."
  },
  {
    "id": 5,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M1",
    "topicName": "Literasi Digital & Ekosistem Periksa Fakta",
    "q": "Budi menemukan sebuah unggahan berisi informasi palsu mengenai jadwal pencairan bantuan pemerintah dan ingin melaporkannya melalui kanal resmi Kementerian Komunikasi dan Informatika (Kominfo) sekaligus memantau apakah aduannya telah ditindaklanjuti. Prosedur lengkap yang sesuai ketentuan adalah ....",
    "options": [
      "mengirim ringkasan cerita ke cybercrime@polri.go.id lalu memantau hasilnya di laman turnbackhoax.id",
      "menghubungi Chatbot Kalimasada di nomor +62 8592 1600 500 tanpa perlu menyertakan bukti visual",
      "mengirim pesan teks ke +62811-1000-0579 dengan mencantumkan identitas lengkap pelapor secara terbuka",
      "mengunggah ulang konten hoaks tersebut di media sosial dengan memberi tagar laporan ke akun resmi Kominfo",
      "mengirim screen capture beserta URL tautan ke aduankonten@mail.kominfo.go.id dan memantau di trustpositif.kominfo.go.id"
    ],
    "answer": 4,
    "explanation": "Aduan hoaks ke Kominfo dikirimkan dengan screen capture dan URL tautan ke aduankonten@mail.kominfo.go.id serta dipantau melalui trustpositif.kominfo.go.id."
  },
  {
    "id": 6,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M1",
    "topicName": "Literasi Digital & Ekosistem Periksa Fakta",
    "q": "Masyarakat Anti Fitnah Indonesia (Mafindo) menyediakan kanal partisipasi publik bagi warga yang ingin melaporkan dugaan konten hoaks secara cepat melalui layanan pesan instan maupun portal web. Kanal resmi yang dikelola oleh Mafindo adalah ....",
    "options": [
      "laman trustpositif.kominfo.go.id dan alamat pos elektronik aduankonten@mail.kominfo.go.id",
      "portal https://turnbackhoax.id/lapor-hoax/ dan layanan Chatbot Kalimasada di nomor +62 8592 1600 500",
      "alamat pos elektronik cybercrime@polri.go.id dan layanan polisionline.net@gmail.com",
      "tipline pengaduan konten hoaks pemerintah melalui nomor chatbot +62811-1000-0579",
      "portal Sistem Pendataan Kebudayaan Terpadu (SPKT) melalui fitur Urun Daya masyarakat"
    ],
    "answer": 1,
    "explanation": "Kanal resmi pelaporan hoaks produk Mafindo adalah laman turnbackhoax.id/lapor-hoax/ dan Chatbot Kalimasada pada nomor +62 8592 1600 500."
  },
  {
    "id": 7,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M1",
    "topicName": "Literasi Digital & Ekosistem Periksa Fakta",
    "q": "Keberadaan ekosistem periksa fakta sering kali disalahpahami sebagai upaya membatasi kebebasan berpendapat di ruang digital. Padahal, tujuan utama dibangunnya ekosistem periksa fakta adalah ....",
    "options": [
      "menggantikan peran jurnalisme profesional sebagai satu-satunya sumber berita resmi negara",
      "menghapus seluruh perbedaan opini politik maupun kritik sosial yang muncul di media sosial",
      "memusatkan kendali seluruh percakapan digital di bawah pengawasan satu lembaga tunggal",
      "membantu masyarakat mengakses informasi yang akurat serta mendorong literasi media yang lebih baik",
      "membatasi akses pengguna internet agar hanya dapat membuka situs milik instansi pemerintah"
    ],
    "answer": 3,
    "explanation": "Tujuan utama ekosistem periksa fakta adalah membantu masyarakat mengakses informasi akurat sekaligus meningkatkan literasi media secara kritis."
  },
  {
    "id": 8,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M1",
    "topicName": "Literasi Digital & Ekosistem Periksa Fakta",
    "q": "Selain melalui Kominfo dan Mafindo, masyarakat juga dapat melaporkan konten hoaks yang mengandung unsur tindak pidana siber secara langsung melalui jalur surat elektronik kepolisian. Alamat surel yang disediakan untuk pelaporan tersebut adalah ....",
    "options": [
      "cybercrime@polri.go.id dan polisionline.net@gmail.com",
      "aduankonten@mail.kominfo.go.id dan trustpositif@kominfo.go.id",
      "lapor-hoax@turnbackhoax.id dan kalimasada@mafindo.or.id",
      "pengaduan@siberkreasi.id dan literasi@kominfo.go.id",
      "verifikasi@cekfakta.com dan aduan@bssn.go.id"
    ],
    "answer": 0,
    "explanation": "Kanal pelaporan kejahatan siber berbasis pos elektronik kepolisian adalah cybercrime@polri.go.id dan polisionline.net@gmail.com. No. Materi Kunci Konsep Kunci & Dasar Pembahasan"
  },
  {
    "id": 9,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M1",
    "topicName": "Literasi Digital & Ekosistem Periksa Fakta",
    "q": "Ketika pengguna media sosial menemukan unggahan menyesatkan, lalu menekan tombol lapor (report) sehingga platform meninjau dan menghapus unggahan tersebut, peristiwa ini menunjukkan berjalannya komponen ekosistem periksa fakta berupa ....",
    "options": [
      "transparansi metodologi dan publikasi hasil riset verifikasi",
      "dukungan sumber daya serta perlindungan hukum dari pemerintah",
      "pelaporan dan penghapusan konten palsu oleh pengguna dan platform",
      "jaringan kolaboratif lintas organisasi pemeriksa fakta internasional",
      "pendidikan formal literasi media di lingkungan sekolah dan kampus"
    ],
    "answer": 2,
    "explanation": "Partisipasi pengguna melaporkan konten meragukan yang ditindaklanjuti dengan penandaan atau penghapusan oleh platform merupakan komponen pelaporan konten palsu."
  },
  {
    "id": 10,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M1",
    "topicName": "Literasi Digital & Ekosistem Periksa Fakta",
    "q": "Dalam ekosistem periksa fakta, institusi dan pemerintah memiliki peran penting agar organisasi pemeriksa fakta mampu bertahan menghadapi ancaman gugatan maupun keterbatasan biaya operasional. Bentuk dukungan yang tepat tanpa merusak independensi verifikasi adalah ....",
    "options": [
      "menentukan kesimpulan akhir apakah suatu berita layak diberi label hoaks atau fakta",
      "mewajibkan seluruh organisasi periksa fakta meminta persetujuan pejabat sebelum merilis artikel",
      "mengambil alih seluruh tim ahli pemeriksa fakta menjadi pegawai struktural kementerian",
      "melarang organisasi periksa fakta bekerja sama dengan jaringan pemeriksa fakta luar negeri",
      "menyediakan dukungan pendanaan, sumber daya, serta perlindungan hukum bagi organisasi periksa fakta"
    ],
    "answer": 4,
    "explanation": "Institusi dan pemerintah berperan menyediakan dukungan pendanaan, sumber daya, serta perlindungan hukum tanpa mengintervensi independensi hasil verifikasi."
  },
  {
    "id": 11,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M2",
    "topicName": "Web Browser, Search Engine, & Manajemen Konten",
    "q": "Seorang siswa mengira bahwa Google Chrome dan Google Search merupakan satu perangkat lunak yang sama karena keduanya sering digunakan bersamaan saat mencari tugas. Perbedaan mendasar yang paling tepat antara web browser dan search engine adalah ....",
    "options": [
      "web browser hanya bekerja saat terhubung ke internet, sedangkan search engine dapat berjalan tanpa jaringan",
      "web browser adalah perangkat lunak klien untuk mengakses dan menampilkan laman web, sedangkan search engine adalah program berbasis web untuk mencari informasi di WWW",
      "web browser bertugas mengindeks seluruh situs di dunia, sedangkan search engine bertugas menyimpan berkas unduhan ke cakram lokal",
      "web browser hanya mampu menampilkan konten teks statis, sedangkan search engine menampilkan konten multimedia dan video",
      "web browser memerlukan kata kunci untuk membuka alamat situs, sedangkan search engine memerlukan alamat IP numerik"
    ],
    "answer": 1,
    "explanation": "Web browser adalah aplikasi perangkat lunak untuk menampilkan isi web, sedangkan search engine adalah program berbasis web untuk mencari halaman di WWW."
  },
  {
    "id": 12,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M2",
    "topicName": "Web Browser, Search Engine, & Manajemen Konten",
    "q": "Sebuah jurnal ilmiah milik universitas baru saja diterbitkan secara daring sepuluh menit lalu dengan alamat URL yang valid. Namun, ketika mahasiswa mengetikkan judul artikel tersebut di mesin pencari, artikel belum muncul di daftar hasil pencarian. Penyebab teknis paling logis dari kondisi ini adalah ....",
    "options": [
      "komputer mahasiswa menggunakan web browser yang tidak mendukung protokol penyimpanan berkas lokal",
      "situs universitas tidak mengizinkan pengguna memakai operator pencarian logika pada kolom kueri",
      "algoritma ranking secara otomatis memblokir seluruh artikel ilmiah yang usianya kurang dari satu hari",
      "proses crawling oleh bots/spiders belum menemukan dan mencatat URL halaman baru tersebut ke dalam tahap indexing",
      "mahasiswa belum mengaktifkan aplikasi read-it-later untuk menyinkronkan halaman web ke perangkatnya"
    ],
    "answer": 3,
    "explanation": "Laman baru belum muncul di hasil pencarian apabila bots/spiders belum menyelesaikan tahap crawling dan indexing terhadap URL tersebut."
  },
  {
    "id": 13,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M2",
    "topicName": "Web Browser, Search Engine, & Manajemen Konten",
    "q": "Dalam praktik pencarian informasi menggunakan mesin pencari, seorang siswa mengetikkan kueri \"mobil listrik AND penjualan 2020\". Pengaruh penggunaan operator logika AND pada kueri tersebut terhadap hasil penelusuran adalah ....",
    "options": [
      "mempersempit hasil dengan hanya menampilkan halaman yang memuat kedua istilah tersebut secara bersamaan",
      "memperluas hasil dengan menampilkan seluruh halaman yang memuat salah satu dari kedua istilah tersebut",
      "mengecualikan seluruh halaman web yang membahas data penjualan kendaraan pada tahun 2020",
      "mengurutkan halaman berdasarkan tanggal publikasi terbaru tanpa mempertimbangkan relevansi kata kunci",
      "membatasi hasil penelusuran hanya pada situs web yang memiliki akhiran domain lembaga pemerintah"
    ],
    "answer": 0,
    "explanation": "Operator logika AND mensyaratkan kedua istilah muncul bersamaan pada dokumen sehingga hasil pencarian menjadi jauh lebih spesifik."
  },
  {
    "id": 14,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M2",
    "topicName": "Web Browser, Search Engine, & Manajemen Konten",
    "q": "Rani sedang menyusun karya tulis mengenai kebijakan subsidi energi terbarukan di Indonesia, tetapi hasil pencariannya selalu dipenuhi berita mengenai pembangkit listrik tenaga batubara. Formulasi kata kunci dengan operator pencarian paling efektif untuk mengatasi masalah Rani adalah ....",
    "options": [
      "\"energi terbarukan\" OR subsidi OR Indonesia OR batubara",
      "\"energi terbarukan\" AND batubara NOT subsidi AND Indonesia",
      "\"energi terbarukan\" AND subsidi AND Indonesia NOT batubara",
      "subsidi NOT \"energi terbarukan\" AND Indonesia OR batubara",
      "Indonesia NOT subsidi OR \"energi terbarukan\" AND batubara"
    ],
    "answer": 2,
    "explanation": "Kombinasi operator AND menggabungkan topik wajib (energi terbarukan, subsidi, Indonesia), sedangkan NOT batubara menyaring keluar topik yang tidak diinginkan."
  },
  {
    "id": 15,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M2",
    "topicName": "Web Browser, Search Engine, & Manajemen Konten",
    "q": "Setelah menentukan kata kunci dan operator pencarian yang tepat, langkah keempat dalam mencari informasi yang akurat adalah memilih sumber yang kredibel. Di antara kelompok sumber berikut, yang memiliki tingkat validitas tertinggi untuk rujukan tugas akademik adalah ....",
    "options": [
      "unggahan utas viral di media sosial, forum diskusi anonim, dan blog pribadi tanpa daftar pustaka",
      "ensiklopedia terbuka yang dapat disunting siapa saja tanpa proses peninjauan sejawat",
      "situs agregator berita sensasional yang tidak mencantumkan nama penulis maupun dewan redaksi",
      "pesan berantai dari grup percakapan daring yang mengutip pernyataan tokoh tanpa tautan sumber",
      "repositori universitas, jurnal ilmiah, situs lembaga pemerintah, dan portal berita resmi bereputasi"
    ],
    "answer": 4,
    "explanation": "Sumber kredibel untuk rujukan ilmiah meliputi repositori universitas, jurnal ilmiah, situs lembaga pemerintah, dan portal berita bereputasi."
  },
  {
    "id": 16,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M2",
    "topicName": "Web Browser, Search Engine, & Manajemen Konten",
    "q": "Dika sering menemukan artikel referensi penting saat menjelajah internet menggunakan komputer sekolah, namun ia baru sempat membacanya saat berada di perjalanan pulang menggunakan ponsel tanpa kuota internet. Fitur utama aplikasi Pocket yang paling membantu kebutuhan Dika adalah ....",
    "options": [
      "memblokir seluruh iklan dan pelacak pada jaringan Wi-Fi publik secara otomatis",
      "menyimpan artikel daring sebagai aplikasi read-it-later untuk dibaca kembali secara luring (offline) di berbagai perangkat",
      "menerjemahkan alamat domain situs web menjadi deretan angka alamat IP secara lokal",
      "mengompresi seluruh berkas video beresolusi tinggi menjadi dokumen teks yang dapat disunting",
      "menggantikan fungsi mesin pencari untuk melakukan crawling situs web secara mandiri"
    ],
    "answer": 1,
    "explanation": "Pocket berfungsi sebagai aplikasi read-it-later untuk menyimpan artikel daring agar dapat dibaca kembali secara luring (offline) lintas perangkat."
  },
  {
    "id": 17,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M2",
    "topicName": "Web Browser, Search Engine, & Manajemen Konten",
    "q": "Perhatikan daftar perangkat lunak dan layanan berikut: (1) Safari, (2) Baidu, (3) Mozilla Firefox, (4) Yandex, (5) Opera, dan (6) Bing. Pengelompokan yang paling tepat berdasarkan fungsinya adalah ....",
    "options": [
      "nomor (1), (2), dan (3) adalah web browser; nomor (4), (5), dan (6) adalah search engine",
      "nomor (2), (4), dan (5) adalah web browser; nomor (1), (3), dan (6) adalah search engine",
      "nomor (1), (4), dan (6) adalah web browser; nomor (2), (3), dan (5) adalah search engine",
      "nomor (1), (3), dan (5) adalah web browser; nomor (2), (4), dan (6) adalah search engine",
      "nomor (3), (5), dan (6) adalah web browser; nomor (1), (2), dan (4) adalah search engine"
    ],
    "answer": 3,
    "explanation": "Safari, Mozilla Firefox, dan Opera termasuk perangkat lunak web browser, sedangkan Baidu, Yandex, dan Bing termasuk search engine."
  },
  {
    "id": 18,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M2",
    "topicName": "Web Browser, Search Engine, & Manajemen Konten",
    "q": "Selain menampilkan konten multimedia dan mengunduh berkas ke penyimpanan lokal, sebuah web browser modern memiliki fungsi perlindungan perangkat. Wujud nyata dari fungsi perlindungan tersebut saat pengguna berselancar di internet adalah ....",
    "options": [
      "memberikan peringatan dan memblokir akses ketika pengguna hendak membuka situs berbahaya atau berkas berisiko",
      "menjamin seluruh informasi yang ditulis di dalam artikel situs web pasti bebas dari unsur hoaks",
      "meningkatkan kecepatan paket data dari penyedia layanan internet secara fisik hingga dua kali lipat",
      "menghapus secara permanen seluruh salinan unggahan pengguna dari peladen media sosial pihak ketiga",
      "menyusun daftar peringkat relevansi jutaan situs web di dunia berdasarkan kata kunci pengguna"
    ],
    "answer": 0,
    "explanation": "Salah satu dari lima fungsi utama web browser adalah melindungi perangkat pengguna dari ancaman situs berbahaya maupun unduhan berisiko."
  },
  {
    "id": 19,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M2",
    "topicName": "Web Browser, Search Engine, & Manajemen Konten",
    "q": "Ketika mencari data statistik untuk tugas sekolah, mengetikkan satu kata umum seperti \"pendidikan\" menghasilkan jutaan halaman yang terlalu luas dan tidak fokus. Strategi berurutan yang dianjurkan agar hasil pencarian tepat sasaran adalah ....",
    "options": [
      "mengganti web browser berkali-kali hingga urutan hasil pada halaman pertama berubah total",
      "menyalin seluruh paragraf pertanyaan tugas ke kolom pencarian tanpa menggunakan tanda kutip maupun operator",
      "menentukan tujuan pencarian secara spesifik, memilih kata kunci/frasa relevan, lalu menerapkan operator pencarian",
      "membuka hasil pencarian mulai dari halaman terakhir karena sumber ilmiah selalu berada di urutan terbawah",
      "menyimpan seluruh laman hasil pencarian ke aplikasi Pocket terlebih dahulu sebelum memeriksa kata kuncinya"
    ],
    "answer": 2,
    "explanation": "Pencarian efektif diawali dengan merumuskan tujuan pencarian, memilih kata kunci/frasa spesifik, lalu memperincinya menggunakan operator pencarian."
  },
  {
    "id": 20,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M2",
    "topicName": "Web Browser, Search Engine, & Manajemen Konten",
    "q": "Dalam mekanisme kerja search engine, setelah bots/spiders menjelajahi tautan dan menyimpannya ke dalam basis data, mesin pencari menyusun daftar urutan tautan yang tampil di layar pengguna dari yang paling sesuai dengan kata kunci hingga yang kurang relevan. Tahapan ini disebut ....",
    "options": [
      "Crawling",
      "Bookmarking",
      "Downloading",
      "Archiving",
      "Ranking Intelektual"
    ],
    "answer": 4,
    "explanation": "Ranking adalah tahapan ketiga cara kerja mesin pencari yang menyusun daftar hasil berdasarkan tingkat relevansi tertinggi terhadap kata kunci."
  },
  {
    "id": 21,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M3",
    "topicName": "Digitalisasi Budaya, Profesi Informatika, & HKI",
    "q": "Pemerintah mengembangkan dua platform digital untuk mendukung pelestarian kebudayaan nasional, yaitu Budaya Kita dan SPKT (Sistem Pendataan Kebudayaan Terpadu). Perbedaan fungsi utama di antara kedua platform tersebut adalah ....",
    "options": [
      "Budaya Kita khusus mendata cagar budaya benda, sedangkan SPKT hanya memuat koleksi manuskrip digital",
      "Budaya Kita dikelola oleh komunitas swasta, sedangkan SPKT merupakan aplikasi komersial berbayar",
      "Budaya Kita menjadi laman informasi publik objek kebudayaan, sedangkan SPKT mengintegrasikan data terpusat termasuk fitur Urun Daya masyarakat",
      "Budaya Kita berfungsi mengurus pendaftaran hak paten seni tradisional, sedangkan SPKT berfungsi memblokir konten bajakan",
      "Budaya Kita digunakan untuk pembelajaran luring di sekolah, sedangkan SPKT digunakan untuk transaksi jual beli karya seni"
    ],
    "answer": 2,
    "explanation": "Budaya Kita menjadi portal informasi objek kebudayaan publik, sedangkan SPKT mengintegrasikan data terpusat termasuk partisipasi Urun Daya masyarakat."
  },
  {
    "id": 22,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M3",
    "topicName": "Digitalisasi Budaya, Profesi Informatika, & HKI",
    "q": "Seorang kreator konten membuat video pendek tentang upacara adat suatu daerah, tetapi ia memotong bagian penjelasan makna filosofisnya dan menambahkan narasi komedi yang mengubah arti ritual tersebut agar cepat viral. Tindakan kreator tersebut paling bertentangan dengan prinsip etika kreator budaya digital berupa ....",
    "options": [
      "Konteks Asli dan Integritas dalam menjaga makna sejarah serta keutuhan informasi budaya",
      "Anti-Hoaks dan Validasi dalam memeriksa sumber data statistik kependudukan",
      "Kepatuhan Lisensi dalam mendaftarkan merek dagang perangkat lunak penyunting video",
      "Efisiensi Jaringan dalam mengompresi ukuran berkas multimedia sebelum diunggah",
      "Autentikasi Dua Langkah dalam mengamankan akun kanal media sosial kreator"
    ],
    "answer": 0,
    "explanation": "Kreator budaya digital wajib menjaga prinsip Konteks Asli dan Integritas agar makna sejarah serta nilai budaya tidak diubah secara sembarangan."
  },
  {
    "id": 23,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M3",
    "topicName": "Digitalisasi Budaya, Profesi Informatika, & HKI",
    "q": "Sebelum tim pengembang mulai menulis baris kode untuk sistem informasi akademik sekolah yang baru, diperlukan seorang profesional yang bertugas mewawancarai bagian tata usaha, menganalisis alur administrasi yang sedang berjalan, serta menyusun dokumen rancangan kebutuhan sistem. Profesi informatika yang dimaksud adalah ....",
    "options": [
      "Database Administrator",
      "Network Engineer",
      "Game Developer",
      "Cybersecurity Specialist",
      "System Analyst"
    ],
    "answer": 4,
    "explanation": "System Analyst bertugas menganalisis masalah pengguna dan alur sistem berjalan lalu menerjemahkannya menjadi rancangan kebutuhan bagi pengembang."
  },
  {
    "id": 24,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M3",
    "topicName": "Digitalisasi Budaya, Profesi Informatika, & HKI",
    "q": "Sebuah platform pendidikan daring ingin menghadirkan dua fitur baru: (1) dasbor laporan untuk memantau tren nilai ujian siswa per semester, dan (2) algoritma cerdas yang otomatis merekomendasikan latihan soal sesuai tingkat kemampuan tiap siswa. Dua profesi yang paling tepat menangani masing-masing fitur tersebut secara berurutan adalah ....",
    "options": [
      "UI/UX Designer dan Network Engineer",
      "Data Analyst dan AI / Machine Learning Engineer",
      "Web Developer dan Database Administrator",
      "Programmer dan Cybersecurity Specialist",
      "System Analyst dan Game Developer"
    ],
    "answer": 1,
    "explanation": "Data Analyst mengolah data menjadi dasbor insight keputusan, sedangkan AI/Machine Learning Engineer melatih dan menerapkan model pembelajaran adaptif."
  },
  {
    "id": 25,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M3",
    "topicName": "Digitalisasi Budaya, Profesi Informatika, & HKI",
    "q": "Saat pelaksanaan ujian berbasis komputer di sekolah, terdeteksi upaya akses ilegal dari luar jaringan yang mencoba masuk ke basis data nilai siswa dan mengubah catatan skor. Profesi informatika yang memiliki tugas utama memantau lalu lintas ancaman, mengidentifikasi risiko, serta menangani insiden keamanan tersebut adalah ....",
    "options": [
      "UI/UX Designer",
      "Game Developer",
      "Data Analyst",
      "Cybersecurity Specialist",
      "Web Developer"
    ],
    "answer": 3,
    "explanation": "Cybersecurity Specialist bertugas melindungi sistem, jaringan, dan data nilai dari ancaman serta menangani insiden akses ilegal peretas. No. Materi Kunci Konsep Kunci & Dasar Pembahasan"
  },
  {
    "id": 26,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M3",
    "topicName": "Digitalisasi Budaya, Profesi Informatika, & HKI",
    "q": "Satu produk ponsel pintar modern dilindungi oleh beberapa jenis Hak Kekayaan Intelektual (HKI) sekaligus. Pasangan komponen produk dan jenis perlindungan HKI yang paling akurat adalah ....",
    "options": [
      "logo merek dagang dilindungi Paten, sedangkan cara kerja sensor sidik jari dilindungi Hak Cipta",
      "bentuk fisik casing ponsel dilindungi Rahasia Dagang, sedangkan kode perangkat lunak dilindungi Merek",
      "kode aplikasi dilindungi Hak Cipta, teknologi sensor sidik jari dilindungi Paten, dan bentuk casing dilindungi Desain Industri",
      "algoritma internal rahasia dilindungi Desain Industri, sedangkan musik bawaan dilindungi Paten",
      "nama dagang produk dilindungi Hak Cipta, sedangkan konfigurasi tampilan bodi luar dilindungi Rahasia Dagang"
    ],
    "answer": 2,
    "explanation": "Dalam anatomi HKI produk digital: kode aplikasi dilindungi Hak Cipta, mekanisme teknis sensor sidik jari dilindungi Paten, dan bentuk casing dilindungi Desain Industri."
  },
  {
    "id": 27,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M3",
    "topicName": "Digitalisasi Budaya, Profesi Informatika, & HKI",
    "q": "Sinta memiliki gagasan cemerlang di kepalanya mengenai konsep aplikasi pengingat jadwal belajar, namun ia belum pernah menuangkannya ke dalam rancangan tertulis, purwarupa, maupun kode program. Ditinjau dari konsep Kekayaan Intelektual (KI) dan HKI, status gagasan Sinta adalah ....",
    "options": [
      "belum memperoleh perlindungan hukum HKI karena ide abstrak baru dilindungi setelah diwujudkan menjadi karya nyata",
      "otomatis terdaftar sebagai hak paten sejak pertama kali gagasan tersebut diceritakan kepada teman",
      "dilindungi sebagai desain industri selama gagasan tersebut belum ditiru oleh pengembang lain",
      "termasuk pelanggaran hak cipta apabila ada orang lain yang lebih dulu membuat aplikasi serupa",
      "otomatis menjadi milik publik yang tidak boleh didaftarkan meskipun kelak telah dikembangkan menjadi aplikasi"
    ],
    "answer": 0,
    "explanation": "Kekayaan Intelektual baru memperoleh perlindungan hukum HKI apabila ide atau kreativitas tersebut telah diwujudkan menjadi karya nyata yang teridentifikasi."
  },
  {
    "id": 28,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M3",
    "topicName": "Digitalisasi Budaya, Profesi Informatika, & HKI",
    "q": "Andi mengunduh ilustrasi grafis dari internet yang berlisensi non-komersial (tidak boleh diperjualbelikan). Ia mencetak ilustrasi tersebut pada kaus untuk dijual dan mencantumkan nama ilustrator serta tautan situs aslinya pada label produk. Penilaian yang paling tepat terhadap tindakan Andi adalah ....",
    "options": [
      "sudah sepenuhnya sah secara hukum karena pencantuman atribusi otomatis menggugurkan larangan komersial",
      "sah apabila keuntungan penjualan kaus tidak melebihi biaya produksi pencetakan",
      "melanggar prinsip atribusi sumber karena tautan situs tidak dicantumkan di bagian depan kaus",
      "tidak melanggar HKI selama karya tersebut diunduh secara gratis tanpa meretas peladen pemiliknya",
      "tetap merupakan pelanggaran HKI karena atribusi hanya memenuhi kejujuran akademis, sedangkan penggunaan komersial melanggar ketentuan lisensi"
    ],
    "answer": 4,
    "explanation": "Atribusi hanya memenuhi etika pencantuman asal karya, sedangkan pemanfaatan komersial atas karya berlisensi non-komersial tetap melanggar HKI."
  },
  {
    "id": 29,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M3",
    "topicName": "Digitalisasi Budaya, Profesi Informatika, & HKI",
    "q": "Dalam program digitalisasi budaya, tim dokumentasi daerah merekam naskah kuno beraksara daerah, teknik pembuatan perahu tradisional tanpa paku, ramuan pengobatan herbal warisan leluhur, serta tata cara upacara panen. Keempat hal tersebut secara berurutan termasuk dalam 10 Objek Pemajuan Budaya kategori ....",
    "options": [
      "Bahasa, Permainan Rakyat, Olahraga Tradisional, dan Adat Istiadat",
      "Manuskrip, Teknologi Tradisional, Pengetahuan Tradisional, dan Ritus",
      "Seni, Bahasa, Manuskrip, dan Permainan Rakyat",
      "Ritus, Olahraga Tradisional, Adat Istiadat, dan Seni",
      "Teknologi Tradisional, Seni, Bahasa, dan Olahraga Tradisional"
    ],
    "answer": 1,
    "explanation": "Naskah kuno (Manuskrip), teknik perahu tradisional (Teknologi Tradisional), ramuan herbal (Pengetahuan Tradisional), dan upacara panen (Ritus) termasuk 10 Objek Pemajuan Budaya."
  },
  {
    "id": 30,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M3",
    "topicName": "Digitalisasi Budaya, Profesi Informatika, & HKI",
    "q": "Rancangan visual antarmuka dan alur prototipe portal berita sekolah telah selesai dibuat dengan tampilan menarik dan mudah dinavigasi. Namun, situs web tersebut belum bisa menampilkan artikel dinamis karena belum dibangun fungsi sisi peladen (server) dan belum terhubung ke basis data. Profesi yang bertugas menyelesaikan tahap tersebut adalah ....",
    "options": [
      "UI/UX Designer",
      "Network Engineer",
      "Data Analyst",
      "Web Developer",
      "System Analyst"
    ],
    "answer": 3,
    "explanation": "Web Developer bertugas membangun sisi tampilan maupun fungsi peladen (server), menghubungkan basis data, serta menguji kelayakan situs web."
  },
  {
    "id": 31,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M4",
    "topicName": "Etika, Privasi, dan Keamanan Digital",
    "q": "Nisa meneruskan tangkapan layar percakapan yang mempermalukan teman sekelasnya ke grup WhatsApp. Sepuluh menit kemudian ia menyesal dan menghapus pesan tersebut dari grup. Analisis yang paling tepat mengenai konsekuensi etika dan jejak digital dari tindakan Nisa adalah ....",
    "options": [
      "Nisa bebas dari tanggung jawab karena ia hanya berperan sebagai penyebar, bukan pembuat tangkapan layar",
      "penghapusan pesan di grup secara otomatis menghapus seluruh berkas gambar yang telah tersimpan di galeri anggota lain",
      "sebagai penyebar (distributor), Nisa tetap memikul tanggung jawab atas dampaknya dan salinan konten berpotensi tetap tersimpan sebagai jejak digital",
      "jejak digital hanya terbentuk apabila konten diunggah ke platform publik terbuka, bukan pada grup percakapan tertutup",
      "tindakan meneruskan pesan tidak berdampak pada reputasi korban selama nama lengkap korban tidak ditulis pada takarir"
    ],
    "answer": 2,
    "explanation": "Penyebar konten (distributor) tetap memikul tanggung jawab atas dampak informasi yang diteruskan, dan penghapusan tidak menghapus salinan tangkapan layar pihak lain."
  },
  {
    "id": 32,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M4",
    "topicName": "Etika, Privasi, dan Keamanan Digital",
    "q": "Seorang siswa menggunakan kombinasi tanggal lahir dan nama sekolahnya sebagai kata sandi yang sama untuk akun permainan daring, media sosial, dan pos elektronik utama. Risiko keamanan terbesar dari kebiasaan tersebut adalah ....",
    "options": [
      "aplikasi autentikator menolak menghasilkan kode OTP jika panjang kata sandi kurang dari dua puluh karakter",
      "perangkat ponsel otomatis memblokir izin akses kamera dan mikrofon pada seluruh aplikasi terpasang",
      "kata sandi yang menggunakan angka tanggal lahir tidak dapat disimpan di dalam brankas Password Manager",
      "penyedia layanan internet akan memutus koneksi jaringan karena mendeteksi pola karakter yang berulang",
      "jika satu akun mengalami kebocoran data, penyerang dapat memakai kata sandi yang sama untuk membobol akun penting lainnya"
    ],
    "answer": 4,
    "explanation": "Penggunaan satu kata sandi yang sama di banyak layanan menyebabkan kebocoran pada satu akun mengancam keamanan email dan akun penting lainnya."
  },
  {
    "id": 33,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M4",
    "topicName": "Etika, Privasi, dan Keamanan Digital",
    "q": "Penggunaan Password Manager sangat dianjurkan untuk mengatasi keterbatasan manusia dalam mengingat puluhan kata sandi yang rumit dan berbeda. Cara kerja serta manfaat utama Password Manager adalah ....",
    "options": [
      "mengganti seluruh kata sandi akun menjadi kode sidik jari sehingga pengguna tidak lagi membutuhkan satu pun kata sandi",
      "menyimpan kata sandi unik tiap akun di dalam brankas digital terenkripsi yang dilindungi satu master password serta membantu mengaudit kata sandi lemah/bocor",
      "mengirimkan daftar seluruh kata sandi pengguna secara berkala ke surat elektronik cadangan dalam bentuk teks biasa",
      "menyeragamkan kata sandi pada seluruh situs web agar pengguna cukup mengetik satu kombinasi yang sama di mana saja",
      "mematikan kebutuhan autentikasi dua langkah karena seluruh pintu masuk akun telah dijaga oleh aplikasi pengelola"
    ],
    "answer": 1,
    "explanation": "Password Manager menyimpan kata sandi unik tiap akun dalam brankas digital terenkripsi yang dikunci satu master password serta mengaudit kredensial lemah."
  },
  {
    "id": 34,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M4",
    "topicName": "Etika, Privasi, dan Keamanan Digital",
    "q": "Dalam penerapan Autentikasi Dua Langkah (2FA), pengguna dapat memilih pengiriman kode OTP melalui SMS atau menggunakan aplikasi autentikator seperti Google/Microsoft Authenticator. Keunggulan utama penggunaan aplikasi autentikator dibandingkan kode OTP berbasis SMS adalah ....",
    "options": [
      "kode pada aplikasi autentikator bersifat tetap seumur hidup sehingga tidak pernah berubah setiap waktu",
      "aplikasi autentikator memperbolehkan pengguna membagikan kode verifikasi kepada petugas layanan pelanggan",
      "aplikasi autentikator secara otomatis menyinkronkan kata sandi akun ke seluruh perangkat publik",
      "kode verifikasi sementara dihasilkan langsung di dalam aplikasi perangkat tanpa bergantung pada jaringan SMS yang rentan intersepsi",
      "pengguna tidak perlu memasukkan kata sandi utama saat melakukan login dari perangkat baru yang asing"
    ],
    "answer": 3,
    "explanation": "Aplikasi autentikator menghasilkan kode sementara secara lokal di perangkat tanpa bergantung pada jalur SMS yang rentan intersepsi atau rekayasa sosial."
  },
  {
    "id": 35,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M4",
    "topicName": "Etika, Privasi, dan Keamanan Digital",
    "q": "Akun media sosial milik Raka sudah dilindungi dengan kata sandi 16 karakter yang unik serta autentikasi dua langkah (2FA) sehingga peretas tidak dapat masuk ke akunnya. Namun, Raka mengatur profilnya menjadi publik dan rutin mengunggah lokasi real-time rumah serta jadwal hariannya. Kondisi Raka menunjukkan bahwa ....",
    "options": [
      "aspek keamanan digital akunnya sudah kuat dalam mencegah akses tanpa izin, tetapi aspek privasi digital tetap lemah karena data pribadi terbuka bagi publik",
      "aspek privasi digital akunnya telah terjaga sempurna, tetapi aspek keamanan digital gagal karena fitur lokasi diaktifkan",
      "pengaktifan 2FA secara otomatis menyembunyikan seluruh unggahan foto dan informasi lokasi dari pengguna yang belum berteman",
      "keamanan dan privasi digital merupakan dua istilah identik sehingga penguatan kata sandi otomatis melindungi seluruh data diri",
      "data lokasi dan alamat rumah tidak termasuk kategori informasi pribadi selama tidak disertai nomor identitas kependudukan"
    ],
    "answer": 0,
    "explanation": "Keamanan digital mencegah akses masuk tanpa izin, sedangkan privasi digital mengatur kendali atas informasi pribadi apa yang boleh diketahui publik."
  },
  {
    "id": 36,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M4",
    "topicName": "Etika, Privasi, dan Keamanan Digital",
    "q": "Sebuah aplikasi kalkulator sederhana yang bekerja secara luring meminta izin akses (permissions) terhadap daftar kontak, mikrofon, dan lokasi perangkat secara terus-menerus saat dipasang. Langkah paling bijak yang sesuai dengan prinsip pengelolaan izin aplikasi adalah ....",
    "options": [
      "menyetujui seluruh izin agar aplikasi dapat menghitung operasi matematika dengan tingkat akurasi lebih tinggi",
      "memberikan izin akses kontak dan lokasi saja sambil tetap membiarkan akses mikrofon aktif di latar belakang",
      "menolak seluruh izin akses yang tidak relevan dengan fungsi utama aplikasi dan memeriksa ulang pengaturan izin ponsel",
      "membagikan kode OTP akun Google agar aplikasi kalkulator dapat mencadangkan riwayat perhitungan ke awan",
      "tetap menyetujui semua izin dengan syarat akun media sosial pengguna diubah menjadi mode privat"
    ],
    "answer": 2,
    "explanation": "Aplikasi hanya boleh diberi izin akses yang relevan dengan fungsi utamanya; izin kontak, mikrofon, dan lokasi pada kalkulator luring harus ditolak."
  },
  {
    "id": 37,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M4",
    "topicName": "Etika, Privasi, dan Keamanan Digital",
    "q": "Kamu menerima notifikasi peringatan resmi bahwa akun media sosialmu baru saja diakses dari perangkat dan kota yang tidak dikenal. Urutan langkah pemulihan pertama yang paling tepat dan aman dilakukan adalah ....",
    "options": [
      "mengklik tautan pemulihan yang dikirim melalui pesan singkat mencurigakan lalu memasukkan kode OTP",
      "membuka aplikasi atau situs resmi dari perangkat tepercaya, mengamankan email utama dan mengganti kata sandi, lalu mengeluarkan semua sesi perangkat asing",
      "segera menghapus aplikasi media sosial dari ponsel tanpa mengubah kata sandi maupun memeriksa perangkat yang masih login",
      "membalas pesan notifikasi dengan menanyakan identitas pemilik perangkat asing yang sedang mengakses akun",
      "membuat akun baru menggunakan kata sandi yang sama persis dengan akun lama agar mudah diingat kembali"
    ],
    "answer": 1,
    "explanation": "Pemulihan akun dimulai dari aplikasi/situs resmi di perangkat tepercaya dengan mengamankan email utama, mengganti kata sandi, dan memutus sesi perangkat asing."
  },
  {
    "id": 38,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M4",
    "topicName": "Etika, Privasi, dan Keamanan Digital",
    "q": "Saat membuka kolom komentar suatu unggahan, Dina menemukan serangan penghinaan berkelanjutan dan penyebaran data pribadi (doxing) yang ditujukan kepada seorang siswa. Sikap beretika dan aman yang seharusnya diambil Dina adalah ....",
    "options": [
      "membagikan ulang unggahan tersebut ke akun pribadinya agar semakin banyak orang mengetahui identitas pelaku",
      "membalas komentar pelaku dengan kata-kata kasar serupa untuk membela korban di kolom publik",
      "mengunduh data pribadi korban yang tersebar untuk disimpan sebagai koleksi pribadi di perangkatnya",
      "mengabaikan kejadian tersebut tanpa melakukan pelaporan karena perundungan daring bukan pelanggaran aturan platform",
      "tidak ikut menyebarkan konten, menyimpan bukti seperlunya, memblokir dan melaporkan akun pelaku, serta meminta bantuan orang dewasa tepercaya"
    ],
    "answer": 4,
    "explanation": "Penanganan konten berisiko dan perundungan siber meliputi: tidak menyebarkan ulang, menyimpan bukti seperlunya, memblokir/melaporkan, serta melapor ke orang dewasa tepercaya."
  },
  {
    "id": 39,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M4",
    "topicName": "Etika, Privasi, dan Keamanan Digital",
    "q": "Ketika mulai menerapkan perlindungan keamanan berlapis pada seluruh akun digital yang dimiliki, pengguna sangat disarankan memprioritaskan pengaktifan 2FA pada akun email utama terlebih dahulu. Alasan strategis di balik prioritas ini adalah ....",
    "options": [
      "akun email utama sering digunakan sebagai jalur pemulihan kata sandi dan verifikasi keamanan bagi berbagai akun digital lainnya",
      "layanan email merupakan satu-satunya platform yang tidak dapat dilindungi menggunakan Password Manager",
      "pengaktifan 2FA pada email otomatis mengaktifkan 2FA pada seluruh aplikasi permainan dan media sosial tanpa pengaturan tambahan",
      "peretas hanya mengincar akun surat elektronik dan tidak pernah menyerang akun media sosial maupun perbankan",
      "kode OTP yang dikirim ke surat elektronik memiliki masa berlaku permanen sehingga lebih mudah dicatat"
    ],
    "answer": 0,
    "explanation": "Email utama diprioritaskan karena umumnya berperan sebagai akun pemulihan kata sandi dan pusat verifikasi bagi berbagai layanan digital lainnya."
  },
  {
    "id": 40,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M4",
    "topicName": "Etika, Privasi, dan Keamanan Digital",
    "q": "Pada suatu malam, ponsel Arman tiba-tiba menerima dua pesan SMS berisi kode OTP resmi dari platform media sosial padahal Arman sedang tidak mencoba masuk ke akunnya. Analisis paling tepat terhadap fenomena ini adalah ....",
    "options": [
      "sistem operator seluler mengalami gangguan acak yang sering mengirimkan kode keamanan ke nomor yang salah",
      "fitur Password Manager di ponsel Arman sedang memperbarui kata sandi akun secara otomatis di latar belakang",
      "akun Arman telah sepenuhnya aman sehingga kode OTP dikirim sebagai tanda penghargaan keamanan bulanan",
      "pihak lain telah berhasil mengetahui kata sandi akun Arman dan sedang berupaya melewati tahap verifikasi kedua (2FA)",
      "Arman harus segera mengirimkan kode OTP tersebut ke layanan bantuan agar sesi login asing dapat dibatalkan"
    ],
    "answer": 3,
    "explanation": "Kode OTP yang muncul tanpa diminta menandakan pihak lain telah mengetahui kata sandi akun dan sedang mencoba melewati autentikasi langkah kedua."
  },
  {
    "id": 41,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M5",
    "topicName": "Infrastruktur Jaringan Komputer & Keamanan Siber",
    "q": "Sebuah bank nasional membangun jaringan komunikasi data yang menghubungkan seluruh kantor cabang pembantu di dalam satu wilayah kota metropolitan agar transaksi nasabah terintegrasi secara real-time. Klasifikasi skala jaringan, topologi umum, dan media kabel utama yang paling sesuai untuk infrastruktur tersebut adalah ....",
    "options": [
      "PAN (Personal Area Network) dengan topologi Point-to-Point menggunakan gelombang Bluetooth",
      "LAN (Local Area Network) dengan topologi Bus menggunakan kabel Koaksial tunggal",
      "MAN (Metropolitan Area Network) dengan topologi Mesh atau Star menggunakan kabel Fiber Optik",
      "WAN (Wide Area Network) dengan topologi Ring menggunakan kabel UTP tanpa pelindung",
      "PAN (Personal Area Network) dengan topologi Tree menggunakan jaringan seluler 4G"
    ],
    "answer": 2,
    "explanation": "Jaringan yang menghubungkan beberapa gedung dalam satu kota termasuk skala MAN dengan topologi Mesh atau Star serta media kabel Fiber Optik."
  },
  {
    "id": 42,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M5",
    "topicName": "Infrastruktur Jaringan Komputer & Keamanan Siber",
    "q": "Laboratorium komputer sekolah mengalami penurunan kinerja jaringan lokal karena perangkat lama meneruskan setiap paket data ke seluruh komputer secara acak (broadcast). Teknisi mengganti perangkat penghubung tersebut dengan perangkat yang mampu membaca alamat tujuan spesifik tiap komputer. Perbandingan perangkat lama dan perangkat pengganti tersebut adalah ....",
    "options": [
      "mengganti Router dengan Modem agar sinyal analog berubah menjadi pulsa cahaya",
      "mengganti Hub dengan Switch sehingga pengiriman data dalam LAN terarah ke alamat spesifik",
      "mengganti Switch dengan Access Point agar seluruh komputer kabel terputus dari peladen",
      "mengganti Modem dengan Hub untuk memperluas jangkauan gelombang radio Wi-Fi antar-gedung",
      "mengganti Access Point dengan Router untuk menerjemahkan nama domain menjadi alamat IP"
    ],
    "answer": 1,
    "explanation": "Hub mengirim paket data secara acak ke seluruh port (broadcast), sedangkan Switch meneruskan data secara terarah berdasarkan alamat spesifik tujuan. No. Materi Kunci Konsep Kunci & Dasar Pembahasan"
  },
  {
    "id": 43,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M5",
    "topicName": "Infrastruktur Jaringan Komputer & Keamanan Siber",
    "q": "Dalam perancangan jaringan ruangan, topologi Star jauh lebih banyak dipilih oleh sekolah dibandingkan topologi Ring maupun Bus. Analisis keandalan yang mendasari pemilihan topologi Star tersebut adalah ....",
    "options": [
      "pada topologi Star setiap komputer terhubung langsung ke semua komputer lain sehingga tidak membutuhkan perangkat pusat",
      "pada topologi Bus kerusakan satu unit komputer klien otomatis memutus seluruh komunikasi antar- komputer lainnya",
      "pada topologi Ring data mengalir dua arah sehingga kerusakan satu simpul tidak memengaruhi simpul lainnya",
      "pada topologi Star biaya kabel lebih murah daripada Bus karena hanya memakai satu jalur kabel lurus utama",
      "pada topologi Ring kerusakan satu simpul mengganggu seluruh aliran melingkar, sedangkan pada Star kerusakan satu cabang tidak mematikan perangkat lain"
    ],
    "answer": 4,
    "explanation": "Pada topologi Ring kerusakan satu simpul mengganggu aliran melingkar seluruh jaringan, sedangkan pada Star kerusakan satu cabang tidak mematikan komputer lain."
  },
  {
    "id": 44,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M5",
    "topicName": "Infrastruktur Jaringan Komputer & Keamanan Siber",
    "q": "Sebuah kawasan industri membutuhkan jalur komunikasi data antar-gedung sejauh 1,5 kilometer yang melewati area mesin-mesin listrik bertegangan tinggi dengan medan elektromagnetik kuat. Media transmisi kabel yang paling tepat dipilih agar data tetap cepat dan bebas gangguan adalah ....",
    "options": [
      "kabel Fiber Optik karena mentransmisikan data menggunakan pulsa cahaya melalui serat kaca sehingga kebal interferensi elektromagnetik",
      "kabel UTP (Unshielded Twisted Pair) karena tidak memiliki pelindung logam sehingga lebih ringan ditarik jarak jauh",
      "kabel Koaksial televisi karena konduktor tembaga tunggalnya tidak terpengaruh medan magnet industri",
      "gelombang Bluetooth karena mampu menembus dinding beton pabrik hingga jarak beberapa kilometer",
      "kabel UTP tanpa konektor RJ-45 agar sinyal listrik mengalir langsung tanpa hambatan"
    ],
    "answer": 0,
    "explanation": "Kabel Fiber Optik mengirimkan data melalui pulsa cahaya dalam serat kaca sehingga kebal terhadap gangguan elektromagnetik dan andal untuk jarak jauh."
  },
  {
    "id": 45,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M5",
    "topicName": "Infrastruktur Jaringan Komputer & Keamanan Siber",
    "q": "Ketika siswa mengetikkan alamat www.sekolah.com di peramban, muncul pesan galat bahwa alamat situs tidak dapat ditemukan. Namun, ketika siswa mengetikkan langsung deretan angka 142.250.190.46, halaman situs web berhasil terbuka dengan normal. Komponen sistem navigasi internet yang sedang mengalami gangguan adalah ....",
    "options": [
      "kartu jaringan (NIC) pada komputer klien",
      "kabel transmisi Fiber Optik bawah laut",
      "peramban web yang tidak mendukung tampilan grafis",
      "peladen DNS (Domain Name System) yang menerjemahkan nama domain ke alamat IP",
      "perangkat Access Point yang memancarkan sinyal Wi-Fi ruangan"
    ],
    "answer": 3,
    "explanation": "Situs tetap terbuka via alamat IP tetapi gagal via nama domain menunjukkan gangguan pada DNS (Domain Name System) sebagai penerjemah nama ke IP."
  },
  {
    "id": 46,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M5",
    "topicName": "Infrastruktur Jaringan Komputer & Keamanan Siber",
    "q": "Seseorang mengakses akun perbankan dan surel pribadinya melalui jaringan Wi-Fi publik gratis di kafe tanpa pengamanan enkripsi. Di tempat yang sama, pelaku kejahatan siber menjalankan perangkat lunak untuk memantau dan menyadap lalu lintas paket data yang melintas di udara secara diam-diam. Jenis ancaman jaringan yang terjadi pada kasus ini adalah ....",
    "options": [
      "Phishing",
      "Ransomware",
      "Sniffing",
      "Indexing",
      "Broadcasting"
    ],
    "answer": 2,
    "explanation": "Sniffing adalah tindakan memantau atau menyadap lalu lintas paket data yang lewat pada jaringan secara diam-diam untuk mencegat informasi sensitif."
  },
  {
    "id": 47,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M5",
    "topicName": "Infrastruktur Jaringan Komputer & Keamanan Siber",
    "q": "Tepat pada hari pelaksanaan ujian akhir semester daring, peladen situs ujian sekolah dibanjiri jutaan permintaan akses palsu hingga lumpuh (down) sehingga seluruh siswa yang berhak tidak dapat masuk untuk mengerjakan soal. Pilar utama keamanan jaringan yang dilanggar dalam insiden tersebut adalah ....",
    "options": [
      "Confidentiality (Kerahasiaan)",
      "Availability (Ketersediaan)",
      "Integrity (Integritas)",
      "Authentication (Autentikasi)",
      "Attribution (Atribusi)"
    ],
    "answer": 1,
    "explanation": "Pilar Availability (Ketersediaan) menjamin jaringan dan layanan selalu siap diakses oleh pengguna yang berhak pada saat diperlukan seperti waktu ujian."
  },
  {
    "id": 48,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M5",
    "topicName": "Infrastruktur Jaringan Komputer & Keamanan Siber",
    "q": "Kabel UTP dan STP sama-sama termasuk jenis kabel Twisted Pair yang digunakan pada jaringan lokal. Persamaan standar konektor serta perbedaan struktur fisik yang paling tepat di antara keduanya adalah ....",
    "options": [
      "UTP memakai konektor RJ-11 dan berinti serat kaca, sedangkan STP memakai konektor RJ-45 dan berinti tembaga",
      "UTP memiliki anyaman pelindung logam tebal, sedangkan STP sama sekali tidak memiliki lapisan isolator luar",
      "UTP digunakan khusus untuk jaringan antar-benua dasar laut, sedangkan STP digunakan untuk koneksi Bluetooth pribadi",
      "UTP mentransmisikan gelombang radio nirkabel, sedangkan STP mentransmisikan pulsa cahaya laser",
      "keduanya memakai konektor RJ-45, namun STP memiliki lapisan foil/anyaman logam pelindung gangguan elektromagnetik yang memerlukan pembumian"
    ],
    "answer": 4,
    "explanation": "Kabel UTP dan STP sama-sama memakai konektor RJ-45, tetapi STP dilengkapi pelindung foil/anyaman logam pelindung elektromagnetik yang membutuhkan pembumian (grounding)."
  },
  {
    "id": 49,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M5",
    "topicName": "Infrastruktur Jaringan Komputer & Keamanan Siber",
    "q": "Dalam merancang ruang laboratorium ujian berbasis komputer yang menuntut kestabilan koneksi tinggi bagi 40 komputer secara serentak, jaringan kabel (wired) lebih diutamakan daripada nirkabel (wireless) karena ....",
    "options": [
      "jalur transmisi fisik kabel menawarkan kecepatan dan kestabilan koneksi yang lebih konsisten dibandingkan gelombang radio",
      "jaringan nirkabel tidak mampu menghubungkan lebih dari dua perangkat ke dalam satu peladen lokal",
      "jaringan kabel memungkinkan pengguna memindahkan posisi meja komputer secara bebas tanpa batasan panjang jalur",
      "komputer meja di laboratorium tidak memiliki antarmuka kartu jaringan untuk menerima sinyal nirkabel",
      "penggunaan kabel secara otomatis mengenkripsi seluruh kata sandi pengguna tanpa memerlukan konfigurasi keamanan"
    ],
    "answer": 0,
    "explanation": "Jaringan kabel unggul dalam hal kecepatan dan kestabilan transmisi dibandingkan jaringan nirkabel yang lebih mengutamakan fleksibilitas mobilitas."
  },
  {
    "id": 50,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M5",
    "topicName": "Infrastruktur Jaringan Komputer & Keamanan Siber",
    "q": "Agar jaringan LAN di kantor dapat terhubung ke penyedia layanan internet (ISP) sekaligus menyediakan akses Wi-Fi bagi ponsel karyawan, digunakan tiga perangkat: Modem, Router, dan Access Point. Rangkaian fungsi masing-masing perangkat secara berurutan adalah ....",
    "options": [
      "memancarkan sinyal Wi-Fi, menerjemahkan sinyal digital-analog, dan mengirim data secara broadcast ke semua port",
      "menentukan jalur antar-jaringan, memancarkan gelombang Bluetooth, dan menyimpan basis data karyawan",
      "menghubungkan kabel UTP dalam satu ruangan, menerjemahkan nama domain ke IP, dan memblokir serangan siber",
      "menerjemahkan sinyal digital-analog ke ISP, menentukan jalur penghubung antar-jaringan berbeda, dan memancarkan sinyal Wi-Fi ke perangkat nirkabel",
      "mengirim data berdasarkan alamat MAC spesifik, mengonversi pulsa cahaya ke listrik, dan mengatur topologi Ring"
    ],
    "answer": 3,
    "explanation": "Modem menerjemahkan sinyal digital-analog ke ISP, Router menentukan rute antar- jaringan berbeda, dan Access Point memancarkan sinyal Wi-Fi ke klien nirkabel."
  },
  {
    "id": 51,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M6",
    "topicName": "Aplikasi Perkantoran (MS Word, Mail Merge, & MS Excel)",
    "q": "Seorang siswa menyusun laporan penelitian sebanyak 12 halaman di Microsoft Word dengan orientasi kertas Portrait. Pada halaman ke-6 terdapat tabel rekapitulasi data yang sangat lebar sehingga hanya muat jika ditampilkan dalam posisi Landscape, sementara halaman 1–5 dan 7–12 harus tetap Portrait. Pengaturan paling tepat untuk melakukan hal tersebut adalah ....",
    "options": [
      "menekan tombol Page Break biasa di awal halaman ke-6 lalu mengubah Orientation menjadi Landscape",
      "menyisipkan Section Break (Next Page) sebelum dan sesudah halaman ke-6 lalu mengubah Orientation khusus pada bagian tersebut menjadi Landscape",
      "mengecilkan ukuran margin kiri dan kanan seluruh dokumen menjadi nol sentimeter melalui menu Home",
      "menggunakan fitur Columns (Two Columns) pada halaman ke-6 agar tabel otomatis berputar 90 derajat",
      "menyisipkan Line Break berulang kali di atas tabel hingga posisi kertas pada halaman ke-6 melebar otomatis"
    ],
    "answer": 1,
    "explanation": "Section Break (Next Page) memisahkan pengaturan tata letak halaman sehingga orientasi Landscape dapat diterapkan khusus pada satu halaman saja."
  },
  {
    "id": 52,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M6",
    "topicName": "Aplikasi Perkantoran (MS Word, Mail Merge, & MS Excel)",
    "q": "Ketika seorang penulis mencoba membuat daftar isi otomatis melalui tab References → Table of Contents di Microsoft Word, muncul pesan peringatan bahwa tidak ada entri daftar isi yang ditemukan meskipun seluruh judul bab sudah ditebalkan dan diperbesar ukuran hurufnya secara manual. Penyebab utama masalah tersebut adalah ....",
    "options": [
      "nomor halaman belum ditempatkan di bagian atas kertas (Header) menggunakan rata tengah",
      "dokumen belum disimpan dalam format ekstensi .pdf sebelum daftar isi dibuat",
      "jarak spasi antarbaris di seluruh dokumen masih menggunakan pengaturan bawaan Single (1.0)",
      "judul bab dan subbab belum diformat menggunakan gaya struktur bawaan seperti Heading 1 dan Heading 2",
      "fitur Track Changes pada tab Review dalam keadaan tidak aktif saat penulis mengetik judul bab"
    ],
    "answer": 3,
    "explanation": "Fitur daftar isi otomatis di Word memindai paragraf yang telah diberi gaya hierarki bawaan seperti Heading 1 dan Heading 2, bukan teks tebal manual."
  },
  {
    "id": 53,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M6",
    "topicName": "Aplikasi Perkantoran (MS Word, Mail Merge, & MS Excel)",
    "q": "Dalam penulisan daftar pustaka karya ilmiah di Microsoft Word, baris pertama setiap sumber rujukan diletakkan rata di margin kiri, sedangkan baris kedua dan baris-baris berikutnya menjorok masuk ke dalam sejauh 1,27 cm secara seragam. Pengaturan paragraf yang digunakan untuk menghasilkan tampilan tersebut adalah ....",
    "options": [
      "Hanging Indent",
      "First Line Indent",
      "Right Indent",
      "Justify Alignment",
      "Line Spacing Before"
    ],
    "answer": 0,
    "explanation": "Hanging Indent membuat baris pertama paragraf tetap rata kiri sementara baris kedua dan seterusnya menjorok ke dalam secara seragam."
  },
  {
    "id": 54,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M6",
    "topicName": "Aplikasi Perkantoran (MS Word, Mail Merge, & MS Excel)",
    "q": "Panitia ujian sekolah ingin mencetak 350 kartu peserta ujian yang tata letaknya seragam, tetapi memuat nama, nomor peserta, dan ruang ujian berbeda untuk setiap siswa menggunakan fitur Mail Merge di Microsoft Word. Dua komponen utama yang wajib dihubungkan dalam proses tersebut adalah ....",
    "options": [
      "Table of Contents sebagai kerangka kartu dan SmartArt sebagai penyimpanan daftar nama siswa",
      "Header & Footer sebagai templat utama dan Endnote sebagai sumber basis data nomor ujian",
      "Main Document yang berisi kerangka surat serta Merge Fields, dan Data Source yang berisi tabel data terstruktur",
      "Macro Script sebagai pengatur margin kertas dan Footnote sebagai penghubung kolom lembar kerja",
      "Cross-reference sebagai dokumen induk dan Bookmark sebagai berkas pencetak kartu otomatis"
    ],
    "answer": 2,
    "explanation": "Mail Merge memadukan Main Document (kerangka surat dan Merge Fields) dengan Data Source (sumber data penerima berbentuk tabel terstruktur)."
  },
  {
    "id": 55,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M6",
    "topicName": "Aplikasi Perkantoran (MS Word, Mail Merge, & MS Excel)",
    "q": "Berkas sumber data (Data Source) Excel berisi 360 baris data siswa dari kelas X-A hingga X-F telah dihubungkan ke dokumen surat panggilan orang tua di Microsoft Word. Jika wali kelas X-A hanya ingin mencetak surat khusus untuk siswa kelas X-A tanpa menghapus data kelas lain dari berkas Excel asli, langkah paling efisien pada tab Mailings adalah ....",
    "options": [
      "menekan Preview Results lalu menyalin teks satu per satu ke dokumen baru secara manual",
      "menghapus kode Merge Field kelas pada Main Document sebelum menekan tombol cetak",
      "menggunakan perintah Select Recipients → Type a New List untuk mengetik ulang seluruh nama siswa X-A",
      "memilih Highlight Merge Fields agar pencetak hanya memproses baris teks yang diberi warna latar",
      "membuka Edit Recipient List lalu menerapkan Filter pada kolom Kelas untuk memilih X-A sebelum menjalankan Finish & Merge"
    ],
    "answer": 4,
    "explanation": "Menu Edit Recipient List → Filter memungkinkan penyaringan penerima berdasarkan kriteria tertentu (seperti Kelas X-A) tanpa mengubah berkas sumber Excel."
  },
  {
    "id": 56,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M6",
    "topicName": "Aplikasi Perkantoran (MS Word, Mail Merge, & MS Excel)",
    "q": "Saat menghubungkan tabel Excel ke Mail Merge di Word, daftar Insert Merge Field justru menampilkan nama kolom generik seperti F1, F2, dan F3 alih-alih Nama_Siswa, NISN, dan Kelas. Kesalahan struktur pada lembar kerja Excel yang memicu kondisi tersebut adalah ....",
    "options": [
      "ukuran huruf judul kolom di Excel menggunakan jenis huruf yang berbeda dengan dokumen Word",
      "terdapat baris judul laporan dengan sel gabungan (merged cells) di atas baris nama kolom sehingga baris pertama tidak berisi header",
      "jumlah baris data siswa di dalam lembar kerja Excel melebihi seratus baris dalam satu lembar",
      "kolom nilai ujian di Excel diformat menggunakan tipe angka desimal dua angka di belakang koma",
      "dokumen utama di Microsoft Word belum diberi nomor halaman pada bagian bawah kertas"
    ],
    "answer": 1,
    "explanation": "Baris paling atas pada lembar kerja sumber data Excel harus langsung memuat nama kolom unik tanpa baris judul gabungan (merged cells) di atasnya."
  },
  {
    "id": 57,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M6",
    "topicName": "Aplikasi Perkantoran (MS Word, Mail Merge, & MS Excel)",
    "q": "Pada lembar kerja Microsoft Excel, nilai empat mata pelajaran seorang siswa berada pada sel C4, D4, E4, dan F4 dengan nilai berturut-turut 80, 90, (sel kosong karena belum ujian susulan), dan 70. Perbedaan hasil perhitungan antara rumus =AVERAGE(C4:F4) dengan kondisi jika sel E4 diisi angka 0 adalah ....",
    "options": [
      "keduanya menghasilkan nilai 60 karena fungsi AVERAGE selalu membagi total dengan jumlah sel dalam rentang",
      "keduanya menghasilkan nilai 80 karena angka nol diperlakukan sama persis seperti sel kosong oleh Excel",
      "saat kosong menghasilkan galat #DIV/0!, sedangkan saat diisi angka 0 menghasilkan nilai rata- rata 80",
      "saat kosong menghasilkan 80 (total 240 dibagi 3 sel terisi), sedangkan saat diisi 0 menghasilkan 60 (total 240 dibagi 4 sel)",
      "saat kosong menghasilkan 60, sedangkan saat diisi angka 0 menghasilkan 80 karena angka nol diabaikan"
    ],
    "answer": 3,
    "explanation": "Fungsi =AVERAGE(C4:F4) mengabaikan sel kosong (240 ÷ 3 = 80), sedangkan sel bernilai 0 dihitung sebagai pembagi numerik (240 ÷ 4 = 60)."
  },
  {
    "id": 58,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M6",
    "topicName": "Aplikasi Perkantoran (MS Word, Mail Merge, & MS Excel)",
    "q": "Setiap siswa mengikuti 5 kali kuis harian yang nilainya tercatat pada sel B2 sampai F2. Guru menetapkan aturan bahwa nilai akhir kuis diambil dari rata-rata 4 nilai tertinggi saja dengan menggugurkan 1 nilai terendah masing-masing siswa. Penulisan rumus Excel yang paling tepat untuk menghitung nilai akhir tersebut adalah ....",
    "options": [
      "=(SUM(B2:F2)-MIN(B2:F2))/4",
      "=(SUM(B2:F2)-MAX(B2:F2))/4",
      "=AVERAGE(B2:F2)-MIN(B2:F2)",
      "=(MAX(B2:F2)-MIN(B2:F2))/4",
      "=SUM(B2:F2)/MIN(B2:F2)"
    ],
    "answer": 0,
    "explanation": "Rumus =(SUM(B2:F2)-MIN(B2:F2))/4 menjumlahkan kelima skor, mengurangi satu skor terendah dengan MIN, lalu membagi sisanya dengan 4."
  },
  {
    "id": 59,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M6",
    "topicName": "Aplikasi Perkantoran (MS Word, Mail Merge, & MS Excel)",
    "q": "Untuk menghitung nilai rata-rata kelas pada sel B2 hingga B31, seorang siswa mengetikkan rumus =AVG(B2:B31) lalu menekan Enter. Hasil yang muncul pada sel tersebut beserta penyebabnya adalah ....",
    "options": [
      "muncul galat #VALUE! karena rentang sel berisi angka bulat tanpa tanda pemisah desimal",
      "muncul galat #REF! karena jumlah sel yang dihitung melebihi batas maksimal fungsi statistik",
      "muncul galat #NAME? karena Excel tidak mengenali nama fungsi AVG; sintaks yang benar adalah =AVERAGE(B2:B31)",
      "muncul angka 0 karena Excel menganggap AVG sebagai teks label bukan perintah perhitungan",
      "muncul hasil penjumlahan total karena Excel otomatis mengubah singkatan AVG menjadi fungsi SUM"
    ],
    "answer": 2,
    "explanation": "Excel menghasilkan galat #NAME? jika pengguna menulis =AVG(...) karena nama fungsi rata-rata yang valid di Excel adalah =AVERAGE(...)."
  },
  {
    "id": 60,
    "type": "mcq",
    "difficulty": "Medium",
    "points": 5,
    "topicCode": "M6",
    "topicName": "Aplikasi Perkantoran (MS Word, Mail Merge, & MS Excel)",
    "q": "Pada sebuah tabel rekapitulasi nilai, kolom B, C, dan D berisi nilai tugas semester ganjil, kolom E berisi nomor induk siswa (NISN), sedangkan kolom F, G, dan H berisi nilai tugas semester genap. Rumus Excel yang tepat untuk menjumlahkan seluruh nilai tugas ganjil dan genap pada baris ke-5 tanpa ikut menjumlahkan NISN di kolom E adalah ....",
    "options": [
      "=SUM(B5:H5)",
      "=SUM(B5:H5)-AVERAGE(E5)",
      "=MAX(B5:D5)+MIN(F5:H5)",
      "=SUM(B5:D5:F5:H5)",
      "=SUM(B5:D5; F5:H5)"
    ],
    "answer": 4,
    "explanation": "Penggunaan pemisah argumen pada =SUM(B5:D5; F5:H5) menjumlahkan dua rentang terpisah sehingga kolom NISN di E5 tidak ikut terhitung."
  }
];

const QuizManager = {

    MODULES_STORAGE_KEY: 'detektif_fakta_all_modules_v2',
    ACTIVE_MODULE_KEY: 'detektif_fakta_active_module_id',
    CUSTOM_QUIZ_DATA_PREFIX: 'detektif_fakta_quiz_data_',

    // Modul Penilaian Harian Baru (Infrastruktur Jaringan & Keamanan Digital)
    // Modul Tryout Terpadu Informatika Kelas X (60 Soal • 6 Materi Inti)
    TRYOUT_TERPADU_MODULE: {
        id: 'modul_tryout_terpadu',
        title: 'Tryout Terpadu Informatika Kelas X (60 Soal • 6 Materi Inti)',
        category: 'Tryout & Evaluasi Terpadu',
        icon: '🎯',
        badge: 'Tryout Terpadu HOTS',
        description: 'Simulasi ujian komprehensif 60 butir soal HOTS mencakup 6 materi inti: Literasi Digital, Web & Search, Digitalisasi Budaya & HKI, Etika & Privasi, Jaringan & Keamanan Siber, serta Aplikasi Perkantoran (Word, Mail Merge, & Excel).',
        questionCount: 60,
        kkm: 80,
        difficulty: 'HOTS Komprehensif (60 Butir PG Soal Terpadu)',
        dataFile: 'bank_soal/modul_tryout_terpadu.json',
        isDefault: true,
        createdAt: '2026-11-22T08:00:00Z'
    },

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
            m => m && m.id !== this.DEFAULT_MODULE.id && m.id !== this.NETWORK_SECURITY_MODULE.id && m.id !== this.HKI_CULTURE_MODULE.id && m.id !== this.ETIKA_PRIVASI_MODULE.id && m.id !== this.TRYOUT_TERPADU_MODULE.id
        );

        const orderedList = [
            this.NETWORK_SECURITY_MODULE,
            this.DEFAULT_MODULE,
            this.HKI_CULTURE_MODULE,
            this.ETIKA_PRIVASI_MODULE,
            this.TRYOUT_TERPADU_MODULE,
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

    /**
     * Mengambil metadata modul aktif secara sinkron.
     * Kompatibilitas untuk komponen laporan/kuis yang membutuhkan title dan KKM.
     */
    getActiveModule() {
        const activeId = this.getActiveModuleId();
        const builtInModules = [
            this.NETWORK_SECURITY_MODULE,
            this.DEFAULT_MODULE,
            this.HKI_CULTURE_MODULE,
            this.ETIKA_PRIVASI_MODULE,
            this.TRYOUT_TERPADU_MODULE
        ];
        let customModules = [];
        try {
            const stored = JSON.parse(localStorage.getItem(this.MODULES_STORAGE_KEY) || '[]');
            if (Array.isArray(stored)) customModules = stored;
        } catch (e) {
            customModules = [];
        }
        return [...builtInModules, ...customModules].find(module => module && module.id === activeId)
            || this.DEFAULT_MODULE;
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

                        if (targetId === this.TRYOUT_TERPADU_MODULE.id) {
            try {
                const res = await fetch('bank_soal/modul_tryout_terpadu.json');
                if (res.ok) {
                    const data = await res.json();
                    const qs = Array.isArray(data) ? data : (data && data.questions);
                    if (Array.isArray(qs) && qs.length > 0) {
                        window.quizData = qs;
                        return qs;
                    }
                }
            } catch (e) {
                console.warn('Fetch modul_tryout_terpadu.json gagal, menggunakan fallback bawaan:', e);
            }
            if (Array.isArray(window.TRYOUT_TERPADU_BUILTIN_QUESTIONS)) {
                window.quizData = window.TRYOUT_TERPADU_BUILTIN_QUESTIONS;
                return window.TRYOUT_TERPADU_BUILTIN_QUESTIONS;
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