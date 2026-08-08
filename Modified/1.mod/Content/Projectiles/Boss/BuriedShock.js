import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
const { Color, Vector2 } = Modules;
export class BuriedShock extends ModProjectile {
  constructor() { super(); this.Texture = 'Projectiles/ChampionShock'; }
  SetDefaults() { const p=this.Projectile; p.width=42; p.height=42; p.aiStyle=1; p.hostile=true; p.penetrate=-1; p.timeLeft=120; p.tileCollide=false; }
  GetAlpha() { return Color.new(255,255,255,38); }
  AI(p) { const d=Terraria.Dust.NewDust(p.position,p.width,p.height,113,0,0,0,Color.White,1.25); if(Terraria.Main.dust[d]) Terraria.Main.dust[d].noGravity=true; }
  OnKill(p) { for(let i=0;i<10;i++) Terraria.Dust.NewDust(p.position,p.width,p.height,113,p.oldVelocity.X*.5,p.oldVelocity.Y*.75,0,Color.White,1); }
}
