import { Terraria } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModBuff } from '../../TL/ModBuff.js';

let _stunType = -1;

export class GorgonsEyePro extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.ID.ProjectileID.Sets.YoyosLifeTimeMultiplier[this.Projectile.type] = 7.0;
    Terraria.ID.ProjectileID.Sets.YoyosMaximumRange[this.Projectile.type] = 240;
    Terraria.ID.ProjectileID.Sets.YoyosTopSpeed[this.Projectile.type] = 15.0;
  }

  SetDefaults() {
    this.Projectile.width = 18;
    this.Projectile.height = 18;
    this.Projectile.aiStyle = 99; // Yoyo AI style
    this.Projectile.friendly = true;
    this.Projectile.melee = true;
    this.Projectile.penetrate = -1;
    this.Projectile.scale = 1.05;
  }

  OnHitNPC(proj, npc) {
    if (npc && npc.active) {
      if (_stunType === -1) _stunType = ModBuff.getTypeByName('StunnedBuff') ?? Terraria.ID.BuffID.Confused;
      npc.AddBuff(_stunType, 60, false);
    }
  }
}
