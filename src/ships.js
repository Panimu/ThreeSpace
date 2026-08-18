// Ship catalog: stats, hardpoints, and wiki copy for every hull in the game.
// Sprites are Endless Sky art (CC-BY-SA 4.0) — all face up, so angleOffset 90.
// Speeds are px/s, turn in deg/s. `command: true` hulls are player-selectable.
//
// Terran capital line cast from the Endless Sky library (user picks, casting
// board 2026-08): Fenris→Splinter, Aeolus→Mule, Deimos→Vanguard,
// Orion→Behemoth, Hecate→Navy Carrier, Colossus→Dreadnought.
//
// Hardpoints are the refit system's foundation: each is a mount with a
// position on the hull and a `fitted` weapon the player will eventually be
// able to swap. Coordinates are fractions of the sprite: y is along the hull
// toward the bow (+0.5 = bow tip), x is lateral (+ = starboard).

// Tuned for deliberate capital pacing: long ranges, slow cycles, volleys that
// matter. A battery shot is a decision, not a stream.
export const WEAPONS = {
  laserTurret: { name: 'Laser turret', type: 'turret', damage: 12, range: 850, delay: 2600, speed: 420 },
  flakTurret:  { name: 'Flak turret', type: 'turret', damage: 5, range: 500, delay: 900, speed: 380 },
  railgun:     { name: 'Railgun', type: 'spinal', damage: 70, range: 1200, delay: 5000, speed: 520 },
  heavyRailgun:{ name: 'Heavy railgun', type: 'spinal', damage: 110, range: 1300, delay: 6000, speed: 540 },
  beamLance:   { name: 'Beam lance', type: 'spinal', damage: 260, range: 1600, delay: 9000, speed: 600, beam: true },
};

const hp = (type, fitted, x, y) => ({ type, fitted, x, y });

export const SHIPS = {
  fenris: {
    name: 'GTC Fenris', cls: 'Light cruiser', faction: 'GTVA',
    url: 'endless-sky/ship/splinter.png', scale: 0.9,
    hull: 420, speed: 62, turn: 24, accel: 24,
    hardpoints: [
      hp('spinal', 'railgun', 0, 0.45),
      hp('turret', 'laserTurret', 0.16, 0.12),
      hp('turret', 'laserTurret', -0.16, -0.18),
    ],
    desc: 'The patrol workhorse and a captain’s first capital command. Cheap, quick to answer the helm, and thin-skinned — every Fenris skipper learns to keep the bow on the threat.',
    command: true,
  },
  leviathan: {
    name: 'GTC Leviathan', cls: 'Cruiser', faction: 'GTVA',
    url: 'endless-sky/ship/splinter.png', scale: 1.0,
    hull: 650, speed: 50, turn: 18, accel: 18,
    hardpoints: [
      hp('spinal', 'railgun', 0, 0.45),
      hp('turret', 'laserTurret', 0.16, 0.12),
      hp('turret', 'laserTurret', -0.16, -0.18),
      hp('turret', 'laserTurret', 0, -0.35),
    ],
    desc: 'A Fenris hull traded speed for armor until it became a different ship. Holds a blockade line twice as long, arrives half as fast.',
    command: true,
  },
  aeolus: {
    name: 'GTC Aeolus', cls: 'Flak cruiser', faction: 'GTVA',
    url: 'endless-sky/ship/mule.png', scale: 1.0,
    hull: 560, speed: 53, turn: 21, accel: 20,
    hardpoints: [
      hp('spinal', 'railgun', 0, 0.45),
      hp('turret', 'flakTurret', 0.2, 0.2),
      hp('turret', 'flakTurret', -0.2, 0.2),
      hp('turret', 'flakTurret', 0.2, -0.2),
      hp('turret', 'flakTurret', -0.2, -0.2),
    ],
    desc: 'Stubby, dense, and unglamorous. The Aeolus exists to fill the sky around the fleet with fire — bombers hate it, and that is the whole job description.',
    command: true,
  },
  deimos: {
    name: 'GTCv Deimos', cls: 'Corvette', faction: 'GTVA',
    url: 'endless-sky/ship/vanguard.png', scale: 1.2,
    hull: 800, speed: 47, turn: 17, accel: 17,
    hardpoints: [
      hp('spinal', 'heavyRailgun', 0, 0.48),
      hp('turret', 'laserTurret', 0.14, 0.2),
      hp('turret', 'laserTurret', -0.14, 0),
      hp('turret', 'laserTurret', 0.14, -0.25),
    ],
    desc: 'The escort backbone: segmented armor over a spinal battery. A Deimos on your flank is the difference between a battle line and a target line.',
    command: true,
  },
  orion: {
    name: 'GTD Orion', cls: 'Destroyer', faction: 'GTVA',
    url: 'endless-sky/ship/behemoth.png', scale: 2.0,
    hull: 1600, speed: 34, turn: 10, accel: 11,
    hardpoints: [
      hp('spinal', 'beamLance', 0, 0.46),
      hp('turret', 'laserTurret', 0.2, 0.25),
      hp('turret', 'laserTurret', -0.2, 0.25),
      hp('turret', 'laserTurret', 0.2, -0.25),
      hp('turret', 'laserTurret', -0.2, -0.25),
    ],
    desc: 'FUTURE COMMAND — two kilometers of armor and main guns. Where an Orion parks, the front line is.',
  },
  hecate: {
    name: 'GTD Hecate', cls: 'Destroyer / carrier', faction: 'GTVA',
    url: 'endless-sky/ship/carrier.png', scale: 2.0,
    hull: 1400, speed: 37, turn: 11, accel: 12,
    hardpoints: [
      hp('spinal', 'heavyRailgun', 0, 0.46),
      hp('turret', 'laserTurret', 0.18, 0.3),
      hp('turret', 'laserTurret', -0.18, 0.3),
      hp('turret', 'flakTurret', 0.18, -0.1),
      hp('turret', 'flakTurret', -0.18, -0.1),
      hp('turret', 'laserTurret', 0, -0.38),
    ],
    desc: 'FUTURE COMMAND — the Orion’s successor trades broadside weight for a vast fighterbay and a command deck that can run a theater.',
  },
  colossus: {
    name: 'GTVA Colossus', cls: 'Juggernaut', faction: 'GTVA',
    url: 'endless-sky/ship/dreadnought.png', scale: 3.0,
    hull: 3000, speed: 28, turn: 6, accel: 7,
    hardpoints: [
      hp('spinal', 'beamLance', 0.08, 0.46),
      hp('spinal', 'beamLance', -0.08, 0.46),
      hp('turret', 'laserTurret', 0.22, 0.3), hp('turret', 'laserTurret', -0.22, 0.3),
      hp('turret', 'laserTurret', 0.22, 0), hp('turret', 'laserTurret', -0.22, 0),
      hp('turret', 'flakTurret', 0.22, -0.3), hp('turret', 'flakTurret', -0.22, -0.3),
    ],
    desc: 'FUTURE COMMAND — six kilometers, twenty years, and the industrial output of two species. There is one of it.',
  },
  // ---- Vasudan line (user picks, Vasudan casting board 2026-08):
  // Aten→Hai Anomalocaris, Mentu→Hai Cicada, Sobek→Wanderer Derecho,
  // Typhon→Aaulqra, Hatshepsut→Wanderer Winter Gale.

  aten: {
    name: 'GVC Aten', cls: 'Cruiser', faction: 'Vasudan (allied)',
    url: 'derived/vasudan/hai anomalocaris.png', scale: 0.95,
    hull: 380, speed: 56, turn: 21, accel: 22,
    hardpoints: [
      hp('spinal', 'railgun', 0, 0.42),
      hp('turret', 'laserTurret', 0.16, 0.05),
      hp('turret', 'laserTurret', -0.16, -0.2),
    ],
    desc: 'A shell with guns, serving since the Great War. Terran pilots joke about the Aten until one holds a jump node alone for six hours.',
  },
  mentu: {
    name: 'GVC Mentu', cls: 'Cruiser', faction: 'Vasudan (allied)',
    url: 'derived/vasudan/hai cicada.png', scale: 1.0,
    hull: 500, speed: 55, turn: 20, accel: 20,
    hardpoints: [
      hp('spinal', 'railgun', 0, 0.44),
      hp('turret', 'laserTurret', 0.18, 0.15),
      hp('turret', 'laserTurret', -0.18, 0.15),
      hp('turret', 'laserTurret', 0, -0.32),
    ],
    desc: 'The Aten’s successor: segmented, scaled, and twice the ship. The carapace is armor; the elegance is free.',
  },
  sobek: {
    name: 'GVCv Sobek', cls: 'Corvette', faction: 'Vasudan (allied)',
    url: 'derived/vasudan/derecho.png', scale: 1.2,
    hull: 820, speed: 45, turn: 16, accel: 16,
    hardpoints: [
      hp('spinal', 'heavyRailgun', 0, 0.44),
      hp('turret', 'laserTurret', 0.16, 0.12),
      hp('turret', 'laserTurret', -0.16, 0.12),
      hp('turret', 'laserTurret', 0, -0.3),
    ],
    desc: 'Swept curves over a killer’s frame. The Sobek escorts like a crocodile floats — calmly, and then all at once.',
  },
  typhon: {
    name: 'GVD Typhon', cls: 'Destroyer', faction: 'Vasudan (allied)',
    url: 'derived/vasudan/aaulqra.png', scale: 2.0,
    hull: 1500, speed: 31, turn: 8, accel: 10,
    hardpoints: [
      hp('spinal', 'beamLance', 0, 0.42),
      hp('turret', 'laserTurret', 0.18, 0.2), hp('turret', 'laserTurret', -0.18, 0.2),
      hp('turret', 'laserTurret', 0.18, -0.22), hp('turret', 'laserTurret', -0.18, -0.22),
    ],
    desc: 'The ancient temple-ship of the Great War, two kilometers of patience. Half the fleet’s admirals learned command on a Typhon deck.',
  },
  hatshepsut: {
    name: 'GVD Hatshepsut', cls: 'Destroyer', faction: 'Vasudan (allied)',
    url: 'derived/vasudan/winter gale.png', scale: 2.0,
    hull: 1550, speed: 36, turn: 11, accel: 11,
    hardpoints: [
      hp('spinal', 'beamLance', 0, 0.45),
      hp('turret', 'laserTurret', 0.16, 0.25), hp('turret', 'laserTurret', -0.16, 0.25),
      hp('turret', 'flakTurret', 0.16, -0.2), hp('turret', 'flakTurret', -0.16, -0.2),
    ],
    desc: 'The pharaoh’s flagship: a sculpted prow on a hull that moves like calligraphy. The beam cannon under all that elegance is not decorative.',
  },

  // ---- Shivan line (user picks, Shivan casting board 2026-08):
  // Cain/Lilith→Remnant Ibis, Rakshasa→Ka'het Telis'het, Moloch→Ka'het
  // Vareti'het, Demon→Quarg Hydra, Ravana→Quarg Guivre, Lucifer→Remnant
  // Albatross, Sathanas→Korath Kar Ik Vot 349.

  cain: {
    name: 'SC Cain', cls: 'Cruiser', faction: 'Shivan',
    url: 'derived/shivan/ibis.png', scale: 1.0,
    hull: 400, speed: 59, turn: 22, accel: 23,
    hardpoints: [
      hp('spinal', 'railgun', 0, 0.45),
      hp('turret', 'laserTurret', 0.14, 0.1),
      hp('turret', 'laserTurret', -0.14, -0.2),
    ],
    desc: 'The first capital most pilots ever see burn — and the first that burns them. A skeletal spine with a claw for a bow.',
    hostile: true,
  },
  lilith: {
    name: 'SC Lilith', cls: 'Heavy cruiser', faction: 'Shivan',
    url: 'derived/shivan/ibis.png', scale: 1.15,
    hull: 550, speed: 47, turn: 17, accel: 17,
    hardpoints: [
      hp('spinal', 'beamLance', 0, 0.45),
      hp('turret', 'laserTurret', 0.14, 0.1),
      hp('turret', 'laserTurret', -0.14, -0.2),
    ],
    desc: 'A Cain that traded everything for one oversized beam. Doctrine is simple: do not be in front of it.',
    hostile: true,
  },
  rakshasa: {
    name: 'SC Rakshasa', cls: 'Cruiser', faction: 'Shivan',
    url: "derived/shivan/telis'het.png", scale: 1.0,
    hull: 480, speed: 53, turn: 20, accel: 19,
    hardpoints: [
      hp('spinal', 'heavyRailgun', 0, 0.42),
      hp('turret', 'laserTurret', 0.16, 0.15),
      hp('turret', 'laserTurret', -0.16, 0.15),
      hp('turret', 'laserTurret', 0, -0.3),
    ],
    desc: 'Second-generation Shivan cruiser: heavier guns, thicker hide, and a silhouette like something that stings.',
    hostile: true,
  },
  moloch: {
    name: 'SCv Moloch', cls: 'Corvette', faction: 'Shivan',
    url: "derived/shivan/vareti'het.png", scale: 1.2,
    hull: 750, speed: 43, turn: 15, accel: 16,
    hardpoints: [
      hp('spinal', 'heavyRailgun', 0, 0.42),
      hp('turret', 'laserTurret', 0.18, 0.1),
      hp('turret', 'laserTurret', -0.18, 0.1),
      hp('turret', 'laserTurret', 0, -0.32),
    ],
    desc: 'Hunched and asymmetric, more grown than built. The escort that makes Shivan convoys not worth the trade.',
    hostile: true,
  },
  demon: {
    name: 'SD Demon', cls: 'Destroyer', faction: 'Shivan',
    url: 'derived/shivan/quarg hydra.png', scale: 1.8,
    hull: 1500, speed: 34, turn: 10, accel: 11,
    hardpoints: [
      hp('spinal', 'beamLance', 0, 0.44),
      hp('turret', 'laserTurret', 0.2, 0.22), hp('turret', 'laserTurret', -0.2, 0.22),
      hp('turret', 'laserTurret', 0.2, -0.22), hp('turret', 'laserTurret', -0.2, -0.22),
    ],
    desc: 'Jagged black bulk around a fighterbay maw. Where a Demon arrives, the evacuation order has already come too late.',
    hostile: true,
  },
  ravana: {
    name: 'SD Ravana', cls: 'Destroyer', faction: 'Shivan',
    url: 'derived/shivan/quarg guivre.png', scale: 1.8,
    hull: 1400, speed: 34, turn: 11, accel: 11,
    hardpoints: [
      hp('spinal', 'beamLance', 0.1, 0.44),
      hp('spinal', 'beamLance', -0.1, 0.44),
      hp('turret', 'laserTurret', 0.2, 0), hp('turret', 'laserTurret', -0.2, 0),
      hp('turret', 'laserTurret', 0, -0.35),
    ],
    desc: 'Twin forward prongs with the main beams boresighted down them. The Ravana does not maneuver to fight; it points.',
    hostile: true,
  },
  lucifer: {
    name: 'SD Lucifer', cls: 'Superdestroyer', faction: 'Shivan',
    url: 'derived/shivan/albatross.png', scale: 2.6,
    hull: 2600, speed: 31, turn: 7, accel: 8,
    hardpoints: [
      hp('spinal', 'beamLance', 0.08, 0.45),
      hp('spinal', 'beamLance', -0.08, 0.45),
      hp('turret', 'laserTurret', 0.2, 0.25), hp('turret', 'laserTurret', -0.2, 0.25),
      hp('turret', 'laserTurret', 0.2, -0.25), hp('turret', 'laserTurret', -0.2, -0.25),
    ],
    desc: 'The nightmare of the Great War, shielded against everything the Alliance had. Fourteen years later, pilots still check their sensors twice.',
    hostile: true,
  },
  sathanas: {
    name: 'SJ Sathanas', cls: 'Juggernaut', faction: 'Shivan',
    url: 'derived/shivan/kar ik vot 349.png', scale: 3.0,
    hull: 3200, speed: 28, turn: 6, accel: 7,
    hardpoints: [
      hp('spinal', 'beamLance', 0.12, 0.42), hp('spinal', 'beamLance', -0.12, 0.42),
      hp('spinal', 'beamLance', 0.2, 0.3), hp('spinal', 'beamLance', -0.2, 0.3),
      hp('turret', 'laserTurret', 0.22, 0), hp('turret', 'laserTurret', -0.22, 0),
      hp('turret', 'laserTurret', 0.22, -0.3), hp('turret', 'laserTurret', -0.22, -0.3),
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
