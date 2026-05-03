import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
const { Color, Vector2, Rand, Effects, Camera } = Modules;
import { ProjAI } from './../../../TL/ProjAI.js';
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class ThunderBirdScreech extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/Boss/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 150;
    this.Projectile.height = 110;
    this.Projectile.aiStyle = 0;
    this.Projectile.tileCollide = false;
    this.Projectile.penetrate = -1;
    this.Projectile.timeLeft = 35;
  }

  AI(proj) {
    const ai = new ProjAI(proj);
    if (ai[0] === 0) {
      Effects.PlaySound(Terraria.ID.SoundID.NPCHit28, proj.Center.X, proj.Center.Y, 1, -0.3, 1.5);
      Camera.Shake(24, 4);
      ai[0] = 1;
    }
    const player = Terraria.Main.player[Terraria.Main.myPlayer];
    proj.spriteDirection = (player.Center.X > proj.Center.X) ? -1 : 1;
    proj.direction = proj.spriteDirection;
  }

  OnKill(proj) {
    NewProjectile(
      Terraria.Projectile.GetNoneSource(),
      proj.Center.X, proj.Center.Y,
      0, 0, ModProjectile.getTypeByName("TheGrandThunderBirdEnd"), 0, 0,
      Terraria.Main.myPlayer, 0, 0, 0, null
    );
  }
}