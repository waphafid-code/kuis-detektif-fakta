# Perlindungan nilai: apa yang ada di kode dan yang perlu Bapak pasang di Firebase

## Sudah ada di kode (setelah PR ini di-merge)
1. **Verifikasi baca-ulang**: nilai dianggap terkirim hanya bila server mengembalikan nomor bukti yang sama; bila gagal, dicoba ulang 3x lalu masuk antrean HP (dikirim ulang otomatis tiap 25 detik, dan siswa diperingatkan bila menutup halaman).
2. **Log tambah-saja** `submissions_log`: setiap pengiriman ditulis juga dengan cap SHA-256. Penghapusan nilai di dasbor tidak menghapus log ini.
3. **Arsip sebelum hapus** `deleted_archive`: salinan baris disimpan sebelum dihapus guru.
4. **Tombol "Pulihkan Nilai dari Log"** di Dasbor Guru: mengembalikan nilai yang hilang dan menolak entri yang cap integritasnya tidak cocok.
5. Penghapusan guru berstempel waktu: pengerjaan ulang setelah dihapus tidak pernah disembunyikan lagi.

## Perlu dipasang manual (Firebase Console > Realtime Database > Rules)
Salin isi `firebase_database_rules_aman.json`, uji di tab **Rules Playground**, lalu **Publish**.
Isinya: nilai harus 0-100 dan berstruktur benar; `submissions_log` dan `deleted_archive` hanya bisa dibuat, tidak bisa diubah atau dihapus.

## Batasan yang jujur
Aplikasi belum memakai login Firebase, jadi aturan tidak bisa membedakan guru dan siswa: siapa pun yang tahu alamat database masih bisa membaca/menulis `quiz_results`. Perlindungan penuh butuh Firebase Authentication (mis. login anonim untuk siswa + akun guru). Itu perubahan lebih besar dan sebaiknya dikerjakan terpisah.
