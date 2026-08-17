// Builds a fully self-contained single-file HTML (dist/threespace.html): the game
// bundle inlined, every manifest asset embedded as a data URI. Suitable for hosts
// that block external requests. Run: node scripts/build-artifact.mjs
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';

const root = resolve(import.meta.dirname, '..');
execSync('npx vite build', { cwd: root, stdio: 'inherit' });

const distAssets = resolve(root, 'dist/assets');
const bundleFile = readdirSync(distAssets).find((f) => f.endsWith('.js'));
// Escape closing script tags so the bundle can live inside an inline <script>.
const bundle = readFileSync(resolve(distAssets, bundleFile), 'utf8').replaceAll('</script', '<\\/script');

const MIME = { '.png': 'image/png', '.ogg': 'audio/ogg', '.ttf': 'font/ttf' };
const { IMAGES, SOUNDS } = await import(resolve(root, 'src/manifest.js'));
const assets = {};
for (const def of [...Object.values(IMAGES), ...Object.values(SOUNDS)]) {
  const data = readFileSync(resolve(root, 'assets', def.url));
  assets[def.url] = `data:${MIME[extname(def.url)]};base64,${data.toString('base64')}`;
}

const html = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>ThreeSpace</title>
<style>
  html, body { margin: 0; padding: 0; background: #000 !important; height: 100%; overflow: hidden; }
  #game { width: 100%; height: 100dvh; touch-action: none; }
</style>
<div id="game"></div>
<script>window.__ASSETS__ = ${JSON.stringify(assets)};</script>
<script type="module">${bundle}</script>
`;

const out = resolve(root, 'dist/threespace.html');
writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1024 / 1024).toFixed(1)} MB)`);
