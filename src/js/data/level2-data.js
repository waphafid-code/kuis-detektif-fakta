/**
 * ============================================================
 * 📦 LEVEL 2 DATA: RUANG ARSIP SEKRETARIAT OSIS (level2-data.js)
 * ============================================================
 * Menyimpan data 7 Rak Fisik Struktur Data, 12 Kiriman Berkas
 * (Babak 1 Sorter), dan 5 Skenario Terapan Nyata OSIS (Babak 2).
 * ============================================================
 */

(function () {
    'use strict';

    // 1. DEFINISI 7 RAK FISIK STRUKTUR DATA (ITP 2.1)
    const LEVEL_2_RACKS = [
        {
            id: 'array',
            name: 'Array (Larik Berindeks)',
            shortCode: 'ARRAY',
            icon: '🔢',
            badge: 'Indeks [0..n]',
            color: '#3b82f6',
            borderColor: 'rgba(59, 130, 246, 0.6)',
            bgColor: 'rgba(59, 130, 246, 0.12)',
            metaphor: 'Lemari Slot Bersekat Bernomor Urut',
            behavior: 'Akses langsung instan lewat nomor indeks slot [0, 1, 2, ...]. Dokumen bebas diambil atau dicek tanpa menggeser berkas lain.'
        },
        {
            id: 'stack',
            name: 'Stack (Tumpukan LIFO)',
            shortCode: 'STACK',
            icon: '📚',
            badge: 'LIFO (Hanya Dari Atas)',
            color: '#ec4899',
            borderColor: 'rgba(236, 72, 153, 0.6)',
            bgColor: 'rgba(236, 72, 153, 0.12)',
            metaphor: 'Nampan Berkas Bertingkat Vertikal',
            behavior: 'Prinsip LIFO (Last In, First Out). Berkas baru ditumpuk di paling atas (Push) dan hanya berkas teratas yang boleh diambil (Pop). Menolak pengambilan dari tengah!'
        },
        {
            id: 'queue',
            name: 'Queue (Antrean FIFO)',
            shortCode: 'QUEUE',
            icon: '🚶‍♂️➡️',
            badge: 'FIFO (Ban Berjalan)',
            color: '#10b981',
            borderColor: 'rgba(16, 185, 129, 0.6)',
            bgColor: 'rgba(16, 185, 129, 0.12)',
            metaphor: 'Jalur Ban Berjalan / Loket Tiket',
            behavior: 'Prinsip FIFO (First In, First Out). Berkas masuk dari ujung belakang (Rear) dan berkas yang pertama datang wajib diproses terlebih dahulu dari depan (Front).'
        },
        {
            id: 'tree',
            name: 'Tree (Pohon Hierarki)',
            shortCode: 'TREE',
            icon: '🌳',
            badge: 'Induk - Anak (Hirarkis)',
            color: '#14b8a6',
            borderColor: 'rgba(20, 184, 166, 0.6)',
            bgColor: 'rgba(20, 184, 166, 0.12)',
            metaphor: 'Lemari Folder Bercabang Bertingkat',
            behavior: 'Struktur bertingkat satu Induk (Root) yang memiliki Cabang (Branch) dan Ranting (Leaf). Sangat cocok untuk bagan organisasi dan klasifikasi sub-kategori.'
        },
        {
            id: 'linked_list',
            name: 'Linked List (Rantai Berpenunjuk)',
            shortCode: 'LINKED_LIST',
            icon: '🔗',
            badge: 'Pointer Node -> Next',
            color: '#8b5cf6',
            borderColor: 'rgba(139, 92, 246, 0.6)',
            bgColor: 'rgba(139, 92, 246, 0.12)',
            metaphor: 'Rangkaian Kartu Kendali Bertali Penunjuk',
            behavior: 'Elemen tersusun dalam simpul kartu yang menunjuk ke simpul berikutnya via pointer. Sangat lincah untuk menyisipkan dokumen baru di tengah alur tanpa menggeser nomor indeks lain.'
        },
        {
            id: 'graph',
            name: 'Graph (Graf Jaringan Kontak)',
            shortCode: 'GRAPH',
            icon: '🕸️',
            badge: 'Banyak-ke-Banyak (Jaringan)',
            color: '#f59e0b',
            borderColor: 'rgba(245, 158, 11, 0.6)',
            bgColor: 'rgba(245, 158, 11, 0.12)',
            metaphor: 'Papan Pin Relasi Koordinasi Panitia',
            behavior: 'Kumpulan simpul (Nodes) yang saling dihubungkan garis relasi (Edges) tanpa batasan hierarki kaku. Memetakan rute tercepat dan koordinasi multikoneksi.'
        },
        {
            id: 'hash_table',
            name: 'Hash Table (Loker Kode Instan)',
            shortCode: 'HASH_TABLE',
            icon: '🗄️',
            badge: 'Key-Value (Akses O(1))',
            color: '#06b6d4',
            borderColor: 'rgba(6, 182, 212, 0.6)',
            bgColor: 'rgba(6, 182, 212, 0.12)',
            metaphor: 'Loker Kunci Digital Berkode Unik',
            behavior: 'Penyimpanan pasangan Kunci & Nilai (Key-Value). Menggunakan fungsi hash untuk langsung menemukan lokasi berkas dalam sekejap O(1) berdasarkan ID tanpa menyisir rak satu per satu.'
        }
    ];

    // 2. DATA 12 KIRIMAN BERKAS BABAK 1 (WAREHOUSE SORTER)
    const LEVEL_2_SHIPMENTS = [
        {
            id: 'ship-1',
            title: 'Daftar Urutan Nilai 10 Juara Lomba Kebersihan Kelas',
            category: 'Rekapitulasi Nilai',
            sender: 'Seksi Juri Lomba',
            icon: '📊',
            description: 'Tabel daftar nilai juara peringkat 1 sampai 10 dengan nomor urut tetap. Juri butuh langsung memeriksa nilai peringkat ke-4 tanpa membuka berkas lainnya.',
            targetRack: 'array',
            physicalHint: 'Butuh slot indeks berurutan tetap [0..9] agar nomor peringkat bisa dibuka seketika.',
            explanation: 'Array menyimpan data dalam elemen berindeks berurutan. Sangat ideal untuk daftar nilai tetap dengan pencarian instan berbasis nomor posisi [0] hingga [9].'
        },
        {
            id: 'ship-2',
            title: 'Map Berkas Sertifikat Panitia Siap Tanda Tangan',
            category: 'Administrasi Piagam',
            sender: 'Sekretariat OSIS',
            icon: '📜',
            description: 'Tumpukan nampan map sertifikat tebal yang baru dicetak. Ketua OSIS menandatangani map teratas satu per satu. Map tidak boleh ditarik dari tengah karena tumpukan akan berantakan!',
            targetRack: 'stack',
            physicalHint: 'Tumpukan vertikal: yang terakhir ditumpuk di atas meja adalah yang pertama diambil (LIFO).',
            explanation: 'Stack menerapkan prinsip LIFO (Last In, First Out). Berkas ditambahkan ke puncak tumpukan (Push) dan diambil dari atas (Pop). Mengambil dari tengah dilarang keras!'
        },
        {
            id: 'ship-3',
            title: 'Antrean Siswa Mengambil Kupon Makan Gladi Bersih',
            category: 'Logistik Konsumsi',
            sender: 'Seksi Konsumsi',
            icon: '🎟️',
            description: 'Ratusan siswa berbaris di depan meja konsumsi. Panitia wajib melayani siswa yang datang lebih dulu, tidak boleh ada penyerobotan antrean dari belakang.',
            targetRack: 'queue',
            physicalHint: 'Jalur satu arah: yang datang pertama dilayani pertama di depan loket (FIFO).',
            explanation: 'Queue (Antrean) mengusung prinsip FIFO (First In, First Out). Siswa masuk dari belakang (Enqueue) dan dilayani dari baris paling depan (Dequeue) secara adil.'
        },
        {
            id: 'ship-4',
            title: 'Bagan Struktur Kepanitiaan HUT Sekolah ke-40',
            category: 'Struktur Organisasi',
            sender: 'Ketua Umum OSIS',
            icon: '👥',
            description: 'Bagan alur komando bertingkat: dari Kepala Sekolah (Pelindung), Ketua Panitia, membawahi 4 Koordinator Bidang, lalu tiap bidang memiliki 3 seksi pelaksana.',
            targetRack: 'tree',
            physicalHint: 'Memiliki satu akar (Root) yang bercabang ke sub-koordinator (Branch) dan anggota (Leaf).',
            explanation: 'Tree (Pohon) memodelkan data hierarkis hubungan orang tua-anak (Parent-Child). Sangat pas untuk rantai komando organisasi dan klasifikasi bertingkat.'
        },
        {
            id: 'ship-5',
            title: 'Rantai Riwayat Catatan Revisi Rundown Acara Panggung',
            category: 'Dokumen Dinamis',
            sender: 'Koordinator Acara',
            icon: '📝',
            description: 'Catatan draf susunan acara yang terus diperbarui. Tiap versi menunjuk draf revisi berikutnya. Panitia ingin leluasa menyisipkan jadwal darurat di tengah acara tanpa menggeser nomor urut dokumen lain.',
            targetRack: 'linked_list',
            physicalHint: 'Tiap kartu memiliki pointer/tali penunjuk ke kartu berikutnya. Sangat fleksibel disisipi.',
            explanation: 'Linked List menghubungkan node melalui pointer. Menyisipkan atau menghapus acara di tengah rundown tidak memerlukan pergeseran memori berindeks seperti pada Array.'
        },
        {
            id: 'ship-6',
            title: 'Peta Jalur Koordinasi Handy-Talky (HT) Antar-Seksi',
            category: 'Jaringan Komunikasi',
            sender: 'Seksi Keamanan & Lapangan',
            icon: '📻',
            description: 'Diagram jaringan saluran HT: Seksi Perlengkapan harus dapat terhubung langsung ke Seksi Keamanan, Panggung, dan Listrik sekaligus tanpa mengikuti hierarki kaku.',
            targetRack: 'graph',
            physicalHint: 'Jaringan multikoneksi banyak-ke-banyak (Many-to-Many) dengan simpul kontak dan garis relasi.',
            explanation: 'Graph menghubungkan berbagai simpul (Nodes) melalui jalur relasi (Edges). Sangat cocok untuk memetakan jaringan komunikasi dan hubungan non-linier.'
        },
        {
            id: 'ship-7',
            title: 'Loker Pengambilan Barang Tertinggal Berbasis Nomor Tiket',
            category: 'Posko Kehilangan',
            sender: 'Posko Keamanan HUT',
            icon: '🔑',
            description: 'Kotak barang temuan siswa. Setiap barang diberi stiker kode tiket unik (misal: #LOST-88). Petugas ingin langsung tahu loker barang dalam 0,1 detik saat nomor diketik.',
            targetRack: 'hash_table',
            physicalHint: 'Pasangan Kunci (Kode Tiket) dan Nilai (Lokasi Loker) untuk pencarian langsung O(1).',
            explanation: 'Hash Table menggunakan fungsi hash untuk memetakan kunci pencarian langsung ke alamat penyimpanan (Key-Value), memungkinkan akses instan O(1) tanpa menyisir seluruh loker.'
        },
        {
            id: 'ship-8',
            title: 'Jadwal Alokasi Pemakaian Ruang Multimedia (Senin-Sabtu)',
            category: 'Peminjaman Ruangan',
            sender: 'Wakasek Sarana Prasarana',
            icon: '📅',
            description: 'Jadwal 6 hari kerja tetap (Indeks 0 = Senin s.d. Indeks 5 = Sabtu) dengan kapasitas waktu yang sudah pasti dan dapat langsung dilihat per hari.',
            targetRack: 'array',
            physicalHint: 'Slot berukuran tetap yang dialokasikan di awal dengan nomor hari yang baku.',
            explanation: 'Array berukuran tetap sangat efisien ketika jumlah slot sudah pasti (6 hari) dan data sering diakses langsung berdasarkan indeks hari yang spesifik.'
        },
        {
            id: 'ship-9',
            title: 'Log Riwayat Perintah Undo/Redo di Aplikasi Desain Spanduk',
            category: 'Sistem Grafis',
            sender: 'Seksi Publikasi & Dokumentasi',
            icon: '↩️',
            description: 'Daftar langkah aksi pengeditan poster. Saat desainer menekan tombol "Undo" (Batal), aksi coretan kuas paling terakhir yang dibuat harus dibatalkan terlebih dahulu.',
            targetRack: 'stack',
            physicalHint: 'Aksi terakhir yang dimasukkan adalah aksi pertama yang dicabut kembali (LIFO).',
            explanation: 'Fitur Undo/Redo pada software grafis diimplementasikan menggunakan Stack. Aksi terakhir di-Push ke tumpukan, dan saat Undo ditekan, aksi teratas di-Pop seketika.'
        },
        {
            id: 'ship-10',
            title: 'Antrean Berkas Formulir Masuk ke Mesin Fotokopi Ruang OSIS',
            category: 'Layanan Cetak',
            sender: 'Staf Administrasi',
            icon: '🖨️',
            description: 'Spooler dokumen print: 15 dokumen dikirim bersamaan lewat Wi-Fi. Mesin printer mencetak dokumen yang terkirim pertama kali, disusul dokumen berikutnya sesuai urutan kirim.',
            targetRack: 'queue',
            physicalHint: 'Prinsip antrean mesin cetak (Printer Spooler): urutan masuk sama dengan urutan keluar.',
            explanation: 'Sistem antrean printer (print spooling) menggunakan Queue (FIFO) agar berkas yang pertama dikirim selesai dicetak terlebih dahulu sebelum berkas pengirim berikutnya.'
        },
        {
            id: 'ship-11',
            title: 'Struktur Folder Google Drive Penyimpanan Foto Dokumentasi',
            category: 'Arsip Cloud Digital',
            sender: 'Divisi IT & Multimedia',
            icon: '📁',
            description: 'Susunan folder penyimpanan awan: Folder Utama [HUT-40] membawahi Subfolder [Pra-Acara], [Hari-H], dan [Pasca-Acara], yang masing-masing memiliki subfolder fotografer.',
            targetRack: 'tree',
            physicalHint: 'Sistem berkas direktori (File System) bertingkat dari folder induk ke subfolder.',
            explanation: 'File system dan struktur direktori komputer selalu menggunakan struktur data Tree (Pohon), di mana root directory bercabang ke subdirektori dan file-file di dalamnya.'
        },
        {
            id: 'ship-12',
            title: 'Peta Jejaring Alumni Sponsor & Donatur HUT Sekolah',
            category: 'Kemitraan Luar',
            sender: 'Seksi Humas & Sponsorship',
            icon: '🤝',
            description: 'Bagan hubungan sosial antara para alumni: Kak Dani mengenalkan Kak Sinta, yang keduanya terhubung ke perusahaan sponsor X, serta relasi silang antar donatur.',
            targetRack: 'graph',
            physicalHint: 'Jejaring relasi sosial antar-individu yang saling terhubung tanpa hierarki satu arah.',
            explanation: 'Jejaring sosial (Social Network) dimodelkan menggunakan Graph, di mana individu merupakan simpul (Nodes) dan hubungan pertemanan/kemitraan merupakan garis relasi (Edges).'
        }
    ];

    // 3. DATA 5 SKENARIO OSIS BABAK 2 (ITP 2.2 — PENERAPAN STRUKTUR DATA)
    const LEVEL_2_SCENARIOS = [
        {
            id: 'scen-1',
            title: 'Skenario 1: Sistem Pemesanan Tiket Pentas Seni Tanpa Ricuh',
            situation: 'OSIS membuka penjualan 500 tiket pentas seni secara daring. Pada detik pertama, ratusan siswa serentak menekan tombol beli. Agar tidak terjadi kericuhan dan menjamin asas keadilan, siswa yang menekan tombol lebih cepat wajib mendapatkan tiket terlebih dahulu.',
            question: 'Struktur data apa yang paling tepat diterapkan pada server pemesanan tiket tersebut?',
            options: [
                { id: 'queue', text: 'Queue (Antrean FIFO)', icon: '🚶‍♂️➡️' },
                { id: 'stack', text: 'Stack (Tumpukan LIFO)', icon: '📚' },
                { id: 'tree', text: 'Tree (Pohon Hierarki)', icon: '🌳' },
                { id: 'array', text: 'Array (Larik)', icon: '🔢' }
            ],
            correctId: 'queue',
            explanation: 'Queue bekerja dengan prinsip FIFO (First In, First Out). Permintaan yang masuk server lebih awal akan ditempatkan di depan antrean dan diproses terlebih dahulu, sehingga menjamin keadilan pemesanan tiket.'
        },
        {
            id: 'scen-2',
            title: 'Skenario 2: Navigasi Riwayat Tombol Kembali (Back Button) Web OSIS',
            situation: 'Divisi Web merancang portal berita HUT Sekolah. Ketika pengunjung mengklik tombol "Kembali ke Halaman Sebelumnya (Back)", sistem harus seketika membuka halaman yang paling akhir dilihat oleh pengguna sebelum halaman saat ini.',
            question: 'Struktur data apa yang mendasari mekanisme riwayat penjelajahan (Browser History / Back)?',
            options: [
                { id: 'stack', text: 'Stack (Tumpukan LIFO)', icon: '📚' },
                { id: 'queue', text: 'Queue (Antrean FIFO)', icon: '🚶‍♂️➡️' },
                { id: 'graph', text: 'Graph (Jaringan)', icon: '🕸️' },
                { id: 'hash_table', text: 'Hash Table (Loker Kode)', icon: '🗄️' }
            ],
            correctId: 'stack',
            explanation: 'Stack menerapkan prinsip LIFO (Last In, First Out). Setiap kali membuka halaman baru, URL di-push ke puncak tumpukan. Saat tombol Back ditekan, URL paling akhir di-pop kembali seketika.'
        },
        {
            id: 'scen-3',
            title: 'Skenario 3: Verifikasi Cepat 800 Peserta Lomba di Gerbang Masuk',
            situation: 'Pada pagi hari pelaksanaan lomba, 800 peserta berkerumun di gerbang. Panitia pemindai tiket harus memverifikasi keabsahan peserta dalam waktu kurang dari 0,05 detik hanya dengan mengetik atau memindai nomor barcode NISN peserta.',
            question: 'Struktur data apa yang menjamin pencarian kilat dalam waktu konstan O(1) berdasarkan kunci unik?',
            options: [
                { id: 'hash_table', text: 'Hash Table (Tabel Hash Key-Value)', icon: '🗄️' },
                { id: 'linked_list', text: 'Linked List (Senarai Berantai)', icon: '🔗' },
                { id: 'tree', text: 'Tree (Pohon Biner)', icon: '🌳' },
                { id: 'stack', text: 'Stack (Tumpukan)', icon: '📚' }
            ],
            correctId: 'hash_table',
            explanation: 'Hash Table menggunakan fungsi hash untuk mengubah nomor NISN (Key) menjadi alamat memori langsung. Waktu pencariannya adalah O(1) konstan, tidak bergantung pada seberapa banyak (800) peserta yang terdaftar.'
        },
        {
            id: 'scen-4',
            title: 'Skenario 4: Bagan Rantai Komando & Delegasi Tugas Panitia',
            situation: 'Pembina OSIS meminta diagram alur delegasi instruksi yang tertib: Ketua Panitia memegang kendali tertinggi, membawahi 5 Koordinator Divisi, lalu tiap koordinator membawahi 4 Seksi Lapangan, dan tiap seksi memiliki anggota relawan.',
            question: 'Struktur data apa yang paling representatif untuk memodelkan hubungan bertingkat induk-anak ini?',
            options: [
                { id: 'tree', text: 'Tree (Pohon Hierarki)', icon: '🌳' },
                { id: 'array', text: 'Array (Larik Berurutan)', icon: '🔢' },
                { id: 'queue', text: 'Queue (Antrean)', icon: '🚶‍♂️➡️' },
                { id: 'stack', text: 'Stack (Tumpukan)', icon: '📚' }
            ],
            correctId: 'tree',
            explanation: 'Tree (Pohon) memiliki satu simpul akar (Root: Ketua Panitia) dan cabang-cabang anak (Children: Koordinator & Seksi). Sangat akurat merefleksikan hierarki kekuasaan dan alur delegasi organisasi.'
        },
        {
            id: 'scen-5',
            title: 'Skenario 5: Pemetaan Rute Distribusi Logistik Tenda Pameran',
            situation: 'Seksi Perlengkapan harus mendistribusikan sound system ke 12 stan pameran yang tersebar di area kampus sekolah. Sebagian stan terhubung lorong paving, sebagian terhalang taman. Mereka butuh memetakan seluruh jalur untuk menemukan rute terpendek antar-stan.',
            question: 'Struktur data apa yang paling tepat untuk memodelkan titik-titik stan dan jalur penghubungnya?',
            options: [
                { id: 'graph', text: 'Graph (Graf Jaringan Titik & Jalur)', icon: '🕸️' },
                { id: 'stack', text: 'Stack (Tumpukan)', icon: '📚' },
                { id: 'array', text: 'Array (Larik)', icon: '🔢' },
                { id: 'linked_list', text: 'Linked List (Rantai)', icon: '🔗' }
            ],
            correctId: 'graph',
            explanation: 'Graph terdiri dari simpul (Vertices/Nodes = Stan Pameran) dan sisi (Edges = Jalur Lorong). Ini adalah struktur data standar yang digunakan algoritma peta (GPS / Dijkstra) untuk mencari rute terpendek antar-lokasi.'
        }
    ];

    window.LEVEL_2_DATA = {
        racks: LEVEL_2_RACKS,
        shipments: LEVEL_2_SHIPMENTS,
        scenarios: LEVEL_2_SCENARIOS
    };
})();
