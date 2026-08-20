import Phaser from 'phaser';
import { SHIPS } from '../ships.js';
import { ensureStarfield, TEXT_RES } from '../fx.js';

// Fleet setup: tap ships to add them to a side (up to FLEET_MAX each, tap
// again to remove). The first pick on your side is the ship you start conning.
// Or tap a faction for a random battle: two equal fleets, never a 1v1.
const FLEET_MAX = 3;

const FACTIONS = {
  terran: { label: 'TERRAN', match: (s) => s.faction === 'GTVA' },
  vasudan: { label: 'VASUDAN', match: (s) => s.faction.startsWith('Vasudan') },
  shivan: { label: 'SHIVAN', match: (s) => s.faction === 'Shivan' },
};

export class SelectScene extends Phaser.Scene {
  constructor() {
    super('select');
  }

  create() {
    ensureStarfield(this);
    this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'starfield')
      .setOrigin(0).setScrollFactor(0);

    this.add.text(this.scale.width / 2, 18, 'FLEET SETUP', {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 22, color: '#d8e2ee', letterSpacing: 4,
    }).setOrigin(0.5, 0);
    this.add.text(this.scale.width / 2, 44, `tap to add ships — up to ${FLEET_MAX} per side`, {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 11, color: '#5a6678',
    }).setOrigin(0.5, 0);

    // Random battle row: pick a faction, get two matched fleets.
    this.add.text(this.scale.width / 2 - 200, 66, 'RANDOM BATTLE', {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 12, color: '#8593a6', letterSpacing: 2,
    }).setOrigin(1, 0.5).setPosition(this.scale.width / 2 - 148, 78);
    Object.entries(FACTIONS).forEach(([key, f], i) => {
      const bx = this.scale.width / 2 - 130 + i * 96;
      const zone = this.add.rectangle(bx + 44, 78, 88, 26, 0x11161f, 0.9)
        .setStrokeStyle(1, 0x3a4a62).setInteractive({ useHandCursor: true });
      this.add.text(bx + 44, 78, f.label, {
        fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 12, color: '#9fd8ff', letterSpacing: 1,
      }).setOrigin(0.5);
      zone.on('pointerover', () => zone.setStrokeStyle(1, 0x6fb7ff));
      zone.on('pointerout', () => zone.setStrokeStyle(1, 0x3a4a62));
      zone.on('pointerdown', () => this.randomBattle(key));
    });
    const back = this.add.text(24, 24, '← TITLE', {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 15, color: '#9fd8ff',
    }).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('title'));
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('title'));

    this.picks = { player: ['fenris'], enemy: ['cain'] };
    this.rows = { player: new Map(), enemy: new Map() };

    const commands = Object.entries(SHIPS).filter(([, s]) => !s.hostile).map(([k]) => k);
    const opposition = Object.keys(SHIPS);
    this.makeColumn('YOUR FLEET', commands, this.scale.width * 0.27, 'player');
    this.makeColumn('OPPOSITION', opposition, this.scale.width * 0.73, 'enemy');

    const launch = this.add.rectangle(this.scale.width / 2, this.scale.height - 44, 220, 48, 0x11161f, 0.95)
      .setStrokeStyle(1, 0xffb454).setInteractive({ useHandCursor: true }).setDepth(5);
    this.add.text(launch.x, launch.y, 'LAUNCH', {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 20, color: '#ffb454', letterSpacing: 4,
    }).setOrigin(0.5).setDepth(6);
    const go = () => {
      if (!this.picks.player.length || !this.picks.enemy.length) return;
      this.scene.start('sandbox', { player: [...this.picks.player], enemy: [...this.picks.enemy] });
    };
    launch.on('pointerdown', go);
    this.input.keyboard.on('keydown-ENTER', go);
  }

  // Random battle: two equal-sized fleets (never 1v1), the opposition drawn
  // from another faction and strength-matched hull-for-hull.
  randomBattle(factionKey) {
    const pool = (match) => Object.entries(SHIPS).filter(([, s]) => match(s)).map(([k]) => k);
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    const n = 2 + Math.floor(Math.random() * (FLEET_MAX - 1));
    const mine = shuffle(pool(FACTIONS[factionKey].match)).slice(0, n);
    const foeFaction = shuffle(Object.keys(FACTIONS).filter((k) => k !== factionKey))[0];
    const foePool = pool(FACTIONS[foeFaction].match);
    const used = new Set();
    const foes = mine.map((key) => {
      let best = null, bestD = Infinity;
      for (const fk of foePool) {
        if (used.has(fk)) continue;
        const d = Math.abs(SHIPS[fk].hull - SHIPS[key].hull);
        if (d < bestD) { bestD = d; best = fk; }
      }
      used.add(best);
      return best;
    });
    this.scene.start('sandbox', { player: mine, enemy: foes });
  }

  makeColumn(title, keys, x, side) {
    this.titleTexts ??= {};
    this.titleTexts[side] = this.add.text(x, 100, title, {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 14, color: '#8593a6', letterSpacing: 2,
    }).setOrigin(0.5, 0);
    const top = 126;
    const rowH = Math.min(28, (this.scale.height - top - 100) / keys.length);
    keys.forEach((key, i) => {
      const ship = SHIPS[key];
      const label = this.add.text(x, top + i * rowH, '', {
        fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 14,
        color: ship.hostile ? '#c98a80' : '#aab6c6',
      }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
      label.on('pointerdown', () => this.toggle(side, key));
      this.rows[side].set(key, label);
    });
    this.refresh(side);
  }

  toggle(side, key) {
    const picks = this.picks[side];
    const at = picks.indexOf(key);
    if (at >= 0) picks.splice(at, 1);
    else if (picks.length < FLEET_MAX) picks.push(key);
    this.refresh(side);
  }

  refresh(side) {
    const picks = this.picks[side];
    for (const [key, label] of this.rows[side]) {
      const ship = SHIPS[key];
      const at = picks.indexOf(key);
      if (at >= 0) {
        const tag = side === 'player' && at === 0 ? '★' : `${at + 1}`;
        label.setColor('#ffb454').setText(`▸${tag} ${ship.name}  ·  ${ship.cls}`);
      } else {
        label.setColor(ship.hostile ? '#c98a80' : '#aab6c6').setText(`${ship.name}  ·  ${ship.cls}`);
      }
    }
    this.titleTexts[side].setText(
      side === 'player' ? `YOUR FLEET  ${picks.length}/${FLEET_MAX}` : `OPPOSITION  ${picks.length}/${FLEET_MAX}`);
  }
}
