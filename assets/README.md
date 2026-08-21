# Assets

All prior third-party asset packs were purged (2026-08); see git history.

| Pack | Source | License |
|------|--------|---------|
| `sheets/` | User-provided FS2-style sprite sheets (fan-made art, uploaded 2026-08-19) | Project-internal; not from a third-party pack |

`sheets/INDEX.md` catalogs every sheet's contents. The sheets are labeled
reference plates; individual sprites get sliced into `assets/ships/` and
`assets/hardware/` before game use. `src/ships.js` / `src/manifest.js` still
point at pre-purge paths until the slicing pass rewires them.

Note: original FreeSpace 2 game data (models, textures, sounds) is proprietary
(Interplay/THQ Nordic) and must not be added to this repository.

Personal local assets belong in `assets/local/` (gitignored, never committed).

Sliced game-ready sprites:
- `ships/<faction>/` — capital ships cut from the capital sheets, plus all 42
  fighters/bombers cut from fighters-bombers.png (alpha-keyed).
- `ships/{terran,vasudan,shivan}/` also carry the support hulls cut from
  support-and-installations.png: AWACS, science ships, freighters, transports,
  gas miners, hospital ships, sentry guns and the Ganymede/Arcadia
  installations. They are catalogued in `src/ships.js` as `CIVILIANS`.
- `ships/ntf/` — the red-trim Neo-Terran Front named variants (Iceni,
  Belisarius, Repulse, Carthage, Glorious, Impervious) from the same sheet.
- `ships/other/` — the Knossos portal.
- `fx/` — beam bodies, bolt cores, flak burst cut from the ordnance sheet.

Campaign reference data lives in `scripts/fs2-campaign-source.json`: a
distilled per-mission roster (which hulls were present, their names, their
IFF, and the goal list) derived from a clean-room campaign reconstruction. It
is reference data, not game data — no retail assets, tables or mission files
are reproduced. `scripts/check-campaign.mjs` audits `src/campaign.js` against
it.
