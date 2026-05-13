/**
 * script.js — Pagii-Aull
 * Scroll-driven time-of-day transitions using GSAP + ScrollTrigger
 * ──────────────────────────────────────────────────────────────────
 * Color philosophy:
 *   Pagi  → Blue pastel sky, warm golden horizon
 *   Siang → Deep ocean blue, blazing white sun high
 *   Sore  → Purple-to-orange sunset drama
 *   Malam → Near-black navy, soft blue moonlight
 */

// ── Wait for libraries to load ───────────────────────────────────
window.addEventListener('load', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error('[Pagii] GSAP or ScrollTrigger not loaded.');
    fallbackReveal();
    return;
  }
  init();
});


// ═══════════════════════════════════════════════════════════════
// 1. CONSTANTS & PALETTE
// ═══════════════════════════════════════════════════════════════

const PALETTES = {
  pagi: {
    skyTop:    '#5BBFEA',   // biru muda cerah
    skyBot:    '#AAE0F5',   // biru pucat
    horizon:   '#FDDCB0',   // golden peach
    ground:    '#7EC850',   // hijau segar
    textColor: '#1A3C5E',   // navy
    subColor:  '#2E6DA4',
    glassBase: 'rgba(255,255,255,0.18)',
    glassBorder:'rgba(255,255,255,0.35)',
  },
  siang: {
    skyTop:    '#1565C0',   // biru tua menengah
    skyBot:    '#42A5F5',   // biru cerah
    horizon:   '#FFF9C4',   // kuning pucat
    ground:    '#4CAF50',   // hijau siang
    textColor: '#0D2B4A',
    subColor:  '#1565C0',
    glassBase: 'rgba(255,255,255,0.15)',
    glassBorder:'rgba(255,255,255,0.30)',
  },
  sore: {
    skyTop:    '#3E0D54',   // ungu tua gelap
    skyBot:    '#C94B08',   // oranye tua
    horizon:   '#F97316',   // oranye hangat
    ground:    '#2D1B45',   // ungu gelap
    textColor: '#FFF3E8',   // krem hangat
    subColor:  '#FFCBA0',   // peach terang
    glassBase: 'rgba(80,20,110,0.22)',
    glassBorder:'rgba(255,200,140,0.25)',
  },
  malam: {
    skyTop:    '#020511',   // hitam biru tua
    skyBot:    '#0D1B4A',   // biru navy gelap
    horizon:   '#080E28',   // biru gelap
    ground:    '#04060D',   // hampir hitam
    textColor: '#E8EEFF',   // putih kebiruan
    subColor:  '#A0B8FF',   // lavender
    glassBase: 'rgba(10,15,50,0.38)',
    glassBorder:'rgba(160,184,255,0.2)',
  },
};

// Progress breakpoints (0–1) for each phase
const PHASE = {
  pagi:  { start: 0,    end: 0.33 },
  siang: { start: 0.33, end: 0.55 },
  sore:  { start: 0.55, end: 0.78 },
  malam: { start: 0.78, end: 1.0  },
};


// ═══════════════════════════════════════════════════════════════
// 2. HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Linear interpolation between two values
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Clamp t between 0 and 1
 */
function clamp01(t) {
  return Math.max(0, Math.min(1, t));
}

/**
 * Map a value from one range to another, then clamp
 */
function mapRange(value, inMin, inMax, outMin, outMax) {
  const t = clamp01((value - inMin) / (inMax - inMin));
  return lerp(outMin, outMax, t);
}

/**
 * Parse hex color into [r,g,b]
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)]
    : [0,0,0];
}

/**
 * Interpolate between two hex colors, return rgb() string
 */
function lerpColor(hexA, hexB, t) {
  const [r1,g1,b1] = hexToRgb(hexA);
  const [r2,g2,b2] = hexToRgb(hexB);
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  return `rgb(${r},${g},${b})`;
}


// ═══════════════════════════════════════════════════════════════
// 3. DOM REFERENCES
// ═══════════════════════════════════════════════════════════════

const skyGradient     = document.getElementById('sky-gradient');
const horizonGlow     = document.getElementById('horizon-glow');
const groundSil       = document.getElementById('ground-silhouette');
const sun             = document.getElementById('sun');
const moon            = document.getElementById('moon');
const stars           = document.getElementById('stars');
const clouds1         = document.getElementById('clouds-1');
const clouds2         = document.getElementById('clouds-2');
const heartFinale     = document.getElementById('heart-finale');
const scrollHint      = document.getElementById('scroll-hint');
const sections        = document.querySelectorAll('.time-section');
const sectionInners   = document.querySelectorAll('.section-inner');
const particlesEl     = document.getElementById('particles-container');


// ═══════════════════════════════════════════════════════════════
// 4. PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════════════

const PARTICLE_CONFIGS = {
  pagi:  { count: 8,  minSize: 4,  maxSize: 9,  colors: ['#FFFFFF','#FFF9C4','#B3E5FC'], minDur: 14, maxDur: 22 },
  siang: { count: 5,  minSize: 3,  maxSize: 7,  colors: ['#FFFFFF','#E3F2FD'],           minDur: 12, maxDur: 18 },
  sore:  { count: 12, minSize: 3,  maxSize: 8,  colors: ['#FF9D43','#FFDCA0','#FF7043','#CE93D8'], minDur: 10, maxDur: 16 },
  malam: { count: 16, minSize: 2,  maxSize: 5,  colors: ['#A0B8FF','#C3CEFF','#7986CB','#FFFFFF'], minDur: 18, maxDur: 28 },
};

let activeParticles = [];

function clearParticles() {
  activeParticles.forEach(p => p.remove());
  activeParticles = [];
  particlesEl.innerHTML = '';
}

function spawnParticles(phase) {
  clearParticles();
  const cfg = PARTICLE_CONFIGS[phase];
  for (let i = 0; i < cfg.count; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    const size = lerp(cfg.minSize, cfg.maxSize, Math.random());
    const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
    const dur  = lerp(cfg.minDur, cfg.maxDur, Math.random());
    const delay = -Math.random() * dur;   // stagger start
    const left  = Math.random() * 100;

    el.style.cssText = `
      left: ${left}%;
      bottom: ${-size}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      opacity: ${0.4 + Math.random() * 0.5};
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      filter: blur(${size > 6 ? 1.5 : 0.5}px);
    `;
    particlesEl.appendChild(el);
    activeParticles.push(el);
  }
}


// ═══════════════════════════════════════════════════════════════
// 5. SKY GRADIENT UPDATE
// ═══════════════════════════════════════════════════════════════

/**
 * Returns the blended palette between two phases given global progress 0–1
 */
function getBlendedPalette(progress) {
  // Find which transition we are in
  const phases = ['pagi','siang','sore','malam'];

  let fromKey = 'pagi', toKey = 'siang', localT = 0;

  for (let i = 0; i < phases.length - 1; i++) {
    const from = PHASE[phases[i]];
    const to   = PHASE[phases[i+1]];
    if (progress >= from.start && progress < to.end) {
      fromKey = phases[i];
      toKey   = phases[i+1];
      localT  = mapRange(progress, from.end, to.end, 0, 1);
      break;
    }
  }

  if (progress >= PHASE.malam.start) {
    fromKey = 'sore';
    toKey   = 'malam';
    localT  = mapRange(progress, PHASE.malam.start, PHASE.malam.end, 0, 1);
  }

  const A = PALETTES[fromKey];
  const B = PALETTES[toKey];
  const t = clamp01(localT);

  return {
    skyTop:      lerpColor(A.skyTop,   B.skyTop,   t),
    skyBot:      lerpColor(A.skyBot,   B.skyBot,   t),
    horizon:     lerpColor(A.horizon,  B.horizon,  t),
    ground:      lerpColor(A.ground,   B.ground,   t),
    textColor:   lerpColor(A.textColor,B.textColor,t),
  };
}

function updateSky(progress) {
  const pal = getBlendedPalette(progress);

  // Sky gradient
  skyGradient.style.background = `linear-gradient(
    to bottom,
    ${pal.skyTop} 0%,
    ${pal.skyBot} 55%,
    ${pal.horizon} 100%
  )`;

  // Ground color
  groundSil.style.color = pal.ground;

  // Horizon glow opacity: brightest at pagi and sore transitions
  const glowPagi  = mapRange(progress, 0,    0.2,  0.6, 0);
  const glowSore  = mapRange(progress, 0.55, 0.72, 0,   0.9);
  const glowMalam = mapRange(progress, 0.72, 0.88, 0.9, 0);
  horizonGlow.style.opacity = Math.max(glowPagi, glowSore, glowMalam);
}


// ═══════════════════════════════════════════════════════════════
// 6. CELESTIAL BODY POSITIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Sun arc:
 *   pagi  → rises from 75% top  (just visible)
 *   siang → peaks at  8% top   (high noon)
 *   sore  → sets at  95% top   (below horizon)
 */
function updateSun(progress) {
  // 0–0.33: rising (75% → 8%)
  const rising = mapRange(progress, 0, 0.33, 75, 8);
  // 0.33–0.66: setting (8% → 95%)
  const setting = mapRange(progress, 0.33, 0.66, 8, 95);

  let topPercent;
  if (progress < 0.33) {
    topPercent = rising;
  } else {
    topPercent = setting;
  }

  sun.style.top = `${topPercent}%`;

  // Opacity: visible from pagi to sore (0 → 1 → 1 → 0)
  const opVisible = mapRange(progress, 0,    0.06,  0, 1);
  const opFading  = mapRange(progress, 0.62, 0.72,  1, 0);
  sun.style.opacity = progress < 0.62 ? opVisible : opFading;

  // Scale: slightly larger at noon
  const scale = progress < 0.33
    ? mapRange(progress, 0, 0.33, 0.9, 1.15)
    : mapRange(progress, 0.33, 0.66, 1.15, 0.85);
  sun.style.transform = `translateX(-50%) scale(${scale})`;
}

/**
 * Moon:
 *   Rises at sore → malam (from 120% to 15%)
 *   Opacity: 0 → 1
 */
function updateMoon(progress) {
  const opacity = mapRange(progress, 0.68, 0.85, 0, 1);
  const topPct  = mapRange(progress, 0.68, 0.95, 108, 12);

  moon.style.opacity = opacity;
  moon.style.top = `${topPct}%`;
}

/**
 * Stars: fade in during sore→malam
 */
function updateStars(progress) {
  const opacity = mapRange(progress, 0.72, 0.88, 0, 1);
  stars.style.opacity = opacity;
}

/**
 * Clouds: visible in pagi & siang, fade at sore
 */
function updateClouds(progress) {
  const opacity1 = mapRange(progress, 0.50, 0.68, 0.75, 0);
  const opacity2 = mapRange(progress, 0.52, 0.70, 0.60, 0);

  clouds1.style.opacity = Math.max(0, opacity1);
  clouds2.style.opacity = Math.max(0, opacity2);

  // Gentle horizontal drift
  const drift = progress * 60; // pixels
  clouds1.style.transform = `translateX(${drift}px)`;
  clouds2.style.transform = `scaleX(-1) translateX(${drift * 0.6}px)`;
}


// ═══════════════════════════════════════════════════════════════
// 7. SECTION TEXT REVEAL (GSAP per-section)
// ═══════════════════════════════════════════════════════════════

function setupSectionReveals() {
  // First section (#pagi) reveals immediately on load, no scroll required
  const pagiInner = document.querySelector('#pagi .section-inner');
  if (pagiInner) {
    gsap.to(pagiInner, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.3,
    });
  }

  // Rest of sections reveal on scroll
  sectionInners.forEach((inner) => {
    const parentSection = inner.closest('section');
    if (parentSection && parentSection.id === 'pagi') return; // skip pagi, already handled

    gsap.to(inner, {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: inner,
        start: 'top 78%',
        end:   'top 35%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // Heart finale reveal
  if (heartFinale) {
    gsap.to(heartFinale, {
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: 'back.out(1.5)',
      scrollTrigger: {
        trigger: heartFinale,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });
  }

  // Hide scroll hint when user scrolls past first section
  if (scrollHint) {
    ScrollTrigger.create({
      trigger: '#siang',
      start: 'top 80%',
      onEnter:  () => gsap.to(scrollHint, { opacity: 0, y: -10, duration: 0.5 }),
      onLeaveBack: () => gsap.to(scrollHint, { opacity: 1, y: 0, duration: 0.5 }),
    });
  }
}


// ═══════════════════════════════════════════════════════════════
// 8. MASTER SCROLL LISTENER
// ═══════════════════════════════════════════════════════════════

let lastPhase = '';

function onScroll() {
  const docH   = document.documentElement.scrollHeight - window.innerHeight;
  const scrollY = window.scrollY;
  const progress = docH > 0 ? clamp01(scrollY / docH) : 0;

  // Update sky visuals
  updateSky(progress);
  updateSun(progress);
  updateMoon(progress);
  updateStars(progress);
  updateClouds(progress);

  // Determine current phase for particles
  let currentPhase = 'pagi';
  if (progress >= PHASE.malam.start)      currentPhase = 'malam';
  else if (progress >= PHASE.sore.start)  currentPhase = 'sore';
  else if (progress >= PHASE.siang.start) currentPhase = 'siang';

  if (currentPhase !== lastPhase) {
    lastPhase = currentPhase;
    spawnParticles(currentPhase);
  }
}


// ═══════════════════════════════════════════════════════════════
// 9. INIT
// ═══════════════════════════════════════════════════════════════

function init() {
  gsap.registerPlugin(ScrollTrigger);

  // Initial state
  onScroll();
  spawnParticles('pagi');

  // Passive scroll listener for sky (lightweight, no GSAP overhead)
  window.addEventListener('scroll', onScroll, { passive: true });

  // GSAP section reveal triggers
  setupSectionReveals();

  // Refresh after fonts/images loaded
  ScrollTrigger.refresh();

  console.log('[Pagii] ✨ Loaded successfully. Scroll to explore!');
}

function fallbackReveal() {
  // If GSAP fails to load, just show everything
  sectionInners.forEach(inner => {
    inner.style.opacity = '1';
    inner.style.transform = 'none';
  });
  if (heartFinale) {
    heartFinale.style.opacity = '1';
    heartFinale.style.transform = 'none';
  }
}
