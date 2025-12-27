/* --- INITIALIZE CONTENT --- */
function initContent() {
    const resDiv = document.getElementById('research');
    const srcDiv = document.getElementById('sources');
    if(!window.DATA) return;

    DATA.research.forEach(txt => {
        const p = document.createElement('p');
        p.innerHTML = txt;
        resDiv.appendChild(p);
    });

    DATA.sources.forEach(s => {
        const d = document.createElement('div');
        d.className = 'apa-citation';
        d.innerHTML = `${s.text} <a href="${s.link}" target="_blank">${s.link}</a>`;
        srcDiv.appendChild(d);
    });
}

/* --- TABS & THEME --- */
function switchTab(id) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('btn-' + id).classList.add('active');
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

function changeColorTheme(val) {
    const colors = { blue: '#3b82f6', cyan: '#06b6d4', green: '#10b981', red: '#ef4444', purple: '#d946ef' };
    document.documentElement.style.setProperty('--primary', colors[val]);
}

/* --- PARTICLE SYSTEM --- */
const canvas = document.getElementById("canvas-bg");
const ctx = canvas.getContext("2d");
const scrollContainer = document.getElementById("scroll-container");
let w, h, particles = [], lastScroll = 0;

function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }

class Particle {
    constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
    }
    update(delta) {
        this.x += this.vx;
        this.y += this.vy - delta; // Scroll effect
        if (this.x < 0) this.x = w; if (this.x > w) this.x = 0;
        if (this.y < 0) { this.y = h; this.x = Math.random() * w; }
        if (this.y > h) { this.y = 0; this.x = Math.random() * w; }
    }
    draw() {
        const pColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
        ctx.beginPath(); ctx.arc(this.x, this.y, 1.5, 0, Math.PI*2);
        ctx.fillStyle = pColor; ctx.globalAlpha = 0.5; ctx.fill();
    }
}

function animate() {
    ctx.clearRect(0, 0, w, h);
    let delta = scrollContainer.scrollTop - lastScroll;
    lastScroll = scrollContainer.scrollTop;
    particles.forEach(p => { p.update(delta); p.draw(); });
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => { resize(); particles = []; for(let i=0; i<100; i++) particles.push(new Particle()); });
resize();
for(let i=0; i<100; i++) particles.push(new Particle());
initContent();
animate();