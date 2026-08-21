import Phaser from 'phaser';
import { IMAGES } from './manifest.js';
import { SHIPS, STRIKECRAFT, WEAPONS } from './ships.js';
import { factionColor, beamPalette } from './fx.js';

// Attract-mode duel for the title screen: two random capitals (no balancing)
// fight forever behind the menu. Completely silent, no physics bodies, no
// pixel damage — a lightweight shadow of the sandbox sim. Everything lives in
// one container that is scaled and panned each frame so both ships stay in
// shot; the real camera (and the menu UI on it) is never touched.
const DEG = Math.PI / 180;
const ORBIT = 950;

export class TitleBattle {
  constructor(scene) {
    this.scene = scene;
    this.root = scene.add.container(0, 0).setAlpha(0.85);
    this.ships = [null, null];
    this.respawnAt = [0, 0];
    this.bolts = [];
    this.beams = [];
    this.fighters = [[], []];
    this.view = { scale: 0.4, x: 0, y: 0, init: false };
    this.spawn(0, { x: 700, y: 0 });
    this.spawn(1, { x: -700, y: 0 });
  }

  spawn(side, foeAt) {
    const keys = Object.keys(SHIPS);
    // Bias toward carriers so the backdrop regularly shows fighter launches.
    const carriers = keys.filter((k) => SHIPS[k].hangar);
    const key = Math.random() < 0.45
      ? carriers[(Math.random() * carriers.length) | 0]
      : keys[(Math.random() * keys.length) | 0];
    const spec = SHIPS[key];
    const bearing = Math.random() * Math.PI * 2;
    const x = foeAt.x + Math.cos(bearing) * 1500;
    const y = foeAt.y + Math.sin(bearing) * 1500;
    const img = this.scene.add.image(x, y, `ship_${key}`);
    img.setScale(IMAGES[`ship_${key}`].targetLength / img.width);
    this.root.add(img);
    this.ships[side] = {
      img, spec,
      hull: spec.hull,
      facing: Math.atan2(foeAt.y - y, foeAt.x - x),
      angleOffset: IMAGES[`ship_${key}`].angleOffset * DEG,
      throttle: 1, vx: 0, vy: 0,
      next: spec.hardpoints.map(() => 1500 + Math.random() * 6000),
      accent: factionColor(spec),
      size: Math.max(img.displayWidth, img.displayHeight),
      dying: false,
    };
    if (spec.hangar) {
      this.ships[side].bay = spec.hangar.flatMap(({ craft, wings }) => Array(wings).fill(craft));
      this.ships[side].nextLaunch = this.scene.time.now + 2500 + Math.random() * 3000;
    }
  }

  launchWing(ship, side, time) {
    const key = ship.bay.shift();
    const spec = STRIKECRAFT[key];
    const cos = Math.cos(ship.facing), sin = Math.sin(ship.facing);
    const bow = ship.img.displayWidth * 0.3;
    for (let i = 0; i < 3; i++) {
      const lat = (i - 1) * 26;
      const img = this.scene.add.image(
        ship.img.x + cos * bow - sin * lat,
        ship.img.y + sin * bow + cos * lat, `ship_${key}`);
      img.setScale(IMAGES[`ship_${key}`].targetLength / img.width).setRotation(ship.facing);
      this.root.add(img);
      this.fighters[side].push({
        img, spec, isFighter: true, hull: spec.hull, facing: ship.facing,
        size: 20, jitter: 0.9 + Math.random() * 0.2,
        nextGun: time + Math.random() * 1500, retarget: 0,
      });
    }
    ship.nextLaunch = time + 12000;
  }

  hardpointPos(ship, point) {
    const along = point.y * ship.img.displayWidth;
    const lateral = point.x * ship.img.displayHeight;
    const cos = Math.cos(ship.facing), sin = Math.sin(ship.facing);
    return {
      x: ship.img.x + cos * along - sin * lateral,
      y: ship.img.y + sin * along + cos * lateral,
    };
  }

  burst(x, y, n, big = false) {
    for (let i = 0; i < n; i++) {
      const orb = this.scene.add.image(x, y, 'glow-orb')
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(big ? 0.5 + Math.random() * 0.6 : 0.25 + Math.random() * 0.25)
        .setTint(0xffd9a0);
      this.root.add(orb);
      const ang = Math.random() * Math.PI * 2;
      const dist = (big ? 160 : 70) * (0.4 + Math.random());
      this.scene.tweens.add({
        targets: orb, x: x + Math.cos(ang) * dist, y: y + Math.sin(ang) * dist,
        alpha: 0, duration: 420 + Math.random() * 300, onComplete: () => orb.destroy(),
      });
    }
  }

  fire(ship, target, point, i, time) {
    const weapon = WEAPONS[point.fitted];
    const pos = this.hardpointPos(ship, point);
    const dist = Phaser.Math.Distance.Between(pos.x, pos.y, target.img.x, target.img.y);
    if (dist > weapon.range) return;
    // Spinal mounts hold fire until the bow is roughly on the target.
    const bearing = Phaser.Math.Angle.Between(pos.x, pos.y, target.img.x, target.img.y);
    if (weapon.type === 'spinal'
      && Math.abs(Phaser.Math.Angle.Wrap(bearing - ship.facing)) > 18 * DEG) return;
    ship.next[i] = time + weapon.delay + Math.random() * 1500;

    if (weapon.beam) {
      const size = target.size;
      const across = bearing + Math.PI / 2;
      const sign = Math.random() < 0.5 ? 1 : -1;
      const palette = beamPalette(ship.spec);
      const strip = (tex, tint) => this.scene.add.image(pos.x, pos.y, tex)
        .setOrigin(0, 0.5).setBlendMode(Phaser.BlendModes.ADD).setTint(tint).setVisible(false);
      const beam = {
        ship, target, weapon, point,
        elapsed: 0,
        charge: weapon.chargeMs ?? 2200,
        hold: weapon.holdMs ?? 2200,
        hit: Math.random() < 0.8,
        off: { x: 0, y: 0 },
        // Layered gradient strips, same as the sandbox battle beams: an outer
        // glow, a faction-tinted mid glow, and a white core. All three stretch
        // cleanly to any length since they're pure width-wise gradients.
        halo: strip('beam-halo', palette.outer),
        mid: strip('beam-halo', palette.mid),
        core: strip('beam-core', 0xffffff),
        glow: this.scene.add.image(pos.x, pos.y, 'glow-orb')
          .setBlendMode(Phaser.BlendModes.ADD).setTint(palette.mid),
        muzzle: this.scene.add.image(pos.x, pos.y, 'glow-orb')
          .setBlendMode(Phaser.BlendModes.ADD).setTint(0xffffff),
      };
      if (weapon.slash) {
        beam.slashFrom = { x: Math.cos(across) * size * 0.75 * sign, y: Math.sin(across) * size * 0.75 * sign };
        beam.slashTo = { x: -Math.cos(across) * size * 0.5 * sign, y: -Math.sin(across) * size * 0.5 * sign };
      } else if (!beam.hit) {
        const missBy = size * (0.55 + Math.random() * 0.3);
        beam.off = { x: Math.cos(across) * missBy * sign, y: Math.sin(across) * missBy * sign };
      }
      this.root.add(beam.halo);
      this.root.add(beam.mid);
      this.root.add(beam.core);
      this.root.add(beam.glow);
      this.root.add(beam.muzzle);
      this.beams.push(beam);
      return;
    }

    const aim = bearing + (Math.random() - 0.5) * 5 * DEG;
    const shotAngle = weapon.type === 'spinal' ? ship.facing : aim;
    const img = this.scene.add.image(pos.x, pos.y, weapon.bolt ?? 'glow-orb')
      .setBlendMode(Phaser.BlendModes.ADD).setRotation(shotAngle + Math.PI);
    const len = weapon.burst ? 20 : weapon.type === 'spinal' ? 52 : 34;
    img.setDisplaySize(len, Math.max(6, len * (img.height / img.width)));
    this.root.add(img);
    this.bolts.push({
      img, target,
      vx: Math.cos(shotAngle) * weapon.speed, vy: Math.sin(shotAngle) * weapon.speed,
      dmg: weapon.damage, life: weapon.range / weapon.speed,
    });
  }

  damage(target, dmg, x, y) {
    if (!target || target.dying || !target.img.active) return;
    target.hull -= dmg;
    this.burst(x, y, target.isFighter ? 2 : 3);
    if (target.hull <= 0) {
      if (target.isFighter) {
        this.burst(target.img.x, target.img.y, 5);
        target.img.destroy();
      } else {
        this.kill(target);
      }
    }
  }

  nearestFighter(side, from, maxRange) {
    let best = null, bd = maxRange;
    for (const f of this.fighters[side]) {
      if (!f.img.active) continue;
      const d = Phaser.Math.Distance.Between(from.x, from.y, f.img.x, f.img.y);
      if (d < bd) { bd = d; best = f; }
    }
    return best;
  }

  kill(ship) {
    ship.dying = true;
    const side = this.ships.indexOf(ship);
    for (let i = 0; i < 4; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        if (!ship.img.active) return;
        this.burst(
          ship.img.x + (Math.random() - 0.5) * ship.img.displayWidth * 0.7,
          ship.img.y + (Math.random() - 0.5) * ship.img.displayHeight * 0.7, 6);
      });
    }
    this.scene.time.delayedCall(900, () => {
      if (!ship.img.active) return;
      this.burst(ship.img.x, ship.img.y, 18, true);
      const flash = this.scene.add.circle(ship.img.x, ship.img.y, ship.size * 0.5, 0xfff2cc, 0.8)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.root.add(flash);
      this.scene.tweens.add({ targets: flash, scale: 2.2, alpha: 0, duration: 450, onComplete: () => flash.destroy() });
      ship.img.destroy();
      if (this.ships[side] === ship) {
        this.ships[side] = null;
        this.respawnAt[side] = this.scene.time.now + 2000;
      }
    });
  }

  steer(ship, target, dt) {
    const spec = ship.spec;
    let want = ship.facing, throttle = 0.4;
    if (target && !target.dying) {
      const dist = Phaser.Math.Distance.Between(ship.img.x, ship.img.y, target.img.x, target.img.y);
      const bearing = Phaser.Math.Angle.Between(ship.img.x, ship.img.y, target.img.x, target.img.y);
      want = dist > ORBIT * 0.85 ? bearing : bearing + 70 * DEG;
      throttle = dist > ORBIT * 0.5 ? 1 : 0.45;
    }
    ship.facing = Phaser.Math.Angle.RotateTo(ship.facing, want, spec.turn * DEG * dt);
    ship.throttle = throttle;
    const ease = Math.min(1, (spec.accel / spec.speed) * dt);
    ship.vx += (Math.cos(ship.facing) * spec.speed * throttle - ship.vx) * ease;
    ship.vy += (Math.sin(ship.facing) * spec.speed * throttle - ship.vy) * ease;
    ship.img.x += ship.vx * dt;
    ship.img.y += ship.vy * dt;
    ship.img.setRotation(ship.facing + ship.angleOffset);
  }

  update(time, delta) {
    const dt = delta / 1000;
    const [a, b] = this.ships;

    for (const [side, foe] of [[0, b], [1, a]]) {
      const ship = this.ships[side];
      if (!ship) {
        if (time > this.respawnAt[side] && this.respawnAt[side] > 0) {
          this.respawnAt[side] = 0;
          const other = this.ships[1 - side];
          this.spawn(side, other ? { x: other.img.x, y: other.img.y } : { x: 0, y: 0 });
        }
        continue;
      }
      if (ship.dying) continue;
      this.steer(ship, foe && !foe.dying ? foe : null, dt);
      ship.spec.hardpoints.forEach((point, i) => {
        if (time < ship.next[i]) return;
        const weapon = WEAPONS[point.fitted];
        // Anti-fighter mounts pick off the enemy air wing; the rest need
        // the enemy capital alive.
        let target = foe && !foe.dying ? foe : null;
        if (weapon.anti) {
          target = this.nearestFighter(1 - side, ship.img, weapon.range + 200) ?? target;
        }
        if (target) this.fire(ship, target, point, i, time);
      });
      // Carrier hangars cycle wings into the fight.
      if (ship.bay?.length && time > ship.nextLaunch && this.fighters[side].length < 6) {
        this.launchWing(ship, side, time);
      }
    }

    // Fighters: dogfight the enemy wing, strafe the enemy capital otherwise.
    for (const side of [0, 1]) {
      const foeShip = this.ships[1 - side];
      this.fighters[side] = this.fighters[side].filter((f) => {
        if (!f.img.active) return false;
        if (time > f.retarget || !(f.target?.img.active && !f.target.dying)) {
          f.retarget = time + 500 + Math.random() * 400;
          f.target = this.nearestFighter(1 - side, f.img, Infinity)
            ?? (foeShip && !foeShip.dying ? foeShip : null);
        }
        let want = f.facing;
        if (f.wp && time < f.wp.until) {
          want = Phaser.Math.Angle.Between(f.img.x, f.img.y, f.wp.x, f.wp.y);
        } else if (f.target) {
          f.wp = null;
          want = Phaser.Math.Angle.Between(f.img.x, f.img.y, f.target.img.x, f.target.img.y);
          const d = Phaser.Math.Distance.Between(f.img.x, f.img.y, f.target.img.x, f.target.img.y);
          const aligned = Math.abs(Phaser.Math.Angle.Wrap(want - f.facing)) < 20 * DEG;
          if (d < 380 && aligned && time >= f.nextGun) {
            f.nextGun = time + 1600 + Math.random() * 900;
            const ang = want + (Math.random() - 0.5) * 6 * DEG;
            const img = this.scene.add.image(f.img.x, f.img.y, f.spec.gun.bolt)
              .setBlendMode(Phaser.BlendModes.ADD).setRotation(ang + Math.PI);
            img.setDisplaySize(22, Math.max(5, 22 * (img.height / img.width)));
            this.root.add(img);
            this.bolts.push({
              img, target: f.target,
              vx: Math.cos(ang) * 520, vy: Math.sin(ang) * 520,
              dmg: f.spec.gun.damage, life: 0.75,
            });
          }
          const breakAt = f.target.isFighter ? 70 : f.target.size * 0.5;
          if (d < breakAt) {
            const away = f.facing + (Math.random() < 0.5 ? 1 : -1) * (100 * DEG);
            f.wp = { x: f.img.x + Math.cos(away) * 380, y: f.img.y + Math.sin(away) * 380, until: time + 1400 };
          }
        } else {
          // Nothing to fight: hold near home (or the battle's center).
          const home = this.ships[side]?.img.active ? this.ships[side].img : this.view;
          if (Phaser.Math.Distance.Between(f.img.x, f.img.y, home.x, home.y) > 600) {
            want = Phaser.Math.Angle.Between(f.img.x, f.img.y, home.x, home.y);
          }
        }
        f.facing = Phaser.Math.Angle.RotateTo(f.facing, want, 2.6 * dt);
        const sp = f.spec.speed * 0.9 * f.jitter;
        f.img.x += Math.cos(f.facing) * sp * dt;
        f.img.y += Math.sin(f.facing) * sp * dt;
        f.img.setRotation(f.facing);
        return true;
      });
    }

    // Bolts: straight flight, approximate radius hit against their target.
    this.bolts = this.bolts.filter((bolt) => {
      bolt.life -= dt;
      bolt.img.x += bolt.vx * dt;
      bolt.img.y += bolt.vy * dt;
      const t = bolt.target;
      if (t?.img.active && !t.dying
        && Phaser.Math.Distance.Between(bolt.img.x, bolt.img.y, t.img.x, t.img.y) < t.size * 0.35) {
        this.damage(t, bolt.dmg, bolt.img.x, bolt.img.y);
        bolt.img.destroy();
        return false;
      }
      if (bolt.life <= 0) { bolt.img.destroy(); return false; }
      return true;
    });

    // Beams: charge glow, then a burn that tracks (or rakes across) the target.
    this.beams = this.beams.filter((beam) => {
      beam.elapsed += delta;
      const { ship, target, weapon } = beam;
      const done = beam.elapsed > beam.charge + beam.hold + 250;
      if (done || !ship.img.active) {
        beam.halo.destroy();
        beam.mid.destroy();
        beam.core.destroy();
        beam.glow.destroy();
        beam.muzzle.destroy();
        return false;
      }
      const pos = this.hardpointPos(ship, beam.point);
      beam.muzzle.setPosition(pos.x, pos.y);
      beam.glow.setPosition(pos.x, pos.y);
      if (beam.elapsed < beam.charge) {
        // Warm-up: a pulsing tinted bloom around a swelling white core.
        const c = beam.elapsed / beam.charge;
        const pulse = 0.85 + 0.15 * Math.sin(beam.elapsed / 45) + Math.random() * 0.1;
        const size = (18 + 70 * c) * pulse;
        beam.glow.setDisplaySize(size * 2.2, size * 2.2).setAlpha(0.2 + 0.5 * c);
        beam.muzzle.setDisplaySize(size, size).setAlpha(0.35 + 0.65 * c);
        return true;
      }
      beam.glow.setAlpha(0);
      const burnT = (beam.elapsed - beam.charge) / beam.hold;
      const power = burnT > 1 ? Math.max(0, 1 - (beam.elapsed - beam.charge - beam.hold) / 250)
        : 0.86 + Math.random() * 0.14;
      let ox = beam.off.x, oy = beam.off.y;
      if (beam.slashFrom) {
        const f = Math.min(1, burnT);
        ox = beam.slashFrom.x + (beam.slashTo.x - beam.slashFrom.x) * f;
        oy = beam.slashFrom.y + (beam.slashTo.y - beam.slashFrom.y) * f;
      }
      const held = beam.lastDir ?? ship.facing;
      const tx = (target.img.active ? target.img.x : pos.x + Math.cos(held) * weapon.range) + ox;
      const ty = (target.img.active ? target.img.y : pos.y + Math.sin(held) * weapon.range) + oy;
      const dir = Phaser.Math.Angle.Between(pos.x, pos.y, tx, ty);
      beam.lastDir = dir;
      const onHull = target.img.active && !target.dying
        && Math.hypot(tx - target.img.x, ty - target.img.y) < target.size * 0.4;
      const length = target.img.active
        ? Phaser.Math.Distance.Between(pos.x, pos.y, target.img.x, target.img.y) + (onHull ? 0 : 400)
        : weapon.range;
      const bw = (weapon.beamWidth ?? 20) / 20;
      const place = (img, height, alpha) => img.setVisible(true)
        .setPosition(pos.x, pos.y).setRotation(dir).setDisplaySize(length, height).setAlpha(alpha);
      place(beam.halo, 74 * bw * power, 0.7 * power);
      place(beam.mid, 34 * bw * power, 0.85 * power);
      place(beam.core, 9 * bw * power, power);
      beam.muzzle.setDisplaySize(90 * power, 90 * power).setAlpha(power);
      if (onHull && beam.hit !== false && burnT <= 1) {
        this.damage(target, weapon.damage * (delta / beam.hold),
          target.img.x + ox * 0.5, target.img.y + oy * 0.5);
      }
      return true;
    });

    this.fitView(dt);
  }

  // Scale and pan the container so every live combatant stays in shot,
  // easing so kills and respawns swing the view smoothly.
  fitView(dt) {
    const live = this.ships.filter((s) => s?.img.active);
    if (!live.length) return;
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    for (const s of live) {
      x1 = Math.min(x1, s.img.x - s.size * 0.7);
      x2 = Math.max(x2, s.img.x + s.size * 0.7);
      y1 = Math.min(y1, s.img.y - s.size * 0.7);
      y2 = Math.max(y2, s.img.y + s.size * 0.7);
    }
    const sw = this.scene.scale.width, sh = this.scene.scale.height;
    // "Just on screen": fill most of the frame, zooming right in when the
    // duelists close and back out as they spread.
    const target = Phaser.Math.Clamp(
      Math.min((sw * 0.94) / Math.max(200, x2 - x1), (sh * 0.82) / Math.max(200, y2 - y1)),
      0.08, 1.15);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const v = this.view;
    if (!v.init) { v.init = true; v.scale = target; v.x = mx; v.y = my; }
    const ease = Math.min(1, dt * 1.6);
    v.scale += (target - v.scale) * ease;
    v.x += (mx - v.x) * ease;
    v.y += (my - v.y) * ease;
    this.root.setScale(v.scale)
      .setPosition(sw / 2 - v.x * v.scale, sh * 0.45 - v.y * v.scale);
  }
}
