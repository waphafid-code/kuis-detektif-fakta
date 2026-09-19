const fs = require('fs');
const path = require('path');

global.window = global;
eval(fs.readFileSync(path.join(__dirname, '..', 'js', 'default_records.js'), 'utf8'));

const url = 'https://vuegrohnszqtmnthcaqp.supabase.co/rest/v1/quiz_results';
const key = 'sb_publishable_nDQrTtj1ZqRFgb7rtBVFkQ_i6Kr1FdA';

async function uploadAll() {
    console.log(`Mengunggah ${OFFICIAL_EXAM_RESULTS.length} data siswa resmi ke Supabase...`);
    
    // Batch in chunks of 25
    const chunkSize = 25;
    let totalUploaded = 0;

    for (let i = 0; i < OFFICIAL_EXAM_RESULTS.length; i += chunkSize) {
        const chunk = OFFICIAL_EXAM_RESULTS.slice(i, i + chunkSize);
        const payloads = chunk.map(r => ({
            student_name: r.name,
            student_class: r.class,
            score: r.score,
            correct_count: r.correct,
            total_questions: r.total || 20,
            wrong_questions: r.wrongQuestions || [],
            duration: r.duration || '0m',
            time_str: r.time || '00:00',
            quiz_date: r.date || '2026-08-28'
        }));

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': 'Bearer ' + key,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payloads)
        });

        if (res.ok || res.status === 201 || res.status === 204) {
            totalUploaded += chunk.length;
            console.log(`  Chunk ${i / chunkSize + 1}: ${totalUploaded}/${OFFICIAL_EXAM_RESULTS.length} siswa berhasil disimpan.`);
        } else {
            const errText = await res.text();
            console.error(`  Gagal mengunggah chunk ${i}:`, res.status, errText);
        }
    }

    console.log(`\n🎉 SELESAI: Total ${totalUploaded} siswa resmi dari PDF telah tersimpan di database Supabase!`);
}

uploadAll().catch(console.error);
