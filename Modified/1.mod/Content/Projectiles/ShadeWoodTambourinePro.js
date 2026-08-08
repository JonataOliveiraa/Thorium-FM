import { ModProjectile } from '../../TL/ModProjectile.js';

export class ShadeWoodTambourinePro extends ModProjectile {
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
    // Sem flag de classe: o dano vem do proprio item de bardo, nao do corpo a corpo

    this.Projectile.penetrate = -1;
    this.Projectile.timeLeft = 300;

    this.Projectile.ignoreWater = true;
    this.Projectile.tileCollide = true;
    this.Projectile.usesLocalNPCImmunity = true;
    this.Projectile.localNPCHitCooldown = -1;
  }
}