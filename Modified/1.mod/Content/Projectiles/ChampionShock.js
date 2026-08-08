import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Vector2, Color } = Modules;

export class ChampionShock extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 42;
    this.Projectile.height = 42;
    this.Projectile.aiStyle = -1;
    this.Projectile.light = 0.25;
    this.Projectile.friendly = true;
    this.Projectile.melee = true;
    this.Projectile.penetrate = -1;
    this.Projectile.timeLeft = 60;
  }

  AI(proj) {
    const vel = proj.velocity;
    vel.X *= 0.975;
    vel.Y *= 0.975;
    proj.velocity = vel;
    proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI / 2;

    const dustPos = Vector2.new(proj.position.X + 2, proj.position.Y + 2);
    const dustIdx = Terraria.Dust.NewDust(dustPos, proj.width, proj.height, 63, 0, 0, 100, Color.White, 1);
    const dust = Terraria.Main.dust[dustIdx];
    if (dust) {
      dust.scale *= 1.4 + Terraria.Main.rand['int Next(int maxValue)'](10) * 0.1;
      const dVel = dust.velocity;
      dVel.X *= 0.2;
      dVel.Y *= 0.2;
      dust.velocity = dVel;
      dust.noGravity = true;
    }
  }

  OnKill(proj, timeLeft) {
    for (let i = 0; i < 10; i++) {
      Terraria.Dust.NewDust(
        proj.position, proj.width, proj.height, 63,
        proj.oldVelocity.X * 0.5, proj.oldVelocity.Y * 0.8, 0, Color.White, 1
      );
    }
  }
}
