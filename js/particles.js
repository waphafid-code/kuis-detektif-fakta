// ============================================================
//  ✨ PARTICLE SYSTEM
// ============================================================
let canvas = null;
let ctx = null;
let particles = [];
let isTabVisible = true;

function ensureCanvas() {
    if (!canvas) {
        canvas = document.getElementById('particle-canvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    return !!canvas;
}

function resizeCanvas() { 
    if (!ensureCanvas()) return;
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
}
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() { this.reset(); }
    reset() {
        if (!canvas) return;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.8 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.25;
        this.speedY = (Math.random() - 0.5) * 0.25;
        this.opacity = Math.random() * 0.35 + 0.1;
        this.hue = Math.random() > 0.5 ? 260 : 190;
    }
    update() {
        this.x += this.speedX; this.y += this.speedY;
        if (!canvas || this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.opacity})`;
        ctx.fill();
    }
}

function initParticles() {
    if (!ensureCanvas()) return;
    resizeCanvas();
    const isMobile = window.innerWidth < 768;
    // Ringan & hemat baterai: 12 di mobile, 24 di desktop
    const count = isMobile ? 12 : 24;
    particles = [];
    for (let i = 0; i < count; i++) particles.push(new Particle());
}

function drawParticles() {
    if (!isTabVisible || !ensureCanvas()) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isMobile = window.innerWidth < 768;
    particles.forEach(p => { p.update(); p.draw(); });

    // Garis koneksi halus hanya di Desktop
    if (!isMobile) {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 90) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(139, 92, 246, ${0.04 * (1 - dist / 90)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }
    requestAnimationFrame(drawParticles);
}

document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
    if (isTabVisible) requestAnimationFrame(drawParticles);
});

initParticles();
drawParticles();

// ============================================================

//  🔀 SHUFFLE & SPECTACULAR STREAK CELEBRATIONS
// ============================================================
function shuffleArray(arr) {
    const shuffled = arr.map((val, idx) => ({ val, origIdx: idx }));
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function showEmojiReaction(emoji, x, y) {
    const el = document.createElement('div');
    el.className = 'emoji-reaction';
    el.textContent = emoji;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
}

function triggerStreakVibration(streakCount) {
    // 1. Haptic Vibration API (Halus, Nyaman, dan Tidak Boros Baterai di HP)
    if ('vibrate' in navigator) {
        try {
            if (streakCount === 1) {
                navigator.vibrate(35); // Denyut mikro halus
            } else if (streakCount === 2) {
                navigator.vibrate([35, 25, 40]); // Double-tap renyah
            } else if (streakCount === 3) {
                navigator.vibrate([45, 25, 50]); // Triple-tap dinamis
            } else if (streakCount === 4) {
                navigator.vibrate([50, 25, 60]); // Power combo
            } else {
                navigator.vibrate([60, 25, 70, 25, 80]); // High streak combo
            }
        } catch (e) {}
    }

    // 2. Visual Screen Micro-Rumble (Halus & Nyaman di Mata)
    const app = document.getElementById('main-app');
    if (app) {
        app.classList.remove('vibrate-lvl-1', 'vibrate-lvl-2', 'vibrate-lvl-3', 'vibrate-lvl-4', 'vibrate-lvl-mega', 'shake-it');
        void app.offsetWidth; // Force reflow agar animasi re-trigger dengan mulus

        if (streakCount === 1) {
            app.classList.add('vibrate-lvl-1');
        } else if (streakCount === 2) {
            app.classList.add('vibrate-lvl-2');
        } else if (streakCount === 3) {
            app.classList.add('vibrate-lvl-3');
        } else if (streakCount === 4) {
            app.classList.add('vibrate-lvl-4');
        } else {
            app.classList.add('vibrate-lvl-mega');
        }
    }

    // 3. ✨ Smooth Radial Light Flare (Ringan 60 FPS di HP)
    const blurOverlay = document.getElementById('radial-blur-overlay');
    if (blurOverlay) {
        blurOverlay.classList.remove('radial-blur-lvl-1', 'radial-blur-lvl-2', 'radial-blur-lvl-mega');
        void blurOverlay.offsetWidth; // Force reflow

        if (streakCount <= 2) {
            blurOverlay.classList.add('radial-blur-lvl-1');
        } else if (streakCount <= 4) {
            blurOverlay.classList.add('radial-blur-lvl-2');
        } else {
            blurOverlay.classList.add('radial-blur-lvl-mega');
        }
    }
}

function showMegaComboHero(streakVal) {
    let badgeText = `🔥 ${streakVal}X STREAK!`;
    let subText = 'LUAR BIASA! LANJUTKAN!';

    if (streakVal === 2) {
        badgeText = '🔥 2X COMBO!';
        subText = 'ANALISIS TAJAM! TERUS MAJU!';
    } else if (streakVal === 3) {
        badgeText = '⚡ 3X ON FIRE!';
        subText = 'MENYALA DETEKTIF! FOKUS SEMPURNA!';
    } else if (streakVal === 4) {
        badgeText = '🎯 4X SHARPSHOOTER!';
        subText = 'BIDIKAN FAKTA SELALU AKURAT!';
    } else if (streakVal === 5) {
        badgeText = '🚀 5X UNSTOPPABLE!';
        subText = 'DETEKTIF SULTAN! TAK TERBENDUNG!';
    } else if (streakVal === 6) {
        badgeText = '💥 6X HYPER DRIVE!';
        subText = 'KOMPUTASI NALAR LEVEL TINGGI!';
    } else if (streakVal >= 7 && streakVal < 10) {
        badgeText = `🌟 ${streakVal}X CYBER GODLIKE!`;
        subText = 'OTAK SUPER KOMPUTER! DETEKTIF GENIUS!';
    } else if (streakVal >= 10) {
        badgeText = `👑 ${streakVal}X LEGENDARY DETECTIVE!`;
        subText = 'PENGUASA AUDIT DATA TERTINGGI!';
    }

    sfxStreakCombo(streakVal);

    // Hapus hero lama jika masih ada untuk cegah tumpukan DOM
    const oldHero = document.querySelector('.super-combo-hero');
    if (oldHero) oldHero.remove();

    const hero = document.createElement('div');
    hero.className = 'super-combo-hero';
    hero.innerHTML = `
        <div class="combo-badge">${badgeText}</div>
        <div class="combo-sub">${subText}</div>
    `;
    document.body.appendChild(hero);
    setTimeout(() => hero.remove(), 950);
}

function spawnRandomEmojis(emoji, count) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1;
            const y = Math.random() * window.innerHeight * 0.6 + window.innerHeight * 0.2;
            showEmojiReaction(emoji, x, y);
        }, i * 120);
    }
}

// ============================================================