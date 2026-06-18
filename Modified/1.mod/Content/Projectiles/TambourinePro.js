import { ModProjectile } from '../../TL/ModProjectile.js';

export class TambourinePro extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 30;
    this.Projectile.height = 30;
    this.Projectile.scale = 1;

    this.Projectile.aiStyle = 3;
    this.AIType = 52

    this.Projectile.friendly = true;
    this.Projectile.hostile = false;
    this.Projectile.melee = true;

    this.Projectile.penetrate = -1;
    this.Projectile.timeLeft = 300;

    this.Projectile.ignoreWater = true;
    this.Projectile.tileCollide = true;
    this.Projectile.usesLocalNPCImmunity = true;
    this.Projectile.localNPCHitCooldown = -1;
  }
}