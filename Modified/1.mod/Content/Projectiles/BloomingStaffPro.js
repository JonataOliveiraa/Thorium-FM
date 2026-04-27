import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModBuff } from "./../../TL/ModBuff.js";
import { Color } from '../../TL/Modules/Color.js';
import { Vector2 } from '../../TL/Modules/Vector2.js';

const { Main } = Terraria;

export class BloomingStaffPro extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 20;
    this.Projectile.height = 20;
    this.Projectile.aiStyle = -1;
    this.Projectile.friendly = true;
    this.Projectile.magic = true;
    this.Projectile.penetrate = 1;
    this.Projectile.timeLeft = 90;
  }

  AI(proj) {
      proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + 1.57;

      if (Math.random() > 0.4) {
          let dustType = Math.random() > 0.5 ? 166 : 167; 
          
          let d = Main.dust[Terraria.Dust.NewDust(proj.position, proj.width, proj.height, dustType, 0, 0, 100, Color.White, 1.2)];
          d.noGravity = true;
          
          d.velocity = Vector2.Multiply(proj.velocity, 0.3);
      }
  }

  OnHitNPC(proj, npc) {
      Main.LocalPlayer.AddBuff(ModBuff.getTypeByName('LifeRecoveryBuff'), 180, true);
  }
}