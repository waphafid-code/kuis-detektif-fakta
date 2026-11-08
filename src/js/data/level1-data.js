/**
 * ============================================================
 * 🕵️ DATA LEVEL 1: INBOX DETECTIVE (ATP 1.1 - 1.2 — C3 MENERAPKAN)
 * ============================================================
 * 12 Dokumen realistis untuk diuji dengan 3 Alat Uji dan
 * dipilah ke Nampan FAKTA VALID atau HOAKS / PALSU.
 * ============================================================
 */

(function () {
    'use strict';

    const LEVEL_1_DOCS = [
        {
            id: 'doc1',
            title: 'Pengumuman Libur Sekolah Diperpanjang!',
            sender: 'Kementerian Pendidikan (Kemdikbud)',
            snippet: 'Hore! Surat Edaran No. 14/2026 menyatakan libur semester genap diperpanjang 2 minggu lagi. Sebarkan ke teman sekelas!',
            url: 'https://kurikulum.kemdikbud.go.id/edaran-14',
            fileType: 'PDF Document',
            isHoax: false,
            tests: {
                domain: '✅ DOMAIN AMAN: Menggunakan domain resmi pemerintah (.go.id). Bukan situs abal-abal!',
                metadata: '📅 TANGGAL COCOK: Tanggal surat sesuai dengan kalender pendidikan tahun ini.',
                media: '🔍 VALIDASI MEDIA: Berita ini juga muncul di berita TV dan situs resmi kementerian.'
            },
            explanation: '🚨 STATUS: FAKTA. Ini benar dokumen resmi pemerintah dengan domain asli kemdikbud.go.id. Kamu bisa libur tenang!'
        },
        {
            id: 'doc2',
            title: 'Klaim 10.000 Diamond Free Fire Gratis!',
            sender: 'Pesan Berantai WhatsApp',
            snippet: 'Event rahasia Garena! Klik link ini untuk klaim 10.000 Diamond dan Skin Sultan gratis sebelum ditutup jam 12 malam!',
            url: 'http://ff-diamond-gratis-sultan.biz.id/klaim',
            fileType: 'Web Link',
            isHoax: true,
            tests: {
                domain: '🚨 DOMAIN PALSU: Ekstensi murah (.biz.id) jelas bukan situs resmi Garena!',
                metadata: '⚠️ URGENSI PALSU: "Sebelum jam 12 malam" adalah trik murahan agar kamu panik dan cepat klik.',
                media: '❌ HOAKS TERCIDUK: Komunitas game sudah melaporkan ini sebagai modus pencurian akun (Phishing).'
            },
            explanation: '🚨 STATUS: HOAKS / PHISHING. Jebakan klasik Raja Hoaks untuk mencuri password akun game kamu.'
        },
        {
            id: 'doc3',
            title: 'Mod TikTok VIP Tanpa Iklan (.APK)',
            sender: 'Grup Mabar (Anggota Tak Dikenal)',
            snippet: 'Bro, install aplikasi ini buat nonton TikTok tanpa iklan dan bisa download video VIP. Aman 100%!',
            url: 'TikTok_VIP_NoAds.apk',
            fileType: 'Android Package (.apk)',
            isHoax: true,
            tests: {
                domain: '🚨 FORMAT BERBAHAYA: File .APK dari luar AppStore/PlayStore sangat berbahaya!',
                metadata: '⚠️ SUMBER MENCURIGAKAN: Dikirim oleh nomor tak dikenal yang baru masuk grup.',
                media: '❌ MALWARE TERDETEKSI: Program ini dirancang untuk menyadap kamera dan keyboard HP kamu.'
            },
            explanation: '🚨 STATUS: MALWARE. Ini bukan aplikasi VIP, tapi virus Trojan yang bisa mengambil alih HP-mu!'
        },
        {
            id: 'doc4',
            title: 'Laporan Tren E-Sport Nasional',
            sender: 'Badan Pusat Statistik RI',
            snippet: 'Rilis Berita Resmi: Pertumbuhan industri game dan E-Sport di kalangan pelajar SMA Indonesia.',
            url: 'https://bps.go.id/id/pressrelease/2026/esport-naker.html',
            fileType: 'Official Web Report',
            isHoax: false,
            tests: {
                domain: '✅ DOMAIN VALID: Situs resmi Lembaga Pemerintah bps.go.id dengan sertifikat keamanan.',
                metadata: '📅 METADATA VALID: Ada tabel data resmi, nama peneliti, dan logo instansi.',
                media: '🔍 TERVERIFIKASI: Berita rilis ini diliput oleh portal berita teknologi terpercaya.'
            },
            explanation: '🚨 STATUS: FAKTA. Ini adalah riset asli dari Badan Pusat Statistik RI, bagus untuk bahan tugas sekolah.'
        },
        {
            id: 'doc5',
            title: 'Hujan Meteor Malam Ini, Matikan HP!',
            sender: 'Forward dari Tante',
            snippet: 'PENGUMUMAN! Nanti malam akan ada radiasi kosmik dari hujan meteor. Matikan HP jam 12 malam agar tidak meledak!!!',
            url: 'Radiasi_Kosmik_Bahaya.txt',
            fileType: 'Text Broadcast',
            isHoax: true,
            tests: {
                domain: '⚠️ TANPA SUMBER: Cuma pesan teks biasa tanpa link ke situs astronomi/LAPAN.',
                metadata: '📅 HOAKS ZOMBIE: Pesan ini sudah beredar tiap tahun sejak 2012!',
                media: '❌ BANTAHAN AHLI: Ilmuwan membantah keras, radiasi kosmik tidak akan membuat HP meledak.'
            },
            explanation: '🚨 STATUS: HOAKS. Hoaks jadul ("Zombie Hoax") yang terus didaur ulang untuk menakut-nakuti orang tua.'
        },
        {
            id: 'doc6',
            title: 'Pendaftaran Beasiswa E-Sport Pelajar',
            sender: 'Kementerian Pemuda dan Olahraga',
            snippet: 'Pemerintah membuka beasiswa penuh bagi pelajar SMA yang berprestasi di bidang E-Sport tingkat nasional.',
            url: 'https://kemenpora.go.id/beasiswa/esport-2026',
            fileType: 'Official Portal',
            isHoax: false,
            tests: {
                domain: '✅ DOMAIN RESMI: Subdomain resmi Kementerian Pemuda dan Olahraga (kemenpora.go.id).',
                metadata: '📅 DOKUMEN SAH: Terdapat pedoman pendaftaran PDF dengan stempel digital asli.',
                media: '🔍 KREDIBILITAS TINGGI: Dipublikasikan lewat akun Instagram resmi @kemenpora dengan centang biru.'
            },
            explanation: '🚨 STATUS: FAKTA. Info resmi beasiswa pemerintah. Siapkan tim mabar kamu untuk ikut seleksinya!'
        },
        {
            id: 'doc7',
            title: 'Razia Rambut Gondrong Polisi Masuk Sekolah',
            sender: 'Grup Telegram "Anak Gaul"',
            snippet: 'AWAS! Besok jam 8 pagi polisi akan masuk ke sekolah buat cukur paksa rambut gondrong. Bolos aja bro!',
            url: 'Foto_Polisi_Cukur_Rambut.jpg',
            fileType: 'Image / Viral Message',
            isHoax: true,
            tests: {
                domain: '⚠️ FOTO TANPA KONTEKS: Tidak ada link ke portal berita atau surat kepolisian.',
                metadata: '📅 FOTO PALSU: Reverse Image Search membuktikan ini adalah foto razia tahun 2015 di kota lain.',
                media: '❌ KLARIFIKASI SEKOLAH: Kepala Sekolah sudah menyatakan tidak ada razia polisi.'
            },
            explanation: '🚨 STATUS: HOAKS. Foto lama yang diedit ulang oleh Raja Hoaks agar murid-murid membolos sekolah.'
        },
        {
            id: 'doc8',
            title: 'Pengumuman Jadwal Ujian Nasional',
            sender: 'Dinas Pendidikan Daerah',
            snippet: 'Edaran resmi: Jadwal dan kisi-kisi Ujian Akhir Semester Genap tahun ajaran ini.',
            url: 'https://disdik.padang.go.id/arsip/jadwal-ujian.pdf',
            fileType: 'PDF Document',
            isHoax: false,
            tests: {
                domain: '✅ DOMAIN PEMDA: Domain resmi instansi daerah padang.go.id.',
                metadata: '📅 TANGGAL RESMI: Dilengkapi kop surat resmi dan tanda tangan Kepala Dinas Pendidikan.',
                media: '🔍 TERVERIFIKASI: Edaran ini juga dipasang di papan pengumuman sekolah.'
            },
            explanation: '🚨 STATUS: FAKTA. Info valid, selamat belajar menghadapi ujian!'
        },
        {
            id: 'doc9',
            title: 'Undian Tiket Konser K-Pop VIP',
            sender: 'SMS Blast (Pengirim: Kpop-Promo)',
            snippet: 'Selamat! No Anda menang tiket VIP Konser BTS. Klik link untuk klaim dan masukkan nomor kartu ATM ortu kamu!',
            url: 'http://tiket-kpop-gratis-vip.xyz/login',
            fileType: 'Web Link Phishing',
            isHoax: true,
            tests: {
                domain: '🚨 DOMAIN FRAUD: Domain .xyz gratisan, bukan web resmi promotor konser!',
                metadata: '⚠️ RED FLAG FATAL: Meminta nomor kartu ATM dan PIN! Promotor asli tidak pernah minta PIN bank.',
                media: '❌ PERINGATAN BANK: Ini modus pencurian saldo bank yang sedang marak terjadi.'
            },
            explanation: '🚨 STATUS: HOAKS / PHISHING. Ini kejahatan siber serius untuk menguras rekening bank orang tuamu.'
        },
        {
            id: 'doc10',
            title: 'Peringatan Dini Cuaca Ekstrem',
            sender: 'BMKG Indonesia',
            snippet: 'Hujan lebat disertai angin kencang berpotensi terjadi di wilayah pesisir mulai besok pagi.',
            url: 'https://inatews.bmkg.go.id/info-cuaca',
            fileType: 'Sensor Telemetry Report',
            isHoax: false,
            tests: {
                domain: '✅ DOMAIN BMKG: Sistem peringatan dini resmi inatews.bmkg.go.id.',
                metadata: '📅 DATA ILMIAH: Berdasarkan pantauan satelit cuaca terkini.',
                media: '🔍 APLIKASI RESMI: Peringatan yang sama muncul di notifikasi HP lewat aplikasi InfoBMKG.'
            },
            explanation: '🚨 STATUS: FAKTA. Laporan resmi dari sensor BMKG. Sebaiknya bawa jas hujan besok!'
        },
        {
            id: 'doc11',
            title: 'Aplikasi Cek Jawaban Ujian Otomatis (.APK)',
            sender: 'Akun Misterius',
            snippet: 'Malas mikir pas ujian? Instal aplikasi AI bot ini di HP-mu. Kamera akan baca soal dan otomatis nulis jawaban A,B,C,D!',
            url: 'Cheat_Ujian_AI_AutoBot.apk',
            fileType: 'Android Package (.apk)',
            isHoax: true,
            tests: {
                domain: '🚨 APLIKASI ILEGAL: Aplikasi semacam ini 100% scam dan berisi virus.',
                metadata: '⚠️ PERILAKU ANEH: Aplikasi ini diam-diam minta izin untuk membaca semua foto dan SMS di HP.',
                media: '❌ REVIEW BURUK: Banyak pelajar menangis karena HP mereka terkunci ransomware setelah instal ini.'
            },
            explanation: '🚨 STATUS: MALWARE. Bukan cuma menyontek itu salah, tapi aplikasi ini adalah Virus Ransomware pemeras uang!'
        },
        {
            id: 'doc12',
            title: 'Tips Menghindari Radiasi Gadget',
            sender: 'Kementerian Kesehatan Republik Indonesia',
            snippet: 'Panduan resmi durasi main HP (Screen Time) yang sehat bagi pelajar agar mata tidak minus.',
            url: 'https://kemkes.go.id/publikasi/pedoman-screen-time',
            fileType: 'Official Web Bulletin',
            isHoax: false,
            tests: {
                domain: '✅ DOMAIN RESMI: Portal utama Kementerian Kesehatan (kemkes.go.id).',
                metadata: '📅 KONTEKS MEDIS: Disusun oleh Ikatan Dokter Mata Indonesia berdasarkan jurnal ilmiah.',
                media: '🔍 VALIDASI AHLI: Direkomendasikan oleh banyak ahli kesehatan di stasiun TV nasional.'
            },
            explanation: '🚨 STATUS: FAKTA. Panduan kesehatan sah. Ingat, main game boleh, tapi kesehatan mata nomor satu!'
        }
    ];

    window.LEVEL_1_DOCS = LEVEL_1_DOCS;
})();
