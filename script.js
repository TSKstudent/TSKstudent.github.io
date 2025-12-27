/* --- CONTENT LOADER --- */
function loadContent() {
    const researchDiv = document.getElementById('research');
    const sourcesDiv = document.getElementById('sources');

    // Load Research Paragraphs
    DATA.research.forEach(text => {
        const p = document.createElement('p');
        p.innerHTML = text;
        researchDiv.appendChild(p);
    });

    // Load Sources
    DATA.sources.forEach(source => {
        const div = document.createElement('div');
        div.className = 'apa-citation';
        div.innerHTML = `${source.text} <a href="${source.link}" target="_blank">${source.link}</a>`;
        sourcesDiv.appendChild(div);
    });
}

/* --- TAB LOGIC --- */
let isAnimating = false;
function switchTab(targetId) {
    if (isAnimating) return;
    const targetContent = document.getElementById(targetId);
    const currentContent = document.querySelector('.tab-content.active');
    if (currentContent && currentContent.id === targetId) return;

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-' + targetId).classList.add('active');
    isAnimating = true;

    if (currentContent) {
        currentContent.classList.remove('active');
        currentContent.classList.add('exiting');
        setTimeout(() => {
            currentContent.classList.remove('exiting');
            targetContent.classList.add('active');
            isAnimating = false;
        }, 300); 
    } else {
        targetContent.classList.add('active');
        isAnimating = false;
    }
}

/* --- SETTINGS LOGIC --- */
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    document.getElementById('themeLabel').innerText = document.body.classList.contains('light-mode') ? "Light" : "Dark";
}

function changeColorTheme(val) {
    const r = document.documentElement;
    const themes = {
        blue: ['#3b82f6', '#1d4ed8'],
        cyan: ['#06b6d4', '#0e7490'],
        green: ['#10b981', '#047857'],
        red: ['#ef4444', '#b91c1c'],
        purple: ['#d946ef', '#a21caf']
    };
    r.style.setProperty('--primary', themes[val][0]);
    r.style.setProperty('--secondary', themes[val][1]);
    updateSliderBackgrounds();
}

function updateFontSize(val) { document.documentElement.style.setProperty('--base-font-size', val + 'rem'); }

/* --- VISUAL CONFIG --- */
let globalSpeedFactor = 1.0;
let targetParticleCount = 100;
let showDots = true;
let showLines = true;

function updateSpeed(val) { globalSpeedFactor = parseFloat(val); }
function updateParticleCount(val) { 
    targetParticleCount = parseInt(val); 
    document.getElementById('countLabel').innerText = val;
    initParticles(); 
}
function toggleDots(val) { 
    showDots = val; 
    const lt = document.getElementById('linesToggle');
    const lr = document.getElementById('linesRow');
    if (!val) { showLines = false; lt.checked = false; lt.disabled = true; lr.classList.add('disabled'); }
    else { lt.disabled = false; lr.classList.remove('disabled'); }
}
function toggleLines(val) { showLines = val; }

function updateSliderBackgrounds() {
    const sliders = document.querySelectorAll('input[type=range]');
    const style = getComputedStyle(document.documentElement);
    const primary = style.getPropertyValue('--primary').trim();
    const bg = style.getPropertyValue('--text-dim').trim();
    sliders.forEach(slider => {
        const val = (slider.value - slider.min) / (slider.max - slider.min) * 100;
        slider.style.background = `linear-gradient(to right, ${primary} 0%, ${primary} ${val}%, ${bg} ${val}%, ${bg} 100%)`;
        slider.style.height = '4px'; slider.style.borderRadius = '2px';
    });
}

/* --- PARTICLE SYSTEM (SCROLL-AWARE) --- */
const canvas = document.getElementById("canvas-bg");
const ctx = canvas.getContext("2d");
const scrollContainer = document.getElementById("scroll-container");

let width, height, particles = [];
const connectionDistance = 150;
const mouseRadius = 250; 
let mouse = { x: -1000, y: -1000, isDown: false };
let lastScrollTop = 0;

window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mousedown', () => { mouse.isDown = true; });
window.addEventListener('mouseup', () => { mouse.isDown = false; });

function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => r + r + g + g + b + b));
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 59, g: 130, b: 246 };
}

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseVx = (Math.random() - 0.5) * 0.5;
        this.baseVy = (Math.random() - 0.5) * 0.5;
        this.momVx = 0; this.momVy = 0;
        this.size = Math.random() * 2 + 1;
    }
    update(sDelta) {
        this.x += (this.baseVx * globalSpeedFactor) + this.momVx;
        this.y += (this.baseVy * globalSpeedFactor) + this.momVy - sDelta;
        this.momVx *= 0.92; this.momVy *= 0.92;
        if (this.x < 0) this.x = width; if (this.x > width) this.x = 0;
        if (this.y < -20) { this.y = height + 20; this.x = Math.random() * width; }
        else if (this.y > height + 20) { this.y = -20; this.x = Math.random() * width; }
        let dx = mouse.x - this.x, dy = mouse.y - this.y, dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < mouseRadius && mouse.isDown) {
            let f = (mouseRadius - dist) / mouseRadius;
            this.momVx -= (dx / dist) * f * 2.0; this.momVy -= (dy / dist) * f * 2.0;
        }
    }
    draw(rgb) {
        if (!showDots) return;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`; ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < targetParticleCount; i++) particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    let sDelta = scrollContainer.scrollTop - lastScrollTop;
    lastScrollTop = scrollContainer.scrollTop;
    let rgb = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue('--primary').trim());

    particles.forEach((p, i) => {
        p.update(sDelta); p.draw(rgb);
        if (!showLines) return;
        for (let j = i + 1; j < particles.length; j++) {
            let p2 = particles[j], dx = p.x - p2.x, dy = p.y - p2.y, d = Math.sqrt(dx*dx + dy*dy);
            if (d < connectionDistance) {
                let op = 1 - d / connectionDistance;
                let mDx = mouse.x - p.x, mDy = mouse.y - p.y, mD = Math.sqrt(mDx*mDx + mDy*mDy);
                ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${op * (mouse.isDown && mD < mouseRadius ? 0.9 : (mD < mouseRadius ? 0.6 : 0.25))})`;
                ctx.lineWidth = mD < mouseRadius ? 0.8 : 0.5;
                ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => { resize(); initParticles(); });
document.querySelectorAll('input[type=range]').forEach(el => el.addEventListener('input', updateSliderBackgrounds));

// Initialize
loadContent();
resize();
initParticles();
animate();
setTimeout(updateSliderBackgrounds, 100);
