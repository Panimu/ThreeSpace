import Phaser from 'phaser';
import { IMAGES, resolveUrl } from '../manifest.js';
import { ensureNebula, ensureStarfield, ensureBeamTextures, TEXT_RES } from '../fx.js';
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

    // An endless, silent capital duel plays out behind the menu.
    this.battle = new TitleBattle(this);

    // Layout scales with the narrow axis so portrait iPhones don't overflow;
    // an orientation change re-lays everything out via a debounced restart.
    const narrow = Math.min(w(), 520);
    const titleSize = Math.min(56, Math.floor(narrow / 8));
    const titleY = h() * 0.24;
    this.add.text(w() / 2, titleY, 'THREESPACE', {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: titleSize, fontStyle: 'bold',
      color: '#d8e2ee', letterSpacing: Math.max(3, Math.floor(titleSize / 8)),
    }).setOrigin(0.5);
    this.add.text(w() / 2, titleY + titleSize * 0.8, 'CAPITAL COMMAND', {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: Math.min(16, narrow / 24),
      color: '#6fb7ff', letterSpacing: 5,
    }).setOrigin(0.5);
    const blurb = this.add.text(w() / 2, titleY + titleSize * 0.8 + 26,
      'A FreeSpace-inspired capital ship sandbox: take the helm, trade beam fire ' +
      'at range, and break the enemy down pixel by pixel — mount by mount.', {
        fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 12, color: '#8593a6',
        align: 'center', lineSpacing: 5, wordWrap: { width: Math.min(560, w() - 36) },
      }).setOrigin(0.5, 0);
    this.add.text(w() - 12, h() - 10, `v${version}`, {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 11, color: '#5a6678',
    }).setOrigin(1, 1);

    const buttonsTop = Math.max(blurb.y + blurb.height + 24, h() * 0.46);
    const gap = Math.min(58, (h() - buttonsTop - 40) / 4);
    this.makeButton(w() / 2, buttonsTop, 'CAMPAIGN', () => this.scene.start('campaign'));
    this.makeButton(w() / 2, buttonsTop + gap, 'SANDBOX', () => this.scene.start('select'));
    this.makeButton(w() / 2, buttonsTop + gap * 2, 'REFIT', () => this.scene.start('refit'));
    this.makeButton(w() / 2, buttonsTop + gap * 3, 'WIKI', () => this.scene.start('wiki'));

    this.add.text(w() / 2, h() - 8,
      'Ship & effect art: original FS2-style sprite sheets (project assets)', {
        fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 10, color: '#5a6678',
        align: 'center', wordWrap: { width: w() - 120 },
      }).setOrigin(0.5, 1);

    this.input.keyboard.on('keydown-ENTER', () => this.scene.start('campaign'));

    // Orientation change: rebuild the layout once the resize settles.
    const onResize = () => {
      this.relayout?.remove();
      this.relayout = this.time.delayedCall(250, () => this.scene.restart());
    };
    this.scale.on('resize', onResize);
    this.events.once('shutdown', () => this.scale.off('resize', onResize));
  }

  makeButton(x, y, label, onClick) {
    const bw = Math.min(260, this.scale.width - 80);
    const zone = this.add.rectangle(x, y, bw, 50, 0x11161f, 0.9)
      .setStrokeStyle(1, 0x2b3a52).setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 20, color: '#9fd8ff', letterSpacing: 4,
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
