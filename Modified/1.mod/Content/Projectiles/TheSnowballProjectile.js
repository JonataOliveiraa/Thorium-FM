import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { Rand } from './../../TL/Modules/Rand.js'

const { Color, Effects, MathHelper, Vector2 } = Modules;

export class TheSnowballProjectile extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
    this.Blur = 'Projectiles/' + this.constructor.name + '_Blur';

  }

  SetDefaults() {
    this.Projectile.width = this.Projectile.height = 26;
    this.Projectile.friendly = true;
    this.Projectile.penetrate = -1;
    this.Projectile.melee = true;
    this.Projectile.scale = 1;
    this.Projectile.drawLayer = 7;
    this.Projectile.usesLocalNPCImmunity = true;
    this.Projectile.localNPCHitCooldown = 10;

    this.Projectile.aiStyle = Terraria.ID.ProjAIStyleID.Flail;
    this.AIType = Terraria.ID.ProjectileID.BlueMoon;
  }

  OnHitNPC(proj, npc) {
    if (Rand.NextBool(3)) {
      npc.AddBuff(44, 60, false);
    }
  }

  GetAlpha(proj, lightColor) {
    return Color.White;
  }

  PreDraw(proj, lightColor) {
    if (proj.ai.val0 === 1) {
      let projectileTexture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
      const drawPosition = Vector2.Subtract(Vector2.Add(Vector2.Add(proj.position, Vector2.Divide(Vector2.new(proj.width, proj.height), 2)), Vector2.Multiply(Vector2.UnitY, proj.gfxOffY)), Terraria.Main.screenPosition);
      const drawOrigin = Vector2.Divide(Vector2.new(projectileTexture.Width, projectileTexture.Height), 2);
      let drawColor = Color.White;
      drawColor.A = 127;
      drawColor = Color.Multiply(drawColor, 0.5);

      let launchTimer = proj.ai.val1;
      if (launchTimer > 5) {
        launchTimer = 5;
      }

      let spriteEffects = proj.spriteDirection == 1 ? Effects.SpriteEffects.None : Effects.SpriteEffects.FlipHorizontally;
      for (let transparency = 1; transparency >= 0; transparency -= 0.125) {
        let opacity = 1 - transparency;
        let drawAdjustment = Vector2.Multiply(proj.velocity, -launchTimer * transparency);
        Terraria.Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'
        ](projectileTexture, Vector2.Add(drawPosition, drawAdjustment), null, Color.Multiply(drawColor, opacity), proj.rotation, drawOrigin, proj.scale * 1.15 * MathHelper.Lerp(0.5, 1, opacity), spriteEffects, 0);
      }
    }
    return true;
  }
}