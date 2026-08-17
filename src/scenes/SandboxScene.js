import Phaser from 'phaser';
import { IMAGES, SOUNDS } from '../manifest.js';
import { SHIPS, WEAPONS } from '../ships.js';

const WORLD_W = 6000;
const WORLD_H = 4000;
const DEG = Math.PI / 180;
const BATTERY_ARC = 14 * DEG;
const ENGAGE_RANGE = 700; // enemy AI's preferred gun range

export class SandboxScene extends Phaser.Scene {
  constructor() {
    super('sandbox');
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background')
      .setOrigin(0).setScrollFactor(0);
    this.scale.on('resize', (s) => this.bg.setSize(s.width, s.height));

    this.playerShots = this.physics.add.group();
    this.enemyShots = this.physics.add.group();

    this.player = this.spawnCapital('fenris', 1200, WORLD_H / 2, 20 * DEG);
    this.enemy = this.spawnCapital('cain', WORLD_W - 1400, WORLD_H / 2, 200 * DEG);

    this.physics.add.overlap(this.playerShots, this.enemy, (_e, shot) => this.hit(shot, this.enemy));
    this.physics.add.overlap(this.enemyShots, this.player, (_p, shot) => this.hit(shot, this.player));

    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H)
      .startFollow(this.player, false, 0.06, 0.06).setZoom(0.85);

    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,R,ESC');
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('title'));

    this.touch = { active: false, steer: 0, throttle: 0, fire: false };
    if (this.sys.game.device.input.touch) this.createTouchControls();

    this.hud = this.add.text(12, 10, '', { fontFamily: 'monospace', fontSize: 15, color: '#9fd8ff' })
      .setScrollFactor(0).setDepth(10);
    this.banner = this.add.text(this.scale.width / 2, this.scale.height / 2, '', {
      fontFamily: 'monospace', fontSize: 32, color: '#ffffff', align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10);
    this.over = false;
  }

  spawnCapital(key, x, y, facing) {
    const spec = SHIPS[key];
    const ship = this.physics.add.image(x, y, `ship_${key}`);
    ship.setScale(IMAGES[`ship_${key}`].scale);
    ship.body.setSize(ship.width * 0.75, ship.height * 0.75, true);
    ship.spec = spec;
    ship.hull = spec.hull;
    ship.facing = facing;
    ship.throttle = 0;
    ship.angleOffset = IMAGES[`ship_${key}`].angleOffset * DEG;
    ship.syncAngle = () => ship.setRotation(ship.facing + ship.angleOffset);
    ship.syncAngle();
    ship.nextFire = spec.hardpoints.map(() => 0);
    return ship;
  }

  // World position of a hardpoint: y runs along the hull toward the bow,
  // x is lateral. Sprite height is hull length (art faces up).
  hardpointPos(ship, point) {
    const along = point.y * ship.displayHeight;
    const lateral = point.x * ship.displayWidth;
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

  fireShot(group, key, x, y, angle, speed, sound, damage) {
    const def = IMAGES[key];
    const shot = group.create(x, y, key);
    shot.setScale(def.scale).setRotation(angle + def.angleOffset * DEG);
    shot.damage = damage;
    this.physics.velocityFromRotation(angle, speed, shot.body.velocity);
    this.time.delayedCall(1600, () => shot.destroy());
    this.sound.play(sound, { volume: SOUNDS[sound].volume });
  }

  // Turret hardpoints engage on their own when the target is inside their
  // fitted weapon's range; each fires from its real mount position.
  runTurrets(ship, target, group, laserKey, sound, time) {
    if (!target.active) return;
    ship.spec.hardpoints.forEach((point, i) => {
      const weapon = WEAPONS[point.fitted];
      if (weapon.type !== 'turret' || time < ship.nextFire[i]) return;
      const pos = this.hardpointPos(ship, point);
      const dist = Phaser.Math.Distance.Between(pos.x, pos.y, target.x, target.y);
      if (dist > weapon.range) return;
      ship.nextFire[i] = time + weapon.delay + Math.random() * 300;
      const aim = Phaser.Math.Angle.Between(pos.x, pos.y, target.x, target.y) + (Math.random() - 0.5) * 4 * DEG;
      this.fireShot(group, laserKey, pos.x, pos.y, aim, weapon.speed, sound, weapon.damage);
    });
  }

  // Spinal mounts fire together on the battery trigger, but only when the bow
  // is actually laid on the target.
  tryBattery(ship, target, group, time) {
    if (!target.active) return false;
    const aim = Phaser.Math.Angle.Between(ship.x, ship.y, target.x, target.y);
    if (Math.abs(Phaser.Math.Angle.Wrap(aim - ship.facing)) > BATTERY_ARC) return false;
    let fired = false;
    ship.spec.hardpoints.forEach((point, i) => {
      const weapon = WEAPONS[point.fitted];
      if (weapon.type !== 'spinal' || time < ship.nextFire[i]) return;
      const pos = this.hardpointPos(ship, point);
      if (Phaser.Math.Distance.Between(pos.x, pos.y, target.x, target.y) > weapon.range) return;
      ship.nextFire[i] = time + weapon.delay;
      this.fireShot(group, 'battery', pos.x, pos.y, ship.facing, weapon.speed,
        ship === this.player ? 'laserPlayer' : 'laserEnemy', weapon.damage);
      fired = true;
    });
    return fired;
  }

  batteryReady(ship, time) {
    return ship.spec.hardpoints.some((point, i) =>
      WEAPONS[point.fitted].type === 'spinal' && time >= ship.nextFire[i]);
  }

  hit(shot, ship) {
    const damage = shot.damage ?? TURRET_DAMAGE;
    shot.destroy();
    ship.hull -= damage;
    this.burst(shot.x, shot.y, 5);
    if (ship === this.player) this.sound.play('playerHit', { volume: 0.3 });
    if (ship.hull <= 0 && !this.over) {
      this.burst(ship.x, ship.y, 40);
      this.sound.play('explosion', { volume: SOUNDS.explosion.volume });
      ship.destroy();
      this.endMission(ship === this.enemy);
    }
  }

  burst(x, y, quantity) {
    const emitter = this.add.particles(x, y, 'spark', {
      speed: { min: 50, max: 300 }, lifespan: 500, quantity,
      scale: { start: 1, end: 0 }, blendMode: 'ADD', emitting: false,
    });
    emitter.explode(quantity);
    this.time.delayedCall(700, () => emitter.destroy());
  }

  endMission(won) {
    this.over = true;
    if (won) this.sound.play('win', { volume: SOUNDS.win.volume });
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

    this.input.on('pointerdown', (p) => {
      if (p.x < this.scale.width * 0.5 && this.stickPointerId === null) {
        this.stickPointerId = p.id;
        this.stickBase.setPosition(p.x, p.y).setVisible(true);
        this.stickNub.setPosition(p.x, p.y).setVisible(true);
        this.touch.active = true;
      }
    });
    this.input.on('pointermove', (p) => {
      if (p.id !== this.stickPointerId) return;
      const dx = p.x - this.stickBase.x, dy = p.y - this.stickBase.y;
      const len = Math.hypot(dx, dy), clamped = Math.min(len, STICK_R);
      this.touch.steer = Math.atan2(dy, dx);
      this.touch.throttle = clamped / STICK_R;
      this.stickNub.setPosition(
        this.stickBase.x + (len ? (dx / len) * clamped : 0),
        this.stickBase.y + (len ? (dy / len) * clamped : 0),
      );
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
    const place = () => {
      btn.setPosition(this.scale.width - 80, this.scale.height - 100);
      label.setPosition(btn.x, btn.y);
    };
    place();
    this.scale.on('resize', place);
  }

  update(time, delta) {
    const dt = delta / 1000;
    const cam = this.cameras.main;
    this.bg.setTilePosition(cam.scrollX * 0.4, cam.scrollY * 0.4);

    if (this.keys.R.isDown && this.over) { this.scene.restart(); return; }
    if (!this.player.active) return;
    const spec = this.player.spec;

    // Helm: A/D turn, W/S trim throttle; touch stick sets heading + throttle.
    const turn = spec.turn * DEG * dt;
    if (this.touch.active) {
      this.player.facing = Phaser.Math.Angle.RotateTo(this.player.facing, this.touch.steer, turn);
      this.player.throttle = this.touch.throttle;
    } else {
      if (this.keys.A.isDown || this.keys.LEFT.isDown) this.player.facing -= turn;
      if (this.keys.D.isDown || this.keys.RIGHT.isDown) this.player.facing += turn;
      if (this.keys.W.isDown || this.keys.UP.isDown) this.player.throttle = Math.min(1, this.player.throttle + dt * 0.6);
      if (this.keys.S.isDown || this.keys.DOWN.isDown) this.player.throttle = Math.max(0, this.player.throttle - dt * 0.8);
    }
    this.steerCapital(this.player, dt);

    this.runTurrets(this.player, this.enemy, this.playerShots, 'laserPlayer', 'laserPlayer', time);
    if ((this.keys.SPACE.isDown || this.touch.fire) && !this.over) {
      this.tryBattery(this.player, this.enemy, this.playerShots, time);
    }

    // Enemy captain: close to gun range, then hold a slow broadside orbit.
    if (this.enemy.active && !this.over) {
      const e = this.enemy;
      const dist = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
      const bearing = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
      const want = dist > ENGAGE_RANGE * 0.85 ? bearing : bearing + 70 * DEG;
      e.facing = Phaser.Math.Angle.RotateTo(e.facing, want, e.spec.turn * DEG * dt);
      e.throttle = dist > ENGAGE_RANGE * 0.5 ? 1 : 0.45;
      this.steerCapital(e, dt);
      this.runTurrets(e, this.player, this.enemyShots, 'laserEnemy', 'laserEnemy', time);
      this.tryBattery(e, this.player, this.enemyShots, time);
    }

    const batteryReady = this.batteryReady(this.player, time);
    this.hud.setText(
      `${spec.name.toUpperCase()}  HULL ${Math.max(0, Math.round(this.player.hull))}/${spec.hull}   ` +
      `THROTTLE ${Math.round(this.player.throttle * 100)}%   ` +
      `BATTERY ${batteryReady ? 'READY' : '· · ·'}   ` +
      `HOSTILE ${this.enemy.active ? Math.max(0, Math.round(this.enemy.hull)) : 0}/${SHIPS.cain.hull}`,
    );
  }
}
