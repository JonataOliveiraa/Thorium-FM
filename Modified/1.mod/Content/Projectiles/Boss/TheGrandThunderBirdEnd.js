import { Terraria, Microsoft, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ProjAI } from './../../../TL/ProjAI.js';

export class TheGrandThunderBirdEnd extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/Boss/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.Main.projFrames[this.Type] = 9;
  }

  SetDefaults() {
    this.Projectile.width = 150;
    this.Projectile.height = 110;
    this.Projectile.scale = 1;
    this.Projectile.aiStyle = -1;
    this.Projectile.tileCollide = false;
    this.Projectile.penetrate = -1;
    this.Projectile.timeLeft = 300;
  }

  AI(proj) {
    let vel = proj.velocity;
    const player = Terraria.Main.player[Terraria.Main.myPlayer];
    proj.spriteDirection = (player.Center.X > proj.Center.X) ? -1 : 1;
    proj.direction = proj.spriteDirection;

    if (proj.timeLeft === 120) vel.Y = 2;

    if (proj.timeLeft > 80) {
      proj.frameCounter++;
      if (proj.frameCounter > 6) {
        proj.frame++;
        proj.frameCounter = 0;
      }
      if (proj.frame >= 4) proj.frame = 0;
    } else {
      vel.Y = -8;
      proj.frame = 5;
    }

    proj.velocity = vel;
  }
}