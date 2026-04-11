import { Terraria, Modules } from "./../../TL/ModImports.js";
import { ModProjectile } from "./../../TL/ModProjectile.js";
import { ProjAI } from "./../../TL/ProjAI.js"
const { Vector2, Color, Effects } = Modules;

const draw = Terraria.Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'];

export class IcyArmorEffect1 extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 110;
    this.Projectile.height = 110;

    this.Projectile.tileCollide = false;
    this.Projectile.ignoreWater = true;
    this.Projectile.penetrate = -1;
    this.Projectile.timeLeft = 7200;
    this.Projectile.light = 0.5
  }

  GetAlpha(proj, color) {
    color = new Color(0, 255, 255, 255);
    return color.Value;
  }

  AI(proj) {
    const player = Terraria.Main.player[proj.owner];

    if (!player || player.dead) {
      proj.Kill();
      return;
    }

    proj.Center = player.Center;
    proj.gfxOffY = player.gfxOffY;
    proj.timeLeft = 2;
    proj.rotation += 0.025;

    this.ScanNPCs(proj);
  }

  ScanNPCs(proj) {
    const radius = proj.width / 2;
    const radiusSq = radius * radius;
    const ai = new ProjAI(proj);

    for (let i = 0; i < Terraria.Main.maxNPCs; i++) {
      const npc = Terraria.Main.npc[i];
      if (!npc || !npc.active || npc.friendly) continue;

      let distSq = Vector2.DistanceSquared(npc.Center, proj.Center);
      if (distSq < radiusSq) {
        ai[0]++;
        if (ai[0] > 10) {
          npc.AddBuff(44, 60, false);
          ai[0] = 0;
        }
      }
    }
  }
}