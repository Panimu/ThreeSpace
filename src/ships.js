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

export const WEAPONS = {
  laserTurret: { name: 'Laser turret', type: 'turret', damage: 12, range: 700, delay: 1400, speed: 520 },
  flakTurret:  { name: 'Flak turret', type: 'turret', damage: 5, range: 430, delay: 450, speed: 480 },
  railgun:     { name: 'Railgun', type: 'spinal', damage: 55, range: 950, delay: 3200, speed: 640 },
  heavyRailgun:{ name: 'Heavy railgun', type: 'spinal', damage: 85, range: 1000, delay: 3600, speed: 660 },
  beamLance:   { name: 'Beam lance', type: 'spinal', damage: 140, range: 1200, delay: 4500, speed: 720 },
};

const hp = (type, fitted, x, y) => ({ type, fitted, x, y });

export const SHIPS = {
  fenris: {
    name: 'GTC Fenris', cls: 'Light cruiser', faction: 'GTVA',
    url: 'endless-sky/ship/splinter.png', scale: 0.9,
    hull: 420, speed: 100, turn: 34, accel: 40,
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
    hull: 650, speed: 80, turn: 26, accel: 30,
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
    hull: 560, speed: 85, turn: 30, accel: 34,
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
    hull: 800, speed: 75, turn: 24, accel: 28,
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
    hull: 1600, speed: 55, turn: 14, accel: 18,
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
    hull: 1400, speed: 60, turn: 16, accel: 20,
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
    hull: 3000, speed: 45, turn: 8, accel: 12,
    hardpoints: [
      hp('spinal', 'beamLance', 0.08, 0.46),
      hp('spinal', 'beamLance', -0.08, 0.46),
      hp('turret', 'laserTurret', 0.22, 0.3), hp('turret', 'laserTurret', -0.22, 0.3),
      hp('turret', 'laserTurret', 0.22, 0), hp('turret', 'laserTurret', -0.22, 0),
      hp('turret', 'flakTurret', 0.22, -0.3), hp('turret', 'flakTurret', -0.22, -0.3),
    ],
    desc: 'FUTURE COMMAND — six kilometers, twenty years, and the industrial output of two species. There is one of it.',
  },
  // ---- Shivan line (user picks, Shivan casting board 2026-08):
  // Cain/Lilith→Remnant Ibis, Rakshasa→Ka'het Telis'het, Moloch→Ka'het
  // Vareti'het, Demon→Quarg Hydra, Ravana→Quarg Guivre, Lucifer→Remnant
  // Albatross, Sathanas→Korath Kar Ik Vot 349.

  cain: {
    name: 'SC Cain', cls: 'Cruiser', faction: 'Shivan',
    url: 'endless-sky/ship/ibis.png', scale: 1.0,
    hull: 400, speed: 95, turn: 32, accel: 38,
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
    url: 'endless-sky/ship/ibis.png', scale: 1.15,
    hull: 550, speed: 75, turn: 24, accel: 28,
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
    url: "endless-sky/ship/telis'het.png", scale: 1.0,
    hull: 480, speed: 85, turn: 28, accel: 32,
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
    url: "endless-sky/ship/vareti'het.png", scale: 1.2,
    hull: 750, speed: 70, turn: 22, accel: 26,
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
    url: 'endless-sky/ship/quarg hydra.png', scale: 1.8,
    hull: 1500, speed: 55, turn: 14, accel: 18,
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
    url: 'endless-sky/ship/quarg guivre.png', scale: 1.8,
    hull: 1400, speed: 55, turn: 15, accel: 18,
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
    url: 'endless-sky/ship/albatross.png', scale: 2.6,
    hull: 2600, speed: 50, turn: 10, accel: 14,
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
    url: 'endless-sky/ship/kar ik vot 349.png', scale: 3.0,
    hull: 3200, speed: 45, turn: 8, accel: 12,
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
