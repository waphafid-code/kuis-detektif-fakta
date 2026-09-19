/**
 * ============================================================
 * 📝 DATA LEVEL 0: ONBOARDING QUIZ (GATE WAJIB — C1 MENGINGAT)
 * ============================================================
 * Gerbang masuk awal untuk memverifikasi pemahaman istilah dasar
 * sebelum siswa bertugas di Kantor Data Digital.
 * ============================================================
 */

(function () {
    'use strict';

    const LEVEL_0_DATA = {
        title: "Onboarding Gate: Uji Lisensi Detektif Data",
        badge: "Level 0 • C1 Mengingat (Gate Wajib)",
        passingScore: 80, // Minimal 4 dari 5 benar (80%)
        instructions: "Selamat datang di Markas Rahasia! Sebelum memulai misi pertamamu, buktikan kehebatanmu dengan menjawab 5 pertanyaan keamanan dasar ini. Agen yang hebat selalu waspada!",
        questions: [
            {
                id: "q1",
                text: "🔎 Pertanyaan Agen Dasar: Apa bedanya 'DATA' yang baru kamu temukan dengan 'FAKTA' yang sudah dikonfirmasi?",
                options: [
                    "Data itu kumpulan petunjuk mentah yang belum diolah, sedangkan Fakta adalah petunjuk sah yang terbukti kebenarannya! 🕵️",
                    "Data selalu benar 100%, sedangkan Fakta hanyalah gosip dari musuh.",
                    "Data cuma teks huruf, sedangkan Fakta pasti berbentuk video rekaman CCTV.",
                    "Sama saja! Dua-duanya bisa langsung dipercaya tanpa dicek."
                ],
                correct: 0,
                answer: 0,
                explanation: "📝 Catatan Detektif: Tepat! Data adalah bahan mentah (seperti jejak sepatu). Fakta adalah kenyataan yang sudah diverifikasi (jejak itu terbukti milik si pencuri)."
            },
            {
                id: "q2",
                text: "🚨 AWAS JEBAKAN! Kejahatan siber di mana musuh memancingmu memberikan password atau kode OTP lewat link palsu disebut apa?",
                options: [
                    "Formatting (Menghapus memori)",
                    "Phishing (Memancing data korban)",
                    "Defragmenting (Merapikan file)",
                    "Overclocking (Memaksa mesin ngebut)"
                ],
                correct: 1,
                answer: 1,
                explanation: "📝 Catatan Detektif: Benar! Phishing berasal dari kata 'Fishing' (Memancing). Musuh menebar umpan link palsu untuk memancing kelengahanmu!"
            },
            {
                id: "q3",
                text: "🏛️ Misi Penyelamatan Data Negara! Akhiran domain internet (ccTLD) resmi yang DIWAJIBKAN untuk situs pemerintahan Indonesia adalah...",
                options: [
                    ".xyz (Super rahasia)",
                    ".com.id (Komersial)",
                    ".go.id (Government Indonesia)",
                    ".gov.us (Pemerintah asing)"
                ],
                correct: 2,
                answer: 2,
                explanation: "📝 Catatan Detektif: Tepat sekali! Situs resmi pemerintah RI SELALU berakhiran '.go.id'. Kalau ada instansi mengaku resmi tapi pakai .xyz atau .biz, itu pasti musuh!"
            },
            {
                id: "q4",
                text: "📱 Tiba-tiba ada nomor tak dikenal mengirim file 'Undangan_VIP_Gratis.apk'. Apa bahaya terbesar jika kamu klik file ini?",
                options: [
                    "Huruf di HP-mu akan berubah jadi miring semua.",
                    "HP kamu akan kehabisan kertas untuk nge-print undangannya.",
                    "File .APK adalah aplikasi jahat (malware) yang bisa mencuri SMS OTP dan menguras isi tabungan! 😱",
                    "Tidak ada bahayanya! Langsung klik saja kan gratis!"
                ],
                correct: 2,
                answer: 2,
                explanation: "📝 Catatan Detektif: Waspada! .APK adalah paket aplikasi Android. Dokumen undangan asli biasanya berbentuk PDF atau Foto (.jpg), BUKAN aplikasi yang minta diinstal!"
            },
            {
                id: "q5",
                text: "🛡️ Hukum Emas Detektif Siber: Saat kamu menerima pesan heboh di grup obrolan yang belum jelas kebenarannya, apa yang harus kamu lakukan?",
                options: [
                    "Langsung viralkan ke 10 grup lain biar keren!",
                    "Saring sebelum Sharing! Periksa sumber resminya sebelum diteruskan. 🕵️‍♂️",
                    "Tambahkan tulisan 'VIRAL!! BACA SEBELUM DIHAPUS!' biar makin seru.",
                    "Percaya 100% saja kalau yang mengirim itu teman sekelasmu."
                ],
                correct: 1,
                answer: 1,
                explanation: "📝 Catatan Detektif: Sempurna! 'Saring Sebelum Sharing' adalah senjata utama kita melawan sindikat Raja Hoaks. Agen hebat tidak pernah menyebarkan info palsu."
            }
        ]
    };

    window.LEVEL_0_DATA = LEVEL_0_DATA;
})();
