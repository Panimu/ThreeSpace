// Bakes faction-unified recolors of the cast ship sprites into assets/derived/:
// Vasudan hulls gold-shifted, Shivan hulls red-shifted. Derivatives of Endless
// Sky art remain CC-BY-SA 4.0 (see assets/README.md). Run after changing casts:
//   node scripts/recolor-factions.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const { SHIPS } = await import(resolve(root, 'src/ships.js'));

const jobs = new Map(); // source url -> {mode, out}
for (const ship of Object.values(SHIPS)) {
  const mode = ship.faction.startsWith('Vasudan') ? 'vasudan'
    : ship.faction === 'Shivan' ? 'shivan' : null;
  if (!mode || ship.url.startsWith('derived/')) continue;
  jobs.set(ship.url, { mode, out: `derived/${mode}/${basename(ship.url)}` });
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();

for (const [src, { mode, out }] of jobs) {
  const dataUrl = `data:image/png;base64,${readFileSync(resolve(root, 'assets', src)).toString('base64')}`;
  const result = await page.evaluate(async ([url, m]) => {
    const img = await new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = url; });
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d');
    if (m === 'vasudan') {
      // Gold-shift: sepia base pushed warm, saturation restored.
      ctx.filter = 'sepia(0.65) saturate(1.5) brightness(1.05) hue-rotate(-8deg)';
      ctx.drawImage(img, 0, 0);
    } else {
      // Red-shift: desaturate and darken, multiply toward crimson, keep alpha.
      ctx.filter = 'saturate(0.3) brightness(0.8) contrast(1.15)';
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgb(255,72,52)';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(img, 0, 0);
    }
    return c.toDataURL('image/png');
  }, [dataUrl, mode]);
  const outPath = resolve(root, 'assets', out);
  mkdirSync(resolve(outPath, '..'), { recursive: true });
  writeFileSync(outPath, Buffer.from(result.split(',')[1], 'base64'));
  console.log(`${src} -> ${out}`);
}
await browser.close();
