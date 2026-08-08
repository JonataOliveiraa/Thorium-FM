import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Color } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let daggerType = -1;

export class BuriedDaggerSpawner extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/Empty';
  }

  SetDefaults() {
    const proj = this.Projectile;
    proj.width = 50;
    proj.height = 50;
    proj.aiStyle = -1;
    proj.penetrate = -1;
    proj.tileCollide = false;
    proj.timeLeft = 180;
  }

  AI(proj) {
    if (daggerType < 0) {
      daggerType = ModProjectile.getTypeByName('BuriedDagger');
    }

    const player = Terraria.Main.player[proj.owner];
    if (!player || !player.active) {
      proj.active = false;
      return;
    }

    if (proj.timeLeft > 60) {
      const pos = proj.position;
      pos.X = player.Center.X - proj.width / 2;
      pos.Y = player.Center.Y + 50 - proj.height / 2;
      proj.position = pos;
    }

    if (proj.timeLeft % 5 === 0 && proj.timeLeft < 180) {
      const dustIdx = Terraria.Dust.NewDust(proj.position, proj.width, proj.height, 113, 0, 0, 0, Color.White, 0.75);
      if (Terraria.Main.dust[dustIdx]) {
        Terraria.Main.dust[dustIdx].noGravity = true;
      }
    }

    if (proj.timeLeft === 4 && daggerType >= 0) {
      const projCenter = proj.Center;
      for (const xOffset of [-16, 0, 16]) {
        const spawnY = projCenter.Y - (xOffset === 0 ? 10 : 0);
        NewProjectile(null, projCenter.X + xOffset, spawnY, 0, -7, daggerType, 30, 0, proj.owner, 0, 0, 0, null);
      }
    }
  }
}
