import {
  Terraria,
  Modules
} from '../../TL/ModImports.js';
import {
  ModProjectile
} from '../../TL/ModProjectile.js';
import {
  Effects
} from '../../TL/Modules/Effects.js';
import {
  ProjAI
} from '../../TL/ProjAI.js';

const {
  Color,
  Vector2
} = Modules;
const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class HoneyRecorderPro extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.Main.projFrames[this.Type] = 1;
  }

  SetDefaults() {
    this.Projectile.width = 24;
    this.Projectile.height = 24;
    this.Projectile.aiStyle = -1;
    this.Projectile.friendly = true;
    this.Projectile.penetrate = -1;
    this.Projectile.timeLeft = 120;
    this.Projectile.alpha = 0;
    this.Projectile.ignoreWater = true;
    this.Projectile.tileCollide = true;
    this.Projectile.usesLocalNPCImmunity = true;
    this.Projectile.localNPCHitCooldown = -1;
  }

  GetAlpha(proj, color) {
    const opacity = proj.Opacity;
    return Color.Multiply(Color.Multiply(Color.White, 0.8), opacity);
  }

  AI(proj) {
    const localAI = new ProjAI(proj, true);
    const ai = new ProjAI(proj);

    // Salva a velocidade inicial
    if (localAI[0] === 0 && localAI[1] === 0) {
      localAI[0] = proj.velocity.X;
      localAI[1] = proj.velocity.Y;
    }

    const baseX = localAI[0];
    const baseY = localAI[1];

    // Direção base
    let len = Math.sqrt(baseX * baseX + baseY * baseY);
    let dirX = len > 0 ? baseX / len : 0;
    let dirY = len > 0 ? baseY / len : 0;

    // Vetor perpendicular
    let perpX = -dirY;
    let perpY = dirX;

    // Movimento ondulatório
    const amplitude = 7.0;
    const frequency = 0.25;
    const waveOffset = Math.cos(ai[1] * frequency) * amplitude;

    let vel = proj.velocity;
    vel.X = baseX + perpX * waveOffset * frequency;
    vel.Y = baseY + perpY * waveOffset * frequency;
    proj.velocity = vel;

    ai[1]++;

    // Rotação baseada na direção do movimento
    if (proj.velocity.Length() > 0.5) {
      proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X);
    }

    if (ai[1] % 2 === 0) {
      let dustType;
      const r = Math.random();
      if (r < 0.33) dustType = 152;
      else if (r < 0.66) dustType = 55;
      else dustType = 152;

      const dust = NewDustDirect(
        proj.Center, 0, 0, dustType, 0, 0, 0, Color.Orange, 2.5
      );

      if (dust) {
        dust.fadeIn = 0.1
        dust.noGravity = true;
        let dv = dust.velocity;
        dv.X = 0;
        dv.Y = 0;
        dust.velocity = dv;
      }
    }
  }

  OnKill(proj) {
    for (let i = 0; i < 6; i++) {
      const dustType = Math.random() > 0.5 ? 152 : 153;
      const dust = NewDustDirect(
        proj.position,
        proj.width,
        proj.height,
        dustType,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        50,
        Color.Gold,
        1.2 + Math.random() * 0.6
      );
      if (dust) {
        dust.noGravity = true;
      }
    }
  }

  PreDraw(proj) {
    return false
  }
}