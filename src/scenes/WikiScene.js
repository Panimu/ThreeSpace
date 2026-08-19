import Phaser from 'phaser';
import { SHIPS, WEAPONS, armamentSummary } from '../ships.js';
import { ensureStarfield } from '../fx.js';

const HP_COLORS = { spinal: 0xffb454, turret: 0x6fb7ff };

const ENTRY_H = 170;

export class WikiScene extends Phaser.Scene {
  constructor() {
    super('wiki');
  }

  create() {
    const w = () => this.scale.width;

    ensureStarfield(this);
    this.bg = this.add.tileSprite(0, 0, w(), this.scale.height, 'starfield')
      .setOrigin(0).setScrollFactor(0);
    this.scale.on('resize', (s) => this.bg.setSize(s.width, s.height));

    this.add.text(24, 20, 'SHIP REGISTRY', {
      fontFamily: 'monospace', fontSize: 24, color: '#d8e2ee', letterSpacing: 4,
    }).setDepth(5);

    const back = this.add.text(w() - 24, 22, '← TITLE', {
      fontFamily: 'monospace', fontSize: 16, color: '#9fd8ff',
    }).setOrigin(1, 0).setDepth(5).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('title'));
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('title'));

    // Entries live in a container we scroll by dragging or wheel.
    this.list = this.add.container(0, 70);
    let y = 0;
    for (const [key, ship] of Object.entries(SHIPS)) {
      this.list.add(this.makeEntry(key, ship, y));
      y += ENTRY_H;
    }
    this.listHeight = y;

    this.input.on('wheel', (_p, _o, _dx, dy) => this.scroll(dy * 0.6));
    let dragY = null;
    this.input.on('pointerdown', (p) => { dragY = p.y; });
    this.input.on('pointermove', (p) => {
      if (p.isDown && dragY !== null) { this.scroll(dragY - p.y); dragY = p.y; }
    });
    this.input.on('pointerup', () => { dragY = null; });
  }

  scroll(dy) {
    const min = Math.min(0, this.scale.height - 90 - this.listHeight);
    this.list.y = Phaser.Math.Clamp(this.list.y - dy, min + 70, 70);
  }

  makeEntry(key, ship, y) {
    const c = this.add.container(0, y);
    const panel = this.add.rectangle(this.scale.width / 2, ENTRY_H / 2 - 8, this.scale.width - 40, ENTRY_H - 16, 0x11161f, 0.85)
      .setStrokeStyle(1, ship.hostile ? 0x5c2a2a : 0x1d2635);
    c.add(panel);

    const sprite = this.add.image(160, ENTRY_H / 2 - 8, `ship_${key}`);
    sprite.setScale(Math.min((ENTRY_H - 44) / sprite.height, 290 / sprite.width, 1.6));
    c.add(sprite);

    // Hardpoint markers over the sprite (art faces up: +y in hull coords is up).
    // Precursor to the wireframe refit view — same data drives combat.
    const bow = ship.flip ? -1 : 1;
    for (const point of ship.hardpoints) {
      const mx = sprite.x + bow * point.y * sprite.displayWidth;
      const my = sprite.y + point.x * sprite.displayHeight;
      const color = HP_COLORS[WEAPONS[point.fitted].type];
      c.add(this.add.circle(mx, my, 4).setStrokeStyle(1.5, color, 0.95));
      c.add(this.add.circle(mx, my, 1.2, color, 0.9));
    }

    const color = ship.hostile ? '#ff8a7a' : '#d8e2ee';
    c.add(this.add.text(330, 20, `${ship.name.toUpperCase()}`, {
      fontFamily: 'monospace', fontSize: 18, color, letterSpacing: 2,
    }));
    c.add(this.add.text(330, 44, `${ship.cls} · ${ship.faction}`, {
      fontFamily: 'monospace', fontSize: 12, color: '#6fb7ff',
    }));
    c.add(this.add.text(330, 66,
      `${ship.length} m   HULL ${ship.hull}   SPEED ${ship.speed}   TURN ${ship.turn}°/s\nARMAMENT ${armamentSummary(ship)}`, {
        fontFamily: 'monospace', fontSize: 12, color: '#8593a6',
      }));
    c.add(this.add.text(330, 106, ship.desc, {
      fontFamily: 'monospace', fontSize: 12, color: '#aab6c6',
      wordWrap: { width: this.scale.width - 400 },
    }));
    return c;
  }
}
