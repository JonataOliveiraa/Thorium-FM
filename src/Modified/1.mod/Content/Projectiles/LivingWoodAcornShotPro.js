import { Terraria } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

export class LivingWoodAcornShotPro extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 10;
    this.Projectile.height = 10;
    this.Projectile.scale = 1;
    this.Projectile.aiStyle = Terraria.ID.ProjAIStyleID.Arrow;
    this.Projectile.friendly = true;
    this.Projectile.hostile = false;
    this.Projectile.ranged = true;
    this.Projectile.penetrate = 1;
    this.Projectile.timeLeft = 450;
    this.Projectile.ignoreWater = false;
    this.Projectile.tileCollide = true;
    this.Projectile.extraUpdates = 1;
    this.Projectile.usesLocalNPCImmunity = true;
    this.Projectile.localNPCHitCooldown = -1;
  }
}