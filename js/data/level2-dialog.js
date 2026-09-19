/**
 * ============================================================
 * 💬 LEVEL 2 DIALOG: RUANG ARSIP OSIS (level2-dialog.js)
 * ============================================================
 * Dialog narasi mentor Kak Bimo untuk Level 2 Warehouse Sorter.
 * Mendukung template string {playerName} dan 3 variasi performa.
 * ============================================================
 */

(function () {
    'use strict';

    const LEVEL_2_DIALOG = {
        mentor: {
            name: 'Kak Bimo',
            fullName: 'Bimo Wicaksono',
            role: 'Ketua OSIS / Koordinator Acara HUT ke-40',
            avatar: '🧑‍💼',
            badge: 'Pusat Komando Acara'
        },

        // Dialog Pembuka (Muncul saat briefing sebelum masuk Gudang Arsip)
        dialogPembuka: [
            "Halo {playerName}! Syukurlah kamu cepat datang ke ruang sekretariat OSIS! 🏃‍♂️📦",
            "Ulang Tahun Sekolah ke-40 sudah sangat dekat, tapi ruang arsip kita berantakan total akibat kiriman bertubi-tubi dari berbagai divisi dan pihak luar!",
            "Tugasmu: Rapikan 12 kiriman berkas ke 7 Rak Struktur Data (Array, Stack, Queue, Tree, Linked List, Graph, Hash Table) sesuai perilaku fisiknya. Jangan sampai ada antrean yang salah atau dokumen yang terselip!"
        ],

        // Dialog Transisi (Muncul setelah Babak 1 selesai, menuju Babak 2)
        dialogTransisi: [
            "Kerja hebat merapikan 12 berkas, {playerName}! Tapi tugas kita belum selesai!",
            "Sekarang, panitia HUT menghadapi 5 tantangan nyata di lapangan. Pilih struktur data yang paling tepat dan efisien untuk menyelesaikan tiap masalah!"
        ],

        // Dialog Penutup (Muncul di layar rekapitulasi akhir)
        dialogPenutup: {
            high: [ // Akurasi >= 85% (4-5 Bintang)
                "LUAR BIASA, {playerName}! Ruang arsip sekretariat sekarang serapi sistem komputer modern! 🌟",
                "Semua berkas logistik, antrean pendaftaran, hingga rantai koordinasi panitia tertata sempurna. Kepala Sekolah dan Pembina OSIS sangat terkesan!",
                "Meter Kepercayaan Sekolah melonjak pesat! Kita semakin siap menyongsong hari-H Ulang Tahun Sekolah!"
            ],
            medium: [ // Akurasi 60% - 84% (3 Bintang)
                "Bagus sekali, {playerName}! Sebagian besar berkas dan skenario berhasil diselesaikan dengan baik.",
                "Ada beberapa struktur data yang masih tertukar, misalnya antara Stack (LIFO) dan Queue (FIFO). Tapi ruang arsip kita sudah jauh lebih tertib!",
                "Kamu boleh lanjut ke misi berikutnya, atau ulangi level ini untuk mendapatkan 5 bintang penuh!"
            ],
            low: [ // Akurasi < 60% (1-2 Bintang)
                "Waduh, {playerName}! Beberapa berkas masih salah rak sehingga panitia sempat kebingungan mencari dokumen revisi!",
                "Ingat: Antrean memakai Queue (FIFO), tumpukan nampan memakai Stack (LIFO), dan pencarian instan memakai Hash Table.",
                "Jangan berkecil hati! Pelajari kembali karakteristik fisiknya dan coba tata ulang arsip kita!"
            ]
        },

        // Petunjuk Cerita (Story Clue) yang tercatat di Quest Log
        storyClue: "Arsip logistik berhasil dirapikan! Ditemukan berkas otentik proposal sponsor utama dan denah stan pameran HUT ke-40 yang siap diajukan ke Kepala Sekolah."
    };

    window.LEVEL_2_DIALOG = LEVEL_2_DIALOG;
})();
