import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Color, Vector2, Effects } = Modules;

export class ThunderGust extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/Boss/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.Main.projFrames[this.Type] = 5;
  }

  SetDefaults() {
    this.Projectile.width = 44;
    this.Projectile.height = 44;
    this.Projectile.aiStyle = -1;
    this.Projectile.alpha = 75;
    this.Projectile.hostile = true;
    this.Projectile.friendly = false;
    this.Projectile.penetrate = 10;
    this.Projectile.timeLeft = 120;
    this.Projectile.tileCollide = false;
  }

  AI(proj) {
    const d = Effects.NewDust(proj.Center, proj.width / 2, proj.height / 2, 32, 0, 0, 125, Color.White, 1);
    const dust = Terraria.Main.dust[d];
    dust.velocity = Vector2.Multiply(dust.velocity, 0.2);
    dust.noGravity = true;

    proj.spriteDirection = proj.velocity.X < 0 ? 1 : -1;
    proj.frameCounter++;
    if (proj.frameCounter > 3) {
      proj.frame++;
      proj.frameCounter = 0;
    }
    if (proj.frame >= Terraria.Main.projFrames[proj.type]) {
      proj.frame = 0;
    }
    if (proj.timeLeft < 20) {
      proj.alpha += 8;
      if (proj.alpha > 255) proj.alpha = 255;
    }
  }
}