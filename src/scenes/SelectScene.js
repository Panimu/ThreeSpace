import Phaser from 'phaser';
import { SHIPS } from '../ships.js';
import { ensureStarfield } from '../fx.js';

export class SelectScene extends Phaser.Scene {
  constructor() {
    super('select');
  }

  create() {
    ensureStarfield(this);
    this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'starfield')
      .setOrigin(0).setScrollFactor(0);

    this.add.text(this.scale.width / 2, 22, 'SANDBOX SETUP', {
      fontFamily: 'monospace', fontSize: 22, color: '#d8e2ee', letterSpacing: 4,
    }).setOrigin(0.5, 0);
    const back = this.add.text(24, 24, '← TITLE', {
      fontFamily: 'monospace', fontSize: 15, color: '#9fd8ff',
    }).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('title'));
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('title'));

    this.playerPick = 'fenris';
    this.enemyPick = 'cain';
    this.rows = { player: new Map(), enemy: new Map() };

    const commands = Object.entries(SHIPS).filter(([, s]) => !s.hostile).map(([k]) => k);
    const opposition = Object.keys(SHIPS);
    this.makeColumn('YOUR COMMAND', commands, this.scale.width * 0.27, 'player');
    this.makeColumn('OPPOSITION', opposition, this.scale.width * 0.73, 'enemy');

    const launch = this.add.rectangle(this.scale.width / 2, this.scale.height - 44, 220, 48, 0x11161f, 0.95)
      .setStrokeStyle(1, 0xffb454).setInteractive({ useHandCursor: true }).setDepth(5);
    this.add.text(launch.x, launch.y, 'LAUNCH', {
      fontFamily: 'monospace', fontSize: 20, color: '#ffb454', letterSpacing: 4,
    }).setOrigin(0.5).setDepth(6);
    const go = () => this.scene.start('sandbox', { player: this.playerPick, enemy: this.enemyPick });
    launch.on('pointerdown', go);
    this.input.keyboard.on('keydown-ENTER', go);
  }

  makeColumn(title, keys, x, side) {
    this.add.text(x, 58, title, {
      fontFamily: 'monospace', fontSize: 14, color: '#8593a6', letterSpacing: 2,
    }).setOrigin(0.5, 0);
    const top = 88;
    const rowH = Math.min(28, (this.scale.height - top - 100) / keys.length);
    keys.forEach((key, i) => {
      const ship = SHIPS[key];
      const label = this.add.text(x, top + i * rowH, `${ship.name}  ·  ${ship.cls}`, {
        fontFamily: 'monospace', fontSize: 14,
        color: ship.hostile ? '#c98a80' : '#aab6c6',
      }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
      label.on('pointerdown', () => {
        this[`${side}Pick`] = key;
        this.refresh(side);
      });
      this.rows[side].set(key, label);
    });
    this.refresh(side);
  }

  refresh(side) {
    const picked = this[`${side}Pick`];
    for (const [key, label] of this.rows[side]) {
      const ship = SHIPS[key];
      if (key === picked) label.setColor('#ffb454').setText(`▸ ${ship.name}  ·  ${ship.cls}`);
      else label.setColor(ship.hostile ? '#c98a80' : '#aab6c6').setText(`${ship.name}  ·  ${ship.cls}`);
    }
  }
}
