// Ship catalog: stats + wiki copy for every hull in the game.
// Sprites are Endless Sky art (CC-BY-SA 4.0) — all face up, so angleOffset 90.
// Speeds are px/s, turn in deg/s. `command: true` hulls are player-selectable
// in the sandbox; the rest are wiki entries (future commands) or hostiles.

export const SHIPS = {
  gunboat: {
    name: 'Gunboat', cls: 'Light escort', faction: 'Navy',
    url: 'endless-sky/ship/gunboat.png', scale: 0.9,
    hull: 250, speed: 150, turn: 55, accel: 60,
    turrets: 1, batteryDamage: 40,
    desc: 'The smallest hull that still counts as a warship. Quick to answer the helm; do not trade broadsides in it.',
    command: true,
  },
  corvette: {
    name: 'Corvette', cls: 'Escort', faction: 'Navy',
    url: 'endless-sky/ship/corvette.png', scale: 0.95,
    hull: 320, speed: 135, turn: 48, accel: 52,
    turrets: 2, batteryDamage: 45,
    desc: 'A patrol commander’s first real command. Two turrets and enough hull to survive a mistake — one mistake.',
    command: true,
  },
  frigate: {
    name: 'Frigate', cls: 'Frigate', faction: 'Navy',
    url: 'endless-sky/ship/frigate.png', scale: 1.0,
    hull: 450, speed: 110, turn: 38, accel: 42,
    turrets: 2, batteryDamage: 60,
    desc: 'The backbone of the patrol fleet. Slow to turn, steady in the line, and armed well enough to argue with anything its own size.',
    command: true,
  },
  osprey: {
    name: 'Osprey', cls: 'Light cruiser', faction: 'Navy',
    url: 'endless-sky/ship/osprey.png', scale: 1.0,
    hull: 550, speed: 100, turn: 34, accel: 38,
    turrets: 3, batteryDamage: 70,
    desc: 'FUTURE COMMAND — a cruiser’s guns on a hull that still remembers how to maneuver.',
  },
  falcon: {
    name: 'Falcon', cls: 'Cruiser', faction: 'Navy',
    url: 'endless-sky/ship/falcon.png', scale: 1.0,
    hull: 700, speed: 90, turn: 30, accel: 32,
    turrets: 3, batteryDamage: 85,
    desc: 'FUTURE COMMAND — a proper cruiser. Turns like it’s considering the request.',
  },
  vanguard: {
    name: 'Vanguard', cls: 'Heavy cruiser', faction: 'Navy',
    url: 'endless-sky/ship/vanguard.png', scale: 1.05,
    hull: 900, speed: 80, turn: 26, accel: 28,
    turrets: 3, batteryDamage: 100,
    desc: 'FUTURE COMMAND — built around its spinal battery. Point the bow at the problem.',
  },
  protector: {
    name: 'Protector', cls: 'Gun platform', faction: 'Navy',
    url: 'endless-sky/ship/protector.png', scale: 1.05,
    hull: 850, speed: 60, turn: 22, accel: 22,
    turrets: 6, batteryDamage: 0,
    desc: 'FUTURE COMMAND — six turrets and no manners. Nearly stationary; entirely unreasonable.',
  },
  leviathan: {
    name: 'Leviathan', cls: 'Battleship', faction: 'Navy',
    url: 'endless-sky/ship/leviathan.png', scale: 1.1,
    hull: 1200, speed: 70, turn: 20, accel: 24,
    turrets: 4, batteryDamage: 120,
    desc: 'FUTURE COMMAND — the fleet anchor. Where it points, the line holds.',
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
