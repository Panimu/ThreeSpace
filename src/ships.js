// Ship catalog: FS2 hulls with sprites sliced from the reference sheets
// (assets/sheets/, see slicing in scripts history). Art faces LEFT for Terran
// and Shivan hulls (`flip: true` → angleOffset 180°) and RIGHT for Vasudan
// (angleOffset 0°); the length axis is the sprite's WIDTH.
//
// `length` is the hull length in metres as printed on the sheets. On-screen
// size is sublinear so a 6 km juggernaut fits a battle: display px =
// 2.2 × length^0.7 (see displayLength).
//
// Hardpoints use FS2 retail armament: real turret counts and weapon types per
// hull (approximated from the retail tables where exact counts are disputed;
// Colossus/Sathanas model their signature battery plus a representative
// fraction of their dozens of secondary mounts). Positions are estimated from
// the sheet art. x = lateral hull fraction, y = fraction toward the bow.

// `bolt` and `beamTex` reference sprites sliced from the ordnance sheet
// (assets/fx/, see slice-fx script) — the game's projectiles and beams are the
// sheet's actual effect art. `beamWidth` is the on-screen beam thickness.
export const WEAPONS = {
  // Terran
  terranTurret: { name: 'Terran turret', type: 'turret', damage: 12, range: 850, delay: 2600, speed: 420, bolt: 'fx_bolt_subach' },
  terranHuge:   { name: 'Terran huge turret', type: 'spinal', damage: 60, range: 1100, delay: 5200, speed: 500, bolt: 'fx_bolt_terranhuge' },
  standardFlak: { name: 'Standard flak', type: 'turret', damage: 5, range: 500, delay: 900, speed: 380, bolt: 'fx_bolt_subach', burst: true },
  longFlak:     { name: 'Long-range flak', type: 'turret', damage: 6, range: 720, delay: 1100, speed: 400, bolt: 'fx_bolt_subach', burst: true },
  aaaf:         { name: 'AAAf beam', type: 'turret', damage: 40, range: 900, delay: 5000, speed: 0, beam: true, chargeMs: 250, holdMs: 700, beamTex: 'fx_beam_aaa', beamWidth: 14 },
  lterslash:    { name: 'LTerSlash beam', type: 'turret', damage: 120, range: 1200, delay: 8000, speed: 0, beam: true, chargeMs: 450, holdMs: 1600, beamTex: 'fx_beam_lterslash', beamWidth: 18 },
  bgreen:       { name: 'BGreen beam', type: 'spinal', damage: 280, range: 1600, delay: 9000, speed: 0, beam: true, beamTex: 'fx_beam_bgreen', beamWidth: 24 },
  bfgreen:      { name: 'BFGreen beam', type: 'spinal', damage: 460, range: 1800, delay: 12000, speed: 0, beam: true, beamTex: 'fx_beam_bfgreen', beamWidth: 30 },
  // Vasudan
  vasudanTurret:{ name: 'Vasudan turret', type: 'turret', damage: 12, range: 850, delay: 2600, speed: 420, bolt: 'fx_bolt_vasudan' },
  svas:         { name: 'SVas beam', type: 'turret', damage: 90, range: 1100, delay: 7000, speed: 0, beam: true, chargeMs: 450, holdMs: 1500, beamTex: 'fx_beam_svas', beamWidth: 20 },
  bvas:         { name: 'BVas beam', type: 'spinal', damage: 260, range: 1500, delay: 9000, speed: 0, beam: true, beamTex: 'fx_beam_bvas', beamWidth: 24 },
  // Shivan
  shivanTurret: { name: 'Shivan turret', type: 'turret', damage: 13, range: 850, delay: 2500, speed: 430, bolt: 'fx_bolt_shivan' },
  shivanFlak:   { name: 'Shivan flak', type: 'turret', damage: 5, range: 500, delay: 850, speed: 380, bolt: 'fx_bolt_shivan', burst: true },
  saaa:         { name: 'SAAA beam', type: 'turret', damage: 45, range: 900, delay: 5000, speed: 0, beam: true, chargeMs: 250, holdMs: 700, beamTex: 'fx_beam_saaa', beamWidth: 14 },
  sred:         { name: 'SRed beam', type: 'spinal', damage: 250, range: 1500, delay: 9000, speed: 0, beam: true, beamTex: 'fx_beam_sred', beamWidth: 22 },
  lred:         { name: 'LRed beam', type: 'spinal', damage: 380, range: 1700, delay: 11000, speed: 0, beam: true, beamTex: 'fx_beam_lred', beamWidth: 28 },
  bfred:        { name: 'BFRed beam', type: 'spinal', damage: 560, range: 1900, delay: 13000, speed: 0, beam: true, beamTex: 'fx_beam_bfred', beamWidth: 32 },
};

const hp = (type, fitted, x, y) => ({ type, fitted, x, y });
const pair = (type, fitted, x, y) => [hp(type, fitted, x, y), hp(type, fitted, -x, y)];

export function displayLength(metres) {
  return 2.2 * Math.pow(metres, 0.7);
}

export const SHIPS = {
  // ---- Terran (GTVA) ----
  fenris: {
    name: 'GTC Fenris', cls: 'Light cruiser', faction: 'GTVA', length: 260,
    url: 'ships/terran/fenris.png', flip: true,
    hull: 420, speed: 62, turn: 24, accel: 24,
    hardpoints: [ // FS2 retail: 3 turrets
      hp('spinal', 'terranHuge', 0, 0.4),
      hp('turret', 'terranTurret', 0.2, 0.05),
      hp('turret', 'terranTurret', -0.2, -0.25),
    ],
    desc: 'The patrol workhorse and a captain’s first capital command. Three mounts, thin skin — keep the bow on the threat.',
    command: true,
  },
  leviathan: {
    name: 'GTC Leviathan', cls: 'Cruiser', faction: 'GTVA', length: 253,
    url: 'ships/terran/leviathan.png', flip: true,
    hull: 650, speed: 50, turn: 18, accel: 18,
    hardpoints: [ // Fenris hull, one more turret, heavier plate
      hp('spinal', 'terranHuge', 0, 0.4),
      hp('turret', 'terranTurret', 0.2, 0.05),
      hp('turret', 'terranTurret', -0.2, -0.25),
      hp('turret', 'terranTurret', 0, -0.4),
    ],
    desc: 'A Fenris that traded speed for armor. Holds a blockade line twice as long, arrives half as fast.',
    command: true,
  },
  aeolus: {
    name: 'GTC Aeolus', cls: 'Flak cruiser', faction: 'GTVA', length: 272,
    url: 'ships/terran/aeolus.png', flip: true,
    hull: 560, speed: 53, turn: 21, accel: 20,
    hardpoints: [ // FS2 retail: 8 turrets, AAA-heavy — no main battery at all
      ...pair('turret', 'aaaf', 0.22, 0.18),
      ...pair('turret', 'standardFlak', 0.22, -0.12),
      hp('turret', 'longFlak', 0, -0.35),
      hp('turret', 'terranTurret', 0, 0.4),
      ...pair('turret', 'terranTurret', 0.14, 0.02),
    ],
    desc: 'Eight turrets of pure air-defense and no main gun — the Aeolus doesn’t duel, it denies the sky. Bombers hate it.',
    command: true,
  },
  deimos: {
    name: 'GTCv Deimos', cls: 'Corvette', faction: 'GTVA', length: 717,
    url: 'ships/terran/deimos.png', flip: true,
    hull: 800, speed: 47, turn: 17, accel: 17,
    hardpoints: [ // FS2 retail: 13 turrets incl. 2 slash beams
      ...pair('turret', 'lterslash', 0.16, 0.32),
      ...pair('turret', 'aaaf', 0.18, 0.08),
      ...pair('turret', 'standardFlak', 0.18, -0.15),
      hp('turret', 'longFlak', 0, -0.02),
      ...pair('turret', 'terranTurret', 0.1, 0.2),
      ...pair('turret', 'terranTurret', 0.1, -0.32),
      hp('turret', 'terranTurret', 0, 0.44),
    ],
    desc: 'The escort backbone: thirteen mounts over segmented armor, slash beams on the shoulders. A Deimos on your flank is the line holding.',
    command: true,
  },
  orion: {
    name: 'GTD Orion', cls: 'Destroyer', faction: 'GTVA', length: 2100,
    url: 'ships/terran/orion.png', flip: true,
    hull: 1600, speed: 34, turn: 10, accel: 11,
    hardpoints: [ // FS2 retail: 14 turrets incl. heavy beam battery
      ...pair('spinal', 'bgreen', 0.06, 0.44),
      ...pair('turret', 'lterslash', 0.16, 0.2),
      ...pair('turret', 'aaaf', 0.18, -0.05),
      ...pair('turret', 'standardFlak', 0.16, -0.3),
      hp('turret', 'longFlak', 0, 0.05),
      ...pair('turret', 'terranTurret', 0.1, 0.32),
      ...pair('turret', 'terranTurret', 0.1, -0.18),
      hp('turret', 'terranTurret', 0, -0.42),
    ],
    desc: 'FUTURE COMMAND — two kilometers of brick and BGreen. Where an Orion parks, the front line is.',
  },
  hecate: {
    name: 'GTD Hecate', cls: 'Destroyer', faction: 'GTVA', length: 2174,
    url: 'ships/terran/hecate.png', flip: true,
    hull: 1400, speed: 37, turn: 11, accel: 12,
    hardpoints: [ // FS2 retail: 18 turrets, AAA-heavy command ship
      ...pair('spinal', 'bgreen', 0.06, 0.44),
      ...pair('turret', 'lterslash', 0.16, 0.25),
      ...pair('turret', 'aaaf', 0.2, 0.1), ...pair('turret', 'aaaf', 0.2, -0.12),
      ...pair('turret', 'standardFlak', 0.16, -0.3), ...pair('turret', 'longFlak', 0.1, 0.02),
      ...pair('turret', 'terranTurret', 0.12, 0.34),
      ...pair('turret', 'terranTurret', 0.12, -0.2),
      hp('turret', 'terranTurret', 0, -0.44), hp('turret', 'terranTurret', 0, 0.16),
    ],
    desc: 'FUTURE COMMAND — the Orion’s successor: lighter broadside, vast fighterbay, and the heaviest AAA screen in the fleet.',
  },
  hades: {
    name: 'GTD Hades', cls: 'Superdestroyer', faction: 'GTVA', length: 3404,
    url: 'ships/terran/hades.png', flip: true,
    hull: 2000, speed: 30, turn: 7, accel: 9,
    hardpoints: [ // FS1-era hull, FS2-style refit: 16 mounts
      hp('spinal', 'bgreen', 0, 0.46), ...pair('spinal', 'bgreen', 0.08, 0.38),
      ...pair('turret', 'aaaf', 0.18, 0.15), hp('turret', 'aaaf', 0, 0.05),
      ...pair('turret', 'standardFlak', 0.18, -0.1), ...pair('turret', 'longFlak', 0.12, -0.28),
      ...pair('turret', 'terranTurret', 0.12, 0.26),
      ...pair('turret', 'terranTurret', 0.1, -0.4), hp('turret', 'terranTurret', 0, -0.18),
    ],
    desc: 'FUTURE COMMAND — the rogue superdestroyer of the Great War, rebuilt on the sheet at 3.4 km. Three-beam bow array.',
  },
  colossus: {
    name: 'GTVA Colossus', cls: 'Juggernaut', faction: 'GTVA', length: 6000,
    url: 'ships/terran/colossus.png', flip: true,
    hull: 3000, speed: 28, turn: 6, accel: 7,
    hardpoints: [ // Canon carries dozens of turrets; signature BFGreen battery + representative screen modeled
      ...pair('spinal', 'bfgreen', 0.05, 0.46), ...pair('spinal', 'bfgreen', 0.12, 0.4),
      ...pair('turret', 'lterslash', 0.16, 0.28), ...pair('turret', 'lterslash', 0.16, -0.05),
      ...pair('turret', 'aaaf', 0.18, 0.14), ...pair('turret', 'aaaf', 0.18, -0.22),
      ...pair('turret', 'standardFlak', 0.14, 0.04), ...pair('turret', 'longFlak', 0.12, -0.35),
      ...pair('turret', 'terranTurret', 0.1, 0.34), ...pair('turret', 'terranTurret', 0.1, -0.44),
    ],
    desc: 'FUTURE COMMAND — six kilometers, four BFGreens, and a secondary battery too long to list. There is one of it.',
  },

  // ---- Vasudan (allied) ----
  aten: {
    name: 'GVC Aten', cls: 'Cruiser', faction: 'Vasudan (allied)', length: 230,
    url: 'ships/vasudan/aten.png', flip: false,
    hull: 380, speed: 56, turn: 21, accel: 22,
    hardpoints: [ // FS2 retail: 4 turrets
      hp('turret', 'svas', 0, 0.3),
      hp('turret', 'standardFlak', 0, -0.1),
      ...pair('turret', 'vasudanTurret', 0.18, 0.05),
    ],
    desc: 'A shell with guns, serving since the Great War. Terran pilots joke about the Aten until one holds a jump node alone for six hours.',
  },
  mentu: {
    name: 'GVC Mentu', cls: 'Cruiser', faction: 'Vasudan (allied)', length: 322,
    url: 'ships/vasudan/mentu.png', flip: false,
    hull: 500, speed: 55, turn: 20, accel: 20,
    hardpoints: [ // FS2 retail: 6 turrets
      ...pair('turret', 'svas', 0.12, 0.28),
      hp('turret', 'standardFlak', 0, -0.05),
      ...pair('turret', 'vasudanTurret', 0.18, 0.02),
      hp('turret', 'vasudanTurret', 0, -0.35),
    ],
    desc: 'The Aten’s successor: segmented, scaled, and twice the ship. The carapace is armor; the elegance is free.',
  },
  sobek: {
    name: 'GVCv Sobek', cls: 'Corvette', faction: 'Vasudan (allied)', length: 608,
    url: 'ships/vasudan/sobek.png', flip: false,
    hull: 820, speed: 45, turn: 16, accel: 16,
    hardpoints: [ // FS2 retail: 11 turrets
      hp('spinal', 'bvas', 0, 0.42),
      ...pair('turret', 'svas', 0.14, 0.25),
      ...pair('turret', 'aaaf', 0.18, 0.05),
      ...pair('turret', 'standardFlak', 0.16, -0.18),
      ...pair('turret', 'vasudanTurret', 0.1, -0.35),
      ...pair('turret', 'vasudanTurret', 0.12, 0.12),
    ],
    desc: 'Swept curves over a killer’s frame. The Sobek escorts like a crocodile floats — calmly, and then all at once.',
  },
  typhon: {
    name: 'GVD Typhon', cls: 'Destroyer', faction: 'Vasudan (allied)', length: 2153,
    url: 'ships/vasudan/typhon.png', flip: false,
    hull: 1500, speed: 31, turn: 8, accel: 10,
    hardpoints: [ // FS2 retail: 9 turrets on the ancient hull
      ...pair('spinal', 'bvas', 0.06, 0.44),
      hp('turret', 'svas', 0, 0.25),
      ...pair('turret', 'aaaf', 0.14, 0.05),
      ...pair('turret', 'vasudanTurret', 0.1, -0.15),
      ...pair('turret', 'vasudanTurret', 0.08, -0.38),
    ],
    desc: 'The temple-ship of the Great War, two kilometers of patience. Half the fleet’s admirals learned command on a Typhon deck.',
  },
  hatshepsut: {
    name: 'GVD Hatshepsut', cls: 'Destroyer', faction: 'Vasudan (allied)', length: 2126,
    url: 'ships/vasudan/hatshepsut.png', flip: false,
    hull: 1550, speed: 34, turn: 9, accel: 11,
    hardpoints: [ // FS2 retail: 15 turrets, heavy forward beam array in the fork bow
      ...pair('spinal', 'bvas', 0.1, 0.44), hp('spinal', 'bvas', 0, 0.2),
      ...pair('turret', 'svas', 0.16, 0.28),
      ...pair('turret', 'aaaf', 0.18, 0.02),
      ...pair('turret', 'standardFlak', 0.16, -0.2),
      ...pair('turret', 'vasudanTurret', 0.1, 0.1),
      ...pair('turret', 'vasudanTurret', 0.1, -0.35), hp('turret', 'vasudanTurret', 0, -0.44),
    ],
    desc: 'The pharaoh’s flagship: three BVas cannons boresighted down the fork bow. The elegance is not decorative.',
  },

  // ---- Shivan (hostile) ----
  cain: {
    name: 'SC Cain', cls: 'Cruiser', faction: 'Shivan', length: 190,
    url: 'ships/shivan/cain.png', flip: true,
    hull: 400, speed: 60, turn: 22, accel: 23,
    hardpoints: [ // FS2 retail: 4 turrets
      hp('spinal', 'sred', 0, 0.4),
      hp('turret', 'shivanTurret', 0.2, 0.05),
      hp('turret', 'shivanTurret', -0.2, -0.15),
      hp('turret', 'shivanTurret', 0, -0.38),
    ],
    desc: 'The first capital most pilots ever see burn — and the first that burns them. A skeletal spine with a claw for a bow.',
    hostile: true,
  },
  lilith: {
    name: 'SC Lilith', cls: 'Heavy cruiser', faction: 'Shivan', length: 190,
    url: 'ships/shivan/lilith.png', flip: true,
    hull: 550, speed: 48, turn: 17, accel: 17,
    hardpoints: [ // Cain hull, LRed in place of the SRed
      hp('spinal', 'lred', 0, 0.4),
      hp('turret', 'shivanTurret', 0.2, 0.05),
      hp('turret', 'shivanTurret', -0.2, -0.15),
      hp('turret', 'shivanTurret', 0, -0.38),
    ],
    desc: 'A Cain that traded everything for one oversized beam. Doctrine is simple: do not be in front of it.',
    hostile: true,
  },
  rakshasa: {
    name: 'SC Rakshasa', cls: 'Cruiser', faction: 'Shivan', length: 349,
    url: 'ships/shivan/rakshasa.png', flip: true,
    hull: 480, speed: 54, turn: 20, accel: 20,
    hardpoints: [ // FS2 retail: 8 turrets, twin forward beams
      ...pair('spinal', 'sred', 0.1, 0.4),
      ...pair('turret', 'saaa', 0.16, 0.05),
      ...pair('turret', 'shivanTurret', 0.14, -0.2),
      ...pair('turret', 'shivanTurret', 0.1, 0.2),
    ],
    desc: 'Second-generation Shivan cruiser: heavier guns, thicker hide, and a silhouette like something that stings.',
    hostile: true,
  },
  moloch: {
    name: 'SCv Moloch', cls: 'Corvette', faction: 'Shivan', length: 724,
    url: 'ships/shivan/moloch.png', flip: true,
    hull: 750, speed: 44, turn: 15, accel: 16,
    hardpoints: [ // FS2 retail: 11 turrets
      hp('spinal', 'lred', 0, 0.42), ...pair('spinal', 'sred', 0.12, 0.34),
      ...pair('turret', 'saaa', 0.16, 0.08),
      ...pair('turret', 'shivanFlak', 0.16, -0.15),
      ...pair('turret', 'shivanTurret', 0.1, -0.32),
      ...pair('turret', 'shivanTurret', 0.12, 0.2),
    ],
    desc: 'Hunched and asymmetric, more grown than built. The escort that makes Shivan convoys not worth the trade.',
    hostile: true,
  },
  demon: {
    name: 'SD Demon', cls: 'Destroyer', faction: 'Shivan', length: 2139,
    url: 'ships/shivan/demon.png', flip: true,
    hull: 1500, speed: 34, turn: 10, accel: 11,
    hardpoints: [ // FS2 retail: 12 turrets
      ...pair('spinal', 'lred', 0.08, 0.42), hp('spinal', 'sred', 0, 0.3),
      ...pair('turret', 'saaa', 0.16, 0.1), hp('turret', 'saaa', 0, -0.05),
      ...pair('turret', 'shivanTurret', 0.14, 0.25),
      ...pair('turret', 'shivanTurret', 0.14, -0.2),
      ...pair('turret', 'shivanTurret', 0.1, -0.4),
    ],
    desc: 'Jagged black bulk around a fighterbay maw. Where a Demon arrives, the evacuation order has already come too late.',
    hostile: true,
  },
  ravana: {
    name: 'SD Ravana', cls: 'Destroyer', faction: 'Shivan', length: 2346,
    url: 'ships/shivan/ravana.png', flip: true,
    hull: 1400, speed: 34, turn: 11, accel: 11,
    hardpoints: [ // FS2 retail: 13 turrets, main beams boresighted down the prongs
      ...pair('spinal', 'lred', 0.16, 0.44),
      ...pair('spinal', 'sred', 0.06, 0.3),
      ...pair('turret', 'saaa', 0.16, 0.05), hp('turret', 'saaa', 0, -0.1),
      ...pair('turret', 'shivanTurret', 0.14, 0.18),
      ...pair('turret', 'shivanTurret', 0.12, -0.25),
      ...pair('turret', 'shivanTurret', 0.08, -0.42),
    ],
    desc: 'Twin forward prongs with the main beams boresighted down them. The Ravana does not maneuver to fight; it points.',
    hostile: true,
  },
  lucifer: {
    name: 'SD Lucifer', cls: 'Superdestroyer', faction: 'Shivan', length: 2777,
    url: 'ships/shivan/lucifer.png', flip: true,
    hull: 2600, speed: 30, turn: 7, accel: 9,
    hardpoints: [ // The five great beams of the Great War, plus escorts' nightmares
      ...pair('spinal', 'bfred', 0.06, 0.45), hp('spinal', 'lred', 0, 0.36),
      ...pair('spinal', 'lred', 0.1, 0.25),
      ...pair('turret', 'saaa', 0.16, 0.1), ...pair('turret', 'saaa', 0.14, -0.15),
      ...pair('turret', 'shivanTurret', 0.12, 0.02),
      ...pair('turret', 'shivanTurret', 0.1, -0.3), hp('turret', 'shivanTurret', 0, -0.44),
    ],
    desc: 'The nightmare of the Great War, shielded against everything the Alliance had. Five main beams. Pilots still check their sensors twice.',
    hostile: true,
  },
  sathanas: {
    name: 'SJ Sathanas', cls: 'Juggernaut', faction: 'Shivan', length: 5978,
    url: 'ships/shivan/sathanas.png', flip: true,
    hull: 3200, speed: 28, turn: 6, accel: 7,
    hardpoints: [ // Four ultra-heavy claw beams + representative secondary battery
      ...pair('spinal', 'bfred', 0.14, 0.46), ...pair('spinal', 'bfred', 0.22, 0.38),
      ...pair('spinal', 'sred', 0.06, 0.3),
      ...pair('turret', 'saaa', 0.16, 0.12), hp('turret', 'saaa', 0, 0),
      ...pair('turret', 'shivanTurret', 0.12, -0.15),
      ...pair('turret', 'shivanTurret', 0.1, -0.35),
    ],
    desc: 'Four clawed arms around the main beam array, and there are more than eighty of them. The Colossus fought one. Once.',
    hostile: true,
  },
};

// Wiki/refit helper: "1× Railgun · 2× Laser turret"
export function armamentSummary(ship) {
  const counts = {};
  for (const point of ship.hardpoints) counts[point.fitted] = (counts[point.fitted] ?? 0) + 1;
  return Object.entries(counts).map(([w, n]) => `${n}× ${WEAPONS[w].name}`).join(' · ');
}
