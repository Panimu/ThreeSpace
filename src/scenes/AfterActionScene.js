import Phaser from 'phaser';
import { ensureStarfield, TEXT_RES } from '../fx.js';
import { loadCampaign, saveCampaign, applyResult } from '../campaignState.js';

// After-action report: what the battle cost, ship by ship. Beyond being the
// payoff for a fight you mostly watched, this is the campaign's hand-off
// point — the same record becomes persistent fleet damage, veterancy and
// losses once a campaign wraps the sandbox.
export class AfterActionScene extends Phaser.Scene {
  constructor() {
    super('afteraction');
  }

  create(report) {
    this.report = report ?? this.report;
    const r = this.report;
    // A campaign mission folds its result back into the roster exactly once:
    // damage sticks, losses are permanent, a win advances the war.
    if (r.missionId && !this.applied) {
      this.applied = true;
      const state = loadCampaign();
      if (state) saveCampaign(applyResult(state, r));
    }
    const w = this.scale.width, h = this.scale.height;
    const narrow = w < 620;

    ensureStarfield(this);
    this.add.tileSprite(0, 0, w, h, 'starfield').setOrigin(0).setScrollFactor(0).setAlpha(0.6);
    this.add.rectangle(0, 0, w, h, 0x04060c, 0.72).setOrigin(0);

    const text = (x, y, str, size, color, opts = {}) => this.add.text(x, y, str, {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: size, color,
      letterSpacing: opts.ls ?? 0, align: opts.align ?? 'left',
    }).setOrigin(opts.ox ?? 0, 0);

    text(w / 2, 16, r.missionTitle ? `AFTER ACTION · ${r.missionTitle.toUpperCase()}` : 'AFTER ACTION',
      13, '#5a6678', { ox: 0.5, ls: 4 });
    text(w / 2, 36, r.won ? 'HOSTILE FLEET DESTROYED' : 'FLEET LOST',
      Math.min(24, w / 17), r.won ? '#7dd68f' : '#ff7a6a', { ox: 0.5, ls: 2 });

    const mins = Math.floor(r.durationMs / 60000);
    const secs = Math.floor((r.durationMs % 60000) / 1000);
    text(w / 2, 66, `DURATION ${mins}:${String(secs).padStart(2, '0')}   ` +
      `STRIKE CRAFT LOST ${r.craftLost.A} / ${r.craftLost.B}`, 10, '#8593a6', { ox: 0.5 });

    // Ship rows: identity on top, what it did and what it cost underneath.
    let y = 92;
    const rowH = narrow ? 40 : 34;
    const section = (title, ships, colour) => {
      text(20, y, title, 11, '#6fb7ff', { ls: 2 });
      y += 18;
      for (const ship of ships) {
        const lost = !ship.survived;
        text(20, y, `${ship.cls} · ${ship.shipName}`, 12, lost ? '#7a6a6a' : colour);
        const hull = lost ? 'DESTROYED' : `HULL ${ship.hullPct}%`;
        text(narrow ? 20 : 300, narrow ? y + 15 : y,
          `${hull}   MOUNTS ${ship.mountsLive}/${ship.mountsTotal}   ` +
          `DEALT ${Math.round(ship.dealt)}   TAKEN ${Math.round(ship.taken)}`,
          10, lost ? '#6a5a5a' : '#8593a6');
        y += rowH;
      }
      y += 10;
    };
    section('YOUR FLEET', r.fleets.A, '#d8e2ee');
    section('OPPOSITION', r.fleets.B, '#e8b0a4');

    // Best showing of the battle — the seed of campaign veterancy.
    const best = [...r.fleets.A].sort((a, b) => b.dealt - a.dealt)[0];
    if (best && best.dealt > 0) {
      text(w / 2, Math.min(y, h - 96), `TOP GUN — ${best.shipName} (${Math.round(best.dealt)} damage)`,
        11, '#ffb454', { ox: 0.5 });
    }

    const bw = Math.min(180, (w - 60) / 3);
    const by = h - 54;
    if (r.missionId) {
      // Campaign: the roster has already been updated, so the only way on is
      // back to the bridge — a loss simply re-offers the same operation.
      this.makeButton(w / 2 - bw / 2 - 6, by, bw, r.won ? 'CONTINUE' : 'REGROUP',
        () => this.scene.start('campaign'));
      this.makeButton(w / 2 + bw / 2 + 6, by, bw, 'TITLE', () => this.scene.start('title'));
    } else {
      this.makeButton(w / 2 - bw - 10, by, bw, 'REMATCH', () =>
        this.scene.start('sandbox', { player: r.playerKeys, enemy: r.enemyKeys }));
      this.makeButton(w / 2, by, bw, 'NEW BATTLE', () => this.scene.start('select'));
      this.makeButton(w / 2 + bw + 10, by, bw, 'TITLE', () => this.scene.start('title'));
    }
  }

  makeButton(cx, cy, bw, label, onClick) {
    const zone = this.add.rectangle(cx, cy, bw, 40, 0x11161f, 0.95)
      .setStrokeStyle(1, 0x3a4a62).setInteractive({ useHandCursor: true });
    this.add.text(cx, cy, label, {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 13, color: '#9fd8ff', letterSpacing: 2,
    }).setOrigin(0.5);
    zone.on('pointerover', () => zone.setStrokeStyle(1, 0x6fb7ff));
    zone.on('pointerout', () => zone.setStrokeStyle(1, 0x3a4a62));
    zone.on('pointerdown', onClick);
  }
}
