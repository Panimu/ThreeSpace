// Asset manifest: every sprite/sound the game uses is resolved through this map.
//
// To use your own art (e.g. sprites rendered from your own FreeSpace 2 install),
// drop files into assets/local/ (gitignored, never pushed) and point an entry's
// url at e.g. 'local/myfighter.png'. No code changes needed.
//
// angleOffset: degrees added to the entity's facing so the art points the right
// way (facing 0 = east). Art drawn pointing up needs 90, pointing left needs 180.

import { SHIPS } from './ships.js';

// In single-file builds (scripts/build-artifact.mjs), assets are embedded as data
// URIs on window.__ASSETS__ keyed by these same paths.
export function resolveUrl(path) {
  return (typeof window !== 'undefined' && window.__ASSETS__?.[path]) || path;
}

export const IMAGES = {
  laserPlayer:  { url: 'space-shooter-redux/PNG/Lasers/laserBlue01.png', angleOffset: 90, scale: 0.8 },
  laserEnemy:   { url: 'space-shooter-redux/PNG/Lasers/laserRed05.png', angleOffset: 90, scale: 0.8 },
  battery:      { url: 'space-shooter-redux/PNG/Lasers/laserBlue16.png', angleOffset: 90, scale: 1.4 },
  spark:        { url: 'space-shooter-redux/PNG/Effects/star1.png' },
  background:   { url: 'space-shooter-redux/Backgrounds/black.png' },
};

// Every catalog ship is loadable by its key (Endless Sky art faces up).
for (const [key, ship] of Object.entries(SHIPS)) {
  IMAGES[`ship_${key}`] = { url: ship.url, angleOffset: 90, scale: ship.scale ?? 1 };
}

export const SOUNDS = {
  laserPlayer: { url: 'space-shooter-redux/Bonus/sfx_laser1.ogg', volume: 0.25 },
  laserEnemy:  { url: 'space-shooter-redux/Bonus/sfx_laser2.ogg', volume: 0.15 },
  playerHit:   { url: 'space-shooter-redux/Bonus/sfx_shieldDown.ogg', volume: 0.5 },
  explosion:   { url: 'space-shooter-redux/Bonus/sfx_lose.ogg', volume: 0.5 },
  win:         { url: 'space-shooter-redux/Bonus/sfx_twoTone.ogg', volume: 0.6 },
  beam:        { url: 'space-shooter-redux/Bonus/sfx_zap.ogg', volume: 0.35 },
};
