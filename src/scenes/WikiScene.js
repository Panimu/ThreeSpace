import Phaser from 'phaser';
import {
  SHIPS, STRIKECRAFT, WEAPONS, armamentSummary, complementSummary,
} from '../ships.js';
import { ensureStarfield, TEXT_RES } from '../fx.js';

const HP_COLORS = { spinal: 0xffb454, turret: 0x6fb7ff };
const SECTIONS = ['CONTROLS', 'SHIPS', 'CRAFT', 'WEAPONS', 'ASSETS'];
const TOP = 92; // first pixel of scrollable content

// The battle screen, described once. The diagram and its legend are drawn from
// this table, so the tutorial cannot drift out of step with itself. Boxes are
// in the schematic's own 400×210 space and get scaled to the screen.
const HUD_PARTS = [
  { n: 1, box: [4, 4, 26, 22], name: 'LEAVE', sample: 'X',
    desc: 'Abandons the action and returns to the title screen. Tap it twice — '
      + 'the first tap only asks, so a stray thumb cannot throw a battle away.' },
  { n: 2, box: [36, 4, 150, 34], name: 'SHIP STATUS', fill: false,
    sample: 'VIGILANT · GTC FENRIS\nHULL 380/420  MOUNTS 8/9\nBATTERY 12.4s',
    desc: 'The ship you are conning: its name and class, hull, mounts still in '
      + 'service, main-battery reload, air group and hostiles remaining.' },
  { n: 3, box: [36, 44, 180, 16], name: 'FLEET TABS', sample: '* VIGILANT 90%   2 KRIOS 100%',
    desc: 'One tab per capital under your command, with its hull percentage. '
      + 'Tap a tab to take the con of that ship; the rest fight on their own.' },
  { n: 4, box: [36, 66, 130, 12], name: 'ORDERS', fill: false, sample: 'DESTROY ALL HOSTILES', tint: 0xffb454,
    desc: 'The mission objective — destroy the hostiles, hold out against a '
      + 'clock, or keep an escorted ship alive.' },
  { n: 5, box: [292, 4, 104, 66], name: 'MINIMAP',
    desc: 'The whole battle area. Blue is yours, red is theirs, dots are strike '
      + 'craft, and the box is the part you are looking at. Tap anywhere on it '
      + 'to jump the camera there.' },
  { n: 6, box: [284, 76, 112, 48], name: 'CONTACT',
    sample: 'SD RAVANA\nBELETH · DESTROYER\nHULL 62%  MNT 18/26\nRNG 840  GUNS 7/13',
    desc: 'The hostile you have designated: class, name, hull, mounts still '
      + 'alive, range, and how many of your guns can actually bear on it.' },
  { n: 7, box: [246, 120, 142, 11], name: 'INCOMING', fill: false, tint: 0xff7a6a,
    sample: '! LRED BEAM 1.4s',
    desc: 'An enemy beam is charging with a firing solution on one of your '
      + 'ships. The seconds shown are how long you have to get out of the lane.' },
  { n: 8, box: [24, 116, 148, 18], name: 'AIR ORDERS', sample: 'ENGAGE  STRIKE  SCREEN',
    desc: 'One standing order for every fighter wing you have launched: ENGAGE '
      + 'sweeps their craft, STRIKE hits their warships, SCREEN guards yours. '
      + 'Only appears when a carrier is in the fight.' },
  { n: 9, box: [24, 138, 148, 18], name: 'FLEET ORDERS', sample: 'FORM  ENGAGE  STAND',
    desc: 'What your other capitals do: FORM holds station on you, ENGAGE '
      + 'closes and fights, STAND keeps them out at beam range.' },
  { n: 10, box: [322, 140, 74, 17], name: 'FOCUS', sample: 'FOCUS',
    desc: 'Re-centres the camera on the ship you are conning after you have '
      + 'panned away.' },
  { n: 11, box: [10, 166, 48, 40], name: 'HELM',
    desc: 'Drag inside the ring to set a heading and throttle: direction steers, '
      + 'distance from centre is speed. The order holds after you lift your '
      + 'finger — capitals keep their way on.' },
  { n: 12, box: [70, 164, 200, 44], name: 'POWER',
    desc: 'Eight pips of reactor output across three systems. WPN shortens '
      + 'reload, ENG adds speed and turn rate, REP repairs hull. Tap the minus '
      + 'and plus boxes to move power around.' },
  { n: 13, box: [380, 166, 10, 40], name: 'THROTTLE',
    desc: 'Current speed order, as set by the helm ring.' },
  { n: 14, box: [24, 94, 94, 18], name: 'PAUSE · SPEED', sample: 'PAUSE  2x',
    desc: 'Freeze the action, or run it at 1x, 2x or 3x. Capital combat is '
      + 'deliberate by design — the fast-forward is there for long reloads and '
      + 'hold-out missions, and it scales the whole battle, not just the view.' },
];

const GESTURES = [
  ['TAP A HOSTILE', 'Designates it. Your guns and any ships under orders '
    + 'prioritise that target. Tap it again, or tap empty space, to release.'],
  ['DRAG ONE FINGER', 'Pans the camera anywhere in the battle area.'],
  ['PINCH', 'Zooms the battle in and out. The interface never scales.'],
  ['DRAG THE HELM RING', 'Sets heading and throttle for the ship you are conning.'],
  ['TAP THE MINIMAP', 'Jumps the camera to that part of the battle area.'],
];

const ASSET_NOTES = [
  ['SHIP AND EFFECT ART',
    'Every hull, fighter and beam in the game is sliced from FS2-style sprite '
    + 'sheets supplied for this project. The capital plates gave 24 warships, '
    + 'the strike-craft plate 42 fighters and bombers, and the ordnance plate '
    + 'the beam bodies, bolt cores and flak bursts you see in combat. Slicing '
    + 'was automatic — connected-component segmentation, then a cleanup pass '
    + 'that drops measurement lines and caption text.'],
  ['EVERYTHING ELSE IS PROCEDURAL',
    'Backgrounds, nebulae, glow sprites, explosions and every sound are '
    + 'generated at runtime in code (src/fx.js). There are no audio files and '
    + 'no third-party art packs in the build.'],
  ['SHIP AND WEAPON DATA',
    'Hull strength, speed and armament follow the published FreeSpace 2 tables: '
    + 'retail max velocity, retail hitpoints, and each hull’s real turret '
    + 'loadout by type and count. Values are compressed so a million-point '
    + 'juggernaut is still killable in one sitting, but their relationships to '
    + 'each other are the game’s own.'],
  ['CAMPAIGN STRUCTURE',
    'The campaign follows the retail single-player mission graph — its acts, '
    + 'locations, force compositions, objectives and optional SOC branches — '
    + 'rebuilt around the warships present in each mission. All briefing text '
    + 'is written for this project.'],
  ['LICENSING',
    'Original FreeSpace 2 game data is proprietary to Interplay and THQ Nordic '
    + 'and is not distributed here. Nothing in this build is extracted from the '
    + 'retail game.'],
];

export class WikiScene extends Phaser.Scene {
  constructor() {
    super('wiki');
  }

  create() {
    const w = this.scale.width, h = this.scale.height;
    ensureStarfield(this);
    this.bg = this.add.tileSprite(0, 0, w, h, 'starfield').setOrigin(0).setScrollFactor(0);
    this.add.rectangle(0, 0, w, h, 0x04060c, 0.55).setOrigin(0);

    this.add.text(20, 16, 'REGISTRY', {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: Math.min(22, w / 18),
      color: '#d8e2ee', letterSpacing: 4,
    }).setDepth(5);
    const back = this.add.text(w - 20, 18, '< TITLE', {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 14, color: '#9fd8ff',
    }).setOrigin(1, 0).setDepth(5).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('title'));
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('title'));

    // Section tabs.
    this.tabs = [];
    const tw = Math.min(96, (w - 24) / SECTIONS.length - 4);
    SECTIONS.forEach((name, i) => {
      const x = 12 + i * (tw + 4);
      const zone = this.add.rectangle(x, 52, tw, 26, 0x11161f, 0.85)
        .setOrigin(0).setStrokeStyle(1, 0x2b3a52).setDepth(5)
        .setInteractive({ useHandCursor: true });
      const label = this.add.text(x + tw / 2, 65, name, {
        fontFamily: 'monospace', resolution: TEXT_RES,
        fontSize: tw < 74 ? 9 : 11, color: '#8593a6',
      }).setOrigin(0.5).setDepth(6);
      zone.on('pointerdown', () => this.showSection(name));
      this.tabs.push({ name, zone, label });
    });

    // Everything below the tabs scrolls, clipped to its own region.
    this.list = this.add.container(0, TOP);
    this.listHeight = 0;
    const shape = this.make.graphics({ x: 0, y: 0, add: false });
    shape.fillStyle(0xffffff).fillRect(0, TOP - 8, w, h - TOP + 8);
    this.list.setMask(shape.createGeometryMask());

    this.input.on('wheel', (_p, _o, _dx, dy) => this.scroll(dy * 0.6));
    let dragY = null;
    this.input.on('pointerdown', (p) => { dragY = p.y > TOP - 30 ? p.y : null; });
    this.input.on('pointermove', (p) => {
      if (p.isDown && dragY !== null) { this.scroll(dragY - p.y); dragY = p.y; }
    });
    this.input.on('pointerup', () => { dragY = null; });

    this.showSection(this.section ?? SECTIONS[0]);
  }

  showSection(name) {
    this.section = name;
    for (const t of this.tabs) {
      const on = t.name === name;
      t.zone.setFillStyle(0x11161f, on ? 0.95 : 0.6).setStrokeStyle(1, on ? 0xffb454 : 0x2b3a52);
      t.label.setColor(on ? '#ffb454' : '#8593a6');
    }
    this.list.removeAll(true);
    this.list.y = TOP;
    const build = {
      CONTROLS: () => this.buildControls(),
      SHIPS: () => this.buildShips(),
      CRAFT: () => this.buildCraft(),
      WEAPONS: () => this.buildWeapons(),
      ASSETS: () => this.buildAssets(),
    }[name];
    this.listHeight = build() + 40;
  }

  scroll(dy) {
    const min = Math.min(0, this.scale.height - TOP - this.listHeight);
    this.list.y = Phaser.Math.Clamp(this.list.y - dy, min + TOP, TOP);
  }

  // ---- shared bits -------------------------------------------------------

  text(x, y, str, size, color, opts = {}) {
    const t = this.add.text(x, y, str, {
      fontFamily: 'monospace', resolution: TEXT_RES, fontSize: size, color,
      letterSpacing: opts.ls ?? 0, align: opts.align ?? 'left', lineSpacing: opts.lh ?? 3,
      ...(opts.wrap ? { wordWrap: { width: opts.wrap } } : {}),
    }).setOrigin(opts.ox ?? 0, 0);
    this.list.add(t);
    return t;
  }

  card(y, height, tint = 0x1d2635) {
    const r = this.add.rectangle(20, y, this.scale.width - 40, height, 0x11161f, 0.85)
      .setOrigin(0).setStrokeStyle(1, tint);
    this.list.add(r);
    return r;
  }

  heading(y, str) {
    this.text(20, y, str, 11, '#6fb7ff', { ls: 2 });
    return y + 20;
  }

  // ---- CONTROLS: the annotated battle screen -----------------------------

  buildControls() {
    const w = this.scale.width;
    const narrow = w < 620;
    let y = 0;

    y = this.heading(y, 'THE BATTLE SCREEN');
    this.text(20, y, 'Everything you command in an action, and where it lives on screen.',
      11, '#8593a6', { wrap: w - 40 });
    y += 22;

    // Schematic, drawn in a 400x210 space and scaled to fit the screen —
    // capped so it stays a diagram rather than swallowing the page.
    const vw = 400, vh = 210;
    const scale = Math.min((w - 40) / vw, (this.scale.height * 0.5) / vh, 1.05);
    const ox = 20, oy = y;
    const g = this.add.graphics();
    this.list.add(g);
    const S = (v) => v * scale;

    // Screen body and the control panel strip along the bottom.
    g.fillStyle(0x080b12, 0.95).fillRect(ox, oy, S(vw), S(vh));
    g.lineStyle(1, 0x2b3a52, 1).strokeRect(ox, oy, S(vw), S(vh));
    g.fillStyle(0x0a0d14, 0.95).fillRect(ox, oy + S(160), S(vw), S(50));
    g.lineStyle(1, 0x2b3a52, 1).lineBetween(ox, oy + S(160), ox + S(vw), oy + S(160));

    for (const part of HUD_PARTS) {
      const [bx, by, bw, bh] = part.box;
      const tint = part.tint ?? 0x6fb7ff;
      if (part.fill !== false) {
        g.fillStyle(0x11161f, 0.9).fillRect(ox + S(bx), oy + S(by), S(bw), S(bh));
      }
      g.lineStyle(1, tint, part.fill === false ? 0.35 : 0.8)
        .strokeRect(ox + S(bx), oy + S(by), S(bw), S(bh));
      // Representative content, so the diagram reads like the real screen.
      if (part.sample) {
        const t = this.add.text(ox + S(bx) + S(4), oy + S(by) + S(3), part.sample, {
          fontFamily: 'monospace', resolution: TEXT_RES,
          fontSize: Math.max(6, Math.round(7 * scale)),
          color: part.tint === 0xff7a6a ? '#ff7a6a' : part.tint === 0xffb454 ? '#ffb454' : '#8fb7d8',
          lineSpacing: 2,
        });
        this.list.add(t);
      }
      // Numbered marker, hung off the box's top-left corner.
      const mx = ox + S(bx) - 1, my = oy + S(by) - 1;
      g.fillStyle(0xffb454, 0.95).fillCircle(mx, my, 7);
      const num = this.add.text(mx, my, `${part.n}`, {
        fontFamily: 'monospace', resolution: TEXT_RES, fontSize: 9, color: '#0a0d14',
      }).setOrigin(0.5);
      this.list.add(num);
    }

    // Minimap contacts.
    g.fillStyle(0x6fb7ff, 1).fillCircle(ox + S(316), oy + S(44), 2.5);
    g.fillStyle(0x6fb7ff, 1).fillCircle(ox + S(326), oy + S(52), 2.5);
    g.fillStyle(0xff6a5e, 1).fillCircle(ox + S(372), oy + S(26), 2.5);
    g.lineStyle(1, 0x3a4a62, 0.9).strokeRect(ox + S(300), oy + S(30), S(46), S(30));

    // Power board: three rows of pips, some lit.
    const lit = [2, 3, 1];
    ['WPN', 'ENG', 'REP'].forEach((row, r) => {
      const ry = 170 + r * 13;
      const label = this.add.text(ox + S(74), oy + S(ry), row, {
        fontFamily: 'monospace', resolution: TEXT_RES,
        fontSize: Math.max(6, Math.round(7 * scale)),
        color: ['#ff8866', '#6fb7ff', '#7dd68f'][r],
      });
      this.list.add(label);
      for (const bxp of [100, 176]) {
        g.lineStyle(1, 0x3a4a62, 1).strokeRect(ox + S(bxp), oy + S(ry - 1), S(11), S(11));
      }
      const glyphs = ['-', '+'];
      [100, 176].forEach((bxp, i) => {
        const t = this.add.text(ox + S(bxp + 5.5), oy + S(ry + 4.5), glyphs[i], {
          fontFamily: 'monospace', resolution: TEXT_RES,
          fontSize: Math.max(6, Math.round(7 * scale)), color: '#8593a6',
        }).setOrigin(0.5);
        this.list.add(t);
      });
      for (let j = 0; j < 4; j++) {
        const px = 118 + j * 14;
        if (j < lit[r]) {
          g.fillStyle([0xff8866, 0x6fb7ff, 0x7dd68f][r], 0.9)
            .fillRect(ox + S(px), oy + S(ry), S(10), S(9));
        } else {
          g.lineStyle(1, 0x3a4a62, 1).strokeRect(ox + S(px), oy + S(ry), S(10), S(9));
        }
      }
    });

    // Throttle gauge, part filled.
    g.fillStyle(0x9fd8ff, 0.85).fillRect(ox + S(381), oy + S(186), S(8), S(19));
    // The helm ring reads as a ring, not a box.
    g.lineStyle(1.5, 0x9fd8ff, 0.5)
      .strokeCircle(ox + S(34), oy + S(186), S(19));
    g.fillStyle(0x9fd8ff, 0.35).fillCircle(ox + S(34), oy + S(186), S(6));

    y = oy + S(vh) + 18;

    // Legend, one column on a phone and two on anything wider.
    const colW = narrow ? w - 46 : (w - 60) / 2;
    let colY = [y, y];
    HUD_PARTS.forEach((part, i) => {
      const col = narrow ? 0 : i % 2;
      const x = 24 + col * (colW + 16);
      const head = this.text(x, colY[col], `${part.n}. ${part.name}`, 11, '#ffb454');
      const body = this.text(x, colY[col] + 15, part.desc, 10, '#8593a6', { wrap: colW - 8 });
      colY[col] += 15 + body.height + 12;
      void head;
    });
    y = Math.max(...colY) + 8;

    y = this.heading(y, 'TOUCH');
    for (const [name, desc] of GESTURES) {
      this.text(24, y, name, 11, '#9fd8ff');
      const body = this.text(narrow ? 24 : 190, narrow ? y + 14 : y, desc, 10, '#8593a6',
        { wrap: narrow ? w - 52 : w - 220 });
      y += (narrow ? 14 + body.height : Math.max(body.height, 14)) + 10;
    }

    y += 6;
    y = this.heading(y, 'HOW A FIGHT WORKS');
    const notes = [
      'Your guns fire themselves. There is no fire button — turrets and the main '
        + 'battery engage whatever is in range and in arc, so your job is where '
        + 'the ship is pointing and where it is standing.',
      'Every turret only covers the side of the hull it sits on. Bow-on to a '
        + 'target you bring a handful of guns; turned broadside you bring most of '
        + 'them, and show a bigger target doing it.',
      'The main battery only fires down a narrow wedge off the bow, so lining a '
        + 'capital up on a target is a deliberate act that takes a while.',
      'Damage is physical. Shots eat the hull pixel by pixel, and a hardpoint '
        + 'stops working when the hull under it is gone. Ships lose teeth as they '
        + 'lose armour.',
      'Beams glow before they fire. That warm-up is your warning and your window '
        + '— a charging beam that is lined up on you will say so.',
    ];
    for (const n of notes) {
      const t = this.text(24, y, `· ${n}`, 10, '#aab6c6', { wrap: w - 52 });
      y += t.height + 8;
    }
    return y;
  }

  // ---- SHIPS -------------------------------------------------------------

  buildShips() {
    const w = this.scale.width;
    const narrow = w < 620;
    let y = 0;
    y = this.heading(y, `CAPITAL SHIPS — ${Object.keys(SHIPS).length} HULLS`);
    for (const [key, ship] of Object.entries(SHIPS)) {
      y += this.shipEntry(key, ship, y, narrow);
    }
    return y;
  }

  // Entries measure their own text and size the card to fit, so long
  // armament lists and descriptions never spill past the panel.
  shipEntry(key, ship, y, narrow) {
    const w = this.scale.width;
    const artH = 78;
    const artW = narrow ? w - 70 : 280;
    const sprite = this.add.image(0, 0, `ship_${key}`);
    sprite.setScale(Math.min(artH / sprite.height, artW / sprite.width, 1.6));
    this.list.add(sprite);

    const tx = narrow ? 30 : 330;
    const wrap = narrow ? w - 60 : w - 366;
    let ty = y + (narrow ? artH + 22 : 14);
    const top = ty;
    this.text(tx, ty, ship.name.toUpperCase(), 15, ship.hostile ? '#ff8a7a' : '#d8e2ee', { ls: 2 });
    ty += 21;
    this.text(tx, ty, `${ship.cls} · ${ship.faction}`, 11, '#6fb7ff');
    ty += 18;
    const complement = complementSummary(ship);
    const stats = this.text(tx, ty,
      `${ship.length} m   HULL ${ship.hull}   SPEED ${ship.speed}   TURN ${ship.turn}°/s\n`
      + `ARMAMENT ${armamentSummary(ship)}`
      + (complement ? `\nAIR GROUP ${complement}` : ''),
      10, '#8593a6', { wrap });
    ty += stats.height + 6;
    const desc = this.text(tx, ty, ship.desc, 10, '#aab6c6', { wrap });
    ty += desc.height;

    const height = Math.max(ty - y + 14, narrow ? artH + 40 : artH + 24);
    const card = this.card(y, height - 10, ship.hostile ? 0x5c2a2a : 0x1d2635);
    this.list.sendToBack(card);
    sprite.setPosition(narrow ? w / 2 : 170,
      narrow ? y + artH / 2 + 8 : y + (height - 10) / 2);

    // Hardpoint markers — the same data that drives combat and the refit bay.
    const bow = ship.flip ? -1 : 1;
    for (const point of ship.hardpoints) {
      const mx = sprite.x + bow * point.y * sprite.displayWidth;
      const my = sprite.y + point.x * sprite.displayHeight;
      const color = HP_COLORS[WEAPONS[point.fitted].type];
      const ring = this.add.circle(mx, my, 3.5).setStrokeStyle(1.4, color, 0.95);
      const dot = this.add.circle(mx, my, 1.1, color, 0.9);
      this.list.add(ring); this.list.add(dot);
    }
    void top;
    return height;
  }

  // ---- CRAFT -------------------------------------------------------------

  buildCraft() {
    const w = this.scale.width;
    const narrow = w < 620;
    let y = 0;
    y = this.heading(y, `STRIKE CRAFT — ${Object.keys(STRIKECRAFT).length} TYPES`);
    this.text(20, y, 'Carriers launch these in wings of four and they fly themselves. '
      + 'Bombers make torpedo runs on warships; fighters dogfight and strafe.',
      10, '#8593a6', { wrap: w - 40 });
    y += narrow ? 34 : 24;

    for (const [key, c] of Object.entries(STRIKECRAFT)) {
      const sprite = this.add.image(narrow ? 62 : 74, 0, `ship_${key}`);
      sprite.setScale(Math.min(44 / sprite.height, 92 / sprite.width, 2.2));
      this.list.add(sprite);

      const tx = narrow ? 116 : 136;
      const wrap = w - tx - 34;
      this.text(tx, y + 8, c.name.toUpperCase(), 12,
        c.faction === 'Shivan' ? '#ff8a7a' : '#d8e2ee', { ls: 1 });
      this.text(tx, y + 24, `${c.cls} · ${c.faction}`, 9, '#6fb7ff');
      const bomb = c.bomb ? `   TORPEDO ${c.bomb.damage} dmg / ${(c.bomb.delay / 1000).toFixed(0)}s` : '';
      const stats = this.text(tx, y + 38,
        `${c.length} m   HULL ${c.hull}   SPEED ${c.speed}   TURN ${c.turn}°/s`
        + `\nGUN ${c.gun.damage} dmg${bomb}`, 9, '#8593a6', { wrap });
      const rowH = Math.max(38 + stats.height + 14, 60);
      const card = this.card(y, rowH - 8, c.faction === 'Shivan' ? 0x5c2a2a : 0x1d2635);
      this.list.sendToBack(card);
      sprite.setPosition(sprite.x, y + (rowH - 8) / 2);
      y += rowH;
    }
    return y;
  }

  // ---- WEAPONS -----------------------------------------------------------

  buildWeapons() {
    const w = this.scale.width;
    const narrow = w < 620;
    let y = 0;
    y = this.heading(y, `ARMAMENT — ${Object.keys(WEAPONS).length} MOUNTS`);
    this.text(20, y, 'Spinal mounts fire down the bow only. Turrets cover the side of the '
      + 'hull they sit on. Anti-fighter mounts prefer strike craft; slash beams rake '
      + 'across a hull instead of holding one point.', 10, '#8593a6', { wrap: w - 40 });
    y += narrow ? 46 : 34;

    const rowH = narrow ? 54 : 34;
    for (const [, weapon] of Object.entries(WEAPONS)) {
      this.card(y, rowH - 6, weapon.beam ? 0x2b4a3a : 0x1d2635);
      const tags = [
        weapon.type === 'spinal' ? 'SPINAL' : 'TURRET',
        weapon.beam ? 'BEAM' : 'PROJECTILE',
        ...(weapon.slash ? ['SLASH'] : []),
        ...(weapon.anti ? ['ANTI-FIGHTER'] : []),
        ...(weapon.burst ? ['FLAK'] : []),
      ].join(' · ');
      this.text(30, y + 6, weapon.name.toUpperCase(), 11,
        weapon.beam ? '#8fd8a4' : '#d8e2ee', { ls: 1 });
      this.text(30, y + 21, tags, 9, '#5a6678');
      const stats = `${weapon.damage} DMG   ${weapon.range} RANGE   `
        + `${(weapon.delay / 1000).toFixed(1)}s RELOAD`;
      this.text(narrow ? 30 : w - 34, narrow ? y + 33 : y + 12, stats, 10, '#8593a6',
        { ox: narrow ? 0 : 1 });
      y += rowH;
    }
    return y;
  }

  // ---- ASSETS ------------------------------------------------------------

  buildAssets() {
    const w = this.scale.width;
    let y = 0;
    y = this.heading(y, 'WHERE THIS GAME COMES FROM');
    for (const [title, body] of ASSET_NOTES) {
      this.text(24, y, title, 11, '#ffb454', { ls: 1 });
      const t = this.text(24, y + 16, body, 10, '#aab6c6', { wrap: w - 52 });
      y += 16 + t.height + 16;
    }
    y = this.heading(y + 4, 'COUNTS');
    const counts = [
      `${Object.keys(SHIPS).length} capital ships`,
      `${Object.keys(STRIKECRAFT).length} fighters and bombers`,
      `${Object.keys(WEAPONS).length} weapon mounts`,
      `${Object.values(SHIPS).reduce((n, s) => n + s.hardpoints.length, 0)} modelled hardpoints`,
    ];
    this.text(24, y, counts.join('\n'), 10, '#8593a6');
    return y + 70;
  }
}
