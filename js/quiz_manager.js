/**
 * 📦 QUIZ & MODULE MANAGER
 * Mengelola katalog multi-materi (Mission Hub), memuat bank soal aktif,
 * dan menyimpan kuis-kuis baru hasil generate AI secara permanen.
 */

const QuizManager = {
    MODULES_STORAGE_KEY: 'detektif_fakta_all_modules_v2',
    ACTIVE_MODULE_KEY: 'detektif_fakta_active_module_id',
    CUSTOM_QUIZ_DATA_PREFIX: 'detektif_fakta_quiz_data_',

    // Modul default bawaan aplikasi (Detektif Fakta)
    DEFAULT_MODULE: {
        id: 'modul_detektif_fakta',
        title: 'Misi Detektif Fakta: Uji Validitas Data',
        category: 'Literasi Digital & Komputasional',
        icon: '🕵️',
        badge: 'Misi Utama',
        description: 'Investigasi keabsahan data, identifikasi hoaks, dan penalaran lateral untuk siswa kelas X.',
        questionCount: 20,
        kkm: 80,
        difficulty: 'Campuran (Easy - Hard)',
        isDefault: true,
        createdAt: '2026-09-01T08:00:00Z'
    },

    /**
     * Mengambil daftar semua modul yang tersedia (Default + Hasil Buatan Guru)
     */
    async getAllModules() {
        let stored = localStorage.getItem(this.MODULES_STORAGE_KEY);
        let list = [];
        if (stored) {
            try {
                list = JSON.parse(stored);
            } catch (e) {
                list = [];
            }
        }

        // Pastikan modul default selalu ada di urutan pertama
        const hasDefault = list.some(m => m.id === this.DEFAULT_MODULE.id);
        if (!hasDefault) {
            list.unshift(this.DEFAULT_MODULE);
            this.saveModulesList(list);
        }

        return list;
    },

    saveModulesList(modulesList) {
        localStorage.setItem(this.MODULES_STORAGE_KEY, JSON.stringify(modulesList));
    },

    getActiveModuleId() {
        return localStorage.getItem(this.ACTIVE_MODULE_KEY) || this.DEFAULT_MODULE.id;
    },

    setActiveModuleId(id, broadcast = true) {
        localStorage.setItem(this.ACTIVE_MODULE_KEY, id);
        if (broadcast && typeof saveCloudSharedState === 'function') {
            saveCloudSharedState({ activeModuleId: id });
        }
    },

    /**
     * Memuat soal-soal untuk modul yang sedang aktif
     */
    async loadQuestionsForModule(moduleId) {
        // Cek apakah ada versi hasil editan guru yang tersimpan di localStorage
        const storedKey = this.CUSTOM_QUIZ_DATA_PREFIX + (moduleId || this.DEFAULT_MODULE.id);
        const raw = localStorage.getItem(storedKey);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                const qs = parsed.questions || parsed;
                if (Array.isArray(qs) && qs.length > 0) {
                    window.quizData = qs;
                    return qs;
                }
            } catch (e) {
                console.error("Gagal parse soal custom:", e);
            }
        }

        if (!moduleId || moduleId === this.DEFAULT_MODULE.id) {
            // Coba ambil dari file JSON lokal bank_soal/modul_detektif_fakta.json
            try {
                const res = await fetch('bank_soal/modul_detektif_fakta.json');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.questions && data.questions.length > 0) {
                        window.quizData = data.questions;
                        return data.questions;
                    }
                }
            } catch (e) {
                console.warn("Fetch file json lokal gagal (biasanya karena protokol file:// CORS), menggunakan fallback bawaan:", e);
            }

            // Fallback bawaan bila fetch gagal di protokol file://
            if (Array.isArray(window.DEFAULT_BUILTIN_QUESTIONS) && window.DEFAULT_BUILTIN_QUESTIONS.length > 0) {
                window.quizData = window.DEFAULT_BUILTIN_QUESTIONS;
                return window.DEFAULT_BUILTIN_QUESTIONS;
            }
            return window.quizData || [];
        }

        return window.quizData || [];
    },

    /**
     * Menyimpan butir soal yang diedit melalui Editor Bank Soal (G-Form)
     */
    saveQuestionsForModule(moduleId, questions) {
        if (!moduleId) return false;
        const storedKey = this.CUSTOM_QUIZ_DATA_PREFIX + moduleId;
        let pkg = {};
        const raw = localStorage.getItem(storedKey);
        if (raw) {
            try { pkg = JSON.parse(raw); } catch(e) { pkg = {}; }
        }
        pkg.id = moduleId;
        pkg.questions = questions;
        localStorage.setItem(storedKey, JSON.stringify(pkg));

        if (this.getActiveModuleId() === moduleId) {
            window.quizData = questions;
        }
        return true;
    },

    /**
     * Menyimpan kuis baru buatan Guru (dari generator AI atau import)
     */
    async saveNewModule(quizPackage) {
        if (!quizPackage || !quizPackage.questions || quizPackage.questions.length === 0) {
            throw new Error("Paket kuis tidak valid atau tidak memiliki butir soal!");
        }

        const moduleId = quizPackage.id || ('modul_' + Date.now());
        const newModuleMeta = {
            id: moduleId,
            title: quizPackage.title || 'Materi Baru',
            category: quizPackage.category || 'Materi Ajar Guru',
            icon: quizPackage.icon || '📚',
            badge: 'Materi AI',
            description: quizPackage.description || `Kuis evaluasi dengan ${quizPackage.questions.length} butir soal.`,
            questionCount: quizPackage.questions.length,
            kkm: parseInt(quizPackage.kkm || 80, 10),
            difficulty: quizPackage.difficulty || 'Campuran',
            isDefault: false,
            hasRemedialPool: Array.isArray(quizPackage.remedialQuestions) && quizPackage.remedialQuestions.length > 0,
            remedialCount: (quizPackage.remedialQuestions || []).length,
            uploadedAt: Date.now(),
            createdAt: new Date().toISOString()
        };

        // Simpan data butir soal ke storage lokal
        localStorage.setItem(this.CUSTOM_QUIZ_DATA_PREFIX + moduleId, JSON.stringify(quizPackage));

        // Tambahkan ke daftar modul lokal
        const all = await this.getAllModules();
        const existingIdx = all.findIndex(m => m.id === moduleId);
        if (existingIdx >= 0) {
            all[existingIdx] = newModuleMeta;
        } else {
            all.push(newModuleMeta);
        }
        this.saveModulesList(all);

        // ☁️ Sinkronkan ke Cloud Supabase agar muncul di semua perangkat (Mobile & Desktop)
        saveCloudModule(quizPackage);

        return newModuleMeta;
    },

    /**
     * Menghapus modul custom buatan guru
     */
    async deleteModule(moduleId) {
        if (moduleId === this.DEFAULT_MODULE.id) {
            throw new Error("Modul bawaan utama tidak dapat dihapus!");
        }
        localStorage.removeItem(this.CUSTOM_QUIZ_DATA_PREFIX + moduleId);
        let all = await this.getAllModules();
        all = all.filter(m => m.id !== moduleId);
        this.saveModulesList(all);
        if (this.getActiveModuleId() === moduleId) {
            this.setActiveModuleId(this.DEFAULT_MODULE.id);
        }

        // ☁️ Hapus juga dari Cloud Supabase
        deleteCloudModule(moduleId);
        return true;
    },

    /**
     * Sinkronisasi modul dari Cloud Supabase ke perangkat yang sedang aktif (Mobile / Desktop)
     */
    async syncCloudModulesList(cloudRows) {
        if (!Array.isArray(cloudRows) || cloudRows.length === 0) return;
        const all = await this.getAllModules();
        let changed = false;

        cloudRows.forEach(row => {
            const pkg = row.wrong_questions;
            if (!pkg || !pkg.id || !Array.isArray(pkg.questions)) return;

            // Simpan soal modul ke storage lokal
            const localKey = this.CUSTOM_QUIZ_DATA_PREFIX + pkg.id;
            if (!localStorage.getItem(localKey)) {
                localStorage.setItem(localKey, JSON.stringify(pkg));
            }

            // Tambahkan ke daftar modul jika belum ada
            if (!all.some(m => m.id === pkg.id)) {
                all.push({
                    id: pkg.id,
                    title: pkg.title || 'Materi Baru',
                    category: pkg.category || 'Materi Ajar Guru',
                    icon: pkg.icon || '📚',
                    badge: pkg.badge || 'Materi AI Cloud',
                    description: pkg.description || `Kuis evaluasi dengan ${pkg.questions.length} butir soal.`,
                    questionCount: pkg.questions.length,
                    kkm: parseInt(pkg.kkm || 80, 10),
                    difficulty: pkg.difficulty || 'Campuran',
                    isDefault: false,
                    hasRemedialPool: Array.isArray(pkg.remedialQuestions) && pkg.remedialQuestions.length > 0,
                    remedialCount: (pkg.remedialQuestions || []).length,
                    uploadedAt: pkg.uploadedAt || Date.now(),
                    createdAt: pkg.createdAt || new Date().toISOString()
                });
                changed = true;
            }
        });

        if (changed) {
            this.saveModulesList(all);
            console.log('☁️ [QuizManager] Modul dari Cloud Supabase berhasil disinkronkan ke perangkat ini!');
        }
    }
};

window.QuizManager = QuizManager;

// ============================================================
// ☁️ SUPABASE CLOUD MODULE PERSISTENCE HELPERS
// ============================================================
async function saveCloudModule(pkg) {
    if (!pkg || !pkg.id) return;
    try {
        const cfg = typeof getSupabaseConfig === 'function' ? getSupabaseConfig() : { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_ANON_KEY, table: 'quiz_results' };
        const rowName = '__MODULE__' + pkg.id;
        const baseUrl = `${cfg.url.replace(/\/$/, '')}/rest/v1/${cfg.table || 'quiz_results'}`;

        // Coba PATCH jika baris sudah ada
        const patchRes = await fetch(`${baseUrl}?student_name=eq.${encodeURIComponent(rowName)}`, {
            method: 'PATCH',
            headers: {
                'apikey': cfg.key,
                'Authorization': 'Bearer ' + cfg.key,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                wrong_questions: pkg,
                quiz_date: new Date().toLocaleDateString('id-ID')
            })
        });
        const patchData = await patchRes.json();
        
        // Jika belum ada, lakukan POST baris baru
        if (!Array.isArray(patchData) || patchData.length === 0) {
            await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'apikey': cfg.key,
                    'Authorization': 'Bearer ' + cfg.key,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    student_name: rowName,
                    student_class: '__MODULE_DATA__',
                    score: 100,
                    correct_count: (pkg.questions || []).length,
                    total_questions: (pkg.questions || []).length,
                    wrong_questions: pkg,
                    duration: '0',
                    time_str: '00:00',
                    quiz_date: new Date().toLocaleDateString('id-ID')
                })
            });
        }
        console.log(`☁️ Modul "${pkg.title}" berhasil diunggah ke Cloud Supabase!`);
    } catch(e) {
        console.warn('Gagal unggah modul ke Cloud:', e.message);
    }
}
window.saveCloudModule = saveCloudModule;

async function deleteCloudModule(moduleId) {
    if (!moduleId) return;
    try {
        const cfg = typeof getSupabaseConfig === 'function' ? getSupabaseConfig() : { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_ANON_KEY, table: 'quiz_results' };
        const rowName = '__MODULE__' + moduleId;
        const targetUrl = `${cfg.url.replace(/\/$/, '')}/rest/v1/${cfg.table || 'quiz_results'}?student_name=eq.${encodeURIComponent(rowName)}`;
        await fetch(targetUrl, {
            method: 'DELETE',
            headers: {
                'apikey': cfg.key,
                'Authorization': 'Bearer ' + cfg.key
            }
        });
        console.log(`🗑️ Modul "${moduleId}" berhasil dihapus dari Cloud Supabase!`);
    } catch(e) {}
}
window.deleteCloudModule = deleteCloudModule;
