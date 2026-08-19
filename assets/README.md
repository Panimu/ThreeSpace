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
