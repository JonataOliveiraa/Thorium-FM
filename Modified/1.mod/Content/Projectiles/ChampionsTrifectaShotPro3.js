import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Vector2, Color } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let _explosionType = -1;

export class ChampionsTrifectaShotPro3 extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 14;
    this.Projectile.height = 14;
    this.Projectile.aiStyle = 1;
    this.Projectile.arrow = true;
    this.Projectile.friendly = true;
    this.Projectile.ranged = true;
    this.Projectile.penetrate = 1;
    this.Projectile.timeLeft = 300;
  }

  AI(proj) {
    proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI / 2;
  }

  OnKill(proj, timeLeft) {
    for (let i = 0; i < 15; i++) {
      const rx = Terraria.Main.rand['int Next(int minValue, int maxValue)'](-5, 5);
      const ry = Terraria.Main.rand['int Next(int minValue, int maxValue)'](-5, 5);
      const dustIdx = Terraria.Dust.NewDust(
        proj.Center, 10, 10, 174,
        rx, ry, 0, Color.White, 1.65
      );
      const dust = Terraria.Main.dust[dustIdx];
      if (dust) dust.noGravity = true;
    }

    if (_explosionType === -1) {
      _explosionType = ModProjectile.getTypeByName('ChampionsTrifectaShotPro4') ?? -2;
    }

    if (_explosionType > 0 && proj.owner === Terraria.Main.myPlayer) {
      const direction = proj.velocity.X >= 0 ? 1 : -1;
      NewProjectile(
        null, proj.Center, Vector2.Zero, _explosionType,
        Math.floor(proj.damage * 0.5), 1, proj.owner,
        direction, 0, 0, null
      );
    }
  }
}
