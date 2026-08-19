import Phaser from 'phaser';
import { IMAGES } from '../manifest.js';
import { SHIPS, WEAPONS } from '../ships.js';
import {
  ensureNebula, ensureBeamTextures, ensureStarfield, ensureBoltTexture,
  factionColor, beamPalette, sfx,
} from '../fx.js';

// FS2 beam envelope: the muzzle charges visibly, then the beam erupts and
// burns — a slow, devastating event, not a shot. Anti-fighter and slash
// beams override charge/hold per weapon (see WEAPONS).
const BEAM_CHARGE = 650;
const BEAM_RAMP = 140;
const BEAM_HOLD = 2600;
const BEAM_FADE = 300;

const WORLD_W = 6000;
const WORLD_H = 4000;
const DEG = Math.PI / 180;
const BATTERY_ARC = 14 * DEG;
const ENGAGE_RANGE = 1000; // enemy AI's preferred gun range
const MM_W = 170; // minimap width; height follows world aspect

// UI lives on a second camera parked far outside the world so neither camera
// ever renders the other's objects — pinch-zooming the battle never touches
// the interface. All UI object x-coords are UIX + screenX.
const UIX = -20000;
const PANEL_H = 118;
const PAD = { x: 86, r: 54 }; // steering pad center-x / radius (y = h - 62)
const ZOOM_MIN = 0.15;
const ZOOM_MAX = 1.5;

// Energy Transfer System: a limited pool split across ship systems.
// Index = pips allocated (0..4).
const WPN_MUL = [1.7, 1.3, 1.0, 0.8, 0.65];  // weapon cooldown multiplier
const ENG_MUL = [0.55, 0.8, 1.0, 1.15, 1.3]; // speed & turn multiplier
const REP_RATE = [0, 1.2, 2.5, 4.5, 7];      // hull repaired per second

export class SandboxScene extends Phaser.Scene {
  constructor() {
    super('sandbox');
  }

  create(data) {
    this.playerKey = data?.player ?? this.playerKey ?? 'fenris';
    this.enemyKey = data?.enemy ?? this.enemyKey ?? 'cain';
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    ensureNebula(this);
    ensureBeamTextures(this);
    ensureStarfield(this);
    ensureBoltTexture(this);
    this.beams = [];
    this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'starfield')
      .setOrigin(0).setScrollFactor(0);
    this.bgNebula = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'nebula')
      .setOrigin(0).setScrollFactor(0).setAlpha(0.9);
    this.fires = [];

    this.playerShots = this.physics.add.group();
    this.enemyShots = this.physics.add.group();

    this.player = this.spawnCapital(this.playerKey, 1200, WORLD_H / 2, 20 * DEG);
    this.enemy = this.spawnCapital(this.enemyKey, WORLD_W - 1400, WORLD_H / 2, 200 * DEG);

    this.physics.add.overlap(this.playerShots, this.enemy, (_e, shot) => this.hit(shot, this.enemy));
    this.physics.add.overlap(this.enemyShots, this.player, (_p, shot) => this.hit(shot, this.player));

    const biggest = Math.max(
      this.player.displayWidth, this.player.displayHeight,
      this.enemy.displayWidth, this.enemy.displayHeight);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H)
      .startFollow(this.player, false, 0.06, 0.06)
      .setZoom(Phaser.Math.Clamp(240 / biggest, ZOOM_MIN, 0.9));
    this.following = true;

    // The interface renders on its own camera parked over UIX, so pinch-zooming
    // the battle camera never scales it.
    this.uiCam = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.uiCam.setScroll(UIX, 0);
    this.uiCam.ignore([this.bg, this.bgNebula]);
    this.uiAnchors = [];
    this.hitButtons = [];

    this.hullBars = this.add.graphics().setDepth(8);

    // Energy Transfer System: the player splits a fixed pool between weapons,
    // engines and repair. The enemy captain runs a balanced board (all ×1).
    this.energy = { wpn: 2, eng: 2, rep: 2, pool: 8 };
    // Helm orders persist after the finger lifts — capitals keep way on.
    this.helm = { steer: this.player.facing, throttle: 0, engaged: false };

    this.createMinimap();
    this.createControls();
    this.over = false;

    const onResize = (s) => {
      this.uiCam.setSize(s.width, s.height);
      for (const { obj, anchor } of this.uiAnchors) {
        const pos = anchor(s.width, s.height);
        obj.setPosition(UIX + pos.x, pos.y);
      }
    };
    this.scale.on('resize', onResize);
    this.events.once('shutdown', () => this.scale.off('resize', onResize));
  }

  // Registers a UI object at a screen-anchored position (re-applied on resize).
  uiPlace(obj, anchor) {
    this.uiAnchors.push({ obj, anchor });
    const pos = anchor(this.scale.width, this.scale.height);
    obj.setPosition(UIX + pos.x, pos.y);
  }

  drawHullBars() {
    const g = this.hullBars;
    g.clear();
    for (const ship of [this.player, this.enemy]) {
      if (!ship?.active || ship.dying) continue;
      const frac = Phaser.Math.Clamp(ship.hull / ship.spec.hull, 0, 1);
      if (frac >= 1) continue;
      const w = Phaser.Math.Clamp(ship.displayWidth, 70, 320);
      const x = ship.x - w / 2, y = ship.y - ship.displayHeight / 2 - 14;
      const color = frac > 0.6 ? 0x7dd68f : frac > 0.3 ? 0xffb454 : 0xff5040;
      g.fillStyle(0x0a0d14, 0.7).fillRect(x - 1, y - 1, w + 2, 5);
      g.fillStyle(color, 0.9).fillRect(x, y, w * frac, 3);
    }
  }

  createMinimap() {
    this.mmH = Math.round(MM_W * (WORLD_H / WORLD_W));
    this.minimap = this.add.graphics().setDepth(15);
    this.uiPlace(this.minimap, (w) => ({ x: w - MM_W - 14, y: 14 }));
  }

  drawMinimap() {
    const g = this.minimap;
    const px = (x) => (x / WORLD_W) * MM_W;
    const py = (y) => (y / WORLD_H) * this.mmH;
    g.clear();
    g.fillStyle(0x0a0d14, 0.72).fillRect(0, 0, MM_W, this.mmH);
    g.lineStyle(1, 0x2b3a52, 1).strokeRect(0, 0, MM_W, this.mmH);
    const view = this.cameras.main.worldView;
    g.lineStyle(1, 0x3a4a62, 0.9).strokeRect(px(view.x), py(view.y), px(view.width), py(view.height));
    const blip = (ship, color) => {
      if (!ship.active) return;
      const x = px(ship.x), y = py(ship.y);
      g.fillStyle(color, 1).fillCircle(x, y, 3);
      g.lineStyle(1, color, 0.9).lineBetween(x, y, x + Math.cos(ship.facing) * 8, y + Math.sin(ship.facing) * 8);
    };
    blip(this.player, 0x6fb7ff);
    blip(this.enemy, 0xff6a5e);
  }

  // Each ship gets a private canvas copy of its sprite so combat can erode it
  // pixel by pixel. Hardpoints die when the hull under them is shot away.
  makeDamageCanvas(key) {
    const src = this.textures.get(`ship_${key}`).getSourceImage();
    const texKey = `dmg_${key}_${this.dmgCounter = (this.dmgCounter ?? 0) + 1}`;
    const canvas = this.textures.createCanvas(texKey, src.width, src.height);
    canvas.context.drawImage(src, 0, 0);
    canvas.refresh();
    (this.dmgKeys ??= []).push(texKey);
    this.events.once('shutdown', () => this.textures.remove(texKey));
    return texKey;
  }

  mountRegion(ship, point) {
    // Texture space for horizontal art: bow is at -x for flipped (left-facing)
    // sprites, +x otherwise; the hardpoint's lateral axis is texture y.
    const w = ship.damageCanvas.width, h = ship.damageCanvas.height;
    const bow = ship.spec.flip ? -1 : 1;
    return {
      cx: w / 2 + bow * point.y * w,
      cy: h / 2 + point.x * h,
      r: Math.max(8, Math.min(w, h) * 0.16),
    };
  }

  countOpaque(canvasTex, reg) {
    const x0 = Math.max(0, Math.round(reg.cx - reg.r));
    const y0 = Math.max(0, Math.round(reg.cy - reg.r));
    const size = Math.round(reg.r * 2);
    const data = canvasTex.context.getImageData(x0, y0, size, size).data;
    let count = 0;
    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        const dx = x0 + px - reg.cx, dy = y0 + py - reg.cy;
        if (dx * dx + dy * dy <= reg.r * reg.r && data[(py * size + px) * 4 + 3] > 60) count++;
      }
    }
    return count;
  }

  spawnCapital(key, x, y, facing) {
    const spec = SHIPS[key];
    const ship = this.physics.add.image(x, y, this.makeDamageCanvas(key));
    ship.damageCanvas = this.textures.get(ship.texture.key);
    // Horizontal art: sprite width is the hull length; scale to display length.
    ship.setScale(IMAGES[`ship_${key}`].targetLength / ship.width);
    ship.body.setSize(ship.width * 0.75, ship.height * 0.75, true);
    ship.spec = spec;
    ship.hull = spec.hull;
    ship.facing = facing;
    ship.throttle = 0;
    ship.angleOffset = IMAGES[`ship_${key}`].angleOffset * DEG;
    ship.syncAngle = () => ship.setRotation(ship.facing + ship.angleOffset);
    ship.syncAngle();
    ship.nextFire = spec.hardpoints.map(() => 0);
    ship.mountDisabled = spec.hardpoints.map(() => false);
    ship.mountBaseline = spec.hardpoints.map((point) =>
      this.countOpaque(ship.damageCanvas, this.mountRegion(ship, point)));
    ship.accent = factionColor(spec);
    ship.engine = this.add.particles(0, 0, 'glow-orb', {
      tint: ship.accent, lifespan: 380, speed: { min: 4, max: 18 },
      scale: { start: 0.22, end: 0 }, alpha: { start: 0.75, end: 0 },
      frequency: -1, blendMode: 'ADD',
    }).setDepth(2);
    ship.engineOn = false;
    return ship;
  }

  updateEngine(ship) {
    if (!ship.active) return;
    const stern = -ship.displayWidth * 0.48;
    ship.engine.setPosition(
      ship.x + Math.cos(ship.facing) * stern,
      ship.y + Math.sin(ship.facing) * stern,
    );
    const thr = ship.dying ? 0 : ship.throttle;
    if (thr > 0.05) {
      if (!ship.engineOn) { ship.engine.start(); ship.engineOn = true; }
      ship.engine.frequency = 130 - 110 * thr;
    } else if (ship.engineOn) {
      ship.engine.stop();
      ship.engineOn = false;
    }
  }

  // Erode pixels around the impact; area scales with damage relative to hull.
  applyPixelDamage(ship, wx, wy, damage) {
    const tex = ship.damageCanvas;
    const ctx = tex.context;
    const w = tex.width, h = tex.height;
    const cos = Math.cos(-ship.rotation), sin = Math.sin(-ship.rotation);
    const dx = wx - ship.x, dy = wy - ship.y;
    const lx = (dx * cos - dy * sin) / ship.scaleX + w / 2;
    const ly = (dx * sin + dy * cos) / ship.scaleY + h / 2;

    const budget = (damage / ship.spec.hull) * w * h * 0.5;
    const spread = Math.min(w, h) * 0.11;
    ctx.globalCompositeOperation = 'destination-out';
    for (let spent = 0; spent < budget;) {
      const r = Phaser.Math.Between(2, 5);
      const ang = Math.random() * Math.PI * 2;
      const dist = Math.random() * spread;
      ctx.beginPath();
      ctx.arc(lx + Math.cos(ang) * dist, ly + Math.sin(ang) * dist, r, 0, Math.PI * 2);
      ctx.fill();
      spent += Math.PI * r * r;
    }
    ctx.globalCompositeOperation = 'source-over';
    tex.refresh();

    ship.spec.hardpoints.forEach((point, i) => {
      if (ship.mountDisabled[i] || ship.mountBaseline[i] < 20) return;
      const reg = this.mountRegion(ship, point);
      if (Math.hypot(reg.cx - lx, reg.cy - ly) > reg.r + spread + 6) return;
      if (this.countOpaque(tex, reg) / ship.mountBaseline[i] < 0.55) {
        ship.mountDisabled[i] = true;
        const pos = this.hardpointPos(ship, point);
        this.burst(pos.x, pos.y, 14);
        sfx('boom');
        // Dead mounts burn for the rest of the fight.
        const fire = this.add.particles(pos.x, pos.y, 'glow-orb', {
          tint: 0xff8844, lifespan: 480, speed: { min: 5, max: 25 },
          scale: { start: 0.18, end: 0 }, alpha: { start: 0.8, end: 0 },
          frequency: 110, blendMode: 'ADD',
        }).setDepth(4);
        this.fires.push({ ship, point, emitter: fire });
      }
    });
  }

  // World position of a hardpoint: y runs along the hull toward the bow,
  // x is lateral. Sprite WIDTH is the hull length (art is horizontal).
  hardpointPos(ship, point) {
    const along = point.y * ship.displayWidth;
    const lateral = point.x * ship.displayHeight;
    const cos = Math.cos(ship.facing), sin = Math.sin(ship.facing);
    return {
      x: ship.x + cos * along - sin * lateral,
      y: ship.y + sin * along + cos * lateral,
    };
  }

  // Heavy helm: velocity eases toward facing * maxSpeed * throttle.
  steerCapital(ship, dt) {
    const spec = ship.spec;
    const speed = spec.speed * (ship.speedMul ?? 1);
    const targetVx = Math.cos(ship.facing) * speed * ship.throttle;
    const targetVy = Math.sin(ship.facing) * speed * ship.throttle;
    const ease = Math.min(1, (spec.accel / spec.speed) * dt);
    ship.setVelocity(
      ship.body.velocity.x + (targetVx - ship.body.velocity.x) * ease,
      ship.body.velocity.y + (targetVy - ship.body.velocity.y) * ease,
    );
    ship.syncAngle();
  }

  muzzleFlash(x, y, color) {
    const flash = this.add.circle(x, y, 7, color, 0.9).setBlendMode(Phaser.BlendModes.ADD).setDepth(5);
    this.tweens.add({ targets: flash, scale: 2.2, alpha: 0, duration: 160, onComplete: () => flash.destroy() });
  }

  fireShot(group, ship, x, y, angle, weapon) {
    const isFlak = !!weapon.burst;
    // Sheet bolt art streaks leftward (bright core at the left edge), so the
    // sprite is rotated 180° from its travel direction.
    const shot = group.create(x, y, weapon.bolt ?? 'bolt');
    shot.setBlendMode(Phaser.BlendModes.ADD);
    if (weapon.bolt) {
      const len = isFlak ? 20 : weapon.type === 'spinal' ? 52 : 34;
      shot.setDisplaySize(len, Math.max(6, len * (shot.height / shot.width)))
        .setRotation(angle + Math.PI);
    } else {
      shot.setScale(isFlak ? 0.55 : weapon.type === 'spinal' ? 1.3 : 0.8)
        .setRotation(angle)
        .setTint(isFlak ? 0xffcc88 : ship.accent);
    }
    shot.damage = weapon.damage;
    shot.burstFx = isFlak;
    this.physics.velocityFromRotation(angle, weapon.speed, shot.body.velocity);
    this.time.delayedCall((weapon.range / weapon.speed) * 1000 + 250, () => shot.destroy());
    sfx(isFlak ? 'flak' : weapon.type === 'spinal' ? 'heavy' : 'laser');
  }

  flakBurst(x, y) {
    const burst = this.add.image(x, y, 'fx_flak_burst')
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(5)
      .setRotation(Math.random() * Math.PI * 2)
      .setScale(0.35 + Math.random() * 0.3).setAlpha(0.95);
    this.tweens.add({
      targets: burst, scale: burst.scale * 1.6, alpha: 0,
      duration: 320, onComplete: () => burst.destroy(),
    });
  }

  // Beams are sustained: they sweep with the firing ship for ~0.9s and deal
  // their damage continuously while the ray is actually on the target.
  fireBeam(ship, target, weapon, point, turret = false) {
    const palette = beamPalette(ship.spec);
    const strip = (key, depth, tint) => this.add.image(0, 0, key)
      .setOrigin(0, 0.5).setBlendMode(Phaser.BlendModes.ADD).setDepth(depth)
      .setTint(tint).setVisible(false);
    const orb = (tint) => this.add.image(0, 0, 'glow-orb')
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(5).setTint(tint).setVisible(false);
    const beam = {
      ship, target, weapon, point, palette, turret,
      charge: weapon.chargeMs ?? BEAM_CHARGE,
      hold: weapon.holdMs ?? BEAM_HOLD,
      elapsed: 0, pixelPool: 0, connected: false, lastSpark: 0, fired: false,
      // Sheet beam art (muzzle at the image's left edge) replaces the three
      // generated glow strips when the weapon has one.
      body: weapon.beamTex
        ? this.add.image(0, 0, weapon.beamTex).setOrigin(0, 0.5)
          .setBlendMode(Phaser.BlendModes.ADD).setDepth(4).setVisible(false)
        : null,
      halo: weapon.beamTex ? null : strip('beam-halo', 4, palette.outer),
      mid: weapon.beamTex ? null : strip('beam-halo', 4, palette.mid),
      core: weapon.beamTex ? null : strip('beam-core', 5, 0xffffff),
      flare: strip('beam-halo', 5, palette.mid), // fat cone at the muzzle
      muzzle: orb(0xffffff),
      impact: orb(palette.mid),
    };
    this.beams.push(beam);
    sfx('beamCharge');
  }

  beamParts(beam) {
    return [beam.body, beam.halo, beam.mid, beam.core, beam.flare, beam.muzzle, beam.impact]
      .filter(Boolean);
  }

  updateBeams(delta, time) {
    this.beams = this.beams.filter((beam) => {
      const { ship, target, weapon, point } = beam;
      beam.elapsed += delta;
      const total = beam.charge + BEAM_RAMP + beam.hold + BEAM_FADE;
      if (beam.elapsed >= total || !ship.active) {
        for (const part of this.beamParts(beam)) part.destroy();
        return false;
      }
      const pos = this.hardpointPos(ship, point);
      // Spinal beams fire down the bow and sweep with the ship; turreted
      // beams (AAA, slash) track the target from their mount.
      const dir = beam.turret && target.active
        ? Phaser.Math.Angle.Between(pos.x, pos.y, target.x, target.y)
        : ship.facing;

      // Charge phase: the muzzle glow swells before the beam erupts.
      if (beam.elapsed < beam.charge) {
        const charge = beam.elapsed / beam.charge;
        const size = (30 + 80 * charge) * (0.9 + Math.random() * 0.2);
        beam.muzzle.setVisible(true).setPosition(pos.x, pos.y)
          .setDisplaySize(size, size).setAlpha(0.5 + 0.5 * charge);
        return true;
      }

      const t = beam.elapsed - beam.charge;
      if (!beam.fired) {
        beam.fired = true;
        sfx('beamFire');
      }
      const power = t < BEAM_RAMP ? t / BEAM_RAMP
        : t < BEAM_RAMP + beam.hold ? 0.86 + Math.random() * 0.14
        : 1 - (t - BEAM_RAMP - beam.hold) / BEAM_FADE;

      let length = weapon.range;
      let hitting = false;
      if (target.active && !target.dying) {
        const tx = target.x - pos.x, ty = target.y - pos.y;
        const along = tx * Math.cos(dir) + ty * Math.sin(dir);
        const perp = Math.abs(-Math.sin(dir) * tx + Math.cos(dir) * ty);
        if (along > 0 && along < weapon.range
          && perp < Math.max(target.displayWidth, target.displayHeight) * 0.35) {
          length = along;
          hitting = true;
        }
      }
      const endX = pos.x + Math.cos(dir) * length;
      const endY = pos.y + Math.sin(dir) * length;

      const place = (img, height, alpha, len = length) => img.setVisible(true)
        .setPosition(pos.x, pos.y).setRotation(dir)
        .setDisplaySize(len, height).setAlpha(alpha);
      if (beam.body) {
        // The ordnance sheet's own beam art, stretched muzzle-to-impact.
        place(beam.body, (weapon.beamWidth ?? 24) * (0.85 + 0.3 * power), Math.min(1, 0.35 + 0.65 * power));
      } else {
        // Fallback: generated glow strips (outer → inner → white core).
        place(beam.halo, 74 * power, 0.7 * power);
        place(beam.mid, 34 * power, 0.85 * power);
        place(beam.core, 9 * power, power);
      }
      place(beam.flare, 90 * power, 0.9 * power, 150); // eruption cone at the muzzle
      beam.muzzle.setVisible(true).setPosition(pos.x, pos.y)
        .setDisplaySize(120 * power, 120 * power).setAlpha(power);
      beam.impact.setVisible(hitting).setPosition(endX, endY);

      if (hitting && !ship.dying && t < BEAM_RAMP + beam.hold) {
        beam.impact.setDisplaySize(100 + Math.random() * 45, 100 + Math.random() * 45).setAlpha(power);
        if (!beam.connected) {
          beam.connected = true;
          this.cameras.main.shake(160, 0.004);
        }
        const tick = weapon.damage * (delta / (BEAM_RAMP + beam.hold));
        target.hull -= tick;
        beam.pixelPool += tick;
        if (beam.pixelPool > 26) {
          this.applyPixelDamage(target, endX, endY, beam.pixelPool);
          beam.pixelPool = 0;
        }
        if (time > beam.lastSpark + 110) {
          beam.lastSpark = time;
          this.burst(endX, endY, 4);
        }
        if (target === this.player && time > (this.lastBeamHitSound ?? 0) + 700) {
          this.lastBeamHitSound = time;
          sfx('hit');
        }
        if (target.hull <= 0 && !this.over) this.startDeath(target);
      }
      return true;
    });
  }

  // Turret hardpoints engage on their own when the target is inside their
  // fitted weapon's range; each fires from its real mount position.
  runTurrets(ship, target, group, time, delayMul = 1) {
    if (!target.active || target.dying || ship.dying) return;
    ship.spec.hardpoints.forEach((point, i) => {
      const weapon = WEAPONS[point.fitted];
      if (weapon.type !== 'turret' || ship.mountDisabled[i] || time < ship.nextFire[i]) return;
      const pos = this.hardpointPos(ship, point);
      const dist = Phaser.Math.Distance.Between(pos.x, pos.y, target.x, target.y);
      if (dist > weapon.range) return;
      ship.nextFire[i] = time + weapon.delay * delayMul + Math.random() * 500;
      if (weapon.beam) {
        this.fireBeam(ship, target, weapon, point, true);
        return;
      }
      const aim = Phaser.Math.Angle.Between(pos.x, pos.y, target.x, target.y) + (Math.random() - 0.5) * 4 * DEG;
      this.fireShot(group, ship, pos.x, pos.y, aim, weapon);
    });
  }

  // Spinal mounts fire together on the battery trigger, but only when the bow
  // is actually laid on the target.
  tryBattery(ship, target, group, time, delayMul = 1) {
    if (!target.active || target.dying || ship.dying) return false;
    const aim = Phaser.Math.Angle.Between(ship.x, ship.y, target.x, target.y);
    if (Math.abs(Phaser.Math.Angle.Wrap(aim - ship.facing)) > BATTERY_ARC) return false;
    let fired = false;
    ship.spec.hardpoints.forEach((point, i) => {
      const weapon = WEAPONS[point.fitted];
      if (weapon.type !== 'spinal' || ship.mountDisabled[i] || time < ship.nextFire[i]) return;
      const pos = this.hardpointPos(ship, point);
      if (Phaser.Math.Distance.Between(pos.x, pos.y, target.x, target.y) > weapon.range) return;
      ship.nextFire[i] = time + weapon.delay * delayMul;
      if (weapon.beam) {
        this.fireBeam(ship, target, weapon, point);
      } else {
        this.fireShot(group, ship, pos.x, pos.y, ship.facing, weapon);
        this.muzzleFlash(pos.x, pos.y, ship.accent);
      }
      fired = true;
    });
    return fired;
  }

  batteryReady(ship, time) {
    return ship.spec.hardpoints.some((point, i) =>
      WEAPONS[point.fitted].type === 'spinal' && !ship.mountDisabled[i] && time >= ship.nextFire[i]);
  }

  hit(shot, ship) {
    const damage = shot.damage ?? 10;
    const { x, y, burstFx } = shot;
    shot.destroy();
    if (burstFx) this.flakBurst(x, y);
    this.damageShip(ship, damage, x, y);
  }

  damageShip(ship, damage, x, y) {
    if (ship.dying) return;
    ship.hull -= damage;
    this.applyPixelDamage(ship, x, y, damage);
    this.burst(x, y, 5);
    if (ship === this.player) {
      sfx('hit');
      if (damage >= 50) this.cameras.main.shake(150, 0.005);
    }
    if (ship.hull <= 0 && !this.over) this.startDeath(ship);
  }

  // GSB-style staged death: secondary explosions walk the hull, then the
  // magazine goes with a flash and debris.
  startDeath(ship) {
    ship.dying = true;
    ship.mountDisabled = ship.mountDisabled.map(() => true);
    ship.setAcceleration(0);
    ship.throttle = 0;
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 190, () => {
        if (!ship.active) return;
        this.burst(
          ship.x + (Math.random() - 0.5) * ship.displayWidth * 0.7,
          ship.y + (Math.random() - 0.5) * ship.displayHeight * 0.7, 12);
        sfx('boom');
      });
    }
    this.time.delayedCall(1000, () => {
      if (!ship.active) return;
      const { x, y } = ship;
      const size = Math.max(ship.displayWidth, ship.displayHeight);
      this.burst(x, y, 46);
      const flash = this.add.circle(x, y, size * 0.5, 0xfff2cc, 0.85)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(6);
      this.tweens.add({ targets: flash, scale: 2.3, alpha: 0, duration: 480, onComplete: () => flash.destroy() });
      for (let i = 0; i < 9; i++) {
        const chunk = this.add.image(x, y, 'glow-orb')
          .setTint(0x777788).setScale(0.2 + Math.random() * 0.3).setDepth(3);
        const ang = Math.random() * Math.PI * 2;
        const dist = size * (0.4 + Math.random() * 0.8);
        this.tweens.add({
          targets: chunk, x: x + Math.cos(ang) * dist, y: y + Math.sin(ang) * dist,
          angle: Phaser.Math.Between(-180, 180), alpha: 0,
          duration: 1600 + Math.random() * 900, onComplete: () => chunk.destroy(),
        });
      }
      this.cameras.main.shake(320, 0.01);
      sfx('bigBoom');
      ship.engine.destroy();
      ship.destroy();
      this.endMission(ship === this.enemy);
    });
  }

  burst(x, y, quantity) {
    const emitter = this.add.particles(x, y, 'glow-orb', {
      speed: { min: 50, max: 300 }, lifespan: 500, quantity,
      scale: { start: 0.4, end: 0 }, blendMode: 'ADD', emitting: false,
    });
    emitter.explode(quantity);
    this.time.delayedCall(700, () => emitter.destroy());
  }

  endMission(won) {
    this.over = true;
    if (won) sfx('win');
    this.banner.setText(won
      ? 'HOSTILE DESTROYED\n\nTAP TO RETURN'
      : 'SHIP LOST\n\nTAP TO RETURN');
  }

  // Touch-first control suite: a helm pad, an energy board, camera gestures
  // (one-finger pan, two-finger pinch), FOCUS re-centering, and an exit tap.
  // All batteries fire automatically — there is no fire button.
  createControls() {
    this.input.addPointer(3);

    this.hud = this.add.text(0, 0, '', {
      fontFamily: 'monospace', fontSize: 13, color: '#9fd8ff',
    }).setDepth(21);
    this.uiPlace(this.hud, () => ({ x: 52, y: 12 }));

    this.banner = this.add.text(0, 0, '', {
      fontFamily: 'monospace', fontSize: 30, color: '#ffffff', align: 'center',
    }).setOrigin(0.5).setDepth(30);
    this.uiPlace(this.banner, (w, h) => ({ x: w / 2, y: h / 2 - 40 }));

    // Panel chrome (backdrop, pad, pips, gauges) is redrawn every frame by
    // drawPanel(); static labels and tap targets are registered here.
    this.panelG = this.add.graphics().setDepth(20);
    this.uiPlace(this.panelG, () => ({ x: 0, y: 0 }));

    const label = (str, anchor, opts = {}) => {
      const t = this.add.text(0, 0, str, {
        fontFamily: 'monospace', fontSize: opts.size ?? 13, color: opts.color ?? '#9fd8ff',
      }).setOrigin(opts.ox ?? 0.5, 0.5).setDepth(22);
      this.uiPlace(t, anchor);
      return t;
    };
    const button = (str, at, cb, opts = {}) => {
      label(str, (w, h) => {
        const r = at(w, h);
        return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
      }, opts);
      this.hitButtons.push({ at, cb });
    };

    button('✕', () => ({ x: 4, y: 4, w: 40, h: 36 }),
      () => this.scene.start('title'), { size: 18, color: '#8593a6' });
    button('⌖ FOCUS', (w, h) => ({ x: w - 104, y: h - PANEL_H - 44, w: 96, h: 34 }), () => {
      this.cameras.main.startFollow(this.player, false, 0.06, 0.06);
      this.following = true;
    });

    [['wpn', 'WPN', '#ff8866'], ['eng', 'ENG', '#6fb7ff'], ['rep', 'REP', '#7dd68f']]
      .forEach(([sys, name, color], r) => {
        const rowY = (h) => h - 92 + r * 30;
        label(name, (w, h) => ({ x: 150, y: rowY(h) }), { ox: 0, color });
        button('−', (w, h) => ({ x: 183, y: rowY(h) - 13, w: 26, h: 26 }), () => this.adjustEnergy(sys, -1));
        button('+', (w, h) => ({ x: 293, y: rowY(h) - 13, w: 26, h: 26 }), () => this.adjustEnergy(sys, 1));
      });
    this.poolText = label('', (w, h) => ({ x: 150, y: h - 112 }), { ox: 0, size: 11, color: '#8593a6' });

    // Pointer routing: the pad steers, one free finger pans, two pinch.
    this.steerId = null;
    this.panPointers = new Map();
    this.pinch = null;

    this.input.on('pointerdown', (p) => {
      if (this.over) { this.scene.start('title'); return; }
      const w = this.scale.width, h = this.scale.height;
      for (const b of this.hitButtons) {
        const r = b.at(w, h);
        if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) { b.cb(); return; }
      }
      if (this.steerId === null && Math.hypot(p.x - PAD.x, p.y - (h - 62)) < PAD.r + 18) {
        this.steerId = p.id;
        this.updateSteer(p);
        return;
      }
      // The panel strip and minimap are dead zones for camera gestures.
      if (p.y > h - PANEL_H) return;
      if (p.x > w - MM_W - 28 && p.y < this.mmH + 28) return;
      this.panPointers.set(p.id, { x: p.x, y: p.y });
      if (this.panPointers.size === 2) {
        const [a, b] = [...this.panPointers.values()];
        this.pinch = { d0: Math.max(20, Math.hypot(a.x - b.x, a.y - b.y)), z0: this.cameras.main.zoom };
      }
    });

    this.input.on('pointermove', (p) => {
      if (p.id === this.steerId) { this.updateSteer(p); return; }
      const entry = this.panPointers.get(p.id);
      if (!entry) return;
      const cam = this.cameras.main;
      if (this.pinch && this.panPointers.size >= 2) {
        entry.x = p.x;
        entry.y = p.y;
        const [a, b] = [...this.panPointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        cam.setZoom(Phaser.Math.Clamp(this.pinch.z0 * (d / this.pinch.d0), ZOOM_MIN, ZOOM_MAX));
      } else {
        const dx = p.x - entry.x, dy = p.y - entry.y;
        entry.x = p.x;
        entry.y = p.y;
        if (this.following) { cam.stopFollow(); this.following = false; }
        cam.setScroll(cam.scrollX - dx / cam.zoom, cam.scrollY - dy / cam.zoom);
      }
    });

    const release = (p) => {
      if (p.id === this.steerId) this.steerId = null; // helm holds the last order
      this.panPointers.delete(p.id);
      if (this.panPointers.size < 2) this.pinch = null;
    };
    this.input.on('pointerup', release);
    this.input.on('pointerupoutside', release);

    // Desktop convenience: the wheel zooms too.
    this.input.on('wheel', (_p, _objs, _dx, dy) => {
      const cam = this.cameras.main;
      cam.setZoom(Phaser.Math.Clamp(cam.zoom * (dy > 0 ? 0.9 : 1.111), ZOOM_MIN, ZOOM_MAX));
    });
  }

  updateSteer(p) {
    const dx = p.x - PAD.x, dy = p.y - (this.scale.height - 62);
    const len = Math.hypot(dx, dy);
    if (len < 6) return;
    this.helm.engaged = true;
    this.helm.steer = Math.atan2(dy, dx);
    this.helm.throttle = Phaser.Math.Clamp(len / PAD.r, 0, 1);
  }

  adjustEnergy(sys, delta) {
    const e = this.energy;
    const used = e.wpn + e.eng + e.rep;
    if (delta > 0 && (e[sys] >= 4 || used >= e.pool)) return;
    if (delta < 0 && e[sys] <= 0) return;
    e[sys] += delta;
  }

  drawPanel() {
    const g = this.panelG;
    const w = this.scale.width, h = this.scale.height;
    const e = this.energy;
    g.clear();
    g.fillStyle(0x0a0d14, 0.78).fillRect(0, h - PANEL_H, w, PANEL_H);
    g.lineStyle(1, 0x2b3a52, 1).lineBetween(0, h - PANEL_H, w, h - PANEL_H);

    // Helm pad: the nub shows the standing steering order.
    const cy = h - 62;
    g.fillStyle(0xffffff, 0.05).fillCircle(PAD.x, cy, PAD.r);
    g.lineStyle(2, 0x9fd8ff, 0.35).strokeCircle(PAD.x, cy, PAD.r);
    const nx = this.helm.engaged ? PAD.x + Math.cos(this.helm.steer) * PAD.r * this.helm.throttle : PAD.x;
    const ny = this.helm.engaged ? cy + Math.sin(this.helm.steer) * PAD.r * this.helm.throttle : cy;
    g.fillStyle(0x9fd8ff, this.steerId !== null ? 0.55 : 0.3).fillCircle(nx, ny, 13);

    // Exit and FOCUS button chrome.
    g.fillStyle(0x11161f, 0.7).fillRect(4, 4, 40, 36);
    g.lineStyle(1, 0x2b3a52, 1).strokeRect(4, 4, 40, 36);
    g.fillStyle(0x11161f, 0.85).fillRect(w - 104, h - PANEL_H - 44, 96, 34);
    g.lineStyle(1, this.following ? 0x6fb7ff : 0x3a4a62, 1).strokeRect(w - 104, h - PANEL_H - 44, 96, 34);

    // Energy board rows: − [pips ×4] +
    const colors = [0xff8866, 0x6fb7ff, 0x7dd68f];
    ['wpn', 'eng', 'rep'].forEach((sys, r) => {
      const y = h - 92 + r * 30;
      for (const bx of [183, 293]) {
        g.fillStyle(0x11161f, 0.8).fillRect(bx, y - 13, 26, 26);
        g.lineStyle(1, 0x3a4a62, 1).strokeRect(bx, y - 13, 26, 26);
      }
      for (let j = 0; j < 4; j++) {
        const x = 214 + j * 20;
        if (j < e[sys]) g.fillStyle(colors[r], 0.9).fillRect(x, y - 8, 16, 16);
        else g.lineStyle(1, 0x3a4a62, 1).strokeRect(x, y - 8, 16, 16);
      }
    });

    // Throttle gauge.
    const bx = w - 34, by = h - 108, bh = 92;
    g.fillStyle(0x11161f, 0.8).fillRect(bx, by, 12, bh);
    g.lineStyle(1, 0x3a4a62, 1).strokeRect(bx, by, 12, bh);
    const fill = bh * this.helm.throttle;
    if (fill > 1) g.fillStyle(0x9fd8ff, 0.85).fillRect(bx + 2, by + bh - fill, 8, fill);
  }

  update(time, delta) {
    const dt = delta / 1000;
    const cam = this.cameras.main;
    const sw = this.scale.width, sh = this.scale.height;

    // The scrollFactor-0 backdrops scale with camera zoom; refit them every
    // frame so any pinch level keeps the screen covered.
    const z = cam.zoom;
    for (const layer of [this.bg, this.bgNebula]) {
      layer.setPosition((0 - sw / 2) / z + sw / 2, (0 - sh / 2) / z + sh / 2)
        .setSize(sw / z, sh / z);
    }
    this.bg.setTilePosition(cam.scrollX * 0.15, cam.scrollY * 0.15);
    this.bgNebula.setTilePosition(cam.scrollX * 0.28, cam.scrollY * 0.28);

    this.drawMinimap();
    this.drawPanel();
    this.updateBeams(delta, time);
    this.updateEngine(this.player);
    this.updateEngine(this.enemy);
    this.fires = this.fires.filter((f) => {
      if (!f.ship.active) { f.emitter.destroy(); return false; }
      const pos = this.hardpointPos(f.ship, f.point);
      f.emitter.setPosition(pos.x, pos.y);
      return true;
    });
    this.drawHullBars();

    const e = this.energy;
    this.poolText.setText(`POWER  FREE ${e.pool - e.wpn - e.eng - e.rep}/${e.pool}`);

    if (!this.player.active || this.player.dying) return;
    const spec = this.player.spec;

    // Helm holds the last ordered heading; engine power scales speed and turn.
    const engMul = ENG_MUL[e.eng];
    this.player.speedMul = engMul;
    if (this.helm.engaged) {
      this.player.facing = Phaser.Math.Angle.RotateTo(
        this.player.facing, this.helm.steer, spec.turn * DEG * dt * engMul);
    }
    this.player.throttle = this.helm.throttle;
    this.steerCapital(this.player, dt);

    // Repair crews patch the hull from the energy pool.
    this.player.hull = Math.min(spec.hull, this.player.hull + REP_RATE[e.rep] * dt);

    // The weapons officer runs every battery on their own: turrets and the
    // main battery both engage automatically; weapon power sets the tempo.
    const wpnMul = WPN_MUL[e.wpn];
    this.runTurrets(this.player, this.enemy, this.playerShots, time, wpnMul);
    if (!this.over) this.tryBattery(this.player, this.enemy, this.playerShots, time, wpnMul);

    // Enemy captain: close to gun range, then hold a slow broadside orbit.
    if (this.enemy.active && !this.enemy.dying && !this.over) {
      const e = this.enemy;
      const dist = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
      const bearing = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
      const want = dist > ENGAGE_RANGE * 0.85 ? bearing : bearing + 70 * DEG;
      e.facing = Phaser.Math.Angle.RotateTo(e.facing, want, e.spec.turn * DEG * dt);
      e.throttle = dist > ENGAGE_RANGE * 0.5 ? 1 : 0.45;
      this.steerCapital(e, dt);
      this.runTurrets(e, this.player, this.enemyShots, time);
      this.tryBattery(e, this.player, this.enemyShots, time);
    }

    // Battery readout counts down to the next ready spinal mount.
    const spinalWaits = this.player.spec.hardpoints
      .map((point, i) => ({ point, i }))
      .filter(({ point, i }) => WEAPONS[point.fitted].type === 'spinal' && !this.player.mountDisabled[i])
      .map(({ i }) => this.player.nextFire[i] - time);
    const batteryReady = spinalWaits.length > 0 && Math.min(...spinalWaits) <= 0;
    const batteryText = spinalWaits.length === 0 ? 'OFFLINE'
      : batteryReady ? 'READY' : `${(Math.min(...spinalWaits) / 1000).toFixed(1)}s`;
    const mountsUp = this.player.mountDisabled.filter((d) => !d).length;
    this.hud.setText(
      `${spec.name.toUpperCase()}  HULL ${Math.max(0, Math.round(this.player.hull))}/${spec.hull}   ` +
      `MOUNTS ${mountsUp}/${spec.hardpoints.length}   ` +
      `THROTTLE ${Math.round(this.player.throttle * 100)}%   ` +
      `BATTERY ${batteryText}   ` +
      `HOSTILE ${this.enemy.active ? Math.max(0, Math.round(this.enemy.hull)) : 0}/${SHIPS[this.enemyKey].hull}`,
    );
  }
}
