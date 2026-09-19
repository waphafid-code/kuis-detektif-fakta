/**
 * ============================================================
 * 💬 LEVEL 1 DIALOG: INBOX DETECTIVE (level1-dialog.js)
 * ============================================================
 * Dialog narasi mentor Bu Maya untuk Level 1 Inbox Detective.
 * Mendukung template string {playerName} dan 3 variasi performa.
 * ============================================================
 */

(function () {
    'use strict';

    const LEVEL_1_DIALOG = {
        mentor: {
            name: 'Bu Maya',
            fullName: 'Ibu Maya Arisanti, S.Kom., M.T.',
            role: 'Kepala Divisi Integritas Data',
            avatar: '👩‍💼',
            badge: 'Ketua Tim Forensik'
        },

        // Dialog Pembuka (Muncul sebelum siswa menganalisis dokumen)
        dialogPembuka: [
            "Gawat, Agen {playerName}! Server komunikasi kita baru saja diserang 12 dokumen viral yang masuk bersamaan! 🚨",
            "Beberapa dokumen memang info resmi yang penting, tapi sisanya adalah jebakan malware dan berita bohong dari sindikat jahat 'Raja Hoaks' (CV DataKilat)!",
            "Tugasmu: Gunakan 3 Alat Uji Forensik di mejamu. Cek Domain URL-nya, Periksa Tanggalnya, dan Verifikasi Silang ke media resmi. Lempar fakta ke Nampan Hijau, dan musnahkan Hoaks di Nampan Merah!"
        ],

        // Dialog Penutup (Muncul di layar rekapitulasi, bervariasi sesuai skor & bintang)
        dialogPenutup: {
            high: [ // Akurasi >= 85% (4-5 Bintang)
                "BOM DIACTIVATED! Luar biasa, Agen {playerName}! Penglihatanmu setajam laser! ⚡",
                "Kamu berhasil melucuti semua link phishing dan APK pencuri data dari Raja Hoaks. Markas kita aman berkat kejelianmu!",
                "Petunjuk baru: Tim intel menyebutkan bahwa sindikat ini sedang mengacaukan antrean logistik di Gudang Stasiun 2... Bersiaplah!"
            ],
            medium: [ // Akurasi 60% - 84% (3 Bintang)
                "Fiuh! Hampir saja, Agen {playerName}. Sebagian besar jebakan Raja Hoaks berhasil kamu hancurkan.",
                "Namun, ada beberapa jebakan halus yang lolos. Ingat, satu klik yang salah bisa membocorkan rahasia markas kita!",
                "Kamu boleh lanjut ke misi berikutnya, tapi saya tantang kamu untuk mengulang level ini nanti demi 5 bintang sempurna!"
            ],
            low: [ // Akurasi < 60% (1-2 Bintang)
                "AWAS! Sistem Peringatan Bahaya berbunyi! Agen {playerName}, banyak jebakan yang lolos dari periksamu!",
                "Untung saja perisai cadangan markas kita menahan efeknya. Sindikat Raja Hoaks memang sangat licik meniru dokumen asli.",
                "Jangan menyerah! Gunakan selalu Scanner Domain untuk mendeteksi link mencurigakan. Ayo ulang misinya dan balas dendam!"
            ]
        },

        // Petunjuk Cerita (Story Clue) yang terungkap di Quest Log setelah lulus
        storyClue: "Ditemukan jejak digital server CV DataKilat yang menyamarkan malware APK sebagai 'Surat Undangan' dan 'Resi Kurir' untuk membobol sistem kantor."
    };

    window.LEVEL_1_DIALOG = LEVEL_1_DIALOG;
})();
