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
