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
const MM_W = 190; // minimap width; height follows world aspect

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
    this.zoomFactor = Phaser.Math.Clamp(240 / biggest, 0.22, 0.9);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H)
      .startFollow(this.player, false, 0.06, 0.06)
      .setZoom(this.zoomFactor);
    // The scrollFactor-0 backdrops shrink with zoom; oversize to compensate.
    const fitBg = () => {
      const origin = this.toUI(0, 0);
      for (const layer of [this.bg, this.bgNebula]) {
        layer.setPosition(origin.x, origin.y)
          .setSize(this.scale.width / this.zoomFactor, this.scale.height / this.zoomFactor);
      }
    };
    fitBg();
    this.scale.on('resize', fitBg);
    this.hullBars = this.add.graphics().setDepth(8);

    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,R,ESC');
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('title'));

    this.touch = { active: false, steer: 0, throttle: 0, fire: false };
    if (this.sys.game.device.input.touch) this.createTouchControls();

    this.createMinimap();
    const uiPos = this.toUI(12, 10);
    this.hud = this.add.text(uiPos.x, uiPos.y, '', { fontFamily: 'monospace', fontSize: 15, color: '#9fd8ff' })
      .setScrollFactor(0).setDepth(10).setScale(1 / this.zoomFactor);
    this.banner = this.add.text(this.scale.width / 2, this.scale.height / 2, '', {
      fontFamily: 'monospace', fontSize: 32, color: '#ffffff', align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10).setScale(1 / this.zoomFactor);
    this.over = false;
  }

  // Camera zoom also scales scrollFactor-0 objects; this maps a desired
  // on-screen position to the coordinate that renders there at current zoom.
  toUI(sx, sy) {
    const w = this.scale.width / 2, h = this.scale.height / 2;
    return { x: (sx - w) / this.zoomFactor + w, y: (sy - h) / this.zoomFactor + h };
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
    this.minimap = this.add.graphics().setScrollFactor(0).setDepth(15)
      .setScale(1 / this.zoomFactor);
    const place = () => {
      const pos = this.toUI(this.scale.width - MM_W - 14, 14);
      this.minimap.setPosition(pos.x, pos.y);
    };
    place();
    this.scale.on('resize', place);
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
    const targetVx = Math.cos(ship.facing) * spec.speed * ship.throttle;
    const targetVy = Math.sin(ship.facing) * spec.speed * ship.throttle;
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
  runTurrets(ship, target, group, time) {
    if (!target.active || target.dying || ship.dying) return;
    ship.spec.hardpoints.forEach((point, i) => {
      const weapon = WEAPONS[point.fitted];
      if (weapon.type !== 'turret' || ship.mountDisabled[i] || time < ship.nextFire[i]) return;
      const pos = this.hardpointPos(ship, point);
      const dist = Phaser.Math.Distance.Between(pos.x, pos.y, target.x, target.y);
      if (dist > weapon.range) return;
      ship.nextFire[i] = time + weapon.delay + Math.random() * 500;
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
  tryBattery(ship, target, group, time) {
    if (!target.active || target.dying || ship.dying) return false;
    const aim = Phaser.Math.Angle.Between(ship.x, ship.y, target.x, target.y);
    if (Math.abs(Phaser.Math.Angle.Wrap(aim - ship.facing)) > BATTERY_ARC) return false;
    let fired = false;
    ship.spec.hardpoints.forEach((point, i) => {
      const weapon = WEAPONS[point.fitted];
      if (weapon.type !== 'spinal' || ship.mountDisabled[i] || time < ship.nextFire[i]) return;
      const pos = this.hardpointPos(ship, point);
      if (Phaser.Math.Distance.Between(pos.x, pos.y, target.x, target.y) > weapon.range) return;
      ship.nextFire[i] = time + weapon.delay;
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
      ? 'HOSTILE DESTROYED\n\n[R] again   [ESC] title'
      : 'SHIP LOST\n\n[R] again   [ESC] title');
  }

  createTouchControls() {
    this.input.addPointer(2);
    const STICK_R = 70;
    this.stickBase = this.add.circle(0, 0, STICK_R, 0xffffff, 0.08)
      .setStrokeStyle(2, 0x9fd8ff, 0.3).setScrollFactor(0).setDepth(20).setVisible(false);
    this.stickNub = this.add.circle(0, 0, 30, 0x9fd8ff, 0.3).setScrollFactor(0).setDepth(20).setVisible(false);
    this.stickPointerId = null;

    this.stickBase.setScale(1 / this.zoomFactor);
    this.stickNub.setScale(1 / this.zoomFactor);
    this.input.on('pointerdown', (p) => {
      if (p.x < this.scale.width * 0.5 && this.stickPointerId === null) {
        this.stickPointerId = p.id;
        this.stickScreen = { x: p.x, y: p.y };
        const pos = this.toUI(p.x, p.y);
        this.stickBase.setPosition(pos.x, pos.y).setVisible(true);
        this.stickNub.setPosition(pos.x, pos.y).setVisible(true);
        this.touch.active = true;
      }
    });
    this.input.on('pointermove', (p) => {
      if (p.id !== this.stickPointerId) return;
      const dx = p.x - this.stickScreen.x, dy = p.y - this.stickScreen.y;
      const len = Math.hypot(dx, dy), clamped = Math.min(len, STICK_R);
      this.touch.steer = Math.atan2(dy, dx);
      this.touch.throttle = clamped / STICK_R;
      const nub = this.toUI(
        this.stickScreen.x + (len ? (dx / len) * clamped : 0),
        this.stickScreen.y + (len ? (dy / len) * clamped : 0),
      );
      this.stickNub.setPosition(nub.x, nub.y);
    });
    const release = (p) => {
      if (p.id !== this.stickPointerId) return;
      this.stickPointerId = null;
      this.touch.active = false; // throttle holds where it was — capital ships keep way on
      this.stickBase.setVisible(false);
      this.stickNub.setVisible(false);
    };
    this.input.on('pointerup', release);
    this.input.on('pointerupoutside', release);

    const btn = this.add.circle(0, 0, 46, 0xff5555, 0.22)
      .setStrokeStyle(2, 0xff5555, 0.5).setScrollFactor(0).setDepth(20).setInteractive();
    const label = this.add.text(0, 0, 'FIRE', { fontFamily: 'monospace', fontSize: 15, color: '#fff' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(21);
    btn.on('pointerdown', () => { this.touch.fire = true; if (this.over) this.scene.restart(); });
    btn.on('pointerup', () => { this.touch.fire = false; });
    btn.on('pointerout', () => { this.touch.fire = false; });
    btn.setScale(1 / this.zoomFactor);
    label.setScale(1 / this.zoomFactor);
    const place = () => {
      const pos = this.toUI(this.scale.width - 80, this.scale.height - 100);
      btn.setPosition(pos.x, pos.y);
      label.setPosition(btn.x, btn.y);
    };
    place();
    this.scale.on('resize', place);
  }

  update(time, delta) {
    const dt = delta / 1000;
    const cam = this.cameras.main;
    this.bg.setTilePosition(cam.scrollX * 0.15, cam.scrollY * 0.15);
    this.bgNebula.setTilePosition(cam.scrollX * 0.28, cam.scrollY * 0.28);

    this.drawMinimap();
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

    if (this.keys.R.isDown && this.over) { this.scene.restart(); return; }
    if (!this.player.active || this.player.dying) return;
    const spec = this.player.spec;

    // Helm: A/D turn, W/S trim throttle; touch stick sets heading + throttle.
    const turn = spec.turn * DEG * dt;
    if (this.touch.active) {
      this.player.facing = Phaser.Math.Angle.RotateTo(this.player.facing, this.touch.steer, turn);
      this.player.throttle = this.touch.throttle;
    } else {
      if (this.keys.A.isDown || this.keys.LEFT.isDown) this.player.facing -= turn;
      if (this.keys.D.isDown || this.keys.RIGHT.isDown) this.player.facing += turn;
      if (this.keys.W.isDown || this.keys.UP.isDown) this.player.throttle = Math.min(1, this.player.throttle + dt * 0.35);
      if (this.keys.S.isDown || this.keys.DOWN.isDown) this.player.throttle = Math.max(0, this.player.throttle - dt * 0.5);
    }
    this.steerCapital(this.player, dt);

    this.runTurrets(this.player, this.enemy, this.playerShots, time);
    if ((this.keys.SPACE.isDown || this.touch.fire) && !this.over) {
      this.tryBattery(this.player, this.enemy, this.playerShots, time);
    }

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
