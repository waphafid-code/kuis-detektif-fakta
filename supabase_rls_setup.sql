-- ============================================================
-- 🛡️ SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- Tabel: quiz_results
-- Tujuan: Mengamankan database Supabase dari manipulasi/penghapusan ilegal oleh siswa via Console
-- ============================================================

-- 1. Aktifkan Row Level Security (RLS) pada tabel quiz_results
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- 2. Hapus policy lama jika ada untuk mencegah duplikasi
DROP POLICY IF EXISTS "Public can view quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Public can insert quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Only authenticated users can update quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Only authenticated users can delete quiz results" ON public.quiz_results;

-- 3. Kebijakan SELECT (Membaca Data):
-- Publik (anon) diizinkan membaca hasil ujian untuk kebutuhan live leaderboard & rekap dasbor.
CREATE POLICY "Public can view quiz results"
ON public.quiz_results
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Kebijakan INSERT (Menyimpan Nilai Siswa):
-- Siswa (anon) diizinkan menyimpan hasil ujian baru.
-- Dilengkapi validasi integritas: skor harus antara 0 sampai 100.
CREATE POLICY "Public can insert quiz results"
ON public.quiz_results
FOR INSERT
TO anon, authenticated
WITH CHECK (
    score >= 0 AND score <= 100
    AND total_questions > 0
    AND correct_count >= 0
    AND correct_count <= total_questions
);

-- 5. Kebijakan UPDATE (Mengubah Nilai):
-- Anon DITOLAK melakukan modifikasi nilai yang sudah tersimpan.
-- Hanya role terotentikasi (guru/admin) atau service_role yang diizinkan.
CREATE POLICY "Only authenticated users can update quiz results"
ON public.quiz_results
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Kebijakan DELETE (Menghapus Data Rekap):
-- Anon DITOLAK keras menghapus data tabel.
-- Mencegah siswa jail menjalankan: supabase.from('quiz_results').delete().neq('id', 0)
CREATE POLICY "Only authenticated users can delete quiz results"
ON public.quiz_results
FOR DELETE
TO authenticated
USING (true);
