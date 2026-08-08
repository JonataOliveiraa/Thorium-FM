import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
const { Color } = Modules;
export class BuriedMagicPop extends ModProjectile {
  constructor(){super();this.Texture='Projectiles/BuriedMagicPopPro';}
  SetDefaults(){const p=this.Projectile;p.width=12;p.height=12;p.aiStyle=1;p.hostile=true;p.penetrate=1;p.timeLeft=100;p.tileCollide=true;}
  AI(p){const d=Terraria.Dust.NewDust(p.position,p.width,p.height,113,0,0,0,Color.White,.8);if(Terraria.Main.dust[d])Terraria.Main.dust[d].noGravity=true;}
}
