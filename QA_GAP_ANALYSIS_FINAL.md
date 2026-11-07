# QA GAP ANALYSIS & REMEDIATION REPORT
## Platform: QuizMaster v3.0.02 (Kuis Interaktif SMAN 4 Padang)
### Mata Kuliah: Quality Assurance — S1 Pendidikan Teknik Informatika

---

| Dokumen | QA Gap Analysis & Remediation Final Report |
| :--- | :--- |
| **Versi Target** | QuizMaster v3.0.02 (Build `?v=20261106-release-v3005`) |
| **Penyusun** | Tim QA Engineering & Academic Reviewer |
| **Anggota Kelompok** | 1. Muhammad Hafidh Putra Roshadi (QA Lead)<br>2. Pipit Khofifah (Quality Assessment)<br>3. Harie Fadhil (Test Execution & Defect Analyst)<br>4. Andre Geovani (Automation & Traceability) |
| **Tanggal Audit** | 7 November 2026 |
| **Status Kepatuhan** | **100% COMPLIANT (Sesuai Seluruh Rubrik Tugas Praktikum QA.pdf)** |

---

## 1. Ringkasan Eksekutif (*Executive Summary*)

Dokumen ini menyajikan hasil **Audit Kesenjangan Kualitas (*Gap Analysis*)** komprehensif terhadap pelaksanaan penugasan praktikum terintegrasi *Mini Quality Assurance Audit*. Evaluasi dilakukan dengan membandingkan artefak awal proyek terhadap **Lembar Penugasan Praktikum Resmi (Tugas Praktikum QA.pdf)** dari dosen pengampu, serta memverifikasi implementasi kode sumber (*source code*), skrip pengujian otomatis, dan bukti tangkapan layar (*evidence*) aktual.

Tujuan utama analisis kesenjangan ini adalah:
1. Mengidentifikasi seluruh celah metodologis, ketidakkonsistenan data, dan kelemahan analisis pada draf dokumen awal.
2. Melakukan perbaikan (*remediation*) substansial dan terukur berbasis bukti teknis yang sah.
3. Memastikan keselarasan penuh rantai keterlacakan (*end-to-end traceability*) dari *Requirements* $\rightarrow$ *Acceptance Criteria* $\rightarrow$ *Risks* $\rightarrow$ *Test Scenarios* $\rightarrow$ *Test Cases* $\rightarrow$ *Execution Results* $\rightarrow$ *Defects/RCA* $\rightarrow$ *Quality Decision*.

---

## 2. Matriks Identifikasi Kesenjangan Awal (*Initial Gap Assessment*)

Berdasarkan audit silang antara dokumen draf awal dengan lembar penugasan praktikum resmi, ditemukan **8 kesenjangan kritis** sebagai berikut:

| No | Komponen / Tahap | Temuan Kesenjangan Awal (*Gap Identified*) | Tingkat Keparahan | Akar Masalah / Penyebab | Tindakan Perbaikan (*Remediation Action*) |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **GAP-01** | **Tahap 3 (REQ-01)** | Inkonsistensi spesifikasi PIN Guru: Tabel REQ-01 menyebutkan "tepat 6-digit numerik", sedangkan kriteria penerimaan (AC), implementasi kode, input modal DOM, dan test case menggunakan "4-digit numerik (2543)". | **Tinggi (High)** | Draf awal menyalin template generic 6-digit tanpa memeriksa implementasi DOM `maxlength="4"` dan hash SHA-256 riil. | Spesifikasi REQ-01 diselaraskan secara resmi menjadi "tepat 4-digit numerik (`2543`)" di seluruh dokumen, AC, test data, test case, dan RTM. |
| **GAP-02** | **Tahap 5 (RTM & TC-13/14)** | Pada draf RTM awal, REQ-05 dipetakan ke "TC-13, TC-14", namun tabel Test Case utama hanya mendokumentasikan TC-01 s.d TC-12. Selain itu, pemetaan ID requirement pada CSV tertukar (PIN diberi label REQ-03, State Transition diberi label REQ-01). | **Tinggi (High)** | Inkonsistensi penomoran saat transisi penambahan kueri NLP Chatbot Guru, serta kesalahan index pemetaan pada skrip ekspor CSV. | Struktur RTM dibangun ulang total. Pemetaan diperbaiki: TC-01..03 (REQ-01), TC-04..06 (REQ-02), TC-07..09 (REQ-03), TC-10..12 (REQ-04). TC-13 & TC-14 diformalkan untuk REQ-05 dengan evidence teruji. |
| **GAP-03** | **Tahap 6 (Decision Table)** | Decision Table pada dokumen P06 hanya memuat 3 aturan (Rule 1, Rule 2, Rule 3), padahal rubrik dosen secara tegas mewajibkan minimal 2 kondisi dan 4 kombinasi aturan ($2^2 = 4$). | **Sedang (Medium)** | Pengujian awal menggabungkan dua kondisi tanpa memetakan matriks biner lengkap ($2 \times 2 = 4$ kombinasi). | Matriks Decision Table diperluas menjadi 4 aturan formal (R1: Always Open Unlocked, R2: Always Open Override Locked, R3: Scheduled Expired, R4: Scheduled Valid). Dijelaskan analisis risiko kombinasi. |
| **GAP-04** | **Tahap 6 & 7 (Evidence Integrity)** | Tangkapan layar bukti eksekusi TC-11 pada laporan sebelumnya mengalami *top viewport cutoff*, di mana lingkaran indikator skor `90` terpotong 50% di batas atas halaman. | **Sedang (Medium)** | Skrip tangkapan layar otomatis mengeksekusi `window.scrollTo(0, 200)` sebelum capture, sehingga memotong header kartu hasil. | Skrip penangkapan layar diperbarui dengan protokol `window.scrollTo(0, 0)`, gambar diambil ulang secara utuh, dan disematkan ke laporan. |
| **GAP-05** | **Tahap 7 (Defect RCA)** | Analisis akar masalah (RCA) pada beberapa defect awal masih dangkal dan berhenti pada gejala (*symptom*) atau menyatakan "kesalahan programmer" tanpa metodologi 5-Why yang mendalam. | **Sedang (Medium)** | Ketiadaan pemisahan terstruktur antara gejala, penyebab langsung (*direct cause*), dan akar masalah proses/desain (*root cause*). | Setiap defect (DEFECT-01, 02, 03) dilengkapi analisis 5-Why kausalitas berjenjang yang membedakan aspek proses, desain CSS, viewport capturing, dan regex robustness. |
| **GAP-06** | **Tahap 8 (Quality Decision)** | Keputusan rilis awal menyatakan "GO FOR PRODUCTION 100%" hanya berdasarkan persentase lulus uji tanpa analisis risiko residual atau batas lingkungan lab. | **Sedang (Medium)** | Bias konfirmasi hasil pengujian lab lokal yang diasumsikan identik dengan kondisi produksi lapangan sekolah. | Keputusan disesuaikan secara akademis menjadi **CONDITIONAL GO (GO DENGAN SYARAT OPERASIONAL)** dengan mitigasi pilot testing dan pemantauan konkurensi Wi-Fi sekolah. |
| **GAP-07** | **Otomasi Pengujian (Automated Tests)** | Terdapat klaim "61 automated regression tests" di beberapa dokumen awal, padahal repositori telah berkembang memiliki 82 automated test assertions. | **Rendah (Low)** | Dokumen ditulis saat suite pengujian baru memiliki 5 file (61 tes), sebelum penambahan suite biometrik dan mobile UX (21 tes tambahan). | Rekonsiliasi data: Dijelaskan secara transparan bahwa baseline awal adalah 61 tes, dan rilis stabil v3.0.02 mengeksekusi 82 tes terverifikasi (100% Pass) di 7 file skrip Node.js. |
| **GAP-08** | **Etika & Sanitasi Dataset** | Belum ada dokumentasi formal yang menegaskan bahwa dataset 216 siswa bebas dari PII (Personally Identifiable Information) sesuai Etika Akademik Poin H.2. | **Sedang (Medium)** | Data siswa dianggap dummy biasa tanpa penjelasan kepatuhan privasi (UU PDP / Standar Akademik). | Diterbitkan 2 file dataset resmi (`05_Dataset_Sanitized_Students_216` dan `05_Dataset_Historical_Scores_155`) dalam format CSV & XLSX dengan pernyataan kepatuhan privasi eksplisit. |

---

## 3. Rincian Tindakan Perbaikan (*Remediation Details per Phase*)

### A. Tahap 1: Software Quality Assessment
- **Peningkatan Substansi**: Menambahkan profil kebutuhan 3 kelompok pengguna (Guru Mata Pelajaran, Siswa Fase E, dan Administrator Sekolah).
- **Evaluasi 4 Atribut ISO/IEC 25010**: Memperinci evaluasi empiris untuk *Functional Suitability* (12 Black-Box test cases), *Reliability & Fault Tolerance* (offline resilience queue & blur tolerance), *Security* (SHA-256 hash & anti-tampering token), serta *Usability & Accessibility* (WCAG AAA contrast & Potato Mode anti-lag).
- **Cost of Quality (CoQ)**: Menghitung secara realistis biaya pencegahan (*prevention*), penilaian (*appraisal*), kegagalan internal (*internal failure*), dan simulasi kerugian jika kegagalan mencapai pengguna (*external failure*: 216 siswa $\times$ 10 menit pemeriksaan manual = 36 jam kerja guru terbuang).

### B. Tahap 2: QA Lifecycle & Feedback Loop
- **Model Pengembangan**: Mengadopsi siklus *Iterative V-Model Hybrid* yang memetakan aktivitas verifikasi dan validasi di setiap fase.
- **Aktivitas Shift-Left**: Memformalkan 2 aktivitas nyata: (1) *Requirement Ambiguity Review* yang mengoreksi aturan PIN 4-digit, dan (2) *Automated Shift-Left Regression Testing* (82 pengujian Node.js).
- **Sumber Shift-Right**: Memanfaatkan log riwayat pengerjaan siswa dan analitik real-time Dasbor Guru sebagai telemetri evaluasi post-release.
- **Quality Gates**: Menetapkan 3 gerbang mutu formal (QG-1: Requirement Review, QG-2: Pre-Execution, QG-3: Pre-Release Sign-Off) beserta kriteria lolos terukur.

### C. Tahap 3: Requirement Review & Risk Analysis
- **Penyelarasan REQ-01**: Menghapus seluruh rujukan "6-digit" dan menetapkan PIN 4-digit numerik (`2543`) secara konsisten.
- **Formulasi Given-When-Then**: Menyusun kriteria penerimaan (AC) yang bebas dari kata ambigu ("cepat", "normal", "aman") dan menggantinya dengan parameter terukur (misal: "waktu respon $< 500\text{ ms}$", "modal tertutup dan state berpindah").
- **Risk Register**: Menghitung skor risiko sebelum mitigasi ($L \times I$) dan setelah mitigasi (Residual Risk). Menetapkan 3 risiko prioritas: RSK-03 (Class Lockout - Skor 16), RSK-02 (PIN Security - Skor 15), dan RSK-04 (State Manipulation - Skor 12).

### D. Tahap 4: Test Strategy & Test Plan
- **15 Elemen Rencana Uji**: Mendokumentasikan secara lengkap tujuan, batasan *in-scope* dan *out-of-scope*, environment pengujian (Local Web Server port 5500, Chrome v128+), versi aplikasi (v3.0.02), pembagian peran 4 anggota tim, kriteria masuk (*entry criteria*), kriteria keluar (*exit criteria*), serta jadwal kerja 7 hari.

### E. Tahap 5: Test Case, Test Data, Test Oracle & RTM
- **Struktur Standar**: Memastikan setiap test case memuat ID, Skenario, Kebutuhan, Risiko, Tujuan, Prekondisi, Langkah Uji, Data Uji, Hasil yang Diharapkan, Hasil Aktual, Status, dan Tautan Evidence.
- **Test Oracle**: Menetapkan 5 pilar kebenaran objektif (Aturan KKM Kurikulum Informatika SMAN 4 Padang, Konfigurasi Hash SHA-256, Jadwal Pembelajaran Sekolah, Diagram FSM Aplikasi, dan Dataset Siswa Resmi).
- **RTM Dua Arah (*Bidirectional RTM*)**: Memperbaiki pemetaan relasi antar-entitas sehingga 100% kebutuhan dan risiko teruji tanpa ada komponen yang menggantung (*orphaned requirements/tests*).

### F. Tahap 6: Black-Box Test Design & Execution
- **Equivalence Partitioning**: Memetakan kelas valid ($V_1$: 4-digit benar `2543`) dan kelas invalid ($I_1$: 4-digit salah `9999`, $I_2$: non-numerik/panjang salah `12`).
- **Boundary Value Analysis**: Menguji 3 titik kritis KKM 80: Batas Bawah 79 (Remedial), Titik KKM 80 (Tuntas), dan Batas Atas 81/85 (Kompeten).
- **Decision Table**: Memetakan matriks 4 kombinasi aturan ($2^2 = 4$) dengan 3 kondisi akses dan mendokumentasikan analisis risiko untuk kombinasi jadwal yang tidak dieksekusi di lab.
- **State Transition**: Memodelkan mesin 3 state (`LOBBY_SETUP`, `ACTIVE_EXAM`, `RESULTS_REVIEW`), menguji transisi valid ($T_1, T_2, T_3$) dan transisi terlarang ($T_4, T_5$) secara empiris.
- **Negative Testing**: Memastikan 5 test case menguji alur negatif (TC-02, TC-03, TC-08, TC-09, TC-12) dengan status **PASS**.

### G. Tahap 7: Defect Report, Triage & 5-Why RCA
- Melaporkan 3 defect nyata yang ditemukan selama siklus pengujian:
  1. `DEFECT-01`: Kontras modal akses terkunci buruk (kuning di atas putih).
  2. `DEFECT-02`: Pemotongan gambar skor hasil ujian pada capture otomatis.
  3. `DEFECT-03`: Kegagalan klasifikasi intent NLP chatbot guru pada kueri typo/informal.
- Setiap defect dilengkapi identifikasi lingkungan, langkah reproduksi, *severity*, *priority*, analisis akar masalah 5-Why berjenjang, tindakan perbaikan, dan bukti retest dengan status **CLOSED**.

### H. Tahap 8: Final QA Audit & Quality Decision
- **Sintesis Bukti**: Menghubungkan seluruh data pengujian, coverage 100%, residual risk yang terkendali, dan evaluasi Quality Gate.
- **Rekomendasi Mutu**: Memberikan rekomendasi **CONDITIONAL GO** dengan justifikasi teknis dan etis yang matang demi keberhasilan operasional di SMAN 4 Padang.

---

## 4. Matriks Verifikasi Pasca-Perbaikan (*Post-Remediation Verification Matrix*)

| ID Kesenjangan | Status Verifikasi | Bukti Konkret (*Verification Artifact*) |
| :---: | :---: | :--- |
| **GAP-01** | **TERSELESAIKAN (100%)** | `docs/03_Requirement_Risk_Register.md`, `test-cases/05_Test_Cases.xlsx`, dan `LAPORAN_QA_AUDIT_OPTIMIZED.docx` konsisten menggunakan 4-digit PIN (`2543`). |
| **GAP-02** | **TERSELESAIKAN (100%)** | RTM diperbaiki di `QA_TRACEABILITY_MATRIX_FINAL.xlsx` dan `test-cases/05_RTM.csv`. Relasi REQ-01..05 terhubung sempurna. |
| **GAP-03** | **TERSELESAIKAN (100%)** | Matriks Decision Table 4 aturan terdokumentasi di `docs/06_Black_Box_Design.md` dan Bab 6 Laporan. |
| **GAP-04** | **TERSELESAIKAN (100%)** | Gambar `evidence/TC11_ST_ActiveExam_To_Results.png` (260.106 B) menampilkan lingkaran skor `90` 100% utuh tanpa terpotong. |
| **GAP-05** | **TERSELESAIKAN (100%)** | Analisis 5-Why berjenjang untuk DEFECT-01, 02, 03 tersaji lengkap di `docs/07_Defect_Report_RCA.md` dan Bab 7 Laporan. |
| **GAP-06** | **TERSELESAIKAN (100%)** | Bab 8 Laporan menetapkan rekomendasi **CONDITIONAL GO** disertai 3 prasyarat operasional sekolah. |
| **GAP-07** | **TERSELESAIKAN (100%)** | Rekonsiliasi 61 vs 82 automated tests dijelaskan transparan pada Bab 4, 8, dan dokumen checklist. |
| **GAP-08** | **TERSELESAIKAN (100%)** | Tersedia file `05_Dataset_Sanitized_Students_216.xlsx` dan `05_Dataset_Historical_Scores_155.xlsx` di repositori GitHub. |

---

## 5. Kesimpulan Peninjauan Mutu

Seluruh 8 kesenjangan yang teridentifikasi telah berhasil ditangani dan diverifikasi secara tuntas tanpa meninggalkan anomali data, inkonsistensi nomor, maupun klaim fiktif. Seluruh artefak pengujian kini telah memenuhi standar evaluasi akademik tingkat universitas dan siap untuk dipresentasikan serta dinilai oleh dosen pengampu.

