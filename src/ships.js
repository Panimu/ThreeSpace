// Ship catalog: stats + wiki copy for every hull in the game.
// Sprites are Endless Sky art (CC-BY-SA 4.0) — all face up, so angleOffset 90.
// Speeds are px/s, turn in deg/s. `command: true` hulls are player-selectable
// in the sandbox; the rest are future commands or hostiles.
//
// Terran capital line cast from the Endless Sky library (user picks, casting
// board 2026-08): Fenris→Splinter, Aeolus→Mule, Deimos→Vanguard,
// Orion→Behemoth, Hecate→Navy Carrier, Colossus→Dreadnought.

export const SHIPS = {
  fenris: {
    name: 'GTC Fenris', cls: 'Light cruiser', faction: 'GTVA',
    url: 'endless-sky/ship/splinter.png', scale: 0.9,
    hull: 420, speed: 100, turn: 34, accel: 40,
    turrets: 2, batteryDamage: 55,
    desc: 'The patrol workhorse and a captain’s first capital command. Cheap, quick to answer the helm, and thin-skinned — every Fenris skipper learns to keep the bow on the threat.',
    command: true,
  },
  leviathan: {
    name: 'GTC Leviathan', cls: 'Cruiser', faction: 'GTVA',
    url: 'endless-sky/ship/splinter.png', scale: 1.0,
    hull: 650, speed: 80, turn: 26, accel: 30,
    turrets: 3, batteryDamage: 60,
    desc: 'A Fenris hull traded speed for armor until it became a different ship. Holds a blockade line twice as long, arrives half as fast.',
    command: true,
  },
  aeolus: {
    name: 'GTC Aeolus', cls: 'Flak cruiser', faction: 'GTVA',
    url: 'endless-sky/ship/mule.png', scale: 1.0,
    hull: 560, speed: 85, turn: 30, accel: 34,
    turrets: 4, batteryDamage: 45,
    desc: 'Stubby, dense, and unglamorous. The Aeolus exists to fill the sky around the fleet with fire — bombers hate it, and that is the whole job description.',
    command: true,
  },
  deimos: {
    name: 'GTCv Deimos', cls: 'Corvette', faction: 'GTVA',
    url: 'endless-sky/ship/vanguard.png', scale: 1.2,
    hull: 800, speed: 75, turn: 24, accel: 28,
    turrets: 3, batteryDamage: 85,
    desc: 'The escort backbone: segmented armor over a spinal battery. A Deimos on your flank is the difference between a battle line and a target line.',
    command: true,
  },
  orion: {
    name: 'GTD Orion', cls: 'Destroyer', faction: 'GTVA',
    url: 'endless-sky/ship/behemoth.png', scale: 2.0,
    hull: 1600, speed: 55, turn: 14, accel: 18,
    turrets: 4, batteryDamage: 130,
    desc: 'FUTURE COMMAND — two kilometers of armor and main guns. Where an Orion parks, the front line is.',
  },
  hecate: {
    name: 'GTD Hecate', cls: 'Destroyer / carrier', faction: 'GTVA',
    url: 'endless-sky/ship/carrier.png', scale: 2.0,
    hull: 1400, speed: 60, turn: 16, accel: 20,
    turrets: 5, batteryDamage: 90,
    desc: 'FUTURE COMMAND — the Orion’s successor trades broadside weight for a vast fighterbay and a command deck that can run a theater.',
  },
  colossus: {
    name: 'GTVA Colossus', cls: 'Juggernaut', faction: 'GTVA',
    url: 'endless-sky/ship/dreadnought.png', scale: 3.0,
    hull: 3000, speed: 45, turn: 8, accel: 12,
    turrets: 8, batteryDamage: 200,
    desc: 'FUTURE COMMAND — six kilometers, twenty years, and the industrial output of two species. There is one of it.',
  },
  raider: {
    name: 'Korath Raider', cls: 'Raider', faction: 'Korath (hostile)',
    url: 'endless-sky/ship/raider.png', scale: 1.0,
    hull: 600, speed: 95, turn: 30, accel: 36,
    turrets: 3, batteryDamage: 70,
    desc: 'A tower of scavenged armor that appears at the edge of contested space, takes what it wants, and burns the rest.',
    hostile: true,
  },
};
