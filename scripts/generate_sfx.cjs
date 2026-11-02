// Sound synthesis generator for Typemancer
// Synthesizes natural, high-fidelity acoustic sound effects using physical modeling DSP
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;

function createWavBuffer(samples, sampleRate = SAMPLE_RATE) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  return buffer;
}

function saveSound(relativePath, samples) {
  const fullPath = path.resolve(__dirname, '..', 'public', 'assets', 'sfx', relativePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const buf = createWavBuffer(samples);
  fs.writeFileSync(fullPath, buf);
  console.log(`Saved ${relativePath} (${(samples.length / SAMPLE_RATE).toFixed(3)}s, ${buf.length} bytes)`);
}

// ==================== DSP UTILITIES ====================

function softClip(x) {
  return Math.tanh(x);
}

function normalize(arr, peak = 0.95) {
  let max = 0;
  for (let i = 0; i < arr.length; i++) {
    const abs = Math.abs(arr[i]);
    if (abs > max) max = abs;
  }
  if (max === 0) return arr;
  const scale = peak / max;
  for (let i = 0; i < arr.length; i++) {
    arr[i] = softClip(arr[i] * scale);
  }
  return arr;
}

// Single-pole lowpass filter
function lowpass(samples, cutoffHz) {
  const rc = 1.0 / (2.0 * Math.PI * cutoffHz);
  const dt = 1.0 / SAMPLE_RATE;
  const alpha = dt / (rc + dt);
  const out = new Float32Array(samples.length);
  let last = 0;
  for (let i = 0; i < samples.length; i++) {
    last += alpha * (samples[i] - last);
    out[i] = last;
  }
  return out;
}

// Resonant Biquad Bandpass Filter
function bandpass(samples, centerHz, q = 3.0) {
  const w0 = (2 * Math.PI * centerHz) / SAMPLE_RATE;
  const alpha = Math.sin(w0) / (2 * q);
  const b0 = alpha;
  const b1 = 0;
  const b2 = -alpha;
  const a0 = 1 + alpha;
  const a1 = -2 * Math.cos(w0);
  const a2 = 1 - alpha;

  const out = new Float32Array(samples.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < samples.length; i++) {
    const x0 = samples[i];
    const y0 = (b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    out[i] = y0;
    x2 = x1; x1 = x0;
    y2 = y1; y1 = y0;
  }
  return out;
}

// Noise generators
function whiteNoise(length) {
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    out[i] = Math.random() * 2 - 1;
  }
  return out;
}

function pinkNoise(length) {
  const out = new Float32Array(length);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return out;
}

// ==================== 1. TYPING SOUND GENERATORS ====================

// Real mechanical typewriter key strike
function generateMechanicalTypewriter(variation = 0) {
  const duration = 0.085;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const out = new Float32Array(numSamples);

  const jitter = (variation - 1.5) * 0.07;
  const metalFreq1 = (3200 + variation * 240) * (1 + jitter);
  const metalFreq2 = (4400 - variation * 180) * (1 + jitter);
  const bodyFreq = (210 + variation * 18) * (1 + jitter);

  const noise = whiteNoise(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // Layer 1: High transient striker impact crack (10ms)
    const strikerEnv = Math.exp(-t * 220);
    const striker = (noise[i] * 0.6 + Math.sin(2 * Math.PI * metalFreq1 * t) * 0.4) * strikerEnv;

    // Layer 2: Mechanical linkage / escapement metal clack (25ms)
    const linkageEnv = Math.exp(-t * 90);
    const linkage = Math.sin(2 * Math.PI * metalFreq2 * t) * linkageEnv * 0.35;

    // Layer 3: Solid platen roller & cast iron chassis thud (45ms)
    const bodyEnv = Math.exp(-t * 60);
    const body = Math.sin(2 * Math.PI * bodyFreq * t) * bodyEnv * 0.55;

    // Layer 4: Subtle key spring ring (60ms)
    const springEnv = Math.exp(-t * 45);
    const spring = Math.sin(2 * Math.PI * 1850 * t) * springEnv * 0.12;

    out[i] = striker * 0.7 + linkage * 0.35 + body * 0.45 + spring * 0.15;
  }
  return normalize(out, 0.9);
}

// Tactile mechanical keyboard switch "thock"
function generateMechanicalKeyboard(variation = 0) {
  const duration = 0.07;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const out = new Float32Array(numSamples);

  const jitter = (variation - 1.5) * 0.06;
  const clickFreq = (2750 + variation * 200) * (1 + jitter);
  const thockFreq = (480 + variation * 35) * (1 + jitter);

  const noise = whiteNoise(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // Crisp tactile click leaf snap (6ms)
    const snapEnv = Math.exp(-t * 320);
    const snap = (noise[i] * 0.5 + Math.sin(2 * Math.PI * clickFreq * t) * 0.5) * snapEnv;

    // Deep keycap bottom-out thock (35ms)
    const thockEnv = Math.exp(-t * 85);
    const thock = Math.sin(2 * Math.PI * thockFreq * t) * thockEnv;

    // Plate cavity resonance
    const cavityEnv = Math.exp(-t * 110);
    const cavity = Math.sin(2 * Math.PI * (thockFreq * 1.8) * t) * cavityEnv * 0.3;

    out[i] = snap * 0.55 + thock * 0.65 + cavity * 0.25;
  }
  return normalize(out, 0.92);
}

// Arcane quill ink scratch on vellum
function generateQuillScratch(variation = 0) {
  const duration = 0.095;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const pNoise = pinkNoise(numSamples);

  const band1 = bandpass(pNoise, 3200 + variation * 300, 3.5);
  const band2 = bandpass(pNoise, 4800 - variation * 250, 4.0);

  const out = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Envelope with rapid organic scratch texture
    const env = Math.sin((Math.PI * t) / duration) * Math.exp(-t * 15);
    const microTexture = 1 + 0.3 * Math.sin(2 * Math.PI * 140 * t);
    out[i] = (band1[i] * 0.7 + band2[i] * 0.5) * env * microTexture;
  }
  return normalize(out, 0.88);
}

// Soft chalk on slate blackboard
function generateChalkTap(variation = 0) {
  const duration = 0.08;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const noise = whiteNoise(numSamples);

  const band = bandpass(noise, 2400 + variation * 250, 2.8);
  const out = new Float32Array(numSamples);

  const slatePitch = 310 + variation * 25;
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const chalkGrain = Math.exp(-t * 85) * band[i];
    const slateTap = Math.sin(2 * Math.PI * slatePitch * t) * Math.exp(-t * 120);
    out[i] = chalkGrain * 0.75 + slateTap * 0.35;
  }
  return normalize(out, 0.86);
}

// Carriage return bell ("ding!") + lever slide
function generateCarriageReturn() {
  const duration = 0.45;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const out = new Float32Array(numSamples);

  const bellFreq = 1760; // A6
  const harmonic = 3520;

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Bell chime
    const bellEnv = Math.exp(-t * 9);
    const bell = (Math.sin(2 * Math.PI * bellFreq * t) * 0.75 + Math.sin(2 * Math.PI * harmonic * t) * 0.25) * bellEnv;

    // Lever release click (at 0.12s)
    let lever = 0;
    if (t > 0.12) {
      const lt = t - 0.12;
      lever = Math.sin(2 * Math.PI * 650 * lt) * Math.exp(-lt * 40) * 0.2;
    }
    out[i] = bell * 0.85 + lever * 0.25;
  }
  return normalize(out, 0.95);
}

// ==================== 2. BLADED WEAPONS ====================

// Singing steel sword slash
function generateSwordSlash(heavy = false) {
  const duration = heavy ? 0.38 : 0.32;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const noise = whiteNoise(numSamples);
  const out = new Float32Array(numSamples);

  const basePitch = heavy ? 1800 : 2600;
  const ringPitch = heavy ? 1250 : 2100;

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Slicing swoosh of blade cutting air
    const airSwooshEnv = Math.sin(Math.PI * Math.min(1, t / 0.18));
    const pitchDrop = Math.max(400, basePitch - t * 4500);
    const air = Math.sin(2 * Math.PI * pitchDrop * t) * airSwooshEnv * 0.35 + noise[i] * airSwooshEnv * 0.45;

    // Singing razor metallic edge ring
    const ringEnv = t > 0.05 ? Math.exp(-(t - 0.05) * (heavy ? 12 : 16)) : 0;
    const ring = (Math.sin(2 * Math.PI * ringPitch * t) + 0.35 * Math.sin(2 * Math.PI * ringPitch * 1.8 * t)) * ringEnv;

    out[i] = air * 0.65 + ring * 0.55;
  }
  return normalize(out, 0.95);
}

// Defensive blade parry deflection
function generateDefensiveBladeParry() {
  const duration = 0.35;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const out = new Float32Array(numSamples);

  const freq1 = 2950;
  const freq2 = 4150;
  const noise = whiteNoise(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Instant impact transient (5ms)
    const impactEnv = Math.exp(-t * 280);
    const impact = noise[i] * impactEnv * 0.5;

    // Dual ringing steel harmonic resonance (decaying over 300ms)
    const ringEnv = Math.exp(-t * 14);
    const ring = (Math.sin(2 * Math.PI * freq1 * t) * 0.6 + Math.sin(2 * Math.PI * freq2 * t) * 0.4) * ringEnv;

    out[i] = impact * 0.45 + ring * 0.75;
  }
  return normalize(out, 0.94);
}

// Swift smooth knife slice (non-jarring)
function generateKnifeSlice(sharp = true) {
  const duration = 0.24;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const noise = pinkNoise(numSamples);
  const filtered = bandpass(noise, sharp ? 3800 : 2900, 2.5);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Smooth crescent envelope (quick attack, swift smooth decay)
    const env = Math.pow(Math.sin((Math.PI * t) / duration), 1.8) * Math.exp(-t * 8);
    // Subtle steel whistle
    const whistle = Math.sin(2 * Math.PI * (sharp ? 3400 : 2400) * t) * 0.25 * env;
    out[i] = filtered[i] * env * 0.8 + whistle;
  }
  return normalize(out, 0.9);
}

// Lethal heavy guillotine / execution chop
function generateGuillotineChop() {
  const duration = 0.45;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const out = new Float32Array(numSamples);
  const noise = whiteNoise(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Track slide whistle (0.0 to 0.12s)
    let slide = 0;
    if (t < 0.14) {
      slide = noise[i] * 0.25 * Math.sin((Math.PI * t) / 0.14) * Math.sin(2 * Math.PI * (1600 + t * 3000) * t);
    }
    // Severe cutting cleave impact at 0.12s
    let chop = 0;
    if (t >= 0.12) {
      const ct = t - 0.12;
      const chopEnv = Math.exp(-ct * 22);
      const bladeBite = Math.sin(2 * Math.PI * (950 - ct * 1800) * ct) * chopEnv;
      const heavyThud = Math.sin(2 * Math.PI * 130 * ct) * Math.exp(-ct * 35);
      const steelRing = Math.sin(2 * Math.PI * 2200 * ct) * Math.exp(-ct * 18);
      chop = (bladeBite * 0.5 + heavyThud * 0.6 + steelRing * 0.35 + noise[i] * chopEnv * 0.35);
    }
    out[i] = slide + chop;
  }
  return normalize(out, 0.96);
}

// ==================== 3. MAGIC & SPELLS ====================

// Natural Arcane Spark & Lightning Crackle (no 8-bit laser)
function generateArcaneSpark() {
  const duration = 0.32;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const out = new Float32Array(numSamples);
  const noise = whiteNoise(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Initial violent crack
    const crackEnv = Math.exp(-t * 90);
    const crack = noise[i] * crackEnv * 0.65;

    // Resonant mystic spark discharge (descending crackle)
    const sparkEnv = Math.exp(-t * 18);
    const spark = Math.sin(2 * Math.PI * (1450 - t * 1800) * t) * sparkEnv * 0.45;
    // Lower body rumble
    const rumble = Math.sin(2 * Math.PI * 165 * t) * Math.exp(-t * 25) * 0.4;

    out[i] = crack + spark + rumble;
  }
  return normalize(out, 0.92);
}

// Ethereal Ink Sublimation / Magic Erase
function generateMagicErase() {
  const duration = 0.42;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const pNoise = pinkNoise(numSamples);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Smooth vacuum inhalation followed by whisper dispersion
    const env = Math.pow(Math.sin((Math.PI * t) / duration), 1.5);
    const sweepPitch = 1200 + Math.sin(Math.PI * (t / duration)) * 1400;
    const tone = Math.sin(2 * Math.PI * sweepPitch * t) * 0.25;
    out[i] = (pNoise[i] * 0.75 + tone) * env;
  }
  return normalize(out, 0.88);
}

// Ancient Rune Ward / Magic Shield
function generateMagicRuneShield() {
  const duration = 0.48;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const out = new Float32Array(numSamples);

  // Radiant parchment barrier hum: 440Hz + 880Hz + 1320Hz
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.sin(Math.PI * Math.min(1, t / 0.08)) * Math.exp(-t * 7);
    const tone1 = Math.sin(2 * Math.PI * 440 * t);
    const tone2 = Math.sin(2 * Math.PI * 880 * t) * 0.5;
    const tone3 = Math.sin(2 * Math.PI * 1320 * t) * 0.25;
    out[i] = (tone1 + tone2 + tone3) * env * 0.55;
  }
  return normalize(out, 0.9);
}

// Mystic Smoke / Mist Puff (replacing orb drop)
function generateMysticMist() {
  const duration = 0.38;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const pNoise = pinkNoise(numSamples);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.sin(Math.PI * Math.min(1, t / 0.06)) * Math.exp(-t * 9);
    const subPuff = Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 30) * 0.4;
    out[i] = pNoise[i] * env * 0.65 + subPuff;
  }
  return normalize(out, 0.88);
}

// Gentle Restorative Healing Shimmer
function generateGentleHeal() {
  const duration = 0.55;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const out = new Float32Array(numSamples);

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let sum = 0;
    notes.forEach((freq, idx) => {
      const delay = idx * 0.06;
      if (t >= delay) {
        const dt = t - delay;
        const env = Math.exp(-dt * 6.5);
        sum += Math.sin(2 * Math.PI * freq * dt) * env * 0.35;
      }
    });
    out[i] = sum;
  }
  return normalize(out, 0.88);
}

// Sanctuary Vellum Blessing
function generateSanctuaryBlessing() {
  const duration = 0.6;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const out = new Float32Array(numSamples);

  const chords = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let sum = 0;
    chords.forEach((freq, idx) => {
      const delay = idx * 0.05;
      if (t >= delay) {
        const dt = t - delay;
        const env = Math.exp(-dt * 5.5);
        sum += Math.sin(2 * Math.PI * freq * dt) * env * 0.35;
      }
    });
    out[i] = sum;
  }
  return normalize(out, 0.9);
}

// Vampiric Life Drain Whisper
function generateVampiricDrain() {
  const duration = 0.42;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const noise = pinkNoise(numSamples);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.pow(Math.sin((Math.PI * t) / duration), 1.6);
    const fangsSnap = t < 0.05 ? Math.sin(2 * Math.PI * 1850 * t) * Math.exp(-t * 70) * 0.4 : 0;
    const drainVortex = Math.sin(2 * Math.PI * (380 + Math.sin(t * 30) * 80) * t) * env * 0.45;
    out[i] = noise[i] * env * 0.5 + fangsSnap + drainVortex;
  }
  return normalize(out, 0.9);
}

// ==================== 4. HEAVY & EXPLOSIVE ====================

// Visceral Fantasy Combat Hit (replacing generic click)
function generateCombatDirectHit() {
  const duration = 0.28;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const noise = whiteNoise(numSamples);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Punchy body crack (12ms)
    const crackEnv = Math.exp(-t * 140);
    const crack = noise[i] * crackEnv * 0.75;

    // Meaty low-end thud (40ms)
    const thudEnv = Math.exp(-t * 40);
    const thud = Math.sin(2 * Math.PI * (140 - t * 200) * t) * thudEnv * 0.65;

    // Subtle edge bite
    const biteEnv = Math.exp(-t * 90);
    const bite = Math.sin(2 * Math.PI * 720 * t) * biteEnv * 0.35;

    out[i] = crack * 0.65 + thud * 0.65 + bite * 0.3;
  }
  return normalize(out, 0.95);
}

// Massive Blunt Slam (replacing door close)
function generateHeavySlam() {
  const duration = 0.42;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const noise = whiteNoise(numSamples);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Initial violent collision
    const impactEnv = Math.exp(-t * 110);
    const impact = noise[i] * impactEnv * 0.65;

    // Deep sub-bass floor tremor (80Hz decaying over 300ms)
    const subEnv = Math.exp(-t * 18);
    const sub = Math.sin(2 * Math.PI * 82 * t) * subEnv * 0.75;

    // Heavy wooden/stone block body
    const bodyEnv = Math.exp(-t * 35);
    const body = Math.sin(2 * Math.PI * 175 * t) * bodyEnv * 0.55;

    out[i] = impact * 0.55 + sub * 0.65 + body * 0.45;
  }
  return normalize(out, 0.96);
}

// Crushing Granite Boulder Smash (replacing small pebbles)
function generateCrushingBoulderSmash() {
  const duration = 0.55;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const noise = whiteNoise(numSamples);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Explosive rock fracture crack
    const crackEnv = Math.exp(-t * 80);
    const crack = noise[i] * crackEnv * 0.75;

    // Heavy mountain sub rumble (65Hz)
    const rumbleEnv = Math.exp(-t * 12);
    const rumble = Math.sin(2 * Math.PI * (70 + Math.sin(t * 15) * 15) * t) * rumbleEnv * 0.8;

    // Falling tumbling heavy rock fragments
    const tumbleEnv = t > 0.08 ? Math.exp(-(t - 0.08) * 16) : 0;
    const tumble = noise[i] * tumbleEnv * 0.45 * Math.sin(2 * Math.PI * 340 * t);

    out[i] = crack * 0.55 + rumble * 0.75 + tumble * 0.4;
  }
  return normalize(out, 0.96);
}

// ==================== 5. ARMOR & DEFENSE ====================

// Metallicize Armor Hardening Clank
function generateMetallicizeClank() {
  const duration = 0.36;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const noise = whiteNoise(numSamples);
  const out = new Float32Array(numSamples);

  const freq1 = 1680;
  const freq2 = 2540;

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Heavy plate impact
    const clankEnv = Math.exp(-t * 120);
    const clank = noise[i] * clankEnv * 0.45;

    // Resonant iron plate tightening
    const plateEnv = Math.exp(-t * 18);
    const plate = (Math.sin(2 * Math.PI * freq1 * t) * 0.6 + Math.sin(2 * Math.PI * freq2 * t) * 0.4) * plateEnv;

    out[i] = clank * 0.4 + plate * 0.7;
  }
  return normalize(out, 0.92);
}

// Musical Forge Anvil Strikes (replacing jarring kitchen pots)
function generateForgeAnvil(variation = 0) {
  const duration = 0.45;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const out = new Float32Array(numSamples);

  const pitches = [1480, 1850, 2220]; // D6, F#6, A6 harmonics
  const baseFreq = pitches[variation % pitches.length];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Hammer hit transient
    const strikeEnv = Math.exp(-t * 160);
    const strike = (Math.random() * 2 - 1) * strikeEnv * 0.4;

    // Pure tempered anvil ring (musical, non-jarring)
    const ringEnv = Math.exp(-t * 11);
    const ring = (
      Math.sin(2 * Math.PI * baseFreq * t) * 0.6 +
      Math.sin(2 * Math.PI * baseFreq * 2.1 * t) * 0.28 +
      Math.sin(2 * Math.PI * baseFreq * 3.2 * t) * 0.12
    ) * ringEnv;

    out[i] = strike * 0.35 + ring * 0.75;
  }
  return normalize(out, 0.92);
}

// ==================== 6. ENVIRONMENT & ITEMS ====================

// Wooden Blowpipe Toxic Dart
function generateBlowpipeDart() {
  const duration = 0.26;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const noise = whiteNoise(numSamples);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Soft wooden "phut!" puff
    const puffEnv = Math.exp(-t * 90);
    const puff = (Math.sin(2 * Math.PI * 420 * t) * 0.7 + noise[i] * 0.3) * puffEnv;

    // Swift airy needle whistle
    let whistle = 0;
    if (t > 0.03) {
      const wt = t - 0.03;
      const whistleEnv = Math.exp(-wt * 22) * Math.sin(Math.PI * Math.min(1, wt / 0.06));
      whistle = Math.sin(2 * Math.PI * (1950 - wt * 2200) * wt) * whistleEnv * 0.55;
    }
    out[i] = puff * 0.75 + whistle * 0.45;
  }
  return normalize(out, 0.9);
}

// Violent Paper Tear (for "Tear in Two")
function generatePaperTear() {
  const duration = 0.34;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const pNoise = pinkNoise(numSamples);
  const out = new Float32Array(numSamples);

  const filtered = bandpass(pNoise, 3100, 2.0);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Aggressive ripping envelope with rapid micro-bursts of fiber tearing
    const env = Math.sin((Math.PI * t) / duration) * (1 + 0.5 * Math.sin(2 * Math.PI * 95 * t));
    out[i] = filtered[i] * env;
  }
  return normalize(out, 0.93);
}

// Rapid Graphite Pencil Speedwrite (for Speedwrite & Outline)
function generatePencilSpeedwrite() {
  const duration = 0.38;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const pNoise = pinkNoise(numSamples);
  const out = new Float32Array(numSamples);

  const band = bandpass(pNoise, 4200, 3.2);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Rapid sketching strokes (3 strokes back and forth)
    const strokeMod = Math.abs(Math.sin(2 * Math.PI * 7.5 * t));
    const env = Math.sin((Math.PI * t) / duration) * (0.4 + 0.6 * strokeMod);
    out[i] = band[i] * env;
  }
  return normalize(out, 0.88);
}

// Warm Solid Mahogany Wood Desk Tap
function generateWoodFrame() {
  const duration = 0.16;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 60);
    // Warm wooden resonant tap (260Hz + 520Hz)
    const tap = (Math.sin(2 * Math.PI * 260 * t) * 0.7 + Math.sin(2 * Math.PI * 520 * t) * 0.3) * env;
    out[i] = tap;
  }
  return normalize(out, 0.9);
}

// Trimmed Flowing Breeze (concise and clean)
function generateFlowingBreeze() {
  const duration = 1.4;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const pNoise = pinkNoise(numSamples);
  const out = new Float32Array(numSamples);

  const band = bandpass(pNoise, 750, 1.2);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Smooth fade in and gentle fade out
    const env = Math.sin((Math.PI * t) / duration);
    out[i] = band[i] * env;
  }
  return normalize(out, 0.85);
}

// ==================== MAIN GENERATION RUN ====================

console.log('Generating updated sound assets for Typemancer...');

// 1. Typing & UI Sounds
saveSound('typing/typewriter_1.wav', generateMechanicalTypewriter(0));
saveSound('typing/typewriter_2.wav', generateMechanicalTypewriter(1));
saveSound('typing/typewriter_3.wav', generateMechanicalTypewriter(2));
saveSound('typing/typewriter_4.wav', generateMechanicalTypewriter(3));
saveSound('typing/keyboard_1.wav', generateMechanicalKeyboard(0));
saveSound('typing/keyboard_2.wav', generateMechanicalKeyboard(1));
saveSound('typing/keyboard_3.wav', generateMechanicalKeyboard(2));
saveSound('typing/keyboard_4.wav', generateMechanicalKeyboard(3));
saveSound('typing/quill_1.wav', generateQuillScratch(0));
saveSound('typing/quill_2.wav', generateQuillScratch(1));
saveSound('typing/quill_3.wav', generateQuillScratch(2));
saveSound('typing/quill_4.wav', generateQuillScratch(3));
saveSound('typing/chalk_1.wav', generateChalkTap(0));
saveSound('typing/chalk_2.wav', generateChalkTap(1));
saveSound('typing/chalk_3.wav', generateChalkTap(2));
saveSound('typing/chalk_4.wav', generateChalkTap(3));
saveSound('typing/carriage_bell.wav', generateCarriageReturn());

// 2. Bladed Weapons
saveSound('cards/blade_01.wav', generateSwordSlash(false));
saveSound('cards/blade_02.wav', generateGuillotineChop());
saveSound('cards/blade_03.wav', generateDefensiveBladeParry());
saveSound('cards/knifeSlice.wav', generateKnifeSlice(true));
saveSound('cards/knifeSlice2.wav', generateKnifeSlice(false));
saveSound('cards/blade_guillotine.wav', generateGuillotineChop());
saveSound('cards/quick_slash.wav', generateKnifeSlice(true));

// Overwrite legacy files so existing references seamlessly upgrade
saveSound('cards/blade_01.ogg', generateSwordSlash(false));
saveSound('cards/blade_02.ogg', generateGuillotineChop());
saveSound('cards/blade_03.ogg', generateDefensiveBladeParry());
saveSound('cards/knifeSlice.ogg', generateKnifeSlice(true));
saveSound('cards/knifeSlice2.ogg', generateKnifeSlice(false));

// 3. Magic & Spells
saveSound('cards/zap.ogg', generateArcaneSpark());
saveSound('cards/zap.wav', generateArcaneSpark());
saveSound('cards/magicdrop.ogg', generateMysticMist());
saveSound('cards/magicdrop.wav', generateMysticMist());
saveSound('cards/magicshield.ogg', generateMagicRuneShield());
saveSound('cards/magicshield.wav', generateMagicRuneShield());
saveSound('cards/magicerase.ogg', generateMagicErase());
saveSound('cards/magicerase.wav', generateMagicErase());
saveSound('cards/heal.ogg', generateGentleHeal());
saveSound('cards/heal.wav', generateGentleHeal());
saveSound('cards/blessing3.ogg', generateSanctuaryBlessing());
saveSound('cards/blessing3.wav', generateSanctuaryBlessing());
saveSound('cards/curse2.ogg', generateVampiricDrain());
saveSound('cards/curse2.wav', generateVampiricDrain());

// 4. Heavy & Explosive
saveSound('attack_hit.ogg', generateCombatDirectHit());
saveSound('attack_hit.wav', generateCombatDirectHit());
saveSound('cards/doorClose_1.ogg', generateHeavySlam());
saveSound('cards/doorClose_1.wav', generateHeavySlam());
saveSound('cards/boulder_smash.wav', generateCrushingBoulderSmash());

// 5. Armor & Defense
saveSound('cards/metal_01.ogg', generateMetallicizeClank());
saveSound('cards/metal_01.wav', generateMetallicizeClank());
saveSound('cards/metalPot1.ogg', generateForgeAnvil(0));
saveSound('cards/metalPot1.wav', generateForgeAnvil(0));
saveSound('cards/metalPot2.ogg', generateForgeAnvil(1));
saveSound('cards/metalPot2.wav', generateForgeAnvil(1));
saveSound('cards/metalPot3.ogg', generateForgeAnvil(2));
saveSound('cards/metalPot3.wav', generateForgeAnvil(2));

// 6. Environment & Items
saveSound('cards/shot.ogg', generateBlowpipeDart());
saveSound('cards/shot.wav', generateBlowpipeDart());
saveSound('cards/item_wood_01.ogg', generateWoodFrame());
saveSound('cards/item_wood_01.wav', generateWoodFrame());
saveSound('cards/paper_tear.wav', generatePaperTear());
saveSound('cards/pencil_speedwrite.wav', generatePencilSpeedwrite());
saveSound('cards/wind_trimmed.wav', generateFlowingBreeze());

console.log('All Typemancer sound effects generated successfully!');
