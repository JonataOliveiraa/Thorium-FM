import { ModProjectile } from './../../TL/ModProjectile.js';
import { Terraria, Modules } from './../../TL/ModImports.js';
import { Effects } from './../../TL/Modules/Effects.js';

const { Color, Vector2, Rand } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class HarmonicaPro extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
    this.fadeOutTime = 30;
    this.fadeOutSpeed = 9;
  }

  SetStaticDefaults() {
    Terraria.Main.projFrames[this.Type] = 4;
    Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 3;
    Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
  }

  SetDefaults() {
    this.Projectile.width = 8;
    this.Projectile.height = 8;
    this.Projectile.aiStyle = 1;
    this.Projectile.penetrate = 1;
    this.Projectile.timeLeft = 120;
    this.Projectile.friendly = true;
    this.Projectile.ignoreWater = true;
    this.Projectile.tileCollide = true;
    this.Projectile.usesLocalNPCImmunity = true;
    this.Projectile.localNPCHitCooldown = -1;
    this.Projectile.alpha = 0;

    // AIType = 1 (projétil com gravidade)
    this.Projectile.aiStyle = 1;
    this.AIType = 1;
  }

  GetAlpha(proj, color) {
    const opacity = proj.Opacity;
    return Color.Multiply(
      Color.Multiply(Color.White, 0.75),
      opacity
    );
  }

  AI(proj) {
    // Homing para vento (similar ao WindHomingCommon do PC)
    this.WindHomingCommon(proj);

    // Animação de frames
    proj.frameCounter++;
    if (proj.frameCounter > 3) {
      proj.frame++;
      proj.frameCounter = 0;
      if (proj.frame >= 4) {
        proj.frame = 0;
      }
    }

    // Efeito de fade out (desaparecimento gradual)
    if (proj.timeLeft < this.fadeOutTime) {
      const fadeProgress = 1 - (proj.timeLeft / this.fadeOutTime);
      proj.Opacity = 1 - (fadeProgress * this.fadeOutSpeed / 10);
    }
  }

  WindHomingCommon(proj) {
    // Homing suave para inimigos próximos (estilo instrumento de sopro)
    const homingRange = 400;
    const homingSpeed = 0.08;

    let target = null;
    let targetDist = homingRange;

    for (let i = 0; i < 200; i++) {
      const npc = Terraria.Main.npc[i];
      if (npc && npc.active && !npc.dontTakeDamage && !npc.friendly && npc.life > 0) {
        const dist = Vector2.Distance(npc.Center, proj.Center);
        if (dist < targetDist) {
          targetDist = dist;
          target = npc;
        }
      }
    }

    if (target) {
      const direction = Vector2.Subtract(target.Center, proj.Center);
      const normDir = Vector2.Normalize(direction);
      proj.velocity = Vector2.Add(
        proj.velocity,
        Vector2.Multiply(normDir, homingSpeed)
      );

      const maxSpeed = 12;
      if (proj.velocity.Length() > maxSpeed) {
        proj.velocity = Vector2.Multiply(
          Vector2.Normalize(proj.velocity),
          maxSpeed
        );
      }
    }

    // Rotação baseada na velocidade
    proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X);
  }

  OnKill(proj) {
    // Efeito de partículas musicais ao morrer
    for (let i = 0; i < 5; i++) {
      const dustIdx = NewDust(
        proj.position, proj.width, proj.height,
        229, // DustID.MusicNote
        Rand.Next(-4, 5),
        Rand.Next(-4, 5),
        0, Color.White, 1.0
      );
      const dust = Terraria.Main.dust[dustIdx];
      if (dust) {
        dust.noGravity = true;
        dust.noLight = true;
        dust.scale = 0.8 + Math.random() * 0.4;
      }
    }
  }
}