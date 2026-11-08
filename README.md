# 📝 QuizMaster — Platform Kuis Interaktif & Evaluasi Cerdas
### SMAN 4 Padang • Kelas X (X E.1 s.d X E.6)
> **Mini Quality Assurance (QA) Audit Project** — *From Requirements to Test Evidence*  
> Program Studi S1 Pendidikan Teknik Informatika

[![Quality Gate](https://img.shields.io/badge/Quality%20Gate-PASSED-success?style=for-the-badge)](docs/08_QA_Audit_Final_Report.md)
[![Automated Tests](https://img.shields.io/badge/Automated%20Tests-61%2F61%20PASS-brightgreen?style=for-the-badge)](verify_20_bugs.js)
[![Black-Box Tests](https://img.shields.io/badge/Black--Box%20Tests-12%2F12%20PASS-blue?style=for-the-badge)](docs/06_Black_Box_Design.md)
[![Defects Resolved](https://img.shields.io/badge/Defects-3%20CLOSED-success?style=for-the-badge)](docs/07_Defect_Report_RCA.md)

---

## 👥 Tim Quality Assurance (Kelompok Praktikum)

| No | Nama Lengkap Mahasiswa | Peran & Tanggung Jawab Utama |
|:---:|---|---|
| 1 | **Muhammad Hafidh Putra Roshadi** | **Lead QA & Test Strategy Architect** (Orkestrasi QA, Dokumen P01 & P04, Sign-off Rilis) |
| 2 | **Pipit Khofifah** | **Senior Test Case Designer & Requirements Analyst** (Spesifikasi Gherkin P03, Desain Black-Box P06, RTM P05) |
| 3 | **Harie Fadhil** | **Defect Analyst & RCA Lead** (Identifikasi Cacat, 5-Why RCA P07, Verifikasi Re-test) |
| 4 | **Andre Geovani** | **Automation & Evidence Engineer** (Automated Suite 61 Uji, Chrome DevTools MCP Screenshots, Audit Mobile) |

📄 Rincian kontribusi mendalam setiap anggota dapat dilihat pada dokumen: **[`contributions.md`](contributions.md)**

---

## 🌐 Akses Produksi & Video Presentasi QA Audit

- 🚀 **Live Production Application:** [https://waphafid-code.github.io/kuis-detektif-fakta/](https://waphafid-code.github.io/kuis-detektif-fakta/)
- 🎬 **Video Presentasi & Demonstrasi Pengujian (YouTube):** [https://youtu.be/SQYn-bsqfPw](https://youtu.be/SQYn-bsqfPw)
- 📊 **Laporan Final QA Audit (Markdown):** [`docs/08_QA_Audit_Final_Report.md`](docs/08_QA_Audit_Final_Report.md)

---

## 📚 Struktur Repository GitHub (Sesuai Standar Praktikum QA)

```
kuis-detektif-fakta/
├── README.md                              # Berkas Panduan Utama & Ringkasan Proyek QA
├── docs/                                  # Dokumentasi Lengkap 8 Tahap Audit Mutu
│   ├── 01_Quality_Assessment.md           # P01: ISO 25010, Masalah Kualitas, QA vs QC, CoQ
│   ├── 02_QA_Lifecycle.md                 # P02: Siklus QA, Shift-Left & Shift-Right, Quality Gates
│   ├── 03_Requirement_Risk_Register.md    # P03: 5 Kebutuhan, Gherkin Syntax, Risk Matrix 5x5
│   ├── 04_Test_Strategy_Plan.md           # P04: Ruang Lingkup, Level Uji, Lingkungan, Kriteria
│   ├── 06_Black_Box_Design.md             # P06: Desain & Eksekusi EP, BVA, Decision Table, ST
│   ├── 07_Defect_Report_RCA.md            # P07: Laporan 3 Cacat IEEE 829, 5-Why RCA, Bukti Re-test
│   └── 08_QA_Audit_Final_Report.md        # P08: Ringkasan Eksekutif, RTM Audit, Sign-Off Rilis
├── test-cases/                            # Data Uji & Matriks Ketertelusuran
│   ├── 05_Test_Cases.csv                  # 12 Test Case Black-Box Terstruktur
│   └── 05_RTM.csv                         # Requirements Traceability Matrix (REQ -> TC -> Bug)
├── evidence/                              # 15 Bukti Tangkapan Layar Autentik (PNG)
│   ├── home_screen.png                    # Tangkapan Layar Beranda
│   ├── TC01_EP_Valid_PIN.png s.d TC03     # Bukti Equivalence Partitioning (PIN 2543, 9999, 12)
│   ├── TC04_BVA_KKM_79 s.d TC06           # Bukti Boundary Value Analysis (Skor 79, 80, 81)
│   ├── TC07_DT_AlwaysOpen s.d TC09        # Bukti Decision Table Testing (Rule 1, 2, 3)
│   ├── TC10_ST_Lobby s.d TC12             # Bukti State Transition Testing (S1 -> S2 -> S3)
│   ├── DEFECT01_Chatbot_NLP_Query_Fixed.png # Bukti Perbaikan Chatbot Gemini
│   └── DEFECT02_Mobile_FAB_Fixed.png      # Bukti Perbaikan Mobile UI Safe Area
├── src/                                   # Kode Sumber Aplikasi (HTML, CSS, JS, Bank Soal)
└── contributions.md                       # Matriks Pembagian Tugas Anggota Tim
```

---

## 💻 Panduan Menjalankan Aplikasi & Uji Otomatis

### 1. Menjalankan Aplikasi Secara Lokal
Aplikasi QuizMaster tidak memerlukan instalasi backend yang rumit (Client-Side SPA):
```bash
# Opsi 1: Menjalankan skrip batch bawaan
START_SERVER_LOKAL.bat

# Opsi 2: Menggunakan server lokal Node.js / Python
python -m http.server 5500
# Buka di browser: http://localhost:5500
```

### 2. Menjalankan Rangkaian Uji Otomatis (Shift-Left Regression)
Seluruh 61 pengujian otomatis dapat dijalankan melalui terminal Node.js:
```bash
# Uji 20 perbaikan cacat teknis platform
node verify_20_bugs.js

# Uji logika kontrol akses jadwal dan mode always open
node verify_access_control.js

# Uji ketahanan status ujian di localStorage saat offline
node verify_exam_resilience.js

# Uji isolasi nilai dan modul kuis
node verify_module_isolation.js

# Uji optimasi performa perangkat low-end (Potato mode)
node verify_potato_optimizations.js

# Uji responsivitas antarmuka layar ponsel
node verify_mobile_uiux.js
```
*Hasil Verifikasi:* **61 / 61 PASS (100% Berhasil)**.

---

## 🎯 Ringkasan Hasil Pengujian Kotak Hitam (Black-Box)

| Teknik Black-Box | Skenario Uji | Jumlah Test Case | Hasil Eksekusi |
|---|---|:---:|:---:|
| **Equivalence Partitioning (EP)** | Otorisasi PIN Guru (Valid `2543`, Salah `9999`, Format `<4 digit` `12`) | 3 | **100% PASS** |
| **Boundary Value Analysis (BVA)** | Batas KKM 80 (Skor 79: Remedial, Skor 80: Tuntas, Skor 81: Tuntas) | 3 | **100% PASS** |
| **Decision Table (DT)** | Tata Kelola Akses (Always Open, Override Locked, Deadline Expired) | 3 | **100% PASS** |
| **State Transition (ST)** | Siklus Mesin Ujian (`Lobby -> Active Exam -> Results Screen` & Blokir Ilegal) | 3 | **100% PASS** |
| **Total Test Case** | **Cakupan Penuh Kebutuhan REQ-01 s.d REQ-05** | **12** | **100% PASS** |

---

## 🛡️ Cacat Kualitas yang Diperbaiki (Closed Defects)
1. **DEFECT-01 (Critical):** *Unexpected Class Lockout Outside Timetable Slot* — Diselesaikan dengan penambahan flag `alwaysOpen: true` pada `js/access_control.js`.
2. **DEFECT-02 (Medium):** *Mobile FAB Chatbot Overlap with Portal Dasbor Guru* — Diselesaikan dengan penambahan `padding-bottom: 120px` pada viewport ponsel di `css/style.css`.
3. **DEFECT-03 (High):** *AI Chatbot Query NLP Matching Failure on Typo & Class Pattern* — Diselesaikan dengan perancangan ulang tokenizer berbasis ekspresi reguler pada `js/teacher_chatbot.js` (Commit `58d830b`).

---
*© 2026 Tim Quality Assurance QuizMaster — S1 Pendidikan Teknik Informatika.*
