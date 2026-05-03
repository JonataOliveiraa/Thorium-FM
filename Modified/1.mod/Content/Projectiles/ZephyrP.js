import { Terraria } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { VFX } from './../VFXShaders/VFX.js';

export class ZephyrP extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 30;
    this.Projectile.height = 30;
    this.Projectile.scale = 1;
    this.Projectile.aiStyle = -1;
    this.Projectile.friendly = true;
    this.Projectile.hostile = false;
    this.Projectile.ranged = true;
    this.Projectile.penetrate = 1;
    this.Projectile.timeLeft = 600;
    this.Projectile.light = 0.5;
    this.Projectile.alpha = 255;
    this.Projectile.ignoreWater = true;
    this.Projectile.tileCollide = true;
    this.Projectile.extraUpdates = 1;
    this.Projectile.usesLocalNPCImmunity = true;
    this.Projectile.localNPCHitCooldown = -1;
  }

  AI(proj) {
    const d = Terraria.Dust.NewDustDirect(proj.position, proj.width, proj.height, 48, proj.velocity.X * -0.5, proj.velocity.Y * -0.5, 100, null, 1.8);
    if (d) d.noGravity = true;
  }
}