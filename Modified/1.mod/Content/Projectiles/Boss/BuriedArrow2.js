import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
const { Color } = Modules;
export class BuriedArrow2 extends ModProjectile {
  constructor(){super();this.Texture='Projectiles/IcyArrowPro';}
  SetDefaults(){const p=this.Projectile;p.width=14;p.height=14;p.aiStyle=1;p.hostile=true;p.penetrate=1;p.timeLeft=300;p.extraUpdates=1;p.tileCollide=false;}
  GetAlpha(){return Color.new(255,255,255,150);}
  AI(p){p.rotation=Math.atan2(p.velocity.Y,p.velocity.X)+Math.PI/2;}
}
