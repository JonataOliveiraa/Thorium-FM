import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Color } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let boomType = -1;

export class BuriedArrowF extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/IcyArrowPro';
  }

  SetDefaults() {
    const proj = this.Projectile;
    proj.width = 14;
    proj.height = 14;
    proj.aiStyle = 1;
    proj.hostile = true;
    proj.penetrate = 1;
    proj.timeLeft = 300;
    proj.tileCollide = false;
  }

  GetAlpha() {
    return Color.new(255, 190, 130, 180);
  }

  AI(proj) {
    proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI / 2;
  }

  OnHitPlayer(proj, player) {
    if (player && player.active) {
      player.AddBuff(Terraria.ID.BuffID.OnFire, 300, false);
    }
  }

  OnKill(proj) {
    if (boomType < 0) {
      boomType = ModProjectile.getTypeByName('BuriedArrowFBoom');
    }

    if (boomType >= 0) {
      NewProjectile(null, proj.Center.X, proj.Center.Y, 0, 0, boomType, 20, 3, proj.owner, 0, 0, 0, null);
    }

    for (let i = 0; i < 10; i++) {
      const dustIdx = Terraria.Dust.NewDust(
        proj.position, proj.width, proj.height, 6,
        proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 100, Color.White, 1
      );
      if (Terraria.Main.dust[dustIdx]) {
        Terraria.Main.dust[dustIdx].noGravity = true;
      }
    }
  }
}
