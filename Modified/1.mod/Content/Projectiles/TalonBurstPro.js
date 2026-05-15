import { Terraria, Microsoft, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModBuff } from "./../../TL/ModBuff.js";
const { Vector2, Color, Rectangle } = Modules

export class TalonBurstPro extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 8;
    this.Projectile.height = 16;
    this.Projectile.scale = 1;
    this.Projectile.aiStyle = 0;
    this.Projectile.friendly = true;
    this.Projectile.hostile = false;
    this.Projectile.ranged = true;
    this.Projectile.penetrate = 1;
    this.Projectile.timeLeft = 600;
    this.Projectile.ignoreWater = true;
    this.Projectile.tileCollide = true;
    this.Projectile.usesLocalNPCImmunity = true;
  }

  SetStaticDefaults() {
    Terraria.Main.projFrames[this.Type] = 1;
    this.trailScaleDecay = 0.015;
    this.trailAlpha = 0.75;
    Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 4;
    Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 2;
  }

  AI(proj) {
    proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI / 2;
  }

  PreDraw(proj) {
    const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
    const origin = Vector2.new(texture.Width / 2, texture.Height / 2);
    const effects = Microsoft.Xna.Framework.Graphics.SpriteEffects.None;
    const screenPos = Terraria.Main.screenPosition;

    for (let k = proj.oldPos.Length - 1; k > 0; k--) {
      const pos = proj.oldPos.get_Item(k);
      const drawPos = Vector2.Subtract(Vector2.Add(Vector2.Add(pos, Vector2.Divide(Vector2.new(proj.width, proj.height), 2)), Vector2.Multiply(Vector2.UnitY, proj.gfxOffY)), screenPos);

      const alpha = this.trailAlpha * (1 - k / proj.oldPos.Length);
      const color = Color.Lerp(Color.Transparent, Color.White, alpha);
      const scale = Math.max(proj.scale - k * this.trailScaleDecay);

      Terraria.Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'](
        texture, drawPos, null, color, proj.rotation, origin, scale, effects, 0
      );
    }
    return true;
  }

  OnHitNPC(proj, npc) {
    const hitDirection = proj.velocity.X > 0 ? 1 : -1;
    npc['double StrikeNPCNoInteraction(int Damage, float knockBack, int hitDirection, bool crit, bool noEffect, bool fromNet)'](
      proj.damage, proj.knockBack, hitDirection, false, false, false
    );
  }
}