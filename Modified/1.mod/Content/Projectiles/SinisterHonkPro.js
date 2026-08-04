import { Terraria, Modules, Microsoft } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

export class SinisterHonkPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._tex = null;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 8;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 2;
    }

    SetDefaults() {
        this.Projectile.width = 18;
        this.Projectile.height = 18;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 3;
        this.Projectile.timeLeft = 90;
    }

    GetAlpha(proj, color) {
        return Color.Multiply(Color.White, 1 - proj.alpha / 255);
    }

    AI(proj) {
        const vel = proj.velocity;

        proj.velocity = Vector2.Multiply(vel, 0.975);
        proj.rotation = Math.atan2(vel.Y, vel.X) + Math.PI / 2;
        proj.spriteDirection = proj.direction;

        const center = proj.Center;
        const dust = Main.dust[Effects.NewDust(center, 0, 0, 88, 0, 0, 127, Color.new(255, 255, 255, 0), 1.25)];
        if (dust) {
            dust.fadeIn = 1.5;
            dust.velocity = Vector2.Multiply(dust.velocity, 0.3);
            dust.noGravity = true;
        }

        Effects.AddLight(center, 0.1, 0.1, 0.3);

        if (proj.timeLeft < 20) proj.alpha = Math.min(255, proj.alpha + 15);
    }

    PreDraw(proj, lightColor) {
        if (!this._tex) {
            this._tex = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
            if (!this._tex) return true;
        }

        const origin = Vector2.new(this._tex.Width * 0.5, proj.height * 0.5);
        const tint = Color.Multiply(proj.GetAlpha(lightColor), 0.25);
        const oldPos = proj.oldPos;
        const count = Math.min(8, oldPos.Length);

        for (let i = count - 1; i > 0; i--) {
            if (i % 2 !== 0) continue;
            const pos = oldPos.get_Item(i);

            Main.spriteBatch[DRAW](
                this._tex,
                Vector2.new(
                    pos.X - Main.screenPosition.X + origin.X,
                    pos.Y - Main.screenPosition.Y + origin.Y + proj.gfxOffY
                ),
                null, tint, proj.rotation, origin, proj.scale,
                SpriteEffects.None, 0
            );
        }

        return true;
    }

    OnKill(proj) {
        const center = proj.Center;
        const vel = proj.velocity;
        const count = Rand.Next(15, 25);

        for (let i = 0; i < count; i++) {
            const dust = Main.dust[Effects.NewDust(center, 0, 0, 88, vel.X * 0.25, vel.Y * 0.25, 100, Color.White, 1.25)];
            if (!dust) continue;

            dust.fadeIn = 1.3 + Math.random() * 0.2;
            dust.noGravity = true;

            const dv = dust.velocity;
            dust.position = Vector2.new(dust.position.X + dv.X * 4, dust.position.Y + dv.Y * 4);
        }
    }
}
