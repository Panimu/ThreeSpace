import Phaser from 'phaser';
import { SHIPS, shipSpec } from '../ships.js';
import { ensureStarfield, TEXT_RES } from '../fx.js';
import { missionById } from '../campaign.js';
import {
  loadCampaign, saveCampaign, newCampaign, clearCampaign,
  shipReady, hullPct, progress, resolveLoop,
} from '../campaignState.js';

// Campaign bridge: your orders, your task force, and the decision of which
// damaged hulls you are willing to risk on this one. Up to SORTIE_MAX ships
// deploy; the rest stay in dock and keep the damage they already have.
const SORTIE_MAX = 3;

export class CampaignScene extends Phaser.Scene {
  constructor() {
    super('campaign');
  }

  create() {
    // Reused scene instance: never inherit a half-finished confirmation.
    this.confirming = false;
    this.state = loadCampaign() ?? newCampaign();
    saveCampaign(this.state);
    this.sortie = new Set(
      this.state.fleet.filter(shipReady).slice(0, SORTIE_MAX).map((s) => s.name));
    this.build();
  }

  rebuild() {
    this.children.removeAll();
    this.build();
  }

  build() {
    const w = this.scale.width, h = this.scale.height;
    ensureStarfield(this);
    this.add.tileSprite(0, 0, w, h, 'starfield').setOrigin(0).setScrollFactor(0).setAlpha(0.55);
    this.add.rectangle(0, 0, w, h, 0x04060c, 0.7).setOrigin(0);

    const back = this.text(14, 12, '< TITLE', 12, '#9fd8ff');
    back.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start('title'));

    if (this.state.pendingLoop) { this.buildLoopOffer(); return; }

    const mission = missionById(this.state.missionId);
    this.currentMission = mission;
    if (!mission) { this.buildVictory(); return; }
    if (!this.state.fleet.some(shipReady)) { this.buildDefeat(); return; }

    const p = progress(this.state);
    this.text(w / 2, 12, `${mission.act}  ·  OPERATION ${p.done + 1} OF ${p.total}`,
      11, '#5a6678', { ox: 0.5, ls: 2 });
    this.text(w / 2, 32, mission.title.toUpperCase(), Math.min(22, w / 19), '#d8e2ee', { ox: 0.5, ls: 2 });
    this.text(w / 2, 60, mission.where, 11, '#6fb7ff', { ox: 0.5 });

    let y = 84;
    const brief = this.text(w / 2, y, mission.brief, 11, '#aab6c6',
      { ox: 0.5, wrap: Math.min(620, w - 40), align: 'center', ls: 0, lh: 5 });
    y += brief.height + 12;

    // Who is out there, named.
    const listing = (ships) => ships
      .map((e) => `${shipSpec(e.key).name}${e.name ? ` ${e.name}` : ''}`).join('  ·  ');
    const foes = [...mission.enemy, ...(mission.civilians?.B ?? [])];
    this.text(w / 2, y, `OPPOSITION   ${listing(foes)}`, 10, '#e8a49a',
      { ox: 0.5, wrap: w - 40, align: 'center' });
    y += 20;
    if (mission.attach?.length) {
      this.text(w / 2, y, `ATTACHED   ${listing(mission.attach)}`,
        10, '#8fd8a4', { ox: 0.5, wrap: w - 40, align: 'center' });
      y += 20;
    }
    // Whatever is out there that cannot defend itself.
    if (mission.civilians?.A?.length) {
      this.text(w / 2, y, `IN COMPANY   ${listing(mission.civilians.A)}`,
        10, '#8593a6', { ox: 0.5, wrap: w - 40, align: 'center' });
      y += 20;
    }
    const kinds = {
      survive: () => `HOLD THE ACTION FOR ${Math.round(mission.objective.seconds / 60 * 10) / 10} MINUTES`,
      protect: () => `${mission.objective.ship.toUpperCase()} MUST SURVIVE`,
      raid: () => `DESTROY ${mission.objective.targets.join(', ').toUpperCase()}`,
      destroy: () => 'DESTROY ALL HOSTILE WARSHIPS',
    };
    const objLine = (kinds[mission.objective.kind] ?? kinds.destroy)();
    this.text(w / 2, y, objLine, 11, '#ffb454', { ox: 0.5 });
    y += 24;

    // Refit report from the last operation.
    if (this.state.lastRefit?.length) {
      this.text(w / 2, y, `DOCKYARD  ${this.state.lastRefit.join('   ')}`, 9, '#5a8a6a',
        { ox: 0.5, wrap: w - 40, align: 'center' });
      y += 18;
    }

    this.text(20, y, `TASK FORCE — TAP TO ASSIGN (MAX ${SORTIE_MAX})`, 10, '#6fb7ff', { ls: 1 });
    y += 16;
    this.rosterRows(y, Math.max(120, h - y - 66));

    const bw = Math.min(200, w / 2 - 30);
    this.button(w / 2 - bw / 2 - 6, h - 40, bw, 'LAUNCH', () => this.launch(mission), '#ffb454');
    this.button(w / 2 + bw / 2 + 6, h - 40, bw, 'ABANDON', () => this.confirmAbandon(), '#8593a6');
  }

  rosterRows(top, room) {
    const w = this.scale.width;
    const rowH = Math.min(30, room / Math.max(1, this.state.fleet.length));
    this.state.fleet.forEach((ship, i) => {
      const y = top + i * rowH;
      if (y > top + room) return;
      const ready = shipReady(ship);
      const on = this.sortie.has(ship.name);
      const spec = SHIPS[ship.key];
      const zone = this.add.rectangle(20, y, w - 40, rowH - 4, 0x11161f, on ? 0.9 : 0.5)
        .setOrigin(0, 0).setStrokeStyle(1, on ? 0xffb454 : 0x2b3a52);
      if (ready) {
        zone.setInteractive({ useHandCursor: true })
          .on('pointerdown', () => this.toggle(ship));
      }
      const pct = hullPct(ship);
      const dead = ship.deadMounts.length;
      this.text(28, y + rowH / 2 - 7, `${on ? '>' : ' '} ${ship.name}`, 12,
        ready ? (on ? '#ffb454' : '#aab6c6') : '#6a5a5a');
      this.text(w - 28, y + rowH / 2 - 7,
        `${spec.name}   HULL ${pct}%${dead ? `   ${dead} MOUNTS DOWN` : ''}`,
        10, ready ? '#8593a6' : '#6a5a5a', { ox: 1 });
      // Hull bar along the bottom edge of the row.
      const bw = w - 44;
      const g = this.add.graphics();
      g.fillStyle(0x0a0d14, 0.9).fillRect(22, y + rowH - 8, bw, 3);
      g.fillStyle(pct > 60 ? 0x7dd68f : pct > 30 ? 0xffb454 : 0xff5040, 0.95)
        .fillRect(22, y + rowH - 8, bw * (pct / 100), 3);
    });
  }

  toggle(ship) {
    if (this.sortie.has(ship.name)) this.sortie.delete(ship.name);
    else if (this.sortie.size < SORTIE_MAX) this.sortie.add(ship.name);
    this.rebuild();
  }

  launch(mission) {
    const picked = this.state.fleet.filter((s) => this.sortie.has(s.name) && shipReady(s));
    if (!picked.length) return;
    saveCampaign(this.state);
    this.scene.start('sandbox', {
      player: picked.map((s) => ({ key: s.key, name: s.name, hull: s.hull, deadMounts: [...s.deadMounts] })),
      enemy: mission.enemy.map((key, i) => ({ key, name: mission.names?.B?.[i] })),
      mission,
    });
  }

  // Special Operations Command's optional branch, offered between acts.
  buildLoopOffer() {
    const w = this.scale.width, h = this.scale.height;
    const loop = missionById(this.state.pendingLoop);
    this.text(w / 2, h * 0.22, 'SPECIAL OPERATIONS COMMAND', 12, '#6fb7ff', { ox: 0.5, ls: 3 });
    this.text(w / 2, h * 0.22 + 26, 'REQUESTS YOUR TASK FORCE', Math.min(20, w / 21),
      '#d8e2ee', { ox: 0.5, ls: 1 });
    this.text(w / 2, h * 0.22 + 60,
      `SOC has an operation that is not on the fleet's books: "${loop?.title}". `
      + 'It is optional, it is off the main line of the war, and you will get no '
      + 'reinforcements for taking it.', 11, '#aab6c6',
      { ox: 0.5, wrap: Math.min(560, w - 40), align: 'center', lh: 5 });
    const bw = Math.min(180, w / 2 - 30);
    this.button(w / 2 - bw / 2 - 8, h * 0.68, bw, 'ACCEPT', () => {
      resolveLoop(this.state, true);
      saveCampaign(this.state);
      this.rebuild();
    }, '#ffb454');
    this.button(w / 2 + bw / 2 + 8, h * 0.68, bw, 'DECLINE', () => {
      resolveLoop(this.state, false);
      saveCampaign(this.state);
      this.rebuild();
    }, '#8593a6');
  }

  buildVictory() {
    const w = this.scale.width, h = this.scale.height;
    this.text(w / 2, h * 0.3, 'CAPELLA IS GONE', Math.min(28, w / 15), '#d8e2ee', { ox: 0.5, ls: 3 });
    this.text(w / 2, h * 0.3 + 44,
      'The node closed behind the last transport. Whatever the Shivans wanted '
      + 'with a star, they have it — and the Alliance is still here to ask why. '
      + 'Your task force came through.', 11, '#aab6c6',
      { ox: 0.5, wrap: Math.min(560, w - 40), align: 'center', lh: 5 });
    const survivors = this.state.fleet.map((s) => s.name).join(', ') || 'none';
    this.text(w / 2, h * 0.3 + 120, `SURVIVING HULLS  ${survivors}`, 11, '#7dd68f',
      { ox: 0.5, wrap: w - 40, align: 'center' });
    this.button(w / 2, h - 60, Math.min(220, w - 60), 'NEW CAMPAIGN', () => {
      clearCampaign();
      this.state = newCampaign();
      saveCampaign(this.state);
      this.rebuild();
    }, '#ffb454');
  }

  buildDefeat() {
    const w = this.scale.width, h = this.scale.height;
    this.text(w / 2, h * 0.3, 'TASK FORCE LOST', Math.min(26, w / 16), '#ff7a6a', { ox: 0.5, ls: 3 });
    this.text(w / 2, h * 0.3 + 44,
      'There is nothing left under your command that can put to space. The war '
      + 'goes on without you.', 11, '#aab6c6',
      { ox: 0.5, wrap: Math.min(520, w - 40), align: 'center', lh: 5 });
    this.button(w / 2, h - 60, Math.min(220, w - 60), 'NEW CAMPAIGN', () => {
      clearCampaign();
      this.state = newCampaign();
      saveCampaign(this.state);
      this.rebuild();
    }, '#ffb454');
  }

  confirmAbandon() {
    if (this.confirming) {
      clearCampaign();
      this.state = newCampaign();
      saveCampaign(this.state);
      this.confirming = false;
      this.rebuild();
      return;
    }
    this.confirming = true;
    const w = this.scale.width, h = this.scale.height;
    this.text(w / 2, h - 62, 'TAP ABANDON AGAIN TO SCRAP THIS CAMPAIGN', 10, '#ff7a6a', { ox: 0.5 });
  }

  text(x, y, str, size, color, opts = {}) {
    return this.add.text(x, y, str, {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: size, color,
      letterSpacing: opts.ls ?? 0, align: opts.align ?? 'left',
      lineSpacing: opts.lh ?? 2,
      ...(opts.wrap ? { wordWrap: { width: opts.wrap } } : {}),
    }).setOrigin(opts.ox ?? 0, 0);
  }

  button(cx, cy, bw, label, onClick, color) {
    const zone = this.add.rectangle(cx, cy, bw, 38, 0x11161f, 0.95)
      .setStrokeStyle(1, 0x3a4a62).setInteractive({ useHandCursor: true });
    this.add.text(cx, cy, label, {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 13, color, letterSpacing: 2,
    }).setOrigin(0.5);
    zone.on('pointerover', () => zone.setStrokeStyle(1, 0x6fb7ff));
    zone.on('pointerout', () => zone.setStrokeStyle(1, 0x3a4a62));
    zone.on('pointerdown', onClick);
    return zone;
  }
}
