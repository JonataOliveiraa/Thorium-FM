import { Terraria } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

export class ChampionCatcherBobber extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 14;
    this.Projectile.height = 14;
    this.Projectile.aiStyle = 61; // Fishing bobber AI style
    this.Projectile.bobber = true;
    this.Projectile.penetrate = -1;
  }
}
