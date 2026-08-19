import Phaser from 'phaser';
import { SHIPS, WEAPONS, armamentSummary } from '../ships.js';
import { cycleFit } from '../refit.js';
import { ensureStarfield } from '../fx.js';

const HP_COLORS = { spinal: 0xffb454, turret: 0x6fb7ff };

export class RefitScene extends Phaser.Scene {
  constructor() {
    super('refit');
  }

  create() {
    this.keys = Object.entries(SHIPS).filter(([, s]) => !s.hostile).map(([k]) => k);
    this.index = Math.max(0, this.keys.indexOf(this.scene.settings.data?.ship ?? 'fenris'));

    ensureStarfield(this);
    this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'starfield')
      .setOrigin(0).setScrollFactor(0);
    // Blueprint grid ground for the wireframe read.
    this.grid = this.add.grid(this.scale.width / 2, this.scale.height / 2,
      this.scale.width, this.scale.height, 48, 48, 0, 0, 0x6fb7ff, 0.05);

    this.add.text(24, 20, 'REFIT BAY', {
      fontFamily: 'monospace', fontSize: 24, color: '#d8e2ee', letterSpacing: 4,
    }).setDepth(5);
    const back = this.add.text(this.scale.width - 24, 22, '← TITLE', {
      fontFamily: 'monospace', fontSize: 16, color: '#9fd8ff',
    }).setOrigin(1, 0).setDepth(5).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('title'));
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('title'));

    const mkArrow = (x, label, dir) => {
      const t = this.add.text(x, this.scale.height / 2, label, {
        fontFamily: 'monospace', fontSize: 42, color: '#9fd8ff',
      }).setOrigin(0.5).setDepth(5).setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => { this.index = (this.index + dir + this.keys.length) % this.keys.length; this.showShip(); });
    };
    mkArrow(40, '◀', -1);
    mkArrow(this.scale.width - 40, '▶', 1);
    this.input.keyboard.on('keydown-LEFT', () => { this.index = (this.index - 1 + this.keys.length) % this.keys.length; this.showShip(); });
    this.input.keyboard.on('keydown-RIGHT', () => { this.index = (this.index + 1) % this.keys.length; this.showShip(); });

    this.shipLayer = this.add.container(0, 0);
    this.showShip();
  }

  showShip() {
    this.shipLayer.removeAll(true);
    const key = this.keys[this.index];
    const ship = SHIPS[key];
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2 - 20;

    // Ghosted hull: silhouette fill under a translucent sprite reads as wireframe.
    const silhouette = this.add.image(cx, cy, `ship_${key}`).setTintFill(0x2b4a6a).setAlpha(0.9);
    const sprite = this.add.image(cx, cy, `ship_${key}`).setTint(0x9fd8ff).setAlpha(0.4);
    const fit = Math.min((this.scale.height - 260) / sprite.height, (this.scale.width - 240) / sprite.width, 2.2);
    silhouette.setScale(fit);
    sprite.setScale(fit);
    this.shipLayer.add([silhouette, sprite]);

    this.shipLayer.add(this.add.text(cx, 64, `${ship.name.toUpperCase()} — ${ship.cls.toUpperCase()}`, {
      fontFamily: 'monospace', fontSize: 20, color: '#d8e2ee', letterSpacing: 2,
    }).setOrigin(0.5, 0));
    this.shipLayer.add(this.add.text(cx, 90, 'TAP A MOUNT TO REFIT — saved to this browser', {
      fontFamily: 'monospace', fontSize: 12, color: '#8593a6',
    }).setOrigin(0.5, 0));

    this.armamentText = this.add.text(cx, this.scale.height - 56,
      `HULL ${ship.hull}   SPEED ${ship.speed}   TURN ${ship.turn}°/s\n${armamentSummary(ship)}`, {
        fontFamily: 'monospace', fontSize: 14, color: '#9fd8ff', align: 'center',
      }).setOrigin(0.5, 0);
    this.shipLayer.add(this.armamentText);

    const bow = ship.flip ? -1 : 1;
    ship.hardpoints.forEach((point, i) => {
      const mx = cx + bow * point.y * sprite.displayWidth;
      const my = cy + point.x * sprite.displayHeight;
      const color = HP_COLORS[point.type];
      const ring = this.add.circle(mx, my, 13).setStrokeStyle(2, color, 1)
        .setInteractive({ useHandCursor: true });
      const dot = this.add.circle(mx, my, 3, color, 1);
      const side = mx >= cx ? 1 : -1;
      const label = this.add.text(mx + side * 22, my, WEAPONS[point.fitted].name, {
        fontFamily: 'monospace', fontSize: 12, color: '#d8e2ee',
        backgroundColor: '#10151fdd', padding: { x: 6, y: 3 },
      }).setOrigin(side > 0 ? 0 : 1, 0.5);
      ring.on('pointerdown', () => {
        const fitted = cycleFit(key, i);
        label.setText(WEAPONS[fitted].name);
        this.armamentText.setText(
          `HULL ${ship.hull}   SPEED ${ship.speed}   TURN ${ship.turn}°/s\n${armamentSummary(ship)}`);
        this.tweens.add({ targets: ring, scale: { from: 1.5, to: 1 }, duration: 180 });
      });
      this.shipLayer.add([ring, dot, label]);
    });
  }
}
