import Phaser from 'phaser';
import { IMAGES, SOUNDS, resolveUrl } from '../manifest.js';

const WORLD_W = 4000;
const WORLD_H = 3000;
const DEG = Math.PI / 180;

const PLAYER = { hull: 100, accel: 320, maxSpeed: 340, burnSpeed: 640, turnRate: 200, fireDelay: 180 };
const FIGHTER = { hull: 30, accel: 220, maxSpeed: 280, turnRate: 120, fireDelay: 900, range: 650, damage: 8 };
const CRUISER = { hull: 300, range: 1000, fireDelay: 2000, damage: 12 };

export class BattleScene extends Phaser.Scene {
  constructor() {
    super('battle');
  }

  preload() {
    for (const [key, def] of Object.entries(IMAGES)) this.load.image(key, resolveUrl(def.url));
    for (const [key, def] of Object.entries(SOUNDS)) this.load.audio(key, resolveUrl(def.url));
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background')
      .setOrigin(0).setScrollFactor(0);
    this.scale.on('resize', (s) => this.bg.setSize(s.width, s.height));

    this.player = this.spawnShip('player', 400, WORLD_H / 2, PLAYER.hull, PLAYER.maxSpeed);
    this.player.setDamping(true).setDrag(0.4).setCollideWorldBounds(true);
    this.fireAt = 0;

    this.playerLasers = this.physics.add.group();
    this.enemyLasers = this.physics.add.group();

    this.cruiser = this.spawnShip('enemyCruiser', WORLD_W - 700, WORLD_H / 2, CRUISER.hull, 0);
    this.cruiser.facing = 180 * DEG;
    this.cruiser.syncAngle();
    this.cruiser.body.setImmovable(true);
    this.cruiser.nextShot = 0;

    this.fighters = this.physics.add.group();
    for (let i = 0; i < 4; i++) {
      const f = this.spawnShip('enemyFighter', WORLD_W - 1200, WORLD_H / 2 + (i - 1.5) * 260, FIGHTER.hull, FIGHTER.maxSpeed);
      f.setDamping(true).setDrag(0.4);
      f.nextShot = 0;
      this.fighters.add(f, false);
    }

    this.physics.add.overlap(this.playerLasers, this.fighters, (laser, ship) => this.hitShip(laser, ship, 10));
    this.physics.add.overlap(this.playerLasers, this.cruiser, (ship, laser) => this.hitShip(laser, this.cruiser, 10));
    this.physics.add.overlap(this.enemyLasers, this.player, (ship, laser) => this.hitPlayer(laser));

    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H).startFollow(this.player, false, 0.08, 0.08);

    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,RIGHT,SPACE,SHIFT,R');
    this.touch = { active: false, steer: 0, thrust: 0, fire: false, burn: false };
    if (this.sys.game.device.input.touch) this.createTouchControls();
    this.hud = this.add.text(12, 10, '', { fontFamily: 'monospace', fontSize: 16, color: '#9fd8ff' })
      .setScrollFactor(0).setDepth(10);
    this.banner = this.add.text(this.scale.width / 2, this.scale.height / 2, '', {
      fontFamily: 'monospace', fontSize: 34, color: '#ffffff', align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10);
    this.over = false;
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
      const dx = p.x - this.stickBase.x;
      const dy = p.y - this.stickBase.y;
      const len = Math.hypot(dx, dy);
      const clamped = Math.min(len, STICK_R);
      this.touch.steer = Math.atan2(dy, dx);
      this.touch.thrust = clamped / STICK_R;
      this.stickNub.setPosition(
        this.stickBase.x + (len ? (dx / len) * clamped : 0),
        this.stickBase.y + (len ? (dy / len) * clamped : 0),
      );
    });
    const releaseStick = (p) => {
      if (p.id !== this.stickPointerId) return;
      this.stickPointerId = null;
      this.touch.active = false;
      this.touch.thrust = 0;
      this.stickBase.setVisible(false);
      this.stickNub.setVisible(false);
    };
    this.input.on('pointerup', releaseStick);
    this.input.on('pointerupoutside', releaseStick);

    const makeButton = (label, color, offsetY, onDown, onUp) => {
      const btn = this.add.circle(0, 0, 44, color, 0.22)
        .setStrokeStyle(2, color, 0.5).setScrollFactor(0).setDepth(20)
        .setInteractive({ useHandCursor: false });
      const text = this.add.text(0, 0, label, { fontFamily: 'monospace', fontSize: 15, color: '#ffffff' })
        .setOrigin(0.5).setScrollFactor(0).setDepth(21);
      btn.on('pointerdown', () => { onDown(); if (this.over) this.scene.restart(); });
      btn.on('pointerup', onUp);
      btn.on('pointerout', onUp);
      const place = () => {
        btn.setPosition(this.scale.width - 78, this.scale.height - offsetY);
        text.setPosition(btn.x, btn.y);
      };
      place();
      this.scale.on('resize', place);
      return btn;
    };
    makeButton('FIRE', 0xff5555, 96, () => { this.touch.fire = true; }, () => { this.touch.fire = false; });
    makeButton('BURN', 0xffaa33, 208, () => { this.touch.burn = true; }, () => { this.touch.burn = false; });
  }

  spawnShip(key, x, y, hull, maxSpeed) {
    const def = IMAGES[key];
    const ship = this.physics.add.image(x, y, key);
    ship.setScale(def.scale ?? 1);
    if (maxSpeed) ship.setMaxVelocity(maxSpeed);
    ship.body.setSize(ship.width * 0.7, ship.height * 0.7, true);
    ship.hull = hull;
    ship.facing = 0;
    ship.angleOffset = (def.angleOffset ?? 0) * DEG;
    ship.syncAngle = () => ship.setRotation(ship.facing + ship.angleOffset);
    ship.syncAngle();
    return ship;
  }

  fireLaser(group, key, ship, speed, sound) {
    const def = IMAGES[key];
    const laser = group.create(
      ship.x + Math.cos(ship.facing) * ship.displayWidth * 0.6,
      ship.y + Math.sin(ship.facing) * ship.displayWidth * 0.6,
      key,
    );
    laser.setScale(def.scale ?? 1).setRotation(ship.facing + (def.angleOffset ?? 0) * DEG);
    this.physics.velocityFromRotation(ship.facing, speed, laser.body.velocity);
    this.time.delayedCall(1200, () => laser.destroy());
    this.sound.play(sound, { volume: SOUNDS[sound].volume });
  }

  hitShip(laser, ship, damage) {
    laser.destroy();
    ship.hull -= damage;
    this.burst(laser.x, laser.y, 4);
    if (ship.hull <= 0 && ship !== this.cruiser) this.destroyShip(ship);
    if (ship === this.cruiser && ship.hull <= 0 && !this.over) {
      this.destroyShip(ship);
      this.endMission(true);
    }
  }

  hitPlayer(laser) {
    laser.destroy();
    this.player.hull -= FIGHTER.damage;
    this.burst(laser.x, laser.y, 4);
    this.sound.play('playerHit', { volume: SOUNDS.playerHit.volume });
    if (this.player.hull <= 0 && !this.over) {
      this.destroyShip(this.player);
      this.endMission(false);
    }
  }

  destroyShip(ship) {
    this.burst(ship.x, ship.y, 24);
    this.sound.play('explosion', { volume: SOUNDS.explosion.volume });
    ship.destroy();
  }

  burst(x, y, quantity) {
    const emitter = this.add.particles(x, y, 'spark', {
      speed: { min: 60, max: 260 }, lifespan: 450, quantity,
      scale: { start: 0.9, end: 0 }, blendMode: 'ADD', emitting: false,
    });
    emitter.explode(quantity);
    this.time.delayedCall(600, () => emitter.destroy());
  }

  endMission(won) {
    this.over = true;
    if (won) this.sound.play('win', { volume: SOUNDS.win.volume });
    this.banner.setText(won ? 'CRUISER DESTROYED\nMission complete\n\n[R] restart' : 'SHIP LOST\n\n[R] restart');
  }

  update(time, delta) {
    const dt = delta / 1000;
    const cam = this.cameras.main;
    this.bg.setTilePosition(cam.scrollX * 0.4, cam.scrollY * 0.4);

    if (this.keys.R.isDown && this.over) { this.scene.restart(); return; }
    if (!this.player.active) return;

    // --- player flight ---
    const turn = PLAYER.turnRate * DEG * dt;
    if (this.touch.active) {
      this.player.facing = Phaser.Math.Angle.RotateTo(this.player.facing, this.touch.steer, turn);
    } else {
      if (this.keys.A.isDown || this.keys.LEFT.isDown) this.player.facing -= turn;
      if (this.keys.D.isDown || this.keys.RIGHT.isDown) this.player.facing += turn;
    }
    this.player.syncAngle();

    const burning = this.keys.SHIFT.isDown || this.touch.burn;
    this.player.setMaxVelocity(burning ? PLAYER.burnSpeed : PLAYER.maxSpeed);
    const thrust = (this.keys.W.isDown || this.keys.UP.isDown) ? 1 : this.touch.thrust;
    if (thrust > 0) {
      this.physics.velocityFromRotation(this.player.facing, PLAYER.accel * thrust * (burning ? 2.2 : 1), this.player.body.acceleration);
    } else {
      this.player.setAcceleration(0);
    }

    if ((this.keys.SPACE.isDown || this.touch.fire) && time > this.fireAt && !this.over) {
      this.fireAt = time + PLAYER.fireDelay;
      this.fireLaser(this.playerLasers, 'laserPlayer', this.player, 700, 'laserPlayer');
    }

    // --- fighter AI: turn toward player, close, shoot ---
    for (const f of this.fighters.getChildren()) {
      if (!f.active) continue;
      const want = Phaser.Math.Angle.Between(f.x, f.y, this.player.x, this.player.y);
      f.facing = Phaser.Math.Angle.RotateTo(f.facing, want, FIGHTER.turnRate * DEG * dt);
      f.syncAngle();
      const dist = Phaser.Math.Distance.Between(f.x, f.y, this.player.x, this.player.y);
      if (dist > 220) {
        this.physics.velocityFromRotation(f.facing, FIGHTER.accel, f.body.acceleration);
      } else {
        f.setAcceleration(0);
      }
      const aimedAt = Math.abs(Phaser.Math.Angle.Wrap(want - f.facing)) < 10 * DEG;
      if (aimedAt && dist < FIGHTER.range && time > f.nextShot && !this.over) {
        f.nextShot = time + FIGHTER.fireDelay;
        this.fireLaser(this.enemyLasers, 'laserEnemy', f, 560, 'laserEnemy');
      }
    }

    // --- cruiser turret ---
    if (this.cruiser.active && !this.over) {
      const dist = Phaser.Math.Distance.Between(this.cruiser.x, this.cruiser.y, this.player.x, this.player.y);
      if (dist < CRUISER.range && time > this.cruiser.nextShot) {
        this.cruiser.nextShot = time + CRUISER.fireDelay;
        const want = Phaser.Math.Angle.Between(this.cruiser.x, this.cruiser.y, this.player.x, this.player.y);
        for (const spread of [-6 * DEG, 0, 6 * DEG]) {
          const turret = { x: this.cruiser.x, y: this.cruiser.y, facing: want + spread, displayWidth: this.cruiser.displayWidth * 0.4 };
          this.fireLaser(this.enemyLasers, 'laserEnemy', turret, 500, 'laserEnemy');
        }
      }
    }

    const fightersLeft = this.fighters.countActive();
    this.hud.setText(
      `HULL ${Math.max(0, this.player.hull)}%   ` +
      `CRUISER ${this.cruiser.active ? Math.max(0, Math.round((this.cruiser.hull / CRUISER.hull) * 100)) : 0}%   ` +
      `HOSTILES ${fightersLeft}${this.keys.SHIFT.isDown ? '   [BURN]' : ''}`,
    );
  }
}
