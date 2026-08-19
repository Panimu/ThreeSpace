import Phaser from 'phaser';
import { IMAGES, resolveUrl } from '../manifest.js';
import { ensureNebula, ensureStarfield, ensureBeamTextures } from '../fx.js';
import { TitleBattle } from '../titlebattle.js';
import { version } from '../../package.json';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  preload() {
    // The title preloads everything so Sandbox/Wiki start instantly.
    for (const [key, def] of Object.entries(IMAGES)) this.load.image(key, resolveUrl(def.url));
  }

  create() {
    const w = () => this.scale.width;
    const h = () => this.scale.height;

    ensureNebula(this);
    ensureStarfield(this);
    ensureBeamTextures(this);
    this.bg = this.add.tileSprite(0, 0, w(), h(), 'starfield').setOrigin(0).setScrollFactor(0);
    this.nebula = this.add.tileSprite(0, 0, w(), h(), 'nebula').setOrigin(0).setScrollFactor(0).setAlpha(0.85);
    this.scale.on('resize', (s) => { this.bg.setSize(s.width, s.height); this.nebula.setSize(s.width, s.height); });

    // An endless, silent capital duel plays out behind the menu.
    this.battle = new TitleBattle(this);

    this.add.text(w() / 2, h() * 0.3, 'THREESPACE', {
      fontFamily: 'monospace', fontSize: Math.min(64, w() / 9), fontStyle: 'bold',
      color: '#d8e2ee', letterSpacing: 8,
    }).setOrigin(0.5);
    this.add.text(w() / 2, h() * 0.3 + Math.min(64, w() / 9) * 0.75, 'CAPITAL COMMAND', {
      fontFamily: 'monospace', fontSize: 16, color: '#6fb7ff', letterSpacing: 6,
    }).setOrigin(0.5);
    this.add.text(w() / 2, h() * 0.3 + Math.min(64, w() / 9) * 0.75 + 34,
      'A FreeSpace-inspired capital ship sandbox: take the helm, trade beam fire\n' +
      'at range, and break the enemy down pixel by pixel — mount by mount.', {
        fontFamily: 'monospace', fontSize: 13, color: '#8593a6', align: 'center', lineSpacing: 5,
      }).setOrigin(0.5, 0);
    this.add.text(w() - 14, h() - 12, `v${version}`, {
      fontFamily: 'monospace', fontSize: 12, color: '#5a6678',
    }).setOrigin(1, 1);

    this.makeButton(w() / 2, h() * 0.52, 'SANDBOX', () => this.scene.start('select'));
    this.makeButton(w() / 2, h() * 0.52 + 66, 'REFIT', () => this.scene.start('refit'));
    this.makeButton(w() / 2, h() * 0.52 + 132, 'WIKI', () => this.scene.start('wiki'));

    this.add.text(w() / 2, h() - 16,
      'Ship & effect art: original FS2-style sprite sheets (project assets)', {
        fontFamily: 'monospace', fontSize: 11, color: '#5a6678',
      }).setOrigin(0.5, 1);

    this.input.keyboard.on('keydown-ENTER', () => this.scene.start('select'));
  }

  makeButton(x, y, label, onClick) {
    const zone = this.add.rectangle(x, y, 260, 54, 0x11161f, 0.9)
      .setStrokeStyle(1, 0x2b3a52).setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: 'monospace', fontSize: 22, color: '#9fd8ff', letterSpacing: 4,
    }).setOrigin(0.5);
    zone.on('pointerover', () => zone.setStrokeStyle(1, 0x6fb7ff));
    zone.on('pointerout', () => zone.setStrokeStyle(1, 0x2b3a52));
    zone.on('pointerdown', onClick);
    return [zone, text];
  }

  update(time, delta) {
    this.nebula.tilePositionX += (delta / 1000) * 3;
    this.battle.update(time, delta);
  }
}
