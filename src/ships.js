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
// Pacing is FS2-measured: long reloads, deliberate salvos, duels that take
// minutes. `slash: true` beams rake across the target hull instead of holding
// one aimpoint (LTerSlash/SVas are the retail slash beams).
export const WEAPONS = {
  // Terran
  terranTurret: { name: 'Terran turret', type: 'turret', damage: 8, range: 850, delay: 8500, speed: 420, bolt: 'fx_bolt_subach' },
  terranHuge:   { name: 'Terran huge turret', type: 'spinal', damage: 50, range: 1100, delay: 15000, speed: 500, bolt: 'fx_bolt_terranhuge' },
  standardFlak: { name: 'Standard flak', type: 'turret', damage: 4, range: 500, delay: 2200, speed: 380, bolt: 'fx_bolt_subach', burst: true, anti: true },
  longFlak:     { name: 'Long-range flak', type: 'turret', damage: 5, range: 720, delay: 2600, speed: 400, bolt: 'fx_bolt_subach', burst: true, anti: true },
  aaaf:         { name: 'AAAf beam', type: 'turret', damage: 35, range: 900, delay: 13000, speed: 0, beam: true, anti: true, chargeMs: 600, holdMs: 700, beamTex: 'fx_beam_aaa', beamWidth: 14 },
  lterslash:    { name: 'LTerSlash beam', type: 'turret', damage: 110, range: 1200, delay: 24000, speed: 0, beam: true, slash: true, chargeMs: 1400, holdMs: 2200, beamTex: 'fx_beam_lterslash', beamWidth: 18 },
  bgreen:       { name: 'BGreen beam', type: 'spinal', damage: 260, range: 1600, delay: 30000, speed: 0, beam: true, beamTex: 'fx_beam_bgreen', beamWidth: 24 },
  bfgreen:      { name: 'BFGreen beam', type: 'spinal', damage: 420, range: 1800, delay: 36000, speed: 0, beam: true, beamTex: 'fx_beam_bfgreen', beamWidth: 30 },
  // Vasudan
  vasudanTurret:{ name: 'Vasudan turret', type: 'turret', damage: 8, range: 850, delay: 8500, speed: 420, bolt: 'fx_bolt_vasudan' },
  svas:         { name: 'SVas slash beam', type: 'turret', damage: 85, range: 1100, delay: 21000, speed: 0, beam: true, slash: true, chargeMs: 1400, holdMs: 2000, beamTex: 'fx_beam_svas', beamWidth: 20 },
  bvas:         { name: 'BVas beam', type: 'spinal', damage: 240, range: 1500, delay: 28000, speed: 0, beam: true, beamTex: 'fx_beam_bvas', beamWidth: 24 },
  // Shivan
  shivanTurret: { name: 'Shivan turret', type: 'turret', damage: 9, range: 850, delay: 8000, speed: 430, bolt: 'fx_bolt_shivan' },
  shivanFlak:   { name: 'Shivan flak', type: 'turret', damage: 4, range: 500, delay: 2100, speed: 380, bolt: 'fx_bolt_shivan', burst: true, anti: true },
  saaa:         { name: 'SAAA beam', type: 'turret', damage: 40, range: 900, delay: 13000, speed: 0, beam: true, anti: true, chargeMs: 600, holdMs: 700, beamTex: 'fx_beam_saaa', beamWidth: 14 },
  sred:         { name: 'SRed beam', type: 'spinal', damage: 230, range: 1500, delay: 28000, speed: 0, beam: true, beamTex: 'fx_beam_sred', beamWidth: 22 },
  lred:         { name: 'LRed beam', type: 'spinal', damage: 350, range: 1700, delay: 33000, speed: 0, beam: true, beamTex: 'fx_beam_lred', beamWidth: 28 },
  bfred:        { name: 'BFRed beam', type: 'spinal', damage: 520, range: 1900, delay: 40000, speed: 0, beam: true, beamTex: 'fx_beam_bfred', beamWidth: 32 },
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
    // FS2 canon: destroyer fighterbay, ~24-craft air group.
    hangar: [{ craft: 'myrmidon', wings: 2 }, { craft: 'hercules2', wings: 1 },
      { craft: 'medusa', wings: 2 }, { craft: 'ursa', wings: 1 }],
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
    // FS2 canon: carries up to 150 craft — the largest air group modeled.
    hangar: [{ craft: 'myrmidon', wings: 3 }, { craft: 'perseus', wings: 2 },
      { craft: 'artemis', wings: 2 }, { craft: 'boanerges', wings: 1 }],
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
    hangar: [{ craft: 'hercules2', wings: 2 }, { craft: 'ulysses', wings: 1 },
      { craft: 'ursa', wings: 2 }, { craft: 'medusa', wings: 1 }],
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
    // Canon: 60 fighter/bomber wings aboard; a representative fraction flies.
    hangar: [{ craft: 'myrmidon', wings: 3 }, { craft: 'perseus', wings: 2 },
      { craft: 'hercules2', wings: 1 }, { craft: 'artemis', wings: 2 }, { craft: 'boanerges', wings: 2 }],
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
    // FS2 canon: two fighterbays.
    hangar: [{ craft: 'serapis', wings: 2 }, { craft: 'horus', wings: 1 },
      { craft: 'sekhmet', wings: 2 }, { craft: 'osiris', wings: 1 }],
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
    hangar: [{ craft: 'serapis', wings: 3 }, { craft: 'tauret', wings: 2 },
      { craft: 'sekhmet', wings: 2 }, { craft: 'bakha', wings: 1 }],
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
    hangar: [{ craft: 'manticore', wings: 2 }, { craft: 'mara', wings: 1 },
      { craft: 'seraphim', wings: 2 }, { craft: 'nephilim', wings: 1 }],
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
    hangar: [{ craft: 'mara', wings: 2 }, { craft: 'basilisk', wings: 1 },
      { craft: 'seraphim', wings: 2 }, { craft: 'taurvi', wings: 2 }],
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
    hangar: [{ craft: 'mara', wings: 2 }, { craft: 'manticore', wings: 2 },
      { craft: 'seraphim', wings: 2 }, { craft: 'nephilim', wings: 2 }],
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
    hangar: [{ craft: 'aeshma', wings: 2 }, { craft: 'mara', wings: 3 }, { craft: 'dragon', wings: 1 },
      { craft: 'seraphim', wings: 2 }, { craft: 'nahema', wings: 2 }],
  },
};

// ---- Strike craft --------------------------------------------------------
// Fighters and bombers sliced from the fighters-bombers sheet (all bows face
// right → no flip, angleOffset 0). They launch in wings of 4 from capital
// fighterbays (`hangar` below), fly themselves, and respond to the wing order
// set in SandboxScene. Lengths are canon-flavored metres; on-screen size gets
// a readability floor — at true scale a 15 m fighter would be an invisible
// dot beside a 2 km destroyer (see strikeDisplayLength).
export const STRIKECRAFT = {
  // Terran
  myrmidon:  { name: 'GTF Myrmidon', cls: 'Fighter', faction: 'GTVA', length: 15, url: 'ships/terran/myrmidon.png',
    speed: 185, turn: 160, hull: 16, gun: { damage: 4, range: 400, delay: 1500, speed: 560, bolt: 'fx_bolt_subach' } },
  perseus:   { name: 'GTF Perseus', cls: 'Interceptor', faction: 'GTVA', length: 17, url: 'ships/terran/perseus.png',
    speed: 205, turn: 150, hull: 14, gun: { damage: 4, range: 420, delay: 1950, speed: 580, bolt: 'fx_bolt_subach' } },
  hercules2: { name: 'GTF Hercules Mk II', cls: 'Assault fighter', faction: 'GTVA', length: 20, url: 'ships/terran/hercules2.png',
    speed: 160, turn: 120, hull: 26, gun: { damage: 6, range: 400, delay: 1750, speed: 540, bolt: 'fx_bolt_subach' } },
  ulysses:   { name: 'GTF Ulysses', cls: 'Fighter', faction: 'GTVA', length: 16, url: 'ships/terran/ulysses.png',
    speed: 190, turn: 175, hull: 15, gun: { damage: 4, range: 380, delay: 1950, speed: 560, bolt: 'fx_bolt_subach' } },
  medusa:    { name: 'GTB Medusa', cls: 'Bomber', faction: 'GTVA', length: 24, url: 'ships/terran/medusa.png',
    speed: 130, turn: 90, hull: 30, gun: { damage: 4, range: 350, delay: 1800, speed: 520, bolt: 'fx_bolt_subach' },
    bomb: { damage: 60, range: 780, delay: 18000, speed: 250, bolt: 'fx_bolt_terranhuge' } },
  ursa:      { name: 'GTB Ursa', cls: 'Heavy bomber', faction: 'GTVA', length: 31, url: 'ships/terran/ursa.png',
    speed: 110, turn: 70, hull: 45, gun: { damage: 5, range: 350, delay: 1950, speed: 520, bolt: 'fx_bolt_subach' },
    bomb: { damage: 90, range: 820, delay: 22000, speed: 230, bolt: 'fx_bolt_terranhuge' } },
  artemis:   { name: 'GTB Artemis', cls: 'Bomber', faction: 'GTVA', length: 24, url: 'ships/terran/artemis.png',
    speed: 150, turn: 100, hull: 26, gun: { damage: 4, range: 360, delay: 1750, speed: 530, bolt: 'fx_bolt_subach' },
    bomb: { damage: 55, range: 760, delay: 16000, speed: 260, bolt: 'fx_bolt_terranhuge' } },
  boanerges: { name: 'GTB Boanerges', cls: 'Heavy bomber', faction: 'GTVA', length: 30, url: 'ships/terran/boanerges.png',
    speed: 125, turn: 80, hull: 38, gun: { damage: 4, range: 350, delay: 1800, speed: 520, bolt: 'fx_bolt_subach' },
    bomb: { damage: 80, range: 800, delay: 21000, speed: 240, bolt: 'fx_bolt_terranhuge' } },
  // Vasudan
  serapis:   { name: 'GVF Serapis', cls: 'Interceptor', faction: 'Vasudan (allied)', length: 15, url: 'ships/vasudan/serapis.png',
    speed: 200, turn: 170, hull: 13, gun: { damage: 4, range: 410, delay: 1950, speed: 570, bolt: 'fx_bolt_mekhu' } },
  horus:     { name: 'GVF Horus', cls: 'Fighter', faction: 'Vasudan (allied)', length: 14, url: 'ships/vasudan/horus.png',
    speed: 195, turn: 180, hull: 12, gun: { damage: 3, range: 380, delay: 1800, speed: 560, bolt: 'fx_bolt_mekhu' } },
  tauret:    { name: 'GVF Tauret', cls: 'Fighter', faction: 'Vasudan (allied)', length: 21, url: 'ships/vasudan/tauret.png',
    speed: 170, turn: 140, hull: 22, gun: { damage: 5, range: 400, delay: 1650, speed: 550, bolt: 'fx_bolt_mekhu' } },
  sekhmet:   { name: 'GVB Sekhmet', cls: 'Bomber', faction: 'Vasudan (allied)', length: 29, url: 'ships/vasudan/sekhmet.png',
    speed: 140, turn: 95, hull: 34, gun: { damage: 4, range: 360, delay: 1750, speed: 530, bolt: 'fx_bolt_mekhu' },
    bomb: { damage: 75, range: 800, delay: 19000, speed: 245, bolt: 'fx_bolt_vasudan' } },
  osiris:    { name: 'GVB Osiris', cls: 'Bomber', faction: 'Vasudan (allied)', length: 30, url: 'ships/vasudan/osiris.png',
    speed: 120, turn: 85, hull: 30, gun: { damage: 3, range: 340, delay: 1800, speed: 510, bolt: 'fx_bolt_mekhu' },
    bomb: { damage: 60, range: 760, delay: 18000, speed: 240, bolt: 'fx_bolt_vasudan' } },
  bakha:     { name: 'GVB Bakha', cls: 'Bomber', faction: 'Vasudan (allied)', length: 24, url: 'ships/vasudan/bakha.png',
    speed: 145, turn: 100, hull: 28, gun: { damage: 4, range: 360, delay: 1750, speed: 530, bolt: 'fx_bolt_mekhu' },
    bomb: { damage: 60, range: 780, delay: 17000, speed: 255, bolt: 'fx_bolt_vasudan' } },
  // Shivan
  mara:      { name: 'SF Mara', cls: 'Fighter', faction: 'Shivan', length: 17, url: 'ships/shivan/mara.png',
    speed: 195, turn: 165, hull: 15, gun: { damage: 4, range: 400, delay: 1950, speed: 570, bolt: 'fx_bolt_shivanlight' } },
  manticore: { name: 'SF Manticore', cls: 'Interceptor', faction: 'Shivan', length: 16, url: 'ships/shivan/manticore.png',
    speed: 210, turn: 155, hull: 12, gun: { damage: 3, range: 390, delay: 1800, speed: 580, bolt: 'fx_bolt_shivanlight' } },
  basilisk:  { name: 'SF Basilisk', cls: 'Assault fighter', faction: 'Shivan', length: 32, url: 'ships/shivan/basilisk.png',
    speed: 155, turn: 115, hull: 28, gun: { damage: 6, range: 410, delay: 1750, speed: 550, bolt: 'fx_bolt_shivanlight' } },
  dragon:    { name: 'SF Dragon', cls: 'Fighter', faction: 'Shivan', length: 18, url: 'ships/shivan/dragon.png',
    speed: 220, turn: 190, hull: 14, gun: { damage: 4, range: 400, delay: 1800, speed: 580, bolt: 'fx_bolt_shivanlight' } },
  aeshma:    { name: 'SF Aeshma', cls: 'Assault fighter', faction: 'Shivan', length: 26, url: 'ships/shivan/aeshma.png',
    speed: 165, turn: 125, hull: 24, gun: { damage: 5, range: 400, delay: 1650, speed: 550, bolt: 'fx_bolt_shivanlight' } },
  seraphim:  { name: 'SB Seraphim', cls: 'Heavy bomber', faction: 'Shivan', length: 42, url: 'ships/shivan/seraphim.png',
    speed: 125, turn: 80, hull: 40, gun: { damage: 4, range: 350, delay: 1800, speed: 520, bolt: 'fx_bolt_shivanlight' },
    bomb: { damage: 80, range: 800, delay: 21000, speed: 240, bolt: 'fx_bolt_shivanheavy' } },
  nephilim:  { name: 'SB Nephilim', cls: 'Bomber', faction: 'Shivan', length: 40, url: 'ships/shivan/nephilim.png',
    speed: 130, turn: 85, hull: 36, gun: { damage: 4, range: 350, delay: 1800, speed: 520, bolt: 'fx_bolt_shivanlight' },
    bomb: { damage: 70, range: 780, delay: 18000, speed: 245, bolt: 'fx_bolt_shivanheavy' } },
  taurvi:    { name: 'SB Taurvi', cls: 'Bomber', faction: 'Shivan', length: 33, url: 'ships/shivan/taurvi.png',
    speed: 140, turn: 95, hull: 30, gun: { damage: 4, range: 360, delay: 1750, speed: 530, bolt: 'fx_bolt_shivanlight' },
    bomb: { damage: 60, range: 770, delay: 17000, speed: 250, bolt: 'fx_bolt_shivanheavy' } },
  nahema:    { name: 'SB Nahema', cls: 'Bomber', faction: 'Shivan', length: 30, url: 'ships/shivan/nahema.png',
    speed: 150, turn: 100, hull: 28, gun: { damage: 4, range: 360, delay: 1750, speed: 530, bolt: 'fx_bolt_shivanlight' },
    bomb: { damage: 65, range: 780, delay: 17000, speed: 255, bolt: 'fx_bolt_shivanheavy' } },
};

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
