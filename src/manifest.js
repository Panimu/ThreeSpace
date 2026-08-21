// Asset manifest: every ship sprite is resolved through this map. Backgrounds,
// bolts, beams, and sounds are all procedural now (src/fx.js) — the only files
// the game loads are the sliced ship sprites.
//
// To use your own art, drop files into assets/local/ (gitignored) and point an
// entry's url at 'local/whatever.png'.

import { SHIPS, STRIKECRAFT, CIVILIANS, displayLength, strikeDisplayLength } from './ships.js';

// In single-file builds, assets are embedded on window.__ASSETS__ by path.
export function resolveUrl(path) {
  return (typeof window !== 'undefined' && window.__ASSETS__?.[path]) || path;
}

// Art is horizontal: Terran/Shivan sprites face left (offset 180°), Vasudan
// face right (offset 0°). Scale maps the sprite's width to the hull's display
// length; SandboxScene fills in the real scale once the texture is loaded.
export const IMAGES = {};
for (const [key, ship] of Object.entries(SHIPS)) {
  IMAGES[`ship_${key}`] = {
    url: ship.url,
    angleOffset: ship.flip ? 180 : 0,
    targetLength: displayLength(ship.length),
  };
}
// Non-combatants share the capitals' art convention and scale curve.
for (const [key, ship] of Object.entries(CIVILIANS)) {
  IMAGES[`ship_${key}`] = {
    url: ship.url,
    angleOffset: ship.flip ? 180 : 0,
    targetLength: displayLength(ship.length),
  };
}
// Strike craft (fighters/bombers) all face right on the sheet — no flip.
for (const [key, craft] of Object.entries(STRIKECRAFT)) {
  IMAGES[`ship_${key}`] = {
    url: craft.url,
    angleOffset: 0,
    targetLength: strikeDisplayLength(craft.length),
  };
}

// Effect art sliced from the ordnance sheet (assets/fx/): beam bodies, bolt
// cores, and the flak burst. Referenced from WEAPONS via bolt/beamTex keys.
const FX = [
  'beam_sred', 'beam_lred', 'beam_bfred', 'beam_saaa', 'beam_sgreen',
  'beam_bgreen', 'beam_bfgreen', 'beam_lterslash', 'beam_terslash',
  'beam_vslash', 'beam_aaa', 'beam_svas', 'beam_bvas', 'beam_superlaser',
  'bolt_subach', 'bolt_terranhuge', 'bolt_vasudan', 'bolt_shivan',
  'bolt_mekhu', 'bolt_shivanlight', 'bolt_shivanheavy',
  'bolt_terranweak', 'bolt_shivanweak',
  'flak_burst',
];
for (const name of FX) IMAGES[`fx_${name}`] = { url: `fx/${name}.png`, angleOffset: 0 };

// Kept for build-script compatibility; all audio is synthesized in fx.js.
export const SOUNDS = {};
