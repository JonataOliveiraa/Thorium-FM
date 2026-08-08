import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
const { Color } = Modules;
export class BuriedArrowFBoom extends ModProjectile {
  constructor(){super();this.Texture='Projectiles/ChampionShock';}
  SetDefaults(){const p=this.Projectile;p.width=64;p.height=64;p.aiStyle=-1;p.hostile=true;p.penetrate=-1;p.timeLeft=4;p.tileCollide=false;p.alpha=255;}
  AI(p){for(let i=0;i<3;i++)Terraria.Dust.NewDust(p.position,p.width,p.height,6,Math.random()*6-3,Math.random()*6-3,0,Color.White,1.4);}
}
