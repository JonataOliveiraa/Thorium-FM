import { Terraria, Microsoft, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ProjAI } from './../../../TL/ProjAI.js';

const { Color, Vector2, Rand, Effects } = Modules;

export class TheGrandThunderBirdEnd extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/Boss/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.Main.projFrames[this.Type] = 9;
    Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 24;
    Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
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

  PreDraw(proj, lightColor) {
    const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;

    const SpriteEffects = Microsoft.Xna.Framework.Graphics.SpriteEffects;
    const effects = proj.spriteDirection === 1
      ? SpriteEffects.None
      : SpriteEffects.FlipHorizontally;

    const frameHeight = texture.Height / Terraria.Main.projFrames[this.Type];

    const source = Modules.Rectangle.new(
      0,
      frameHeight * proj.frame,
      texture.Width,
      frameHeight
    );

    const origin = Vector2.new(texture.Width / 2, frameHeight / 2);

    for (let i = proj.oldPos.Length - 1; i >= 0; i -= 2) {
      const pos = proj.oldPos.get_Item(i);

      let drawPos = Vector2.Subtract(pos, Terraria.Main.screenPosition);
      drawPos = Vector2.Add(drawPos, origin);

      const alpha = (proj.oldPos.Length - i) / proj.oldPos.Length;
      const color = Color.op_Multiply(Color.Cyan, alpha * 0.15);

      Terraria.Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'](
        texture, drawPos, source, color, proj.rotation, origin, proj.scale, effects, 0
      );
    }

    return true;
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