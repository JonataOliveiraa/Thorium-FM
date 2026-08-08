import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color } = Modules;

export class BuriedMagicPopPro extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 10;
    this.Projectile.height = 10;
    this.Projectile.aiStyle = 1;
    this.Projectile.friendly = true;
    this.Projectile.magic = true;
    this.Projectile.penetrate = 1;
    this.Projectile.timeLeft = 120;
    this.Projectile.tileCollide = true;
  }

  OnHitNPC(proj, npc) {
    if (npc && npc.life <= 0) {
      const player = Terraria.Main.player[proj.owner];
      if (player && player.active) {
        player.HealMana(15);
      }
    }
  }

  AI(proj) {
    proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI / 2;

    const dustIdx = Terraria.Dust.NewDust(proj.position, proj.width, proj.height, 172, 0, 0, 0, Color.White, 1);
    const dust = Terraria.Main.dust[dustIdx];
    if (dust) {
      const vel = dust.velocity;
      vel.X *= 0.2;
      vel.Y *= 0.2;
      dust.velocity = vel;
      dust.noGravity = true;
    }
  }
}
