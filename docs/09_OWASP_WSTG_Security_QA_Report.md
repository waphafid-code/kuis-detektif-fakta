# Dokumen P09: Laporan Pengujian Keamanan OWASP WSTG v4.2 & Real QA Verification
## Audit Keamanan & Verifikasi Fitur Baru — Platform QuizMaster SMAN 4 Padang

---

### 1. Jawaban Singkat: Apakah Sudah Ada di Laporan QA Sebelumnya?
**BELUM.** Laporan QA sebelumnya ([01_Quality_Assessment.md](01_Quality_Assessment.md) s.d. [08_QA_Audit_Final_Report.md](08_QA_Audit_Final_Report.md), tertanggal 6–8 November 2026) baru mencakup pengujian *Black-Box* (EP, BVA, DT, ST) dan 61 *shift-left unit test* untuk versi `v3.0.02`.

Laporan QA lama **belum mencakup**:
1. Pengujian keamanan standar **OWASP Web Security Testing Guide (WSTG v4.2) Bab 4.1 s.d. 4.12**.
2. Pengujian fitur terbaru (28 November 2026): anti-cheat ketat pada Akun Demo, alur kunci ke-3 wajib persetujuan Guru di Dasbor Guru, deteksi `Win+Shift+S` / `PrintScreen` / `copy-paste`, pengaturan toleransi kustom, timer kustom bebas, pilihan multi-modul kustom, dan penghapusan kartu refleksi.

---

### 2. Bagaimana Cara Melakukan Pengujian Nyata (*Real Testing*) & Alurnya

Pengujian nyata terbagi menjadi **2 jalur pelengkap**:

#### A. Jalur 1 — Pengujian Terintegrasi Real Runtime + OWASP Security Audit (Otomatis)
Menjalankan seluruh skrip produksi secara bersamaan (`default_records.js` + `student_roster.js` + `quiz_manager.js` + `storage.js` + `audio.js` + `ai_studio.js` + `dashboard.js` + `quiz_engine.js`) menggunakan **WebCrypto SHA-256 asli**, simulasi event DOM nyata, serta inspeksi konfigurasi server, Firestore, Firebase RTDB, dan Supabase RLS:
```powershell
node verify_owasp_wstg_security.js
node verify_anticheat_comprehensive.js
```

#### B. Jalur 2 — Pengujian E2E Real di Browser Chrome (`http://localhost:5500/index.html`)
> **Status Eksekusi Otomatis Chrome di Sesi Ini:** **TERBLOKIR (`BLOCKED`)** karena Chrome di perangkat belum mengaktifkan *remote debugging* (`DevToolsActivePort` tidak ditemukan di `C:\Users\hafid\AppData\Local\Google\Chrome\User Data`) dan Playwright/Puppeteer tidak terpasang. Berikut langkah nyata agar dapat dijalankan langsung di Chrome:

1. Jalankan server lokal lewat [START_SERVER_LOKAL.bat](../START_SERVER_LOKAL.bat) (atau `python -m http.server 5500`), lalu buka `http://localhost:5500/index.html`.
   *(Opsional jika ingin agent AI langsung mengklik Chrome Anda: buka `chrome://inspect/#remote-debugging` dan aktifkan Remote Debugging).*
2. **Alur Uji 1 — Verifikasi Tanpa Gimik:** Buka halaman hasil / inspeksi DOM (`document.getElementById('student-reflection-card')` harus `null`).
3. **Alur Uji 2 — Uji Auth & Kontrol Guru (OWASP 4.4/4.5):**
   - Buka DevTools Console (`F12`), jalankan `switchScreen('teacher')` atau `grantTeacherAccess()` sebelum login ➔ harus ditolak dan muncul `#pin-modal`.
   - Coba PIN salah `0000` ➔ harus ditolak; masukkan PIN resmi ➔ Dasbor Guru terbuka.
4. **Alur Uji 3 — Pengaturan Kustom Guru:**
   - Set **`Anti-Cheat di Akun Demo`** = `Aktif Penuh`, **`Akun & Kelas Demo`** = `Tampilkan`.
   - Isi **Waktu Kustom** (misal `45 detik` atau `2 menit`) lalu klik `Terapkan` ➔ verifikasi dropdown menampilkan nilai kustom.
   - Set **Batas Toleransi** (misal `3` atau `0`), dan uji **Kustom Multi-Modul** (centang HKI + Etika & Privasi saja) ➔ kembali ke Beranda dan pastikan hanya 2 modul tersebut yang muncul.
5. **Alur Uji 4 — Uji Anti-Cheat Akun Demo & Persetujuan Guru:**
   - Masuk kuis memakai `KELAS DEMO` -> cek Console `window.quizData[0].answer` harus `undefined` (terlindung di vault).
   - Lakukan pelanggaran `#1` (Copy / `Ctrl+C`), `#2` (`PrintScreen` / `Win+Shift+S`), dan `#3` (Klik kanan / Pindah tab) ➔ pelanggaran ke-3 harus mengunci tombol lanjut mandiri dan menampilkan **🔒 Wajib Persetujuan Guru**.
   - Refresh / kembali ke Beranda lalu klik Mulai lagi ➔ pastikan tetap terkunci.
   - Buka Dasbor Guru ➔ cek panel **🔐 Persetujuan Lanjut Kuis**, klik **✅ Setujui Lanjut Kuis** ➔ cek layar siswa terbuka kembali dan bisa melanjutkan soal.

---

### 3. Hasil Audit OWASP WSTG v4.2 (4.1 s.d. 4.12) — Jujur & Aktual

Berdasarkan eksekusi nyata `node verify_owasp_wstg_security.js` pada **28 November 2026**:

| Bab OWASP WSTG | Ruang Lingkup Uji Nyata | Status Aktual | Temuan Riil / Catatan Teknis |
|---|---|---|---|
| **4.1 Information Gathering** | Eksposur file sensitif di root web statis (`express.static(__dirname)`, Python HTTP, GitHub Pages) | **OPEN FINDING (HIGH)** | Endpoint statis mengizinkan akses langsung ke `bank_soal/*.json` (berisi kunci jawaban), `server.js`, `database.rules.json`, `firestore.rules`, dan `supabase_rls_setup.sql`. |
| **4.2 Configuration & Deployment Management** | Header keamanan HTTP, CORS `server.js`, pemaparan file konfigurasi | **OPEN FINDING (MEDIUM)** | `server.js` memakai `app.use(cors())` wildcard dan belum menyertakan header `Content-Security-Policy`, `X-Frame-Options`, atau `X-Content-Type-Options`. |
| **4.3 Identity Management** | Pemilihan roster resmi 216 siswa + Token Ujian opsional | **PASS WITH LIMITATION** | Validasi roster memblokir nama tak terdaftar dan Token Ujian mencegah joki luar kelas, namun tidak ada password individual per siswa (desain keterpakaian kelas X). |
| **4.4 Authentication Testing** | Bypass auth console `grantTeacherAccess()`, forged `sessionStorage` token, kekuatan PIN 4-digit | **MIXED (UI PASS / CRYPTO HIGH)** | Bypass console & token palsu di `dashboard.js` **BERHASIL DIBLOKIR**. Namun `TEACHER_PIN_HASH` adalah SHA-256 tanpa salt atas PIN 4 digit (10.000 kombinasi; uji real Node membuktikan *brute-force* offline selesai dalam **< 15 ms**). `server.js` juga masih menyimpan fallback `'2543'`. |
| **4.5 Authorization Testing** | Isolasi Dasbor Guru, `confirmClearData`, dan aturan Cloud DB | **MIXED (CLIENT PASS / CLOUD CRITICAL)** | Penjaga otorisasi klien (`isTeacherAuthValid()`) **BERHASIL MEMBLOKIR** akses ilegal. Namun `firestore.rules` masih `if true` untuk semua operasi dan `database.rules.json` masih `.write: true`. |
| **4.6 Session Management** | Anti-tampering sesi ujian (`computeSessionChecksum`) & token guru | **PASS (CLIENT-SIDE)** | Uji real memodifikasi `score` dan `cheatStrikes` di `sessionStorage` menyebabkan checksum `_sig` gagal dan sesi langsung dibersihkan. (Catatan: rahasia checksum tetap berada di sisi klien karena aplikasi berjalan sebagai SPA statis). |
| **4.7 Input Validation Testing** | XSS (`escapeHtml`, `_sanitizeWatermarkText`), CSV Formula Injection (`CWE-1236`), SQL Injection | **PASS** | `escapeHtml()` menetralkan tag HTML, `sanitizeSpreadsheetValue()` memberi awalan `'` pada karakter rumus (`= + - @`), dan `server.js` memakai *parameterized SQL* (`?`). |
| **4.8 Testing for Error Handling** | Respons galat API server | **OPEN FINDING (MEDIUM)** | `server.js` mengembalikan `err.message` mentah pada HTTP `500` (`/api/scores`, `/api/settings`), berisiko membocorkan struktur SQL internal. |
| **4.9 Testing for Weak Cryptography** | Algoritma hash PIN guru & checksum sesi | **OPEN FINDING (MEDIUM/HIGH)** | SHA-256 tanpa KDF (PBKDF2/Argon2) pada PIN 4-digit rentan *offline cracking*; checksum sesi memakai hash geser 32-bit + salt statis klien. |
| **4.10 Business Logic Testing** | KKM 80, batas `single_only` + blokir `isCheated`, Demo anti-cheat, 3-strike ➔ lock Guru, custom timer & multi-modul | **PASS** | Seluruh alur bisnis & pembukaan kunci dari Dasbor Guru terverifikasi berjalan nyata pada bundel skrip terintegrasi. |
| **4.11 Client-Side Testing** | Vault kunci jawaban (`_secureAnswerVault`), blokir `copy`/`cut`/`paste`/`contextmenu`/`PrintScreen`/`Win+Shift+S`/`getDisplayMedia` | **PASS** | `window.quizData[0].answer` bernilai `undefined` setelah `vaultAnswers()`, serta seluruh event kecurangan memicu modal peringatan & penguncian. |
| **4.12 API Testing** | Express `/api/*`, Firestore, Firebase RTDB, Supabase RLS | **OPEN FINDING (CRITICAL/HIGH)** | Express `GET /api/scores` & `POST /api/scores` belum memerlukan token autentikasi dan menerima skor langsung dari klien. Firestore & RTDB belum membatasi tulis/hapus dengan Firebase Auth. Supabase RLS sudah memblokir `UPDATE`/`DELETE` dari `anon` (catatan: fitur sinkronisasi shared state guru memakai `PATCH` dengan key publik bila dijalankan tanpa login Supabase Auth). |

---

### 4. Rekomendasi Prioritas Perbaikan Keamanan Nyata
1. **[CRITICAL] Kunci `firestore.rules` & `database.rules.json`:** Gunakan Firebase Authentication (misal Custom Claims / Anonymous Auth + validasi ketat agar siswa hanya dapat `create` satu kali dan tidak bisa `update`/`delete` nilai orang lain).
2. **[HIGH] Pisahkan Static Public Folder di `server.js`:** Pindahkan asset web siswa ke folder `public/` khusus dan **jangan** mengekspos file backend (`server.js`, `verify_*.js`, `*.sql`, atau file JSON berisi kunci jawaban jika memakai server dinamis—penilaian jawaban idealnya dilakukan di server `/api/grade`).
3. **[HIGH] Autentikasi Server-Side Penuh untuk Guru:** Hapus fallback PIN `'2543'` dari `server.js`, wajibkan token JWT/session server yang ditandatangani di backend, serta lindungi `/api/scores` agar hanya mengembalikan rekap ke Guru terotentikasi.
4. **[MEDIUM] Sanitasi Pesan Error API & Tambahkan Security Headers:** Ganti `err.message` pada HTTP `500` dengan pesan generik, batasi `cors({ origin: ... })`, dan tambahkan header CSP/`X-Frame-Options` pada server produksi.
