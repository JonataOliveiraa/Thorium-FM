import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ProjAI } from './../../../TL/ProjAI.js';

const { Color, Vector2, Rand, Effects } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class ThunderSpark extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/Boss/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.Main.projFrames[this.Type] = 6;
  }

  SetDefaults() {
    this.Projectile.width = 30;
    this.Projectile.height = 30;
    this.Projectile.aiStyle = -1;
    this.Projectile.hostile = true;
    this.Projectile.friendly = false;
    this.Projectile.penetrate = 1;
    this.Projectile.timeLeft = 600;
    this.Projectile.tileCollide = true;
  }

  GetAlpha(proj, lightColor) {
    return Color.Multiply(Color.new(255, 255, 255, 150), 0.5);
  }

  AI(proj) {
    let ai = new ProjAI(proj)
    if (ai[0] === 0) {
      ai[0] = 1;
      Effects.PlaySound(43, proj.Center.X, proj.Center.Y, 1, Rand.Next(-10, 10) * 0.01, 0.6);
    }

    const d = Effects.NewDust(proj.position, proj.width / 2, proj.height / 2, 15, 0, 0, 100, Color.White, 1)
    const dust = Terraria.Main.dust[d];
    dust.velocity = Vector2.Multiply(dust.velocity, 0.2);
    dust.noGravity = true;

    proj.frameCounter++;
    if (proj.frameCounter > 3) {
      proj.frame++;
      proj.frameCounter = 0;
    }

    if (proj.frame >= Terraria.Main.projFrames[proj.type]) {
      proj.frame = 0;
    }
  }

  OnKill(proj) {
    Effects.PlaySound(43, proj.Center.X, proj.Center.Y, 1, Rand.Next(-10, 10) * 0.01, 1.0);
    const type = ModProjectile.getTypeByName("ThunderGust");
    for (let i = 0; i < 2; i++) {
      const dir = (i % 2 === 0) ? 1 : -1;
      NewProjectile(Terraria.Projectile.GetNoneSource(), proj.Center.X, proj.Center.Y, dir * 3, 0, type, 10, 0, proj.owner, 0, 0, 0, null)
    }
  }
}