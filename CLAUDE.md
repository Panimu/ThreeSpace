# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ThreeSpace is a top-down 2D spaceship game loosely inspired by FreeSpace 2, built with
Phaser 3 and Vite (plain JavaScript, no TypeScript).

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build

There is no test suite or linter yet.

## Architecture

- `src/main.js` boots Phaser (arcade physics, resizing canvas).
- The player commands **capital ships** (FS2-inspired pacing): throttle-based helm,
  slow turns, auto-engaging turrets, bow-aligned main battery. Progression plan:
  small capitals → larger hulls → multi-ship fleets.
- Scenes: `TitleScene` (menu, preloads all assets) → `SelectScene` (pick command +
  opposition) → `SandboxScene` (capital duel), plus `WikiScene` (ship registry) and
  `RefitScene` (wireframe hardpoint refitting; per-browser persistence via
  `src/refit.js`, which mutates the SHIPS catalog in place).
- `SandboxScene` is touch-first (iOS target): no keyboard bindings. The interface
  renders on a second camera parked at `UIX` (far outside the world) so pinch
  zoom never scales it — UI objects live at `x = UIX + screenX` and are anchored
  via `uiPlace()`. Gestures: helm pad steers, one finger pans, two fingers pinch
  (main camera zoom), FOCUS re-follows the player. Batteries fire automatically;
  an Energy Transfer System (WPN/ENG/REP pips from a shared pool) sets weapon
  tempo, speed/turn, and hull repair for the player only.
- `assets/derived/` holds faction recolors (gold-shift Vasudan, red-shift Shivan)
  baked by `scripts/recolor-factions.mjs` — re-run it after changing ship casts.
- `src/ships.js` is the ship catalog: stats, wiki copy, sprite reference, and
  **hardpoints** per hull. Add ships here, not in scenes. Hardpoints are mounts
  ({type, fitted, x, y} — hull-fraction coords, +y toward bow) with a fitted
  weapon from the `WEAPONS` table; combat fires from these positions and the
  wiki draws them as markers. Planned direction: a wireframe refit screen where
  the player re-fits hardpoints and other systems — build on this data, don't
  invent parallel structures.
- `src/manifest.js` is the asset manifest: **all** art/sound is resolved through it.
  Each image entry carries `angleOffset` (degrees to align the art with facing 0 = east)
  and `scale`. Never hardcode asset paths in scenes — add manifest entries.
- `assets/` is served as the Vite `publicDir`, so manifest URLs are paths relative to
  `assets/` (e.g. `space-shooter-redux/PNG/...`).
- Facing convention: entities store `facing` in radians (0 = east); `syncAngle()` applies
  the sprite's `angleOffset`. Use `facing` for thrust/aim math, never `sprite.rotation`.

## Asset licensing (important)

`assets/README.md` is the license inventory — keep it updated when adding assets.
Original FreeSpace 2 game data is proprietary and must never be committed;
personal local assets belong in `assets/local/` (gitignored).

## Asset status (2026-08, post-resprite)

The game now runs entirely on user-provided FS2-style sprite sheets
(`assets/sheets/`, indexed in `assets/sheets/INDEX.md`):
- `assets/ships/<faction>/*.png` — capital sprites sliced from the sheets
  (horizontal art: Terran/Shivan face left → `flip: true`, Vasudan face right).
- `assets/fx/*.png` — beam bodies, bolt cores, and the flak burst sliced from
  the ordnance sheet; `WEAPONS` entries reference them via `bolt`/`beamTex`.
- Backgrounds, glow orbs, and all audio are procedural (`src/fx.js`).
- Ship `length` (metres, from the sheets) drives display size sublinearly:
  `displayLength()` in `src/ships.js`.
- Hardpoints carry FS2 retail armament (real counts/types per hull).
Slicing scripts live in the session scratchpad history; re-slicing needs the
sheet + crop configs (see INDEX.md extraction notes).
