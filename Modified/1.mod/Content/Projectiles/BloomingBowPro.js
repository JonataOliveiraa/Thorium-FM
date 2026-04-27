import { Terraria } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModBuff } from "./../../TL/ModBuff.js";

export class BloomingBowPro extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 18;
    this.Projectile.height = 34;
    this.Projectile.scale = 1;
    this.Projectile.aiStyle = 1;
    this.Projectile.friendly = true;
    this.Projectile.hostile = false;
    this.Projectile.ranged = true;
    this.Projectile.penetrate = 1;
    this.Projectile.timeLeft = 600;
    this.Projectile.light = 0.5;
    this.Projectile.ignoreWater = true;
    this.Projectile.tileCollide = true;
    this.Projectile.extraUpdates = 1;
    this.Projectile.usesLocalNPCImmunity = true;
    this.Projectile.localNPCHitCooldown = -1;
  }

  OnHitNPC(proj, npc) {
    const player = Terraria.Main.player[0];
    player.AddBuff(ModBuff.getTypeByName('LifeRecoveryBuff'), 180, true);
  }
}