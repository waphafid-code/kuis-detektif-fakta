/**
 * Data Misi & Dummy Dataset untuk Lab TIK: Ahli Pencarian
 */
window.LABTIK_DATA = {
    // 5 Misi Pencarian
    missions: [
        {
            id: 1,
            instruction: 'Acara kita butuh hiasan. Cari info vendor <strong>"dekorasi balon"</strong> di <strong>Surabaya</strong>. Tapi pastikan vendor tersebut BUKAN barang <strong>impor</strong> (kecualikan kata impor).',
            hint: 'Gunakan tanda kutip untuk frasa eksak, spasi (sebagai AND) untuk menambah kata lokasi, dan tanda minus (-) untuk mengecualikan kata.',
            expectedQuery: '"dekorasi balon" surabaya -impor',
            targetDocIds: [102]
        },
        {
            id: 2,
            instruction: 'Cari info harga sewa <strong>"sound system"</strong>. Acara ini butuh dari lokasi terdekat, jadi cari yang dari <strong>Sidoarjo</strong> ATAU <strong>Gresik</strong>.',
            hint: 'Gunakan operator OR (harus huruf besar) di antara dua pilihan kota.',
            expectedQuery: '"sound system" sidoarjo OR gresik',
            targetDocIds: [201, 203]
        },
        {
            id: 3,
            instruction: 'Kita butuh dana! Cari <strong>"contoh proposal"</strong> sponsor acara sekolah, tapi HANYA dari situs pemerintah (<strong>go.id</strong>) atau akademik (<strong>ac.id</strong>) agar formatnya resmi.',
            hint: 'Gunakan kombinasi pencarian file/domain jika bisa, atau cukup ketikkan "contoh proposal" sponsor go.id OR ac.id',
            expectedQuery: '"contoh proposal" sponsor go.id OR ac.id',
            targetDocIds: [301, 305]
        },
        {
            id: 4,
            instruction: 'Kita butuh narasumber seminar literasi digital. Cari artikel tentang bahaya <strong>clickbait</strong> dan <strong>hoaks</strong>, tapi hindari berita tentang <strong>politik</strong>.',
            hint: 'Gabungkan kata kunci dengan spasi (AND), dan kecualikan kata politik.',
            expectedQuery: 'clickbait hoaks -politik',
            targetDocIds: [402, 404]
        },
        {
            id: 5,
            instruction: 'Terakhir, cari ide untuk promosi. Ketik tepat frasa eksak <strong>"desain spanduk kreatif"</strong> TANPA ada embel-embel <strong>premium</strong>.',
            hint: 'Ingat fungsi tanda kutip ganda dan tanda minus.',
            expectedQuery: '"desain spanduk kreatif" -premium',
            targetDocIds: [501]
        }
    ],

    // Dummy Dataset (Kumpulan hasil pencarian simulasi)
    dummyResults: [
        // Misi 1 Data
        { id: 101, title: 'Dekorasi Balon Mewah Surabaya (Bahan Impor)', url: 'www.balonmewah-sby.com', snippet: 'Menyediakan dekorasi balon kualitas impor terbaik di Surabaya untuk acara Anda.', isCredible: false },
        { id: 102, title: 'Vendor Dekorasi Balon Lokal Surabaya', url: 'www.dekorasibalon-lokal.co.id', snippet: 'Jasa dekorasi balon murah dan meriah di Surabaya. Semua bahan buatan lokal (bukan impor), aman dan ramah lingkungan.', isCredible: true },
        { id: 103, title: 'Jual Balon Hias Impor Jakarta', url: 'www.balonjakarta.com', snippet: 'Pusat grosir balon hias impor, siap kirim ke seluruh Indonesia termasuk Surabaya.', isCredible: false },
        { id: 104, title: 'Tutorial Dekorasi Ruangan Kelas', url: 'www.idekelas.net', snippet: 'Cara mudah membuat dekorasi balon untuk ulang tahun sekolah di Surabaya.', isCredible: false },
        
        // Misi 2 Data
        { id: 201, title: 'Sewa Sound System Murah Sidoarjo', url: 'www.soundsidoarjo.com', snippet: 'Penyewaan sound system berkualitas untuk acara sekolah dan pernikahan di area Sidoarjo sekitarnya.', isCredible: true },
        { id: 202, title: 'Harga Sound System Surabaya', url: 'www.soundsby.com', snippet: 'Cari sewa sound system? Kami melayani area Surabaya dan sekitarnya dengan harga terjangkau.', isCredible: true },
        { id: 203, title: 'Rental Sound System Spesialis Gresik', url: 'www.gresikaudio.net', snippet: 'Layanan rental sound system terlengkap di kota Gresik. Diskon khusus untuk acara OSIS.', isCredible: true },
        { id: 204, title: 'Jual Sound System Bekas Sidoarjo', url: 'www.jualbeliaudio.com', snippet: 'Forum jual beli sound system bekas area Sidoarjo dan Gresik. Hati-hati penipuan!', isCredible: false },

        // Misi 3 Data
        { id: 301, title: 'Panduan Penyusunan Contoh Proposal Sponsor Kegiatan', url: 'dikbud.sidoarjokab.go.id/proposal-sponsor', snippet: 'Dokumen resmi berisi panduan dan contoh proposal sponsor acara sekolah yang diakui Dinas Pendidikan.', isCredible: true },
        { id: 302, title: '10 Contoh Proposal Sponsor Pasti Cair!!!', url: 'www.blogger-kampungan.blogspot.com', snippet: 'Download ribuan contoh proposal sponsor di sini. Klik link ini sekarang juga, 100% work!', isCredible: false },
        { id: 303, title: 'Cara Membuat Proposal Kegiatan (go.id)', url: 'www.cara-membuat-proposal.com/go-id-ac-id', snippet: 'Artikel SEO jebakan yang hanya memuat kata kunci go.id dan ac.id untuk contoh proposal sponsor agar muncul di mesin pencari.', isCredible: false },
        { id: 304, title: 'Format Resmi Proposal Sekolah', url: 'www.sekolahkita.com', snippet: 'Berbagai contoh proposal sponsor untuk kegiatan ekstrakurikuler.', isCredible: true },
        { id: 305, title: 'Jurnal Manajemen Acara: Analisis Contoh Proposal Sponsor', url: 'jurnal.unesa.ac.id/manajemen-acara', snippet: 'Studi akademis mengenai efektivitas contoh proposal sponsor dalam menggalang dana kegiatan siswa.', isCredible: true },

        // Misi 4 Data
        { id: 401, title: 'Bahaya Clickbait di Berita Politik', url: 'www.beritapolitik.com/clickbait', snippet: 'Mengupas tuntas bagaimana hoaks dan clickbait digunakan dalam kampanye politik tahun ini.', isCredible: true },
        { id: 402, title: 'Literasi Digital: Melawan Hoaks dan Judul Clickbait', url: 'literasidigital.id/melawan-hoaks', snippet: 'Artikel edukasi tentang bahaya clickbait dan cara mengenali hoaks di media sosial, sangat cocok untuk narasumber seminar.', isCredible: true },
        { id: 403, title: 'Artis Ini Terkena Hoaks, Nomor 3 Bikin Kaget!', url: 'www.gosipviral.com', snippet: 'Berita clickbait terbaru. Apakah artis ini korban hoaks politik? Simak selengkapnya.', isCredible: false },
        { id: 404, title: 'Materi Seminar: Fenomena Clickbait dan Penyebaran Hoaks', url: 'kominfo.go.id/materi-clickbait', snippet: 'Bahan paparan resmi mengenai definisi hoaks dan bahaya clickbait bagi psikologi remaja. Tanpa unsur politik.', isCredible: true },
        { id: 405, title: 'Hoaks Politik Paling Menghebohkan', url: 'www.suararakyat.com', snippet: 'Daftar hoaks politik yang menggunakan clickbait untuk menarik perhatian pemilih.', isCredible: false },

        // Misi 5 Data
        { id: 501, title: 'Kumpulan Desain Spanduk Kreatif untuk OSIS', url: 'www.desain-osis.com/spanduk', snippet: 'Inspirasi desain spanduk kreatif untuk acara sekolah. Gratis digunakan tanpa lisensi.', isCredible: true },
        { id: 502, title: 'Template Desain Spanduk Kreatif Premium', url: 'www.canva-pro-seller.com', snippet: 'Beli akun premium untuk mendapatkan ribuan desain spanduk kreatif. Diskon hari ini!', isCredible: false },
        { id: 503, title: 'Jasa Desain Spanduk Murah', url: 'www.jasadesain.com', snippet: 'Kami menerima pesanan desain spanduk acara. Hasil kreatif dan cepat. Hubungi kami.', isCredible: true },
        { id: 504, title: 'Desain Spanduk Kreatif Bikin Acara Premium', url: 'www.tipsdesain.net', snippet: 'Cara membuat desain spanduk kreatif agar acara sekolahmu terlihat premium dan berkelas.', isCredible: false },
        { id: 505, title: 'Spanduk Kreatif Acara Sekolah', url: 'www.sekolah-kreatif.sch.id', snippet: 'Galeri contoh desain spanduk yang dibuat oleh siswa-siswi kreatif kami.', isCredible: true },
        
        // Noise Data (Untuk meramaikan hasil pencarian umum jika query tidak spesifik)
        { id: 901, title: 'Cara Membuat Balon Udara', url: 'www.balonudara.com', snippet: 'Tutorial merakit balon udara untuk tugas sekolah sains.', isCredible: true },
        { id: 902, title: 'Berita Surabaya Hari Ini', url: 'www.suarasurabaya.net', snippet: 'Kabar terkini seputar lalu lintas dan cuaca di kota Surabaya.', isCredible: true },
        { id: 903, title: 'Download Template Proposal Acara', url: 'www.template-gratis.com', snippet: 'Berbagai format proposal dalam format Word.', isCredible: true },
        { id: 904, title: 'Sewa Tenda dan Kursi Surabaya', url: 'www.sewatenda.com', snippet: 'Jasa penyewaan tenda, alat katering, dan sound system area Surabaya.', isCredible: true },
        { id: 905, title: 'Bahaya Sosial Media bagi Remaja', url: 'www.psikologiremaja.id', snippet: 'Dampak negatif hoaks dan kecanduan gadget.', isCredible: true }
    ]
};
