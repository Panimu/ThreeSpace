# Reference material

## `fs2-campaign-reconstruction.md`

The clean-room reconstruction of the FreeSpace 2 single-player campaign that
the game's mission graph is built from: 41 campaign entries, 1,654 placed
ship/object records, the goal and event tables, wings, waypoints and
reinforcements. Briefing, debriefing and radio prose is **not** reproduced —
it is represented by string IDs, word counts and hashes — so this is an index
of structure, not a copy of the game. Original FreeSpace 2 game data remains
proprietary to Interplay and THQ Nordic and is not distributed here.

It is reference, not build input. The chain is:

```
docs/fs2-campaign-reconstruction.md      the record
  └─ scripts/build-campaign-source.py    distils it to the hulls we model
       └─ scripts/fs2-campaign-source.json   per-mission roster, names, IFF, goals
            └─ scripts/check-campaign.mjs    audits src/campaign.js against it
```

Re-run the middle step after editing the reconstruction:

```sh
python3 scripts/build-campaign-source.py
node scripts/check-campaign.mjs --verbose
```

`src/campaign.js` is written by hand — force composition follows the roster,
the briefing prose is ours — and the checker is what stops the two drifting
apart. A mission that departs from the roster on purpose carries a
`canonNote` explaining why.
