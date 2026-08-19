// Shared visual effects helpers.
import Phaser from 'phaser';

// Generates a seamless 1024px nebula tile once per game: layered radial
// gradient blobs in deep space hues, drawn wrapped so it tiles cleanly.
export function ensureNebula(scene) {
  if (scene.textures.exists('nebula')) return;
  const size = 1024;
  const tex = scene.textures.createCanvas('nebula', size, size);
  const ctx = tex.context;
  // FS2 nebulae are loud: saturated purple and teal, not a faint wash.
  const hues = [[130, 60, 190], [30, 140, 150], [170, 50, 150], [60, 80, 200]];
  for (let i = 0; i < 60; i++) {
    const [r, g, b] = hues[i % hues.length];
    const x = Math.random() * size, y = Math.random() * size;
    const rad = 90 + Math.random() * 230;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, `rgba(${r},${g},${b},${0.1 + Math.random() * 0.12})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        ctx.save();
        ctx.translate(dx, dy);
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }
  tex.refresh();
}

// Procedural starfield tile (replaces the purged Kenney backgrounds).
export function ensureStarfield(scene) {
  if (scene.textures.exists('starfield')) return;
  const size = 1024;
  const tex = scene.textures.createCanvas('starfield', size, size);
  const ctx = tex.context;
  ctx.fillStyle = '#04050c';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 420; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const r = Math.random() < 0.92 ? 0.7 : 1.4;
    const tint = Math.random();
    ctx.fillStyle = tint < 0.8 ? `rgba(255,255,255,${0.25 + Math.random() * 0.5})`
      : tint < 0.9 ? `rgba(160,190,255,${0.4 + Math.random() * 0.4})`
      : `rgba(255,200,150,${0.4 + Math.random() * 0.4})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  tex.refresh();
}

// Procedural bolt sprite (replaces Kenney laser art): white capsule glow,
// tinted per faction at fire time. Drawn pointing right (rotation 0 = east).
export function ensureBoltTexture(scene) {
  if (scene.textures.exists('bolt')) return;
  const w = 48, h = 14;
  const tex = scene.textures.createCanvas('bolt', w, h);
  const ctx = tex.context;
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.75, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  for (const [inset, alpha] of [[0, 0.35], [3, 0.6], [5, 1]]) {
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w / 2 - inset, h / 2 - inset, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  tex.refresh();
}

// Tiny WebAudio synth for combat sounds (replaces the purged Kenney sfx).
let audioCtx = null;
export function sfx(name) {
  try {
    audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t = audioCtx.currentTime;
    const tone = (type, f0, f1, dur, vol) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(f0, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + dur);
    };
    const noise = (dur, vol, cutoff) => {
      const len = Math.ceil(audioCtx.sampleRate * dur);
      const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = cutoff;
      const gain = audioCtx.createGain();
      gain.gain.value = vol;
      src.connect(filter).connect(gain).connect(audioCtx.destination);
      src.start(t);
    };
    switch (name) {
      case 'laser': tone('square', 780, 180, 0.1, 0.03); break;
      case 'flak': tone('triangle', 300, 120, 0.07, 0.03); break;
      case 'heavy': tone('sawtooth', 220, 55, 0.35, 0.06); break;
      case 'beamCharge': tone('sine', 110, 520, 0.6, 0.045); break;
      case 'beamFire': tone('sawtooth', 95, 65, 1.2, 0.07); noise(0.8, 0.05, 900); break;
      case 'hit': tone('triangle', 320, 90, 0.13, 0.04); break;
      case 'boom': noise(0.5, 0.1, 1200); tone('sine', 120, 40, 0.4, 0.07); break;
      case 'bigBoom': noise(1.2, 0.16, 700); tone('sine', 90, 28, 0.9, 0.1); break;
      case 'win': tone('sine', 440, 440, 0.15, 0.05); setTimeout(() => tone('sine', 660, 660, 0.3, 0.05), 160); break;
    }
  } catch { /* audio unavailable (headless/locked) — stay silent */ }
}

// Soft gradient strips and orbs the beam renderer stretches between points.
// All white — tinted per faction at draw time.
export function ensureBeamTextures(scene) {
  if (scene.textures.exists('beam-halo')) return;
  const strip = (key, h, stops) => {
    const tex = scene.textures.createCanvas(key, 64, h);
    const ctx = tex.context;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    for (const [offset, alpha] of stops) grad.addColorStop(offset, `rgba(255,255,255,${alpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, h);
    tex.refresh();
  };
  strip('beam-halo', 64, [[0, 0], [0.5, 0.6], [1, 0]]);
  strip('beam-core', 16, [[0, 0], [0.3, 0.85], [0.5, 1], [0.7, 0.85], [1, 0]]);
  const orb = scene.textures.createCanvas('glow-orb', 64, 64);
  const ctx = orb.context;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  orb.refresh();
}

// Faction accent used for engines and muzzle flashes.
export function factionColor(spec) {
  if (spec.faction === 'Shivan') return 0xff5040;
  if (spec.faction.startsWith('Vasudan')) return 0xffd070;
  return 0x66b7ff;
}

// FS2 beam palettes: GTVA/Vasudan beams are green with a yellow-white inner
// glow; Shivan beams are red with an orange inner glow. Core is always white.
export function beamPalette(spec) {
  return spec.faction === 'Shivan'
    ? { outer: 0xff3822, mid: 0xffb066 }
    : { outer: 0x46ff5e, mid: 0xe8ffb0 };
}
