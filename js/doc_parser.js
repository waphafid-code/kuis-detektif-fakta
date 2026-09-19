/**
 * 📄 DOCUMENT PARSER ENGINE (Client-Side PPTX, PDF & Text Reader)
 * Mengekstrak teks bahan ajar secara lokal di browser tanpa biaya & tanpa kirim file ke server eksternal.
 */

const DocParser = {
    /**
     * Membaca file yang diunggah dan mengembalikan teks murni
     * @param {File} file Objek file dari input HTML
     * @param {Function} onProgress Callback progres (0 - 100%)
     * @returns {Promise<{success: boolean, text: string, meta: object}>}
     */
    async extractText(file, onProgress = () => {}) {
        if (!file) throw new Error("File tidak ditemukan!");
        const ext = file.name.split('.').pop().toLowerCase();
        
        onProgress(10, `Membaca file ${file.name}...`);

        if (ext === 'pdf') {
            return await this.extractPdf(file, onProgress);
        } else if (ext === 'docx' || ext === 'doc') {
            return await this.extractDocx(file, onProgress);
        } else if (ext === 'pptx') {
            return await this.extractPptx(file, onProgress);
        } else if (ext === 'txt' || ext === 'md' || ext === 'csv' || ext === 'json') {
            return await this.extractPlainText(file, onProgress);
        } else {
            throw new Error(`Format file .${ext} belum didukung. Harap unggah file Word (.docx), PDF (.pdf), PowerPoint (.pptx), atau Teks (.txt)!`);
        }
    },

    /**
     * Ekstraksi teks PDF menggunakan PDF.js
     */
    async extractPdf(file, onProgress) {
        if (typeof pdfjsLib === 'undefined') {
            throw new Error("Pustaka PDF.js belum dimuat. Pastikan terhubung ke internet untuk inisialisasi awal.");
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        let fullText = "";
        for (let i = 1; i <= totalPages; i++) {
            onProgress(Math.round(15 + (i / totalPages) * 80), `Membaca PDF halaman ${i} dari ${totalPages}...`);
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageStrings = content.items.map(item => item.str).join(" ");
            fullText += `\n\n--- [Halaman ${i}] ---\n` + pageStrings;
        }

        fullText = fullText.trim();
        return {
            success: true,
            text: fullText,
            meta: {
                fileName: file.name,
                fileType: 'PDF',
                totalPages: totalPages,
                charCount: fullText.length,
                wordCount: fullText.split(/\s+/).filter(Boolean).length
            }
        };
    },

    /**
     * Ekstraksi teks Dokumen Microsoft Word (.docx)
     * Menggunakan Mammoth.js bila tersedia, dengan fallback JSZip XML parser internal
     */
    async extractDocx(file, onProgress) {
        onProgress(20, `Membaca struktur file Word (.docx)...`);
        const arrayBuffer = await file.arrayBuffer();
        let fullText = "";

        // Metode 1: Menggunakan Mammoth.js jika tersedia di browser
        if (typeof mammoth !== 'undefined') {
            try {
                onProgress(45, `Mengekstrak paragraf Word dengan engine Mammoth...`);
                const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                if (result && result.value && result.value.trim().length > 20) {
                    fullText = result.value.trim();
                }
            } catch (err) {
                console.warn("[DocParser] Mammoth parsing gagal, beralih ke engine fallback XML JSZip:", err);
            }
        }

        // Metode 2: Fallback bawaan menggunakan JSZip membaca word/document.xml langsung
        if (!fullText) {
            if (typeof JSZip === 'undefined') {
                throw new Error("Pustaka pembaca file docx (Mammoth/JSZip) belum tersedia.");
            }
            onProgress(60, `Membedah file Word XML secara mandiri...`);
            const zip = await JSZip.loadAsync(arrayBuffer);
            const docXmlEntry = zip.file("word/document.xml");
            
            if (!docXmlEntry) {
                throw new Error("File Word (.docx) ini rusak atau berformat .doc lama (Word 97-2003 binary). Harap simpan ulang dokumen sebagai .docx standar.");
            }

            const xmlContent = await docXmlEntry.async("string");
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, "application/xml");

            // Ambil semua paragraf <w:p>
            const paragraphs = xmlDoc.getElementsByTagName("w:p");
            const extractedParagraphs = [];

            for (let i = 0; i < paragraphs.length; i++) {
                const p = paragraphs[i];
                const textNodes = p.getElementsByTagName("w:t");
                let pText = "";
                for (let t = 0; t < textNodes.length; t++) {
                    pText += textNodes[t].textContent;
                }
                pText = pText.trim();
                if (pText) {
                    extractedParagraphs.push(pText);
                }
            }

            fullText = extractedParagraphs.join("\n\n");
        }

        fullText = fullText.trim();
        if (!fullText) {
            throw new Error("Dokumen Word tidak memuat teks yang dapat diekstrak. Pastikan dokumen bukan hanya berisi gambar pindaian!");
        }

        onProgress(100, `Ekstraksi teks Word selesai!`);

        return {
            success: true,
            text: fullText,
            meta: {
                fileName: file.name,
                fileType: 'Word (.docx)',
                totalPages: Math.max(1, Math.ceil(fullText.split(/\s+/).length / 250)),
                charCount: fullText.length,
                wordCount: fullText.split(/\s+/).filter(Boolean).length
            }
        };
    },

    /**
     * Ekstraksi teks PPTX (PowerPoint) menggunakan JSZip
     */
    async extractPptx(file, onProgress) {
        if (typeof JSZip === 'undefined') {
            throw new Error("Pustaka JSZip belum dimuat. Pastikan terhubung ke internet untuk inisialisasi awal.");
        }

        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        
        // Cari semua slide XML: ppt/slides/slide1.xml, slide2.xml, dst.
        const slideFiles = [];
        zip.forEach((relativePath, zipEntry) => {
            if (/^ppt\/slides\/slide\d+\.xml$/i.test(relativePath)) {
                slideFiles.push(relativePath);
            }
        });

        if (slideFiles.length === 0) {
            throw new Error("Tidak ada slide yang terdeteksi di dalam file presentasi PPTX ini!");
        }

        // Urutkan slide berdasarkan nomor numerik
        slideFiles.sort((a, b) => {
            const numA = parseInt(a.match(/slide(\d+)\.xml/i)[1], 10);
            const numB = parseInt(b.match(/slide(\d+)\.xml/i)[1], 10);
            return numA - numB;
        });

        const parser = new DOMParser();
        let fullText = "";
        const totalSlides = slideFiles.length;

        for (let i = 0; i < totalSlides; i++) {
            const path = slideFiles[i];
            const slideNum = i + 1;
            onProgress(Math.round(15 + (slideNum / totalSlides) * 80), `Membaca Slide ${slideNum} dari ${totalSlides}...`);
            
            const xmlContent = await zip.file(path).async("string");
            const xmlDoc = parser.parseFromString(xmlContent, "application/xml");
            
            // Ambil semua elemen teks drawingml <a:t>
            const textNodes = xmlDoc.getElementsByTagName("a:t");
            const slideLines = [];
            for (let t = 0; t < textNodes.length; t++) {
                const txt = textNodes[t].textContent.trim();
                if (txt) slideLines.push(txt);
            }

            if (slideLines.length > 0) {
                fullText += `\n\n--- [Slide ${slideNum}] ---\n` + slideLines.join("\n");
            }
        }

        fullText = fullText.trim();
        return {
            success: true,
            text: fullText,
            meta: {
                fileName: file.name,
                fileType: 'PPTX (PowerPoint)',
                totalPages: totalSlides,
                charCount: fullText.length,
                wordCount: fullText.split(/\s+/).filter(Boolean).length
            }
        };
    },

    /**
     * Ekstraksi teks murni (TXT, Markdown)
     */
    async extractPlainText(file, onProgress) {
        onProgress(50, `Membaca dokumen teks...`);
        const text = await file.text();
        return {
            success: true,
            text: text.trim(),
            meta: {
                fileName: file.name,
                fileType: 'Text/Markdown',
                totalPages: 1,
                charCount: text.length,
                wordCount: text.split(/\s+/).filter(Boolean).length
            }
        };
    }
};

window.DocParser = DocParser;
