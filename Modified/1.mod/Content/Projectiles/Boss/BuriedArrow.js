import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
const { Color } = Modules;
export class BuriedArrow extends ModProjectile {
  constructor(){super();this.Texture='Projectiles/IcyArrowPro';}
  SetDefaults(){const p=this.Projectile;p.width=14;p.height=14;p.aiStyle=1;p.hostile=true;p.penetrate=1;p.timeLeft=300;p.tileCollide=false;}
  GetAlpha(){return Color.new(255,255,255,150);}
  AI(p){p.rotation=Math.atan2(p.velocity.Y,p.velocity.X)+Math.PI/2;}
  OnKill(p){for(let i=0;i<10;i++){const d=Terraria.Dust.NewDust(p.position,p.width,p.height,1,p.velocity.X*.2,p.velocity.Y*.2,100,Color.White,1);if(Terraria.Main.dust[d])Terraria.Main.dust[d].noGravity=true;}}
}
