import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
const { Color } = Modules;
export class BuriedDagger extends ModProjectile {
  constructor(){super();this.Texture='Projectiles/ChampionShock';}
  SetDefaults(){const p=this.Projectile;p.width=18;p.height=32;p.hostile=true;p.aiStyle=1;p.penetrate=1;p.timeLeft=180;p.tileCollide=true;}
  AI(p){p.rotation=Math.atan2(p.velocity.Y,p.velocity.X)+Math.PI/2;const d=Terraria.Dust.NewDust(p.position,p.width,p.height,57,0,0,0,Color.White,.8);if(Terraria.Main.dust[d])Terraria.Main.dust[d].noGravity=true;}
}
