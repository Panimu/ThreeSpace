import Phaser from 'phaser';
import { ensureNebula, ensureStarfield, ensureBeamTextures, TEXT_RES } from '../fx.js';
import { TitleBattle } from '../titlebattle.js';
import { loadCampaign } from '../campaignState.js';
import { version } from '../../package.json';
import { BUILD_VERSION, updateReady, checkForUpdate, applyUpdate } from '../update.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
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

    // Name, buttons, version — nothing else competing with the battle behind.
    // Layout scales with the narrow axis so portrait phones never overflow; an
    // orientation change re-lays it out via a debounced restart.
    const narrow = Math.min(w(), 520);
    const titleSize = Math.min(56, Math.floor(narrow / 8));
    // A campaign already under way is offered as CONTINUE.
    const inProgress = !!loadCampaign()?.completed?.length;
    const buttons = [inProgress ? 'CONTINUE' : 'CAMPAIGN', 'SANDBOX', 'REFIT', 'WIKI'];
    const gap = Math.min(62, Math.max(52, h() / 11));

    // Centre the whole stack — title plus buttons — in the screen.
    const stackH = titleSize + 28 + gap * (buttons.length - 1) + 50;
    const titleY = Math.max(titleSize * 0.7, (h() - stackH) / 2);
    this.add.text(w() / 2, titleY, 'THREESPACE', {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: titleSize, fontStyle: 'bold',
      color: '#d8e2ee', letterSpacing: Math.max(3, Math.floor(titleSize / 8)),
    }).setOrigin(0.5);

    const buttonsTop = titleY + titleSize * 0.6 + 52;
    const targets = {
      CAMPAIGN: 'campaign', CONTINUE: 'campaign',
      SANDBOX: 'select', REFIT: 'refit', WIKI: 'wiki',
    };
    buttons.forEach((label, i) => {
      this.makeButton(w() / 2, buttonsTop + gap * i, label,
        () => this.scene.start(targets[label]));
    });

    this.add.text(w() - 12, h() - 10, `v${version} · ${BUILD_VERSION}`, {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 11, color: '#5a6678',
    }).setOrigin(1, 1);

    // The safe point. A new build may have been sitting in the cache for a
    // whole campaign — this is the first moment since it landed that reloading
    // costs the player nothing, so it is the first moment we mention it.
    this.offerUpdate();

    this.input.keyboard.on('keydown-ENTER', () => this.scene.start('campaign'));

    // Orientation change: rebuild the layout once the resize settles.
    const onResize = () => {
      this.relayout?.remove();
      this.relayout = this.time.delayedCall(250, () => this.scene.restart());
    };
    this.scale.on('resize', onResize);
    this.events.once('shutdown', () => this.scale.off('resize', onResize));
  }

  // Offers a waiting update, if there is one. Only ever called from create():
  // reaching the title screen means no battle, no briefing and no refit is in
  // progress, so a reload here throws nothing away.
  offerUpdate() {
    // This scene instance is reused across scene.start() and restarted on
    // orientation change, so an async check from a previous run must not draw
    // onto a later one. Each run takes a token and only the current one draws.
    const run = this.offerRun = (this.offerRun ?? 0) + 1;
    const show = (pending) => {
      if (run !== this.offerRun) return;
      const w = this.scale.width, h = this.scale.height;
      const label = this.add.text(12, h - 10, `UPDATE READY · ${pending} · TAP`, {
        fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 11,
        color: '#ffb454', letterSpacing: 1,
      }).setOrigin(0, 1).setDepth(5);
      // Generous hit area — it sits in the corner and the text itself is small.
      this.add.rectangle(6, h - 26, Math.min(w - 24, label.width + 16), 24, 0xffb454, 0.001)
        .setOrigin(0, 0).setDepth(5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => applyUpdate());
      this.tweens.add({
        targets: label, alpha: 0.45, duration: 1100, yoyo: true, repeat: -1,
      });
    };

    const pending = updateReady();
    if (pending) { show(pending); return; }
    // Nothing known yet — but arriving here is itself a good moment to look,
    // so a deploy that landed mid-session is offered now rather than after the
    // next poll. The banner just fades in a beat later if one turns up.
    checkForUpdate().then(() => {
      const found = updateReady();
      if (found) show(found);
    });
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
