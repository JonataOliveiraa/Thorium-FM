import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
const { Color, Vector2, Rand, Effects } = Modules;

export class GrandThunderBirdZap extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/Boss/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 20;
    this.Projectile.height = 20;
    this.Projectile.aiStyle = -1;
    this.Projectile.penetrate = -1;
    this.Projectile.scale = 1;
    this.Projectile.hostile = true;
    this.Projectile.friendly = false;
    this.Projectile.tileCollide = true;
    this.Projectile.timeLeft = 180;
    this.Projectile.alpha = 255;
  }

  AI(proj) {
    if (proj.alpha <= 0) {
      const wave = Math.cos(proj.frameCounter * Math.PI * 2 / 40 - Math.PI / 2) * 22;
      const offset = Vector2.RotatedBy(Vector2.new(0, wave), proj.rotation);
      const back = Vector2.Multiply(Vector2.SafeNormalize(proj.velocity, Vector2.Zero), -1);
      const center = proj.Center;
      const d = Effects.NewDust(center, proj.width / 2, proj.height / 2, 228, 0, 0, 0, Color.White, 1);
      const dust = Terraria.Main.dust[d];
      dust.noGravity = true;
      const randomOffset = Vector2.new(Rand.Next(-3, 3), Rand.Next(-3, 3));
      dust.position = Vector2.Add(center, Vector2.Add(offset, randomOffset));
      dust.fadeIn = 1.4;
      dust.velocity = Vector2.Multiply(dust.velocity, 0.2);
      dust.velocity = Vector2.Add(dust.velocity, Vector2.Add(Vector2.Multiply(back, 2), Vector2.new(Rand.Next(-1, 1), Rand.Next(-1, 1))))
      dust.position = Vector2.Add(dust.position, Vector2.Multiply(proj.velocity, 1.2))
    }

    proj.frameCounter++;
    if (proj.frameCounter >= 40) proj.frameCounter = 0;
    proj.frame = Math.floor(proj.frameCounter / 5);

    if (proj.alpha > 0) {
      proj.alpha -= 55;
      if (proj.alpha < 0) {
        proj.alpha = 0;

        const num = 14;
        for (let i = 0; i < num; i++) {
          const angle = i * (Math.PI * 2 / num);
          const vec = Vector2.RotatedBy(Vector2.Multiply(Vector2.Multiply(Vector2.RotatedBy(Vector2.UnitY, angle), -1), Vector2.new(1, 4)), Vector2.ToRotation(proj.velocity));
          const d = Effects.NewDust(proj.Center, 0, 0, 228, 0, 0, 0, Color.White, 1);
          const dust = Terraria.Main.dust[d];

          dust.scale = 1;
          dust.noGravity = true;
          dust.position = Vector2.Add(proj.Center, vec);
          dust.velocity = Vector2.Add(Vector2.Multiply(dust.velocity, 4), Vector2.Multiply(proj.velocity, 0.3));
        }
      }
    }
    Effects.AddLight(proj.Center, 0.8, 0.65, 0.1);
  }

  OnKill(proj) {
    for (let i = 0; i < 5; i++) {
      const d = Effects.NewDust(proj.position, proj.width, proj.height, 15, Rand.Next(-3, 3), Rand.Next(-3, 3), 0, Color.White, 1);
      Terraria.Main.dust[d].noGravity = true;
    }
  }
}