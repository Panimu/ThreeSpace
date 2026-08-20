import Phaser from 'phaser';

// Tactical overlay: the world-space read-out that turns the sandbox from a
// fireworks display into something you can command. Draws the locked-target
// reticle, incoming-fire brackets on threatened friendlies, and the conned
// ship's weapon envelope (range ring + main-battery arc).
//
// Everything here is drawn in WORLD space on the battle camera, so it pans
// and zooms with the fight; the panel read-outs live on the UI camera.
const DEG = Math.PI / 180;

export class Tactical {
  constructor(scene) {
    this.scene = scene;
    this.g = scene.add.graphics().setDepth(9);
  }

  // Corner brackets around a contact — the universal "this one" marker.
  brackets(x, y, size, color, alpha, thickness = 1.5) {
    const g = this.g;
    const r = size / 2;
    const arm = Math.max(6, size * 0.22);
    g.lineStyle(thickness, color, alpha);
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const cx = x + sx * r, cy = y + sy * r;
      g.lineBetween(cx, cy, cx - sx * arm, cy);
      g.lineBetween(cx, cy, cx, cy - sy * arm);
    }
  }

  draw(time) {
    const s = this.scene;
    const g = this.g;
    g.clear();

    const con = s.con;
    // Weapon envelope for the ship under command: how far the longest gun
    // reaches, and the wedge the bow battery has to be laid in to fire.
    if (con?.active && !con.dying) {
      const reach = s.longestRange(con);
      if (reach) {
        g.lineStyle(1, 0x6fb7ff, 0.13).strokeCircle(con.x, con.y, reach);
      }
      if (s.batteryRange(con)) {
        const arc = s.BATTERY_ARC;
        const len = s.batteryRange(con);
        g.lineStyle(1, 0xffb454, 0.16);
        for (const sign of [-1, 1]) {
          const a = con.facing + sign * arc;
          g.lineBetween(con.x, con.y, con.x + Math.cos(a) * len, con.y + Math.sin(a) * len);
        }
        g.beginPath();
        g.arc(con.x, con.y, len, con.facing - arc, con.facing + arc);
        g.strokePath();
      }
    }

    // Locked target: steady brackets plus a lead marker showing where the
    // guns are actually shooting.
    const t = s.lockedTarget;
    if (t?.active && !t.dying) {
      const size = Math.max(t.displayWidth, t.displayHeight) * 1.25 + 16;
      const pulse = 0.55 + 0.25 * Math.sin(time / 260);
      this.brackets(t.x, t.y, size, 0xffb454, pulse, 2);
      g.lineStyle(1, 0xffb454, 0.5).strokeCircle(t.x, t.y, 4);
      if (con?.active) {
        g.lineStyle(1, 0xffb454, 0.12).lineBetween(con.x, con.y, t.x, t.y);
      }
    }

    // Incoming fire: a friendly with an enemy beam charging on it gets a red
    // bracket that tightens as the shot closes on firing.
    for (const threat of s.threats) {
      const ship = threat.target;
      if (!ship?.active || ship.dying) continue;
      const frac = Phaser.Math.Clamp(threat.charge, 0, 1);
      const size = Math.max(ship.displayWidth, ship.displayHeight) * (1.9 - 0.55 * frac) + 12;
      const flash = 0.35 + 0.45 * Math.abs(Math.sin(time / (90 + 120 * (1 - frac))));
      this.brackets(ship.x, ship.y, size, 0xff5040, flash, 2);
    }
  }
}
