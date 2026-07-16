import { Terraria, Microsoft, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { Effects } from './../../TL/Modules/Effects.js';
import { Rand } from '../../TL/Modules/Rand.js';

const { Color, Vector2 } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class SkywarePro2 extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 18;
    this.Projectile.height = 18;
    this.Projectile.aiStyle = 1;
    this.Projectile.scale = 1;
    this.Projectile.friendly = true;
    this.Projectile.tileCollide = false;
    this.Projectile.penetrate = -1;
    this.Projectile.timeLeft = 30;
    this.Projectile.ignoreWater = true;
    this.Projectile.alpha = 0;
    this.AIType = 14;
  }

  GetAlpha(proj, color) {
    const opacity = proj.Opacity;
    return Color.Multiply(Color.Multiply(Color.White, 0.8), opacity);
  }

  AI(proj) {
    proj.velocity = Vector2.Divide(proj.velocity, 1.04);

    for (let i = 0; i < 1; i++) {
      const dustIdx = NewDust(
        Vector2.Subtract(proj.position, proj.velocity),
        proj.width, proj.height,
        15, 0, 0, 100, Color.White, 1.4
      );
      const dust = Terraria.Main.dust[dustIdx];
      if (dust) {
        dust.velocity = Vector2.Multiply(dust.velocity, 0.2);
        dust.noGravity = true;
      }
    }
  }

  OnHitNPC(proj, npc) {
    npc.immune[proj.owner] = 10;

    for (let i = 0; i < 4; i++) {
      const dustIdx = NewDust(
        npc.position, npc.width, npc.height, 15,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        100, Color.White, 1.0 + Math.random() * 0.5
      );

      const dust = Terraria.Main.dust[dustIdx];
      if (dust) dust.noGravity = true;
    }

    Effects.PlaySound(Terraria.ID.SoundID.Item25, proj.position.X, proj.position.Y);
  }

  OnKill(proj) {
    for (let i = 0; i < 8; i++) {
      const dustIdx = NewDust(
        proj.position, proj.width, proj.height, 15,
        Rand.Next(-3, 4), Rand.Next(-3, 4),
        0, Color.White, 1.0
      );

      const dust = Terraria.Main.dust[dustIdx];
      if (dust) {
        dust.noGravity = true;
        dust.scale = 0.6 + Math.random() * 0.6;
      }
    }
  }
}