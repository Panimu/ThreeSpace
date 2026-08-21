import Phaser from 'phaser';
import { IMAGES, resolveUrl } from '../manifest.js';
import { TEXT_RES } from '../fx.js';
import { version } from '../../package.json';
import { BUILD_VERSION } from '../update.js';

// Boot: loads every sprite in the manifest behind a progress bar, so the game
// opens on something deliberate instead of a blank canvas. Owns all asset
// loading — later scenes assume their textures are already in the cache.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload() {
    const w = this.scale.width, h = this.scale.height;
    const barW = Math.min(360, w - 64);
    const barX = (w - barW) / 2, barY = h / 2 + 18;

    this.cameras.main.setBackgroundColor('#04040a');
    const titleSize = Math.min(48, Math.floor(Math.min(w, 520) / 9));
    this.add.text(w / 2, h / 2 - 46, 'THREESPACE', {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: titleSize,
      fontStyle: 'bold', color: '#d8e2ee', letterSpacing: Math.max(3, titleSize / 8),
    }).setOrigin(0.5);

    const g = this.add.graphics();
    const label = this.add.text(w / 2, barY + 26, 'LOADING', {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 11, color: '#5a6678',
      letterSpacing: 2,
    }).setOrigin(0.5, 0);
    this.add.text(w - 12, h - 10, `v${version} · ${BUILD_VERSION}`, {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 11, color: '#3a4354',
    }).setOrigin(1, 1);

    const draw = (value) => {
      g.clear();
      g.lineStyle(1, 0x2b3a52, 1).strokeRect(barX, barY, barW, 8);
      g.fillStyle(0x6fb7ff, 0.9).fillRect(barX + 1, barY + 1, (barW - 2) * value, 6);
    };
    draw(0);

    const total = Object.keys(IMAGES).length;
    this.load.on('progress', (value) => {
      draw(value);
      label.setText(`LOADING  ${Math.round(value * 100)}%`);
    });
    this.load.on('fileprogress', (file) => {
      // Name the hull being read in, so the wait shows what it is doing.
      const name = String(file.key).replace(/^ship_|^fx_/, '').replace(/_/g, ' ');
      label.setText(`LOADING  ${name.toUpperCase()}`);
    });
    this.load.once('complete', () => {
      draw(1);
      label.setText(`READY  ${total} ASSETS`);
    });

    for (const [key, def] of Object.entries(IMAGES)) this.load.image(key, resolveUrl(def.url));
  }

  create() {
    // A beat on "READY" so the bar does not just flash past on a warm cache.
    this.time.delayedCall(220, () => this.scene.start('title'));
  }
}
