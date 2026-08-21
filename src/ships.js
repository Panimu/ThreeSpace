// Ship catalog: FS2 hulls with sprites sliced from the reference sheets
// (assets/sheets/, see slicing in scripts history). Art faces LEFT for Terran
// and Shivan hulls (`flip: true` → angleOffset 180°) and RIGHT for Vasudan
// (angleOffset 0°); the length axis is the sprite's WIDTH.
//
// `length` is the hull length in metres as printed on the sheets. On-screen
// size is sublinear so a 6 km juggernaut fits a battle: display px =
// 2.2 × length^0.7 (see displayLength).
//
// Retail-sourced data (FreeSpace wiki ship/weapon database):
// - `speed` = retail max velocity (m/s × 2.2 → px/s).
// - `hull` = 4.2 × √(retail hitpoints) — sublinear so a 1,000,000-hp
//   juggernaut is killable in a sandbox round (Fenris 10k → 420 anchors it).
// - `hardpoints` mirror each hull's exact FS2 turret table (weapon types and
//   counts); retail missile turrets (FighterKiller/MX-52/Piranha/Cluster)
//   are modeled as anti-fighter missile batteries. Positions are estimated
//   from the sheet art. x = lateral hull fraction, y = fraction toward bow.
// - Retail publishes no capital rotation times, so `turn` (deg/s) and
//   `accel` are class-derived per hull to match canon handling.

// Weapon values follow retail weapons.tbl: recharge times stay near retail's
// gloriously slow figures (SGreen ~30 s, BGreen 30 s with a 4 s burn, BFRed
// 7 s burns) and damage is calibrated so pulses-to-kill against each weapon's
// intended prey matches retail — e.g. retail BGreen (26,400) kills a Ravana
// (100,000 hp) in ~4 pulses, and 1330 / 320 ≈ 4 here; a Sathanas BFRed salvo
// guts but doesn't one-shot a Colossus, exactly as in the game.
// `slash: true` beams rake across the hull (retail slash beams are
// TerSlash/LTerSlash/VSlash; SVas is a direct beam). `anti: true` mounts
// prefer strike-craft targets. `bolt`/`beamTex` reference ordnance-sheet art.
export const WEAPONS = {
  // ---- Terran ----
  terranTurret: { faction: 'GTVA', name: 'Terran turret', type: 'turret', damage: 10, range: 850, delay: 8500, speed: 420, bolt: 'fx_bolt_subach' },
  terranHuge:   { faction: 'GTVA', name: 'Heavy laser turret', type: 'turret', damage: 22, range: 1300, delay: 14000, speed: 280, bolt: 'fx_bolt_terranhuge' },
  fusionMortar: { faction: 'GTVA', name: 'Fusion mortar', type: 'turret', damage: 30, range: 1100, delay: 9000, speed: 250, bolt: 'fx_bolt_terranhuge' },
  standardFlak: { faction: 'GTVA', name: 'Standard flak', type: 'turret', damage: 5, range: 650, delay: 1600, speed: 380, bolt: 'fx_bolt_subach', burst: true, anti: true },
  longFlak:     { faction: 'GTVA', name: 'Long-range flak', type: 'turret', damage: 6, range: 900, delay: 2200, speed: 400, bolt: 'fx_bolt_subach', burst: true, anti: true },
  heavyFlak:    { faction: 'GTVA', name: 'Heavy flak', type: 'turret', damage: 9, range: 800, delay: 2800, speed: 380, bolt: 'fx_bolt_subach', burst: true, anti: true },
  fighterKiller:{ faction: 'GTVA', name: 'Fighter-killer missiles', type: 'turret', damage: 20, range: 950, delay: 9000, speed: 300, bolt: 'fx_bolt_terranweak', anti: true },
  aaaf:         { faction: 'GTVA', name: 'AAAf beam', type: 'turret', damage: 36, range: 950, delay: 7000, speed: 0, beam: true, anti: true, chargeMs: 600, holdMs: 1000, beamTex: 'fx_beam_aaa', beamWidth: 14 },
  terslash:     { faction: 'GTVA', name: 'TerSlash beam', type: 'turret', damage: 130, range: 1600, delay: 14000, speed: 0, beam: true, slash: true, chargeMs: 1400, holdMs: 2000, beamTex: 'fx_beam_terslash', beamWidth: 20 },
  lterslash:    { faction: 'GTVA', name: 'LTerSlash beam', type: 'spinal', damage: 80, range: 1600, delay: 12000, speed: 0, beam: true, slash: true, chargeMs: 1200, holdMs: 1800, beamTex: 'fx_beam_lterslash', beamWidth: 16 },
  sgreen:       { faction: 'GTVA', name: 'SGreen beam', type: 'spinal', damage: 110, range: 1600, delay: 30000, speed: 0, beam: true, chargeMs: 1800, holdMs: 2500, beamTex: 'fx_beam_sgreen', beamWidth: 18 },
  bgreen:       { faction: 'GTVA', name: 'BGreen beam', type: 'spinal', damage: 320, range: 1600, delay: 30000, speed: 0, beam: true, holdMs: 4000, beamTex: 'fx_beam_bgreen', beamWidth: 24 },
  bfgreen:      { faction: 'GTVA', name: 'BFGreen beam', type: 'spinal', damage: 480, range: 1700, delay: 35000, speed: 0, beam: true, holdMs: 4000, beamTex: 'fx_beam_bfgreen', beamWidth: 30 },
  // ---- Vasudan ----
  vasudanTurret:{ faction: 'Vasudan (allied)', name: 'Vasudan turret', type: 'turret', damage: 10, range: 850, delay: 8500, speed: 420, bolt: 'fx_bolt_vasudan' },
  svas:         { faction: 'Vasudan (allied)', name: 'SVas beam', type: 'turret', damage: 170, range: 1600, delay: 20000, speed: 0, beam: true, chargeMs: 1400, holdMs: 2500, beamTex: 'fx_beam_svas', beamWidth: 20 },
  vslash:       { faction: 'Vasudan (allied)', name: 'VSlash beam', type: 'turret', damage: 125, range: 1600, delay: 14000, speed: 0, beam: true, slash: true, chargeMs: 1400, holdMs: 2000, beamTex: 'fx_beam_vslash', beamWidth: 20 },
  bvas:         { faction: 'Vasudan (allied)', name: 'BVas beam', type: 'spinal', damage: 310, range: 1600, delay: 24000, speed: 0, beam: true, holdMs: 3700, beamTex: 'fx_beam_bvas', beamWidth: 24 },
  // ---- Shivan ----
  shivanTurret: { faction: 'Shivan', name: 'Shivan turret laser', type: 'turret', damage: 12, range: 800, delay: 8000, speed: 430, bolt: 'fx_bolt_shivan' },
  shivanHeavy:  { faction: 'Shivan', name: 'Shivan heavy laser', type: 'turret', damage: 20, range: 1000, delay: 12000, speed: 350, bolt: 'fx_bolt_shivanheavy' },
  shivanFlak:   { faction: 'Shivan', name: 'Shivan flak', type: 'turret', damage: 5, range: 650, delay: 1500, speed: 380, bolt: 'fx_bolt_shivan', burst: true, anti: true },
  shivanCluster:{ faction: 'Shivan', name: 'Shivan cluster missiles', type: 'turret', damage: 18, range: 900, delay: 8000, speed: 300, bolt: 'fx_bolt_shivanweak', anti: true },
  saaa:         { faction: 'Shivan', name: 'SAAA beam', type: 'turret', damage: 34, range: 950, delay: 7000, speed: 0, beam: true, anti: true, chargeMs: 600, holdMs: 1200, beamTex: 'fx_beam_saaa', beamWidth: 14 },
  sred:         { faction: 'Shivan', name: 'SRed beam', type: 'spinal', damage: 150, range: 1600, delay: 25000, speed: 0, beam: true, holdMs: 3800, beamTex: 'fx_beam_sred', beamWidth: 22 },
  lred:         { faction: 'Shivan', name: 'LRed beam', type: 'spinal', damage: 320, range: 1600, delay: 22000, speed: 0, beam: true, holdMs: 6000, beamTex: 'fx_beam_lred', beamWidth: 28 },
  bfred:        { faction: 'Shivan', name: 'BFRed beam', type: 'spinal', damage: 620, range: 2200, delay: 30000, speed: 0, beam: true, holdMs: 6000, beamTex: 'fx_beam_bfred', beamWidth: 32 },
  superlaser:   { faction: 'Shivan', name: 'Shivan super laser', type: 'spinal', damage: 480, range: 1900, delay: 32000, speed: 0, beam: true, holdMs: 5000, beamTex: 'fx_beam_superlaser', beamWidth: 30 },
};

const hp = (type, fitted, x, y) => ({ type, fitted, x, y });
const pair = (type, fitted, x, y) => [hp(type, fitted, x, y), hp(type, fitted, -x, y)];
// n mounts alternating port/starboard (with a slight lateral stagger),
// spaced evenly from y0 (bow-ward) to y1 (stern-ward).
const spread = (type, fitted, n, lat, y0, y1) => Array.from({ length: n }, (_, i) =>
  hp(type, fitted,
    (i % 2 === 0 ? 1 : -1) * lat * (1 - 0.25 * (Math.floor(i / 2) % 2)),
    y0 + (y1 - y0) * (n === 1 ? 0.5 : i / (n - 1))));

export function displayLength(metres) {
  return 2.2 * Math.pow(metres, 0.7);
}

export const SHIPS = {
  // ---- Terran (GTVA) ----
  fenris: {
    name: 'GTC Fenris', cls: 'Light cruiser', faction: 'GTVA', length: 260,
    url: 'ships/terran/fenris.png', flip: true,
    hull: 420, speed: 55, turn: 24, accel: 22, // retail: 20-25 m/s, 10,000 hp
    hardpoints: [ // retail: 5 laser, 1 fusion mortar, 2 AAAf, 1 LTerSlash (bow)
      hp('spinal', 'lterslash', 0, 0.42),
      ...spread('turret', 'terranTurret', 5, 0.16, 0.3, -0.35),
      hp('turret', 'fusionMortar', 0, -0.1),
      ...pair('turret', 'aaaf', 0.18, 0.1),
    ],
    desc: 'The patrol workhorse and a captain’s first capital command. A light slash beam on the bow, thin skin — keep the bow on the threat.',
    command: true,
  },
  leviathan: {
    name: 'GTC Leviathan', cls: 'Cruiser', faction: 'GTVA', length: 253,
    url: 'ships/terran/leviathan.png', flip: true,
    hull: 790, speed: 22, turn: 12, accel: 10, // retail: 10 m/s, 35,000 hp
    hardpoints: [ // retail: 3 laser, 1 fusion mortar, 4 AAAf, 1 SGreen (bow)
      hp('spinal', 'sgreen', 0, 0.42),
      ...spread('turret', 'terranTurret', 3, 0.16, 0.25, -0.3),
      hp('turret', 'fusionMortar', 0, -0.1),
      ...spread('turret', 'aaaf', 4, 0.18, 0.15, -0.2),
    ],
    desc: 'A Fenris that traded speed for armor. Holds a blockade line twice as long, arrives half as fast.',
    command: true,
  },
  aeolus: {
    name: 'GTC Aeolus', cls: 'Flak cruiser', faction: 'GTVA', length: 272,
    url: 'ships/terran/aeolus.png', flip: true,
    hull: 820, speed: 66, turn: 22, accel: 24, // retail: 30 m/s, 38,000 hp
    hardpoints: [ // retail: 2 heavy laser, 6 flak, 2 AAAf, 2 SGreen
      ...pair('spinal', 'sgreen', 0.06, 0.42),
      ...pair('turret', 'terranHuge', 0.12, 0.28),
      ...spread('turret', 'standardFlak', 6, 0.2, 0.2, -0.35),
      ...pair('turret', 'aaaf', 0.18, 0),
    ],
    desc: 'Six flak guns, AAA beams and twin SGreens — the Aeolus doesn’t duel, it denies the sky. Bombers hate it.',
    command: true,
  },
  deimos: {
    name: 'GTCv Deimos', cls: 'Corvette', faction: 'GTVA', length: 717,
    url: 'ships/terran/deimos.png', flip: true,
    hull: 1190, speed: 66, turn: 16, accel: 20, // retail: 30 m/s, 80,000 hp
    hardpoints: [ // retail: 6 laser, 4 heavy laser, 6 flak, 2 missile, 4 AAAf, 4 TerSlash
      ...spread('turret', 'terslash', 4, 0.16, 0.34, 0.1),
      ...spread('turret', 'terranHuge', 4, 0.12, 0.24, -0.05),
      ...spread('turret', 'terranTurret', 6, 0.14, 0.42, -0.4),
      ...spread('turret', 'standardFlak', 6, 0.19, 0.05, -0.3),
      ...pair('turret', 'fighterKiller', 0.1, -0.42),
      ...spread('turret', 'aaaf', 4, 0.17, 0.18, -0.15),
    ],
    desc: 'The escort backbone: twenty-six mounts over segmented armor, four slash beams on the shoulders. A Deimos on your flank is the line holding.',
    command: true,
  },
  orion: {
    name: 'GTD Orion', cls: 'Destroyer', faction: 'GTVA', length: 2100,
    url: 'ships/terran/orion.png', flip: true,
    hull: 1330, speed: 33, turn: 7, accel: 9, // retail: 15 m/s, 100,000 hp
    hardpoints: [ // retail: 3 BGreen, 3 TerSlash, 3 AAAf, 4 heavy laser, 3 laser
      ...spread('spinal', 'bgreen', 3, 0.06, 0.46, 0.38),
      ...spread('turret', 'terranHuge', 4, 0.13, 0.3, -0.1),
      ...spread('turret', 'terranTurret', 3, 0.11, 0.15, -0.4),
      ...spread('turret', 'aaaf', 3, 0.17, 0.2, -0.2),
      ...spread('turret', 'terslash', 3, 0.16, 0.32, 0),
    ],
    desc: 'FUTURE COMMAND — two kilometers of brick and a triple BGreen battery. Where an Orion parks, the front line is.',
    // FS2 canon: destroyer fighterbay, ~24-craft air group.
    hangar: [{ craft: 'myrmidon', wings: 2 }, { craft: 'hercules2', wings: 1 },
      { craft: 'medusa', wings: 2 }, { craft: 'ursa', wings: 1 }],
  },
  hecate: {
    name: 'GTD Hecate', cls: 'Destroyer', faction: 'GTVA', length: 2174,
    url: 'ships/terran/hecate.png', flip: true,
    hull: 1330, speed: 33, turn: 8, accel: 10, // retail: 15 m/s, 100,000 hp
    hardpoints: [ // retail: 1 BGreen, 4 TerSlash, 6 AAAf, 5 laser, 1 heavy, 6+2+2 flak
      hp('spinal', 'bgreen', 0, 0.46),
      hp('turret', 'terranHuge', 0, 0.3),
      ...spread('turret', 'terranTurret', 5, 0.12, 0.36, -0.42),
      ...spread('turret', 'standardFlak', 6, 0.18, 0.1, -0.32),
      ...pair('turret', 'longFlak', 0.14, -0.05),
      ...pair('turret', 'heavyFlak', 0.12, 0.2),
      ...spread('turret', 'aaaf', 6, 0.19, 0.25, -0.25),
      ...spread('turret', 'terslash', 4, 0.16, 0.34, 0.05),
    ],
    desc: 'FUTURE COMMAND — the Orion’s successor: lighter main battery, vast fighterbay, and the heaviest AAA screen in the fleet.',
    // FS2 canon: carries up to 150 craft — the largest air group modeled.
    hangar: [{ craft: 'myrmidon', wings: 3 }, { craft: 'perseus', wings: 2 },
      { craft: 'artemis', wings: 2 }, { craft: 'boanerges', wings: 1 }],
  },
  hades: {
    name: 'GTD Hades', cls: 'Superdestroyer', faction: 'GTVA', length: 3404,
    url: 'ships/terran/hades.png', flip: true,
    hull: 2660, speed: 33, turn: 6, accel: 8, // retail: 15 m/s, 400,000 hp (FS2)
    hardpoints: [ // retail: 16 Shivan-derived lasers, 2+2 missile, 2 BGreen
      ...pair('spinal', 'bgreen', 0.07, 0.44),
      ...spread('turret', 'shivanTurret', 16, 0.15, 0.4, -0.42),
      ...pair('turret', 'fighterKiller', 0.12, -0.2),
      ...pair('turret', 'shivanCluster', 0.1, 0.1),
    ],
    desc: 'FUTURE COMMAND — the rogue superdestroyer of the Great War, bristling with Shivan-derived turret lasers under a Terran keel.',
    hangar: [{ craft: 'hercules2', wings: 2 }, { craft: 'ulysses', wings: 1 },
      { craft: 'ursa', wings: 2 }, { craft: 'medusa', wings: 1 }],
  },
  colossus: {
    name: 'GTVA Colossus', cls: 'Juggernaut', faction: 'GTVA', length: 6000,
    url: 'ships/terran/colossus.png', flip: true,
    hull: 4200, speed: 55, turn: 5, accel: 7, // retail: 25 m/s, 1,000,000 hp
    hardpoints: [ // retail: 6 BGreen, 7 TerSlash, 10 AAAf, 10 heavy, 8 laser, 12 flak, 10 missile
      ...spread('spinal', 'bgreen', 6, 0.08, 0.46, 0.34),
      ...spread('turret', 'terranHuge', 10, 0.13, 0.4, -0.44),
      ...spread('turret', 'terranTurret', 8, 0.1, 0.3, -0.38),
      ...spread('turret', 'standardFlak', 12, 0.19, 0.25, -0.4),
      ...spread('turret', 'fighterKiller', 4, 0.12, 0, -0.3),
      ...spread('turret', 'aaaf', 10, 0.17, 0.3, -0.3),
      ...spread('turret', 'terslash', 7, 0.16, 0.36, -0.05),
    ],
    desc: 'FUTURE COMMAND — six kilometers, six BGreens, and sixty-three turrets. There is one of it.',
    // Canon: 60 fighter/bomber wings aboard; a representative fraction flies.
    hangar: [{ craft: 'myrmidon', wings: 3 }, { craft: 'perseus', wings: 2 },
      { craft: 'hercules2', wings: 1 }, { craft: 'artemis', wings: 2 }, { craft: 'boanerges', wings: 2 }],
  },

  // ---- Neo-Terran Front ----
  // Bosch's flagship. Retail publishes no separate hitpoint line for the Iceni,
  // so it is statted as a heavy corvette: Deimos guns on a tougher hull, fast
  // enough that the campaign's "you will not catch her" is true. Length and art
  // come from the support plate, which draws her nose-up as a command frigate.
  iceni: {
    name: 'NTF Iceni', cls: 'Command frigate', faction: 'NTF', length: 998,
    url: 'ships/ntf/iceni.png', flip: true,
    hull: 1320, speed: 68, turn: 11, accel: 11,
    hardpoints: [
      hp('spinal', 'terslash', 0, 0.44),
      ...spread('turret', 'terranHuge', 4, 0.15, 0.34, -0.3),
      ...spread('turret', 'terranTurret', 6, 0.17, 0.28, -0.38),
      ...spread('turret', 'standardFlak', 4, 0.2, 0.16, -0.24),
      ...spread('turret', 'aaaf', 4, 0.18, 0.22, -0.26),
    ],
    desc: 'Admiral Bosch rides this one. Faster than anything that can hurt it and better armed than anything that can catch it — which is the whole story of the rebellion.',
    hostile: true,
  },

  // ---- Vasudan (allied) ----
  aten: {
    name: 'GVC Aten', cls: 'Cruiser', faction: 'Vasudan (allied)', length: 230,
    url: 'ships/vasudan/aten.png', flip: false,
    hull: 560, speed: 55, turn: 20, accel: 18, // retail: 25 m/s, 18,000 hp
    hardpoints: [ // retail: 4 lasers, 2 AAAf — no beam at all
      ...pair('turret', 'vasudanTurret', 0.15, 0.2),
      ...pair('turret', 'vasudanTurret', 0.13, -0.15),
      ...pair('turret', 'aaaf', 0.16, 0.02),
    ],
    desc: 'A shell with guns, serving since the Great War. No beam, no bluster — and yet an Aten once held a jump node alone for six hours.',
  },
  mentu: {
    name: 'GVC Mentu', cls: 'Cruiser', faction: 'Vasudan (allied)', length: 322,
    url: 'ships/vasudan/mentu.png', flip: false,
    hull: 1030, speed: 77, turn: 24, accel: 26, // retail: 35 m/s (fastest capital), 60,000 hp
    hardpoints: [ // retail: 8 lasers, 2 heavy, 3 flak, 3 AAAf
      ...spread('turret', 'vasudanTurret', 8, 0.14, 0.35, -0.4),
      ...pair('turret', 'terranHuge', 0.1, 0.25),
      ...spread('turret', 'standardFlak', 3, 0.17, 0.05, -0.25),
      ...spread('turret', 'aaaf', 3, 0.16, 0.15, -0.1),
    ],
    desc: 'The Aten’s successor: segmented, scaled, and the fastest capital hull in either fleet. The carapace is armor; the elegance is free.',
  },
  sobek: {
    name: 'GVCv Sobek', cls: 'Corvette', faction: 'Vasudan (allied)', length: 608,
    url: 'ships/vasudan/sobek.png', flip: false,
    hull: 1190, speed: 66, turn: 15, accel: 20, // retail: 30 m/s, 80,000 hp
    hardpoints: [ // retail: 2 VSlash, 8 lasers, 3 heavy, 5 flak, 4 AAAf
      ...pair('turret', 'vslash', 0.15, 0.3),
      ...spread('turret', 'vasudanTurret', 8, 0.13, 0.4, -0.4),
      ...spread('turret', 'terranHuge', 3, 0.1, 0.2, -0.1),
      ...spread('turret', 'standardFlak', 5, 0.18, 0.1, -0.3),
      ...spread('turret', 'aaaf', 4, 0.16, 0.22, -0.18),
    ],
    desc: 'Swept curves over a killer’s frame, twin slash beams on the spine. The Sobek escorts like a crocodile floats — calmly, and then all at once.',
  },
  typhon: {
    name: 'GVD Typhon', cls: 'Destroyer', faction: 'Vasudan (allied)', length: 2153,
    url: 'ships/vasudan/typhon.png', flip: false,
    hull: 1460, speed: 33, turn: 6.5, accel: 8, // retail: 15 m/s, 120,000 hp
    hardpoints: [ // retail: 2 BVas, 2 heavy, 5 flak, 4 missile, 2 AAAf
      ...pair('spinal', 'bvas', 0.06, 0.44),
      ...pair('turret', 'terranHuge', 0.11, 0.25),
      ...spread('turret', 'standardFlak', 5, 0.16, 0.1, -0.3),
      ...spread('turret', 'fighterKiller', 4, 0.12, 0.05, -0.38),
      ...pair('turret', 'aaaf', 0.15, 0.15),
    ],
    desc: 'The temple-ship of the Great War, two kilometers of patience. Half the fleet’s admirals learned command on a Typhon deck.',
    // FS2 canon: two fighterbays.
    hangar: [{ craft: 'serapis', wings: 2 }, { craft: 'horus', wings: 1 },
      { craft: 'sekhmet', wings: 2 }, { craft: 'osiris', wings: 1 }],
  },
  hatshepsut: {
    name: 'GVD Hatshepsut', cls: 'Destroyer', faction: 'Vasudan (allied)', length: 2126,
    url: 'ships/vasudan/hatshepsut.png', flip: false,
    hull: 1540, speed: 33, turn: 8, accel: 9, // retail: 15 m/s, 135,000 hp
    hardpoints: [ // retail: 3 BVas, 1 SVas, 6 heavy, 11 flak, 5 mortar, 4 AAAf
      ...spread('spinal', 'bvas', 3, 0.09, 0.46, 0.4),
      hp('turret', 'svas', 0, 0.28),
      ...spread('turret', 'terranHuge', 6, 0.13, 0.32, -0.2),
      ...spread('turret', 'standardFlak', 11, 0.18, 0.2, -0.42),
      ...spread('turret', 'fusionMortar', 5, 0.11, 0.1, -0.35),
      ...spread('turret', 'aaaf', 4, 0.17, 0.25, -0.15),
    ],
    desc: 'The pharaoh’s flagship: three BVas cannons boresighted down the fork bow and a wall of flak behind them. The elegance is not decorative.',
    hangar: [{ craft: 'serapis', wings: 3 }, { craft: 'tauret', wings: 2 },
      { craft: 'sekhmet', wings: 2 }, { craft: 'bakha', wings: 1 }],
  },

  // ---- Shivan (hostile) ----
  cain: {
    name: 'SC Cain', cls: 'Cruiser', faction: 'Shivan', length: 190,
    url: 'ships/shivan/cain.png', flip: true,
    hull: 590, speed: 66, turn: 26, accel: 26, // retail: 30 m/s, 20,000 hp
    hardpoints: [ // retail: 1 SRed, 3 laser, 2 heavy laser, 2 missile, 1 SAAA
      hp('spinal', 'sred', 0, 0.42),
      ...spread('turret', 'shivanTurret', 3, 0.16, 0.25, -0.25),
      ...pair('turret', 'shivanHeavy', 0.12, 0.05),
      ...pair('turret', 'shivanCluster', 0.14, -0.35),
      hp('turret', 'saaa', 0, -0.05),
    ],
    desc: 'The first capital most pilots ever see burn — and the first that burns them. A skeletal spine with a claw for a bow.',
    hostile: true,
  },
  lilith: {
    name: 'SC Lilith', cls: 'Heavy cruiser', faction: 'Shivan', length: 190,
    url: 'ships/shivan/lilith.png', flip: true,
    hull: 1150, speed: 44, turn: 14, accel: 14, // retail: 20 m/s, 75,000 hp (3.75× the Cain)
    hardpoints: [ // retail: 1 LRed, 5 laser, 2 missile, 1 SAAA
      hp('spinal', 'lred', 0, 0.42),
      ...spread('turret', 'shivanTurret', 5, 0.16, 0.28, -0.3),
      ...pair('turret', 'shivanCluster', 0.14, -0.35),
      hp('turret', 'saaa', 0, -0.05),
    ],
    desc: 'A Cain hull with nearly four times the armor and one oversized beam. Doctrine is simple: do not be in front of it.',
    hostile: true,
  },
  rakshasa: {
    name: 'SC Rakshasa', cls: 'Cruiser', faction: 'Shivan', length: 349,
    url: 'ships/shivan/rakshasa.png', flip: true,
    hull: 840, speed: 44, turn: 18, accel: 16, // retail: 20 m/s, 40,000 hp
    hardpoints: [ // retail: 3 SRed, 8 laser, 2 heavy laser, 1 SAAA
      ...spread('spinal', 'sred', 3, 0.08, 0.42, 0.34),
      ...spread('turret', 'shivanTurret', 8, 0.14, 0.3, -0.38),
      ...pair('turret', 'shivanHeavy', 0.11, 0.1),
      hp('turret', 'saaa', 0, -0.1),
    ],
    desc: 'Second-generation Shivan cruiser: a triple SRed battery on a silhouette like something that stings.',
    hostile: true,
  },
  moloch: {
    name: 'SCv Moloch', cls: 'Corvette', faction: 'Shivan', length: 724,
    url: 'ships/shivan/moloch.png', flip: true,
    hull: 1190, speed: 66, turn: 17, accel: 20, // retail: 30 m/s, 80,000 hp
    hardpoints: [ // retail: 3 SRed, 5 laser, 3+1 flak, 3 missile — no AAA beams
      ...spread('spinal', 'sred', 3, 0.09, 0.42, 0.32),
      ...spread('turret', 'shivanTurret', 5, 0.14, 0.28, -0.35),
      ...spread('turret', 'shivanFlak', 3, 0.17, 0.1, -0.2),
      hp('turret', 'heavyFlak', 0, -0.05),
      ...spread('turret', 'shivanCluster', 3, 0.12, 0.05, -0.3),
    ],
    desc: 'Hunched and asymmetric, more grown than built, with well-sited flak in place of AAA beams. Shivan convoys stop being worth the trade.',
    hostile: true,
  },
  demon: {
    name: 'SD Demon', cls: 'Destroyer', faction: 'Shivan', length: 2139,
    url: 'ships/shivan/demon.png', flip: true,
    hull: 1680, speed: 44, turn: 8, accel: 10, // retail: 20 m/s, 160,000 hp
    hardpoints: [ // retail: 2 LRed, 1 SRed, 10 laser, 2 heavy, 5 missile, 4 flak, 2 SAAA
      ...pair('spinal', 'lred', 0.08, 0.42),
      hp('spinal', 'sred', 0, 0.3),
      ...spread('turret', 'shivanTurret', 10, 0.14, 0.35, -0.4),
      ...pair('turret', 'shivanHeavy', 0.11, 0.15),
      ...spread('turret', 'shivanCluster', 5, 0.13, 0.1, -0.35),
      ...spread('turret', 'shivanFlak', 4, 0.17, 0.05, -0.25),
      ...pair('turret', 'saaa', 0.15, 0.2),
    ],
    desc: 'Jagged black bulk around a fighterbay maw. Where a Demon arrives, the evacuation order has already come too late.',
    hostile: true,
    hangar: [{ craft: 'manticore', wings: 2 }, { craft: 'mara', wings: 1 },
      { craft: 'seraphim', wings: 2 }, { craft: 'nephilim', wings: 1 }],
  },
  ravana: {
    name: 'SD Ravana', cls: 'Destroyer', faction: 'Shivan', length: 2346,
    url: 'ships/shivan/ravana.png', flip: true,
    hull: 1330, speed: 44, turn: 9, accel: 11, // retail: 20 m/s, 100,000 hp
    hardpoints: [ // retail: 2 LRed + 2 SRed boresighted down the prongs, 17 laser, 5 flak, 3 missile, 2 SAAA
      ...pair('spinal', 'lred', 0.16, 0.44),
      ...pair('spinal', 'sred', 0.06, 0.32),
      ...spread('turret', 'shivanTurret', 17, 0.14, 0.38, -0.42),
      ...spread('turret', 'shivanFlak', 5, 0.17, 0.15, -0.3),
      ...pair('turret', 'shivanCluster', 0.12, -0.15),
      ...pair('turret', 'saaa', 0.15, 0.05),
    ],
    desc: 'Twin forward prongs with the main beams boresighted down them. The Ravana does not maneuver to fight; it points.',
    hostile: true,
    hangar: [{ craft: 'mara', wings: 2 }, { craft: 'basilisk', wings: 1 },
      { craft: 'seraphim', wings: 2 }, { craft: 'taurvi', wings: 2 }],
  },
  lucifer: {
    name: 'SD Lucifer', cls: 'Superdestroyer', faction: 'Shivan', length: 2777,
    url: 'ships/shivan/lucifer.png', flip: true,
    hull: 3760, speed: 33, turn: 6, accel: 8, // retail: 15 m/s, 800,000 hp
    hardpoints: [ // retail: 11 laser, 4 missile; main guns are the FS1 twin super lasers
      ...pair('spinal', 'superlaser', 0.06, 0.45),
      ...spread('turret', 'shivanTurret', 11, 0.13, 0.35, -0.42),
      ...spread('turret', 'shivanCluster', 4, 0.12, 0.1, -0.3),
    ],
    desc: 'The nightmare of the Great War, shielded against everything the Alliance had. Twin super lasers. Pilots still check their sensors twice.',
    hostile: true,
    hangar: [{ craft: 'mara', wings: 2 }, { craft: 'manticore', wings: 2 },
      { craft: 'seraphim', wings: 2 }, { craft: 'nephilim', wings: 2 }],
  },
  sathanas: {
    name: 'SJ Sathanas', cls: 'Juggernaut', faction: 'Shivan', length: 5978,
    url: 'ships/shivan/sathanas.png', flip: true,
    hull: 4200, speed: 55, turn: 5.5, accel: 7, // retail: 25 m/s, 1,000,000 hp
    hardpoints: [ // retail: 4 BFRed on the claws + 1 LRed, 22 laser, 13 flak, 5 missile, 8 SAAA
      ...pair('spinal', 'bfred', 0.14, 0.46),
      ...pair('spinal', 'bfred', 0.22, 0.4),
      hp('spinal', 'lred', 0, 0.34),
      ...spread('turret', 'shivanTurret', 22, 0.14, 0.32, -0.44),
      ...spread('turret', 'shivanFlak', 11, 0.18, 0.2, -0.4),
      ...pair('turret', 'heavyFlak', 0.1, 0),
      ...spread('turret', 'shivanCluster', 5, 0.12, 0.05, -0.35),
      ...spread('turret', 'saaa', 8, 0.16, 0.25, -0.28),
    ],
    desc: 'Four BFReds on clawed arms and fifty-odd turrets behind them — and there are more than eighty of it. The Colossus fought one. Once.',
    hostile: true,
    hangar: [{ craft: 'aeshma', wings: 2 }, { craft: 'mara', wings: 3 }, { craft: 'dragon', wings: 1 },
      { craft: 'seraphim', wings: 2 }, { craft: 'nahema', wings: 2 }],
  },
};

// ---- Strike craft --------------------------------------------------------
// Fighters and bombers sliced from the fighters-bombers sheet (all bows face
// right → no flip, angleOffset 0). They launch in wings of 4 from capital
// fighterbays (`hangar` above), fly themselves, and respond to the wing order
// set in SandboxScene. Speeds are retail velocity-range midpoints (× 2.2),
// hulls are retail hitpoints ÷ 12 (Shivan craft relied on shields in retail;
// without shields modeled they are fast but fragile — floor of 10). Bombs are
// Cyclops/Helios-class torpedoes at retail-proportional damage. Lengths are
// canon-flavored metres; on-screen size gets a readability floor.
export const STRIKECRAFT = {
  // Terran
  myrmidon:  { name: 'GTF Myrmidon', cls: 'Fighter', faction: 'GTVA', length: 15, url: 'ships/terran/myrmidon.png',
    speed: 187, turn: 150, hull: 24, gun: { damage: 4, range: 400, delay: 1500, speed: 560, bolt: 'fx_bolt_subach' } },
  perseus:   { name: 'GTF Perseus', cls: 'Interceptor', faction: 'GTVA', length: 17, url: 'ships/terran/perseus.png',
    speed: 198, turn: 160, hull: 22, gun: { damage: 4, range: 420, delay: 1950, speed: 580, bolt: 'fx_bolt_subach' } },
  hercules2: { name: 'GTF Hercules Mk II', cls: 'Assault fighter', faction: 'GTVA', length: 20, url: 'ships/terran/hercules2.png',
    speed: 132, turn: 105, hull: 23, gun: { damage: 6, range: 400, delay: 1750, speed: 540, bolt: 'fx_bolt_subach' } },
  ulysses:   { name: 'GTF Ulysses', cls: 'Fighter', faction: 'GTVA', length: 16, url: 'ships/terran/ulysses.png',
    speed: 180, turn: 195, hull: 15, gun: { damage: 4, range: 380, delay: 1950, speed: 560, bolt: 'fx_bolt_subach' } },
  medusa:    { name: 'GTB Medusa', cls: 'Bomber', faction: 'GTVA', length: 24, url: 'ships/terran/medusa.png',
    speed: 127, turn: 85, hull: 29, gun: { damage: 4, range: 350, delay: 1800, speed: 520, bolt: 'fx_bolt_subach' },
    bomb: { damage: 130, range: 780, delay: 18000, speed: 250, bolt: 'fx_bolt_terranhuge' } },
  ursa:      { name: 'GTB Ursa', cls: 'Heavy bomber', faction: 'GTVA', length: 31, url: 'ships/terran/ursa.png',
    speed: 116, turn: 60, hull: 46, gun: { damage: 5, range: 350, delay: 1950, speed: 520, bolt: 'fx_bolt_subach' },
    bomb: { damage: 160, range: 820, delay: 22000, speed: 230, bolt: 'fx_bolt_terranhuge' } },
  artemis:   { name: 'GTB Artemis', cls: 'Bomber', faction: 'GTVA', length: 24, url: 'ships/terran/artemis.png',
    speed: 143, turn: 100, hull: 23, gun: { damage: 4, range: 360, delay: 1750, speed: 530, bolt: 'fx_bolt_subach' },
    bomb: { damage: 110, range: 760, delay: 16000, speed: 260, bolt: 'fx_bolt_terranhuge' } },
  boanerges: { name: 'GTB Boanerges', cls: 'Heavy bomber', faction: 'GTVA', length: 30, url: 'ships/terran/boanerges.png',
    speed: 132, turn: 80, hull: 27, gun: { damage: 4, range: 350, delay: 1800, speed: 520, bolt: 'fx_bolt_subach' },
    bomb: { damage: 150, range: 800, delay: 21000, speed: 240, bolt: 'fx_bolt_terranhuge' } },
  // Vasudan
  serapis:   { name: 'GVF Serapis', cls: 'Interceptor', faction: 'Vasudan (allied)', length: 15, url: 'ships/vasudan/serapis.png',
    speed: 168, turn: 185, hull: 18, gun: { damage: 4, range: 410, delay: 1950, speed: 570, bolt: 'fx_bolt_mekhu' } },
  horus:     { name: 'GVF Horus', cls: 'Fighter', faction: 'Vasudan (allied)', length: 14, url: 'ships/vasudan/horus.png',
    speed: 220, turn: 200, hull: 14, gun: { damage: 3, range: 380, delay: 1800, speed: 560, bolt: 'fx_bolt_mekhu' } },
  tauret:    { name: 'GVF Tauret', cls: 'Fighter', faction: 'Vasudan (allied)', length: 21, url: 'ships/vasudan/tauret.png',
    speed: 154, turn: 130, hull: 25, gun: { damage: 5, range: 400, delay: 1650, speed: 550, bolt: 'fx_bolt_mekhu' } },
  sekhmet:   { name: 'GVB Sekhmet', cls: 'Bomber', faction: 'Vasudan (allied)', length: 29, url: 'ships/vasudan/sekhmet.png',
    speed: 136, turn: 95, hull: 42, gun: { damage: 4, range: 360, delay: 1750, speed: 530, bolt: 'fx_bolt_mekhu' },
    bomb: { damage: 130, range: 800, delay: 19000, speed: 245, bolt: 'fx_bolt_vasudan' } },
  osiris:    { name: 'GVB Osiris', cls: 'Bomber', faction: 'Vasudan (allied)', length: 30, url: 'ships/vasudan/osiris.png',
    speed: 125, turn: 70, hull: 50, gun: { damage: 3, range: 340, delay: 1800, speed: 510, bolt: 'fx_bolt_mekhu' },
    bomb: { damage: 110, range: 760, delay: 18000, speed: 240, bolt: 'fx_bolt_vasudan' } },
  bakha:     { name: 'GVB Bakha', cls: 'Bomber', faction: 'Vasudan (allied)', length: 24, url: 'ships/vasudan/bakha.png',
    speed: 143, turn: 100, hull: 37, gun: { damage: 4, range: 360, delay: 1750, speed: 530, bolt: 'fx_bolt_mekhu' },
    bomb: { damage: 110, range: 780, delay: 17000, speed: 255, bolt: 'fx_bolt_vasudan' } },
  // Shivan
  mara:      { name: 'SF Mara', cls: 'Fighter', faction: 'Shivan', length: 17, url: 'ships/shivan/mara.png',
    speed: 163, turn: 165, hull: 17, gun: { damage: 4, range: 400, delay: 1950, speed: 570, bolt: 'fx_bolt_shivanlight' } },
  manticore: { name: 'SF Manticore', cls: 'Interceptor', faction: 'Shivan', length: 16, url: 'ships/shivan/manticore.png',
    speed: 228, turn: 190, hull: 10, gun: { damage: 3, range: 390, delay: 1800, speed: 580, bolt: 'fx_bolt_shivanlight' } },
  basilisk:  { name: 'SF Basilisk', cls: 'Assault fighter', faction: 'Shivan', length: 32, url: 'ships/shivan/basilisk.png',
    speed: 146, turn: 115, hull: 10, gun: { damage: 6, range: 410, delay: 1750, speed: 550, bolt: 'fx_bolt_shivanlight' } },
  dragon:    { name: 'SF Dragon', cls: 'Fighter', faction: 'Shivan', length: 18, url: 'ships/shivan/dragon.png',
    speed: 182, turn: 210, hull: 10, gun: { damage: 4, range: 400, delay: 1800, speed: 580, bolt: 'fx_bolt_shivanlight' } },
  aeshma:    { name: 'SF Aeshma', cls: 'Assault fighter', faction: 'Shivan', length: 26, url: 'ships/shivan/aeshma.png',
    speed: 150, turn: 125, hull: 10, gun: { damage: 5, range: 400, delay: 1650, speed: 550, bolt: 'fx_bolt_shivanlight' } },
  seraphim:  { name: 'SB Seraphim', cls: 'Heavy bomber', faction: 'Shivan', length: 42, url: 'ships/shivan/seraphim.png',
    speed: 165, turn: 75, hull: 42, gun: { damage: 4, range: 350, delay: 1800, speed: 520, bolt: 'fx_bolt_shivanlight' },
    bomb: { damage: 150, range: 800, delay: 21000, speed: 240, bolt: 'fx_bolt_shivanheavy' } },
  nephilim:  { name: 'SB Nephilim', cls: 'Bomber', faction: 'Shivan', length: 40, url: 'ships/shivan/nephilim.png',
    speed: 145, turn: 80, hull: 40, gun: { damage: 4, range: 350, delay: 1800, speed: 520, bolt: 'fx_bolt_shivanlight' },
    bomb: { damage: 130, range: 780, delay: 18000, speed: 245, bolt: 'fx_bolt_shivanheavy' } },
  taurvi:    { name: 'SB Taurvi', cls: 'Bomber', faction: 'Shivan', length: 33, url: 'ships/shivan/taurvi.png',
    speed: 151, turn: 85, hull: 50, gun: { damage: 4, range: 360, delay: 1750, speed: 530, bolt: 'fx_bolt_shivanlight' },
    bomb: { damage: 110, range: 770, delay: 17000, speed: 250, bolt: 'fx_bolt_shivanheavy' } },
  nahema:    { name: 'SB Nahema', cls: 'Bomber', faction: 'Shivan', length: 30, url: 'ships/shivan/nahema.png',
    speed: 178, turn: 110, hull: 25, gun: { damage: 4, range: 360, delay: 1750, speed: 530, bolt: 'fx_bolt_shivanlight' },
    bomb: { damage: 120, range: 780, delay: 17000, speed: 255, bolt: 'fx_bolt_shivanheavy' } },
};

// Non-combatants: the freighters, transports, science ships, gas miners and
// installations the FS2 campaign actually asks you to escort, defend or
// destroy. Sliced from support-and-installations.png; lengths are the sheet's
// printed figures. Most carry no weapons at all — `hardpoints: []` means every
// existing combat, damage and report path treats them as ships that cannot
// shoot back. Sentry guns are the exception: they are emplacements with one
// mount and `station: true`, so they never manoeuvre.
//
// Hulls are soft on purpose. A freighter dies to a few turret bursts, which is
// what makes a `protect` objective a real clock rather than a formality.
//
// Speeds are capped below the slowest warship in SHIPS (the Leviathan, 22), so
// a hull under orders always closes on a fleeing one. A freighter that could
// match a cruiser turns a raid into an unwinnable stern chase — which is
// exactly what happened before this cap existed.
export const CIVILIANS = {
  // ---- Terran / GTVA ----
  charybdis:   { name: 'GTVA Charybdis', cls: 'AWACS', faction: 'GTVA', length: 181,
    url: 'ships/terran/charybdis.png', flip: true, hull: 220, speed: 16, turn: 14, accel: 10, hardpoints: [],
    desc: 'Sees further than anything else in the fleet, which makes it the first thing worth killing.' },
  faustus:     { name: 'GTSC Faustus', cls: 'Science cruiser', faction: 'GTVA', length: 162,
    url: 'ships/terran/faustus.png', flip: true, hull: 200, speed: 16, turn: 12, accel: 9, hardpoints: [],
    desc: 'Survey and sensor research. Unarmed, and never where it is safe to be unarmed.' },
  chronos:     { name: 'GTFr Chronos', cls: 'Heavy freighter', faction: 'GTVA', length: 164,
    url: 'ships/terran/chronos.png', flip: true, hull: 180, speed: 16, turn: 10, accel: 7, hardpoints: [],
    desc: 'Civilian bulk hauler. Most of the tonnage moving through GTVA space is one of these.' },
  poseidon:    { name: 'GTFr Poseidon', cls: 'Freighter', faction: 'GTVA', length: 67,
    url: 'ships/terran/poseidon.png', flip: true, hull: 120, speed: 16, turn: 14, accel: 9, hardpoints: [],
    desc: 'Military freighter. Ammunition, spares and rations, moving at the speed of a target.' },
  triton:      { name: 'GTT Triton', cls: 'Heavy transport', faction: 'GTVA', length: 313,
    url: 'ships/terran/triton.png', flip: true, hull: 280, speed: 16, turn: 8, accel: 6, hardpoints: [],
    desc: 'Heavy freight transport. Slow, enormous, and full of things that cannot be replaced quickly.' },
  argo:        { name: 'GTT Argo', cls: 'Transport', faction: 'GTVA', length: 171,
    url: 'ships/terran/argo.png', flip: true, hull: 160, speed: 16, turn: 12, accel: 9, hardpoints: [],
    desc: 'Military transport — troops one way, wounded the other.' },
  elysium:     { name: 'GTT Elysium', cls: 'Personnel transport', faction: 'GTVA', length: 32,
    url: 'ships/terran/elysium.png', flip: true, hull: 70, speed: 16, turn: 22, accel: 16, hardpoints: [],
    desc: 'The evacuation shuttle. Every one you lose is counted in hundreds.' },
  zephyrus:    { name: 'GTG Zephyrus', cls: 'Gas miner', faction: 'GTVA', length: 250,
    url: 'ships/terran/zephyrus.png', flip: true, hull: 340, speed: 10, turn: 6, accel: 4, hardpoints: [],
    desc: 'Scoops fuel out of gas giants. Cannot run, cannot fight, cannot be replaced this decade.' },
  hippocrates: { name: 'GTM Hippocrates', cls: 'Medical frigate', faction: 'GTVA', length: 546,
    url: 'ships/terran/hippocrates.png', flip: true, hull: 420, speed: 16, turn: 7, accel: 5, hardpoints: [],
    desc: 'A hospital with engines. The red cross is not a targeting aid, whatever the Shivans think.' },
  hygeia:      { name: 'GTS Hygeia', cls: 'Support ship', faction: 'GTVA', length: 32,
    url: 'ships/terran/hygeia.png', flip: true, hull: 70, speed: 16, turn: 20, accel: 15, hardpoints: [],
    desc: 'Rearm and repair tender. Turns up when you are out of everything.' },
  ganymede:    { name: 'GTI Ganymede', cls: 'Construction/repair dock', faction: 'GTVA', length: 1348,
    url: 'ships/terran/ganymede.png', flip: true, hull: 1400, speed: 0, turn: 0, accel: 0,
    station: true, hardpoints: [],
    desc: 'Repair and resupply ring. Capitals go in wrecked and come out fighting — if it survives.' },
  arcadia:     { name: 'GTI Arcadia', cls: 'Installation', faction: 'GTVA', length: 3792,
    url: 'ships/terran/arcadia.png', flip: true, hull: 2600, speed: 0, turn: 0, accel: 0,
    station: true, hardpoints: [],
    desc: 'Four kilometres of station. Home to tens of thousands of people who cannot leave quickly.' },
  mjolnir:     { name: 'GTSG Mjolnir', cls: 'Sentry gun', faction: 'GTVA', length: 108,
    url: 'ships/terran/mjolnir.png', flip: true, hull: 260, speed: 0, turn: 0, accel: 0, station: true,
    hardpoints: [hp('turret', 'terranHuge', 0, 0)],
    desc: 'A beam emplacement bolted to nothing. Node defence on a budget.' },

  // ---- Vasudan ----
  setekh:      { name: 'GVA Setekh', cls: 'AWACS', faction: 'Vasudan (allied)', length: 190,
    url: 'ships/vasudan/setekh.png', flip: false, hull: 220, speed: 16, turn: 14, accel: 10, hardpoints: [],
    desc: 'The Vasudan answer to the Charybdis, and just as fragile.' },
  anuket:      { name: 'GVG Anuket', cls: 'Gas miner', faction: 'Vasudan (allied)', length: 347,
    url: 'ships/vasudan/anuket.png', flip: false, hull: 380, speed: 10, turn: 6, accel: 4, hardpoints: [],
    desc: 'A string of collection spheres on a spine. Vasudan fuel production, in one hull.' },
  satis:       { name: 'GVFr Satis', cls: 'Freighter', faction: 'Vasudan (allied)', length: 107,
    url: 'ships/vasudan/satis.png', flip: false, hull: 160, speed: 16, turn: 11, accel: 8, hardpoints: [],
    desc: 'The workhorse of Vasudan shipping. When a convoy is attacked, these are what is in it.' },
  maat:        { name: 'PVFr Ma\u2019at', cls: 'Freighter', faction: 'Vasudan (allied)', length: 56,
    url: 'ships/vasudan/maat.png', flip: false, hull: 110, speed: 16, turn: 14, accel: 9, hardpoints: [],
    desc: 'An older Parliamentary-pattern hull still in service, still hauling, still unarmed.' },
  isis:        { name: 'GVT Isis', cls: 'Transport', faction: 'Vasudan (allied)', length: 27,
    url: 'ships/vasudan/isis.png', flip: false, hull: 70, speed: 16, turn: 20, accel: 15, hardpoints: [],
    desc: 'Vasudan personnel transport. Small, quick off the mark, and full of people.' },
  bes:         { name: 'GVFr Bes', cls: 'Freighter', faction: 'Vasudan (allied)', length: 56,
    url: 'ships/vasudan/bes.png', flip: false, hull: 110, speed: 16, turn: 14, accel: 9, hardpoints: [],
    desc: 'Vasudan light freighter. Ubiquitous and unremarkable until one is yours to protect.' },
  nephthys:    { name: 'GVS Nephthys', cls: 'Support ship', faction: 'Vasudan (allied)', length: 34,
    url: 'ships/vasudan/nephthys.png', flip: false, hull: 70, speed: 16, turn: 20, accel: 15, hardpoints: [],
    desc: 'Rearm and repair tender, Vasudan pattern.' },
  ankh:        { name: 'GVSG Ankh', cls: 'Sentry gun', faction: 'Vasudan (allied)', length: 100,
    url: 'ships/vasudan/ankh.png', flip: false, hull: 240, speed: 0, turn: 0, accel: 0, station: true,
    hardpoints: [hp('turret', 'vasudanTurret', 0, 0)],
    desc: 'Vasudan emplacement gun. Cheap, patient, and sited where you will not see it first.' },

  // ---- Shivan ----
  azraeltr:    { name: 'ST Azrael', cls: 'Transport', faction: 'Shivan', length: 46,
    url: 'ships/shivan/azrael.png', flip: true, hull: 90, speed: 16, turn: 18, accel: 12, hardpoints: [],
    desc: 'Shivan transport. Whatever it is carrying, we have never recovered one intact.' },
  dis:         { name: 'SFr Dis', cls: 'Heavy freighter', faction: 'Shivan', length: 317,
    url: 'ships/shivan/dis.png', flip: true, hull: 300, speed: 14, turn: 7, accel: 5, hardpoints: [],
    desc: 'Three hundred metres of Shivan logistics. Proof that even they have a supply chain.' },
  mephisto:    { name: 'SFr Mephisto', cls: 'Freighter', faction: 'Shivan', length: 54,
    url: 'ships/shivan/mephisto.png', flip: true, hull: 120, speed: 16, turn: 14, accel: 9, hardpoints: [],
    desc: 'Light Shivan freighter, usually escorted far more heavily than its cargo can justify.' },
  asmodeus:    { name: 'SFr Asmodeus', cls: 'Freighter', faction: 'Shivan', length: 123,
    url: 'ships/shivan/asmodeus.png', flip: true, hull: 200, speed: 16, turn: 10, accel: 7, hardpoints: [],
    desc: 'Heavy Shivan hauler. Where one goes, a cruiser is not far behind.' },
  rahu:        { name: 'SSG Rahu', cls: 'Gas miner', faction: 'Shivan', length: 211,
    url: 'ships/shivan/rahu.png', flip: true, hull: 320, speed: 10, turn: 6, accel: 4, hardpoints: [],
    desc: 'Shivan gas mining rig. They need fuel too — which is the only useful thing we know about them.' },
  belial:      { name: 'SSG Belial', cls: 'Sentry gun', faction: 'Shivan', length: 22,
    url: 'ships/shivan/belial.png', flip: true, hull: 220, speed: 0, turn: 0, accel: 0, station: true,
    hardpoints: [hp('turret', 'shivanHeavy', 0, 0)],
    desc: 'Shivan emplacement. Small, hot, and sited in threes.' },
  trident:     { name: 'SSG Trident', cls: 'Sentry gun', faction: 'Shivan', length: 11,
    url: 'ships/shivan/trident.png', flip: true, hull: 180, speed: 0, turn: 0, accel: 0, station: true,
    hardpoints: [hp('turret', 'shivanTurret', 0, 0)],
    desc: 'The smaller Shivan sentry. You will find them by being shot by them.' },
  sac3:        { name: 'SAC 3', cls: 'Cargo container', faction: 'Shivan', length: 243,
    url: 'ships/shivan/sac3.png', flip: true, hull: 90, speed: 0, turn: 0, accel: 0,
    station: true, hardpoints: [],
    desc: 'Shivan cargo container. Scanning one is worth more than destroying ten.' },
  commnode:    { name: 'Shivan Comm Node', cls: 'Relay', faction: 'Shivan', length: 748,
    url: 'ships/shivan/commnode.png', flip: true, hull: 700, speed: 0, turn: 0, accel: 0,
    station: true, hardpoints: [],
    desc: 'How they talk to each other. Killing one blinds a fleet for as long as it takes them to rebuild it.' },

  // ---- Neo-Terran Front ----
  boadicea:    { name: 'NTF Boadicea', cls: 'Asteroid installation', faction: 'NTF', length: 982,
    url: 'ships/ntf/boadicea.png', flip: true, hull: 1500, speed: 0, turn: 0, accel: 0,
    station: true, hardpoints: [],
    desc: 'A rebel forward base hollowed out of a rock. It cannot move, which is the only good news.' },

  // ---- Other ----
  knossos:     { name: 'Knossos Portal', cls: 'Jump node portal', faction: 'Unknown', length: 659,
    url: 'ships/other/knossos.png', flip: true, hull: 3000, speed: 0, turn: 0, accel: 0,
    station: true, hardpoints: [],
    desc: 'Older than the Shivans, older than us. It opens a door in space, and it does not explain itself.' },
};

// Specs come from two tables now — combat hulls and non-combatants — but every
// consumer wants one lookup.
export function shipSpec(key) {
  return SHIPS[key] ?? CIVILIANS[key] ?? null;
}

// Fighters get a readability floor: canon-proportional above ~16 px.
export function strikeDisplayLength(metres) {
  return Math.max(16, 3.0 * Math.pow(metres, 0.6));
}

// Wiki/refit helper: "1× Railgun · 2× Laser turret"
export function armamentSummary(ship) {
  const counts = {};
  for (const point of ship.hardpoints) counts[point.fitted] = (counts[point.fitted] ?? 0) + 1;
  return Object.entries(counts).map(([w, n]) => `${n}× ${WEAPONS[w].name}`).join(' · ');
}

// Wiki helper: "2× GTF Myrmidon wing · 1× GTB Medusa wing" (wings of 4).
export function complementSummary(ship) {
  if (!ship.hangar?.length) return null;
  return ship.hangar.map(({ craft, wings }) => `${wings}× ${STRIKECRAFT[craft].name} wing`).join(' · ');
}
