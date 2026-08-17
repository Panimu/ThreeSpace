// Shared visual effects helpers.
import Phaser from 'phaser';

// Generates a seamless 1024px nebula tile once per game: layered radial
// gradient blobs in deep space hues, drawn wrapped so it tiles cleanly.
export function ensureNebula(scene) {
  if (scene.textures.exists('nebula')) return;
  const size = 1024;
  const tex = scene.textures.createCanvas('nebula', size, size);
  const ctx = tex.context;
  const hues = [[88, 52, 150], [36, 90, 110], [140, 60, 120], [46, 66, 158]];
  for (let i = 0; i < 46; i++) {
    const [r, g, b] = hues[i % hues.length];
    const x = Math.random() * size, y = Math.random() * size;
    const rad = 90 + Math.random() * 230;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, `rgba(${r},${g},${b},${0.05 + Math.random() * 0.07})`);
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

// Faction accent used for engines and beams.
export function factionColor(spec) {
  if (spec.faction === 'Shivan') return 0xff5040;
  if (spec.faction.startsWith('Vasudan')) return 0xffd070;
  return 0x66b7ff;
}
