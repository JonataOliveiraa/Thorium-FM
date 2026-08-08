import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModItem } from '../../TL/ModItem.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Vector2, Color } = Modules;

let _staffType = -1;

export class GorgonGazeStaffPro2 extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.Main.projFrames[this.Projectile.type] = 5;
  }

  SetDefaults() {
    this.Projectile.width = 38;
    this.Projectile.height = 28;
    this.Projectile.aiStyle = -1;
    this.Projectile.penetrate = -1;
    this.Projectile.timeLeft = 30;
    this.Projectile.tileCollide = false;
    this.Projectile.ignoreWater = true;
  }

  GetAlpha(proj, lightColor) {
    return Color.new(255, 255, 255, 100);
  }

  AI(proj) {
    const player = Terraria.Main.player[proj.owner];
    if (!player || !player.active || player.dead) return proj.Kill();

    if (_staffType === -1) {
      _staffType = ModItem.getTypeByName('GorgonGazeStaff') ?? -2;
    }

    if (player.HeldItem && player.HeldItem.type === _staffType) {
      proj.timeLeft = 10;
    }

    const ai = new ProjAI(proj, false);

    if (proj.owner === Terraria.Main.myPlayer) {
      const mouseWorld = Terraria.Main.MouseWorld;
      proj.velocity = Vector2.Zero;
      proj.position = Vector2.new(mouseWorld.X - proj.width * 0.5, mouseWorld.Y - proj.height * 0.5);
    }

    if (player.itemAnimation > 0 && player.HeldItem && player.HeldItem.type === _staffType) {
      ai[0] = 30;
    }

    if (ai[0] > 0) {
      proj.frameCounter++;
      if (proj.frameCounter > 4) {
        proj.frame++;
        proj.frameCounter = 0;
      }
      if (proj.frame >= 5) proj.frame = 1;
      ai[0]--;
    } else {
      proj.frame = 0;
    }
  }
}
