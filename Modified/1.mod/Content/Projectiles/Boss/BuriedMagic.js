import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Color } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let popType = -1;

export class BuriedMagic extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/ChampionShock';
  }

  SetStaticDefaults() {
    Terraria.Main.projFrames[this.Type] = 4;
  }

  SetDefaults() {
    const proj = this.Projectile;
    proj.width = 38;
    proj.height = 38;
    proj.aiStyle = 1;
    proj.alpha = 100;
    proj.hostile = true;
    proj.penetrate = -1;
    proj.timeLeft = 180;
    proj.tileCollide = true;
  }

  GetAlpha() {
    return Color.new(255, 255, 255, 38);
  }

  PostAI(proj) {
    proj.frameCounter++;
    if (proj.frameCounter > 3) {
      proj.frame = (proj.frame + 1) % 4;
      proj.frameCounter = 0;
    }
  }

  OnKill(proj) {
    if (popType < 0) {
      popType = ModProjectile.getTypeByName('BuriedMagicPop');
    }

    if (popType >= 0) {
      const projCenter = proj.Center;
      const velocities = [
        [0, 4], [4, 0], [0, -4], [-4, 0],
        [3, 3], [-3, -3], [3, -3], [-3, 3]
      ];
      for (const [vx, vy] of velocities) {
        NewProjectile(null, projCenter.X, projCenter.Y, vx, vy, popType, 10, 3, proj.owner, 0, 0, 0, null);
      }
    }
  }
}
