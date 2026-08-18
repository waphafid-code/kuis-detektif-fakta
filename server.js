const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const PIN_GURU = process.env.PIN_GURU || '2543';

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

// Sanitasi Input String (Mencegah XSS Injection)
function sanitizeText(str, maxLen = 150) {
    if (!str || typeof str !== 'string') return '';
    return str
        .replace(/<[^>]*>?/gm, '') // Hapus tag HTML/Script
        .replace(/[&<>"']/g, '')   // Hapus karakter khusus
        .trim()
        .substring(0, maxLen);
}

// Middleware Proteksi PIN Guru untuk Endpoint Sensitif
function requireTeacherPin(req, res, next) {
    const pin = req.headers['x-admin-pin'] || req.body.pin || req.query.pin;
    if (pin !== PIN_GURU) {
        return res.status(401).json({ error: 'Akses ditolak: PIN Guru tidak valid!', success: false });
    }
    next();
}

// Konfigurasi MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'quiz_detektif_fakta'
};

let pool = null;
let isDbConnected = false;

// Inisialisasi Database MySQL
async function initDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await connection.end();

        pool = mysql.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        await pool.query(`
            CREATE TABLE IF NOT EXISTS quiz_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_name VARCHAR(150) NOT NULL,
                student_class VARCHAR(20) NOT NULL,
                score INT NOT NULL,
                correct_count INT NOT NULL,
                total_questions INT NOT NULL DEFAULT 20,
                wrong_questions JSON NULL,
                duration VARCHAR(50) NOT NULL,
                time_str VARCHAR(20) NOT NULL,
                quiz_date VARCHAR(30) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_class (student_class),
                INDEX idx_score (score)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS quiz_settings (
                setting_key VARCHAR(50) PRIMARY KEY,
                setting_value VARCHAR(255) NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await pool.query(`
            INSERT INTO quiz_settings (setting_key, setting_value) 
            VALUES ('timer_seconds', '30')
            ON DUPLICATE KEY UPDATE setting_value = setting_value;
        `);

        isDbConnected = true;
        console.log('✅ Berhasil terhubung ke database MySQL:', dbConfig.database);
    } catch (err) {
        isDbConnected = false;
        console.warn('⚠️ Mode Offline-First aktif (MySQL belum menyala):', err.message);
    }
}

// ═══ API ENDPOINTS ═══

// 1. Status Koneksi
app.get('/api/status', async (req, res) => {
    res.json({
        status: 'online',
        mysql_connected: isDbConnected,
        database: dbConfig.database,
        total_questions_default: 20
    });
});

// 2. Ambil Semua Skor Siswa
app.get('/api/scores', async (req, res) => {
    if (!isDbConnected) {
        return res.status(503).json({ error: 'Database MySQL belum terhubung. Gunakan penyimpanan lokal.', mysql_connected: false });
    }
    try {
        const [rows] = await pool.query('SELECT * FROM quiz_results ORDER BY score DESC, created_at ASC');
        const formatted = rows.map(r => ({
            id: r.id,
            name: r.student_name,
            class: r.student_class,
            score: r.score,
            correct: r.correct_count,
            total: r.total_questions || 20,
            wrongQuestions: typeof r.wrong_questions === 'string' ? JSON.parse(r.wrong_questions) : (r.wrong_questions || []),
            duration: r.duration,
            time: r.time_str,
            date: r.quiz_date,
            timestamp: new Date(r.created_at).getTime()
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Simpan Skor Siswa Baru (Dengan Sanitasi Input)
app.post('/api/scores', async (req, res) => {
    if (!isDbConnected) {
        return res.status(503).json({ error: 'Database MySQL belum terhubung', mysql_connected: false });
    }
    const { name, class: studentClass, score, correct, total, wrongQuestions, duration, time, date } = req.body;

    const cleanName = sanitizeText(name, 100);
    const cleanClass = sanitizeText(studentClass, 20);

    if (!cleanName || !cleanClass) {
        return res.status(400).json({ error: 'Nama dan kelas wajib diisi dengan karakter valid.' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO quiz_results 
             (student_name, student_class, score, correct_count, total_questions, wrong_questions, duration, time_str, quiz_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                cleanName,
                cleanClass,
                Number(score) || 0,
                Number(correct) || 0,
                Number(total) || 15,
                JSON.stringify(Array.isArray(wrongQuestions) ? wrongQuestions : []),
                sanitizeText(duration, 30) || '-',
                sanitizeText(time, 20) || '-',
                sanitizeText(date, 30) || '-'
            ]
        );
        res.json({ success: true, insertId: result.insertId, student_name: cleanName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Hapus Semua Data Siswa (Diproteksi PIN Guru)
app.delete('/api/scores', requireTeacherPin, async (req, res) => {
    if (!isDbConnected) {
        return res.status(503).json({ error: 'Database MySQL belum terhubung', mysql_connected: false });
    }
    try {
        await pool.query('TRUNCATE TABLE quiz_results');
        res.json({ success: true, message: 'Semua data hasil kuis di database MySQL berhasil dibersihkan oleh Guru.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Ambil Pengaturan Timer
app.get('/api/settings', async (req, res) => {
    if (!isDbConnected) {
        return res.status(503).json({ error: 'Database MySQL belum terhubung' });
    }
    try {
        const [rows] = await pool.query('SELECT * FROM quiz_settings');
        const settings = {};
        rows.forEach(r => settings[r.setting_key] = r.setting_value);
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Simpan Pengaturan Timer (Diproteksi PIN Guru)
app.post('/api/settings', requireTeacherPin, async (req, res) => {
    if (!isDbConnected) {
        return res.status(503).json({ error: 'Database MySQL belum terhubung' });
    }
    const { timer_seconds } = req.body;
    try {
        await pool.query(
            'INSERT INTO quiz_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            ['timer_seconds', String(timer_seconds || 30), String(timer_seconds || 30)]
        );
        res.json({ success: true, timer_seconds });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Jalankan Server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server Kuis Detektif Fakta berjalan di: http://localhost:${PORT}`);
    });
});
