import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
const { Color } = Modules;
export class MagicalBurstReflectedPro extends ModProjectile {
  constructor(){super();this.Texture='Projectiles/ChampionShock';}
  SetDefaults(){const p=this.Projectile;p.width=24;p.height=24;p.aiStyle=-1;p.friendly=true;p.hostile=false;p.penetrate=1;p.timeLeft=180;p.tileCollide=false;}
  AI(p){p.rotation=Math.atan2(p.velocity.Y,p.velocity.X)+Math.PI/2;for(let i=0;i<2;i++){const d=Terraria.Dust.NewDust(p.position,p.width,p.height,113,0,0,0,Color.White,1.2);if(Terraria.Main.dust[d])Terraria.Main.dust[d].noGravity=true;}}
}
