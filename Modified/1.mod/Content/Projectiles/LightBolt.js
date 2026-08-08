import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModBuff } from '../../TL/ModBuff.js';

const { Vector2, Color } = Modules;

let _stunBuffType = -1;

export class LightBolt extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 10;
    this.Projectile.height = 10;
    this.Projectile.aiStyle = 1;
    this.Projectile.friendly = true;
    this.Projectile.ranged = true;
    this.Projectile.penetrate = 1;
    this.Projectile.timeLeft = 180;
  }

  PreDraw(proj, lightColor) {
    return false;
  }

  OnHitNPC(proj, npc) {
    if (!npc || !npc.active) return;

    if (Terraria.Main.rand['int Next(int minValue, int maxValue)'](0, 4) === 0) {
      if (_stunBuffType === -1) {
        _stunBuffType = ModBuff.getTypeByName('StunnedBuff') ?? Terraria.ID.BuffID.Confused;
      }
      npc.AddBuff(_stunBuffType, 60, false);

      for (let i = 0; i < 15; i++) {
        const dustIdx = Terraria.Dust.NewDust(npc.position, npc.width, npc.height, 159, 0, 0, 100, Color.White, 1.25);
        const dust = Terraria.Main.dust[dustIdx];
        if (dust) {
          dust.noGravity = true;
          const vel = dust.velocity;
          vel.X *= 0.75;
          vel.Y *= 0.75;
          dust.velocity = vel;
        }
      }
    }
  }

  AI(proj) {
    proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI / 2;

    if (proj.timeLeft < 179) {
      for (let i = 0; i < 4; i++) {
        const pos = Vector2.new(proj.Center.X - proj.velocity.X * i * 0.25, proj.Center.Y - proj.velocity.Y * i * 0.25);
        const dustIdx = Terraria.Dust.NewDust(pos, 1, 1, 159, 0, 0, 0, Color.White, 1.5);
        const dust = Terraria.Main.dust[dustIdx];
        if (dust) {
          dust.noGravity = true;
          dust.position = pos;
          const vel = dust.velocity;
          vel.X *= 0.15;
          vel.Y *= 0.15;
          dust.velocity = vel;
        }
      }
    }
  }

  OnKill(proj, timeLeft) {
    for (let i = 0; i < 8; i++) {
      const rx = Terraria.Main.rand['int Next(int minValue, int maxValue)'](-6, 6);
      const ry = Terraria.Main.rand['int Next(int minValue, int maxValue)'](-6, 6);
      const dustIdx = Terraria.Dust.NewDust(
        proj.position, proj.width, proj.height, 159,
        rx, ry, 0, Color.White, 1
      );
      const dust = Terraria.Main.dust[dustIdx];
      if (dust) dust.noGravity = true;
    }
  }
}
