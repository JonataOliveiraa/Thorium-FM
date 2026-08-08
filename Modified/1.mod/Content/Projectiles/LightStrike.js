import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Vector2, Color } = Modules;

export class LightStrike extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 18;
    this.Projectile.height = 18;
    this.Projectile.aiStyle = 1;
    this.Projectile.friendly = true;
    this.Projectile.tileCollide = false;
    this.Projectile.penetrate = -1;
    this.Projectile.timeLeft = 60;
    this.Projectile.extraUpdates = 6;
  }

  PreDraw(proj, lightColor) {
    return false;
  }

  OnHitNPC(proj, npc) {
    if (npc && npc.active) {
      npc.immune[proj.owner] = 2;
    }
  }

  AI(proj) {
    proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI / 2;

    for (let i = 0; i < 4; i++) {
      const pos = Vector2.new(proj.Center.X - proj.velocity.X * i * 0.25, proj.Center.Y - proj.velocity.Y * i * 0.25);
      const dustIdx = Terraria.Dust.NewDust(pos, 1, 1, 159, 0, 0, 0, Color.White, 1.75);
      const dust = Terraria.Main.dust[dustIdx];
      if (dust) {
        dust.noGravity = true;
        dust.position = pos;
        const vel = dust.velocity;
        vel.X *= 0.1;
        vel.Y *= 0.1;
        dust.velocity = vel;
      }
    }
  }

  OnKill(proj, timeLeft) {
    for (let i = 0; i < 10; i++) {
      const rx = Terraria.Main.rand['int Next(int minValue, int maxValue)'](-6, 6);
      const ry = Terraria.Main.rand['int Next(int minValue, int maxValue)'](-6, 6);
      const dustIdx = Terraria.Dust.NewDust(
        proj.position, proj.width, proj.height, 159,
        rx, ry, 125, Color.White, 1
      );
      const dust = Terraria.Main.dust[dustIdx];
      if (dust) dust.noGravity = true;
    }
  }
}
