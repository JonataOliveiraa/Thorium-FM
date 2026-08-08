import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color } = Modules;

export class ChampionsTrifectaShotPro extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 14;
    this.Projectile.height = 14;
    this.Projectile.aiStyle = 1;
    this.Projectile.arrow = true;
    this.Projectile.friendly = true;
    this.Projectile.ranged = true;
    this.Projectile.penetrate = 2;
    this.Projectile.timeLeft = 300;
  }

  AI(proj) {
    proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI / 2;
  }

  OnHitNPC(proj, npc) {
    if (npc && npc.active) {
      npc.AddBuff(Terraria.ID.BuffID.OnFire, 180, false);
    }
  }

  OnKill(proj, timeLeft) {
    for (let i = 0; i < 10; i++) {
      const rx = Terraria.Main.rand['int Next(int minValue, int maxValue)'](-3, 3);
      const ry = Terraria.Main.rand['int Next(int minValue, int maxValue)'](-3, 3);
      const dustIdx = Terraria.Dust.NewDust(
        proj.Center, 10, 10, 157,
        rx, ry, 0, Color.White, 1.5
      );
      const dust = Terraria.Main.dust[dustIdx];
      if (dust) dust.noGravity = true;
    }
  }
}
