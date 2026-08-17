// Refit state: which weapon is fitted on each hardpoint, persisted per browser.
// Mutates SHIPS[..].hardpoints[..].fitted in place so combat, wiki, and the
// refit screen all read one source of truth.
import { SHIPS, WEAPONS } from './ships.js';

const STORE_KEY = 'threespace-refit-v1';

export function loadRefits() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}');
    for (const [shipKey, fits] of Object.entries(saved)) {
      const ship = SHIPS[shipKey];
      if (!ship) continue;
      fits.forEach((weaponKey, i) => {
        const point = ship.hardpoints[i];
        if (point && WEAPONS[weaponKey]?.type === point.type) point.fitted = weaponKey;
      });
    }
  } catch { /* corrupted store — keep defaults */ }
}

export function saveRefits() {
  const out = {};
  for (const [shipKey, ship] of Object.entries(SHIPS)) {
    out[shipKey] = ship.hardpoints.map((point) => point.fitted);
  }
  localStorage.setItem(STORE_KEY, JSON.stringify(out));
}

// Cycle a mount through every weapon compatible with its type. Returns the new fit.
export function cycleFit(shipKey, index) {
  const point = SHIPS[shipKey].hardpoints[index];
  const options = Object.keys(WEAPONS).filter((w) => WEAPONS[w].type === point.type);
  point.fitted = options[(options.indexOf(point.fitted) + 1) % options.length];
  saveRefits();
  return point.fitted;
}
