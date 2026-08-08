import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
const { Color } = Modules;
export class BuriedArrowP extends ModProjectile {
  constructor(){super();this.Texture='Projectiles/IcyArrowPro';}
  SetDefaults(){const p=this.Projectile;p.width=14;p.height=14;p.aiStyle=1;p.hostile=true;p.penetrate=1;p.timeLeft=300;p.tileCollide=false;}
  GetAlpha(){return Color.new(180,255,180,150);}
  AI(p){p.rotation=Math.atan2(p.velocity.Y,p.velocity.X)+Math.PI/2;}
  OnHitPlayer(p, player){if(player&&player.active){player.AddBuff(Terraria.ID.BuffID.Poisoned,300,false);player.AddBuff(Terraria.ID.BuffID.Weak,300,false);}}
}
