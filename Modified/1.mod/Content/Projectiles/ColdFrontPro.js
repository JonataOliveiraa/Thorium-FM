import { Terraria } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { Rand } from './../../TL/Modules/Rand.js'

export class ColdFrontPro extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 42;
    this.Projectile.height = 42;
    this.Projectile.scale = 1;

    this.Projectile.aiStyle = 3;
    this.Projectile.AIType = 52

    this.Projectile.friendly = true;
    this.Projectile.hostile = false;
    this.Projectile.melee = true;

    this.Projectile.penetrate = -1;
    this.Projectile.timeLeft = 300;

    this.Projectile.ignoreWater = true;
    this.Projectile.tileCollide = true;
    this.Projectile.extraUpdates = 1;
    this.Projectile.usesLocalNPCImmunity = true;
    this.Projectile.localNPCHitCooldown = -1;
  }

  OnHitNPC(proj, npc) {
    if (Rand.NextBool(3)) {
      npc.AddBuff(44, 60, false);
    }
  }
}