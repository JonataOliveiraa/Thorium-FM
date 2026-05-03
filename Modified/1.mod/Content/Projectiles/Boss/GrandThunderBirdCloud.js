import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ProjAI } from './../../../TL/ProjAI.js';

const { Color, Vector2, Rand, Effects } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class GrandThunderBirdCloud extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/Boss/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.Main.projFrames[this.Type] = 6;
  }

  SetDefaults() {
    this.Projectile.width = 54;
    this.Projectile.height = 28;
    this.Projectile.aiStyle = -1;
    this.Projectile.penetrate = -1;
    this.Projectile.tileCollide = false;
    this.Projectile.light = 0.1;
    this.Projectile.timeLeft = 120;
    this.Projectile.hostile = true;
    this.Projectile.friendly = false;
  }

  GetAlpha(proj, lightColor) {
    const ai = new ProjAI(proj);
    return Color.Multiply(Color.White, ai[0] * 0.005);
  }

  AI(proj) {
    const ai = new ProjAI(proj);
    proj.velocity = Vector2.Zero;
    ai[0] += 3;
    if (ai[0] * 0.005 >= 1) {
      NewProjectile(Terraria.Projectile.GetNoneSource(), proj.Center.X, proj.Center.Y, 0, 10,
        ModProjectile.getTypeByName("ThunderSpark"),
        0, 0, proj.owner, 0, 0, 0, null);
      proj.Kill();
    }

    proj.frameCounter++;
    if (proj.frameCounter > 4) {
      proj.frame++;
      proj.frameCounter = 0;
    }

    if (proj.frame >= Terraria.Main.projFrames[proj.type]) {
      proj.frame = 0;
    }
  }

  OnKill(proj) {
    for (let i = 0; i < 5; i++) {
      const d = Effects.NewDust(proj.position, proj.width / 2, proj.height / 2, 31, Rand.Next(-3, 3), Rand.Next(-3, 3), 0, Color.White, 1);
      Terraria.Main.dust[d].noGravity = true;
    }
  }
}