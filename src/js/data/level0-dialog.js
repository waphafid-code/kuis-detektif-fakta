/**
 * ============================================================
 * 💬 LEVEL 0 DIALOG: ONBOARDING GATE (level0-dialog.js)
 * ============================================================
 * Dialog narasi mentor Bu Maya untuk Level 0 Onboarding.
 * Mendukung template string {playerName} dan variasi performa.
 * ============================================================
 */

(function () {
    'use strict';

    const LEVEL_0_DIALOG = {
        mentor: {
            name: 'Bu Maya',
            fullName: 'Ibu Maya Arisanti, S.Kom., M.T.',
            role: 'Kepala Divisi Integritas Data',
            avatar: '👩‍💼',
            badge: 'Ketua Tim Forensik'
        },

        // Dialog Pembuka (Muncul sebelum kuis gate dimulai)
        dialogPembuka: [
            "Selamat datang di Markas Rahasia Divisi Integritas Data, Agen {playerName}! 🕵️‍♂️✨",
            "Bulan lalu markas kita nyaris diretas oleh sindikat penjahat siber jahat bernama 'CV DataKilat' karena ada agen yang sembarangan klik link palsu!",
            "Sebelum saya berikan Lencana Detektif Cyber kepadamu, buktikan dulu insting detektifmu di terminal ini. Raih skor minimal 80% untuk membuktikan kamu siap menjalankan misi besar di Stasiun 1!"
        ],

        // Dialog Penutup (Muncul setelah kuis gate selesai, bervariasi sesuai hasil skor)
        dialogPenutup: {
            high: [
                "Luar Biasa, Agen {playerName}! Insting detektifmu setajam elang! 🦅",
                "Lisensi Detektif Siber milikmu resmi aktif! Gerbang Stasiun 1 (Inbox Detective) telah terbuka. Ada 12 dokumen super mencurigakan menunggumu. Ayo bongkar kejahatan mereka!"
            ],
            medium: [
                "Kerja bagus, Agen {playerName}. Kamu punya potensi besar, tapi masih ada sedikit celah yang bisa dimanfaatkan peretas.",
                "Sindikat Raja Hoaks sangat licik! Pastikan kamu berlatih lebih keras lagi. Capai skor 80% agar saya bisa resmi menyerahkan lencana detektif ini kepadamu!"
            ],
            low: [
                "Waduh, Agen {playerName}! Sepertinya kamu masih butuh latihan agar tidak mudah terjebak tipuan musuh.",
                "Jangan menyerah! Seorang detektif hebat belajar dari kesalahannya. Baca baik-baik petunjuk di laporan evaluasi, dan coba lagi misinya! Pasti bisa!"
            ]
        },

        // Petunjuk Cerita (Story Clue) yang terungkap di Quest Log setelah lulus
        storyClue: "Misi Terbuka: Sindikat 'CV DataKilat' sedang menggunakan ratusan robot penyebar spam untuk menyusup ke jaringan markas kita. Hati-hati dengan jebakan mereka!"
    };

    window.LEVEL_0_DIALOG = LEVEL_0_DIALOG;
})();
