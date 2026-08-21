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
- `fx/` — bolt cores and flak burst cut from the ordnance sheet, loaded at runtime. The sheet's beam_*.png slices stay here as reference art only — beams render as procedural gradients (src/ships.js), not stretched sheet art, because the samples are too short to stretch across a real beam range without visible seams.

Campaign reference material lives in `docs/` — see `docs/README.md`. The
clean-room reconstruction there is an index of campaign *structure* (rosters,
goals, events); briefing prose is represented by string IDs and hashes rather
than reproduced, and no retail assets, tables or mission files are included.
