import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Rand } = Modules;

export class ChampionsTrifectaShotPro4 extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.Main.projFrames[this.Projectile.type] = 5;
  }

  SetDefaults() {
    this.Projectile.width = 52;
    this.Projectile.height = 52;
    this.Projectile.aiStyle = -1;
    this.Projectile.friendly = true;
    this.Projectile.ranged = true;
    this.Projectile.penetrate = -1;
    this.Projectile.timeLeft = 30;
    this.Projectile.tileCollide = false;
  }

  OnHitNPC(proj, npc) {
    if (npc && npc.active) {
      npc.AddBuff(Terraria.ID.BuffID.OnFire, 60, false);
    }
  }

  AI(proj) {
    proj.scale += 0.025;
    proj.alpha += 5;
    const ai = new ProjAI(proj, false);
    proj.rotation += ai[0] > 0 ? 0.1 : -0.1;
  }

  OnKill(proj, timeLeft) {
    for (let i = 0; i < 20; i++) {
      const dustIdx = Terraria.Dust.NewDust(
        proj.position, proj.width, proj.height, 127,
        Rand.Next(-6, 6), Rand.Next(-6, 6), 0, Color.White, 2
      );
      const dust = Terraria.Main.dust[dustIdx];
      if (dust) dust.noGravity = true;
    }
  }
}
