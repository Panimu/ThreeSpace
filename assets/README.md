# Assets

Purged (2026-08). All prior asset packs (Kenney Space Shooter Redux/Extension,
MillionthVector factions, Endless Sky ship library, and the derived faction
recolors baked from it) have been removed. New sprite sheets are pending.

Once new assets land: add them under `assets/<pack-name>/`, log the source and
license here in a table, and rewire `src/ships.js` / `src/manifest.js` to point
at the new files (both currently reference paths that no longer exist).

Note: original FreeSpace 2 game data (models, textures, sounds) is proprietary
(Interplay/THQ Nordic) and must not be added to this repository.

Personal local assets belong in `assets/local/` (gitignored, never committed).
