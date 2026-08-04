import { Terraria, Modules, Microsoft } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

const TRAIL = 5;

export class BentZombieArmPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._tex = null;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = TRAIL;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
    }

    SetDefaults() {
        this.Projectile.width = 34;
        this.Projectile.height = 34;
        this.Projectile.aiStyle = 3; // bumerangue: vai e volta
        this.Projectile.melee = true;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 300;

        this.AIType = 52;
    }

    AI(proj) {
        if (Math.random() * 3 >= 1) return;

        const vel = proj.velocity;
        const dust = Main.dust[Effects.NewDust(
            proj.position, proj.width, proj.height,
            5, vel.X * 0.25, vel.Y * 0.25, 125, Color.White, 2
        )];
        if (dust) dust.noGravity = true;
    }

    // Rastro que vai desbotando atras do braco
    PreDraw(proj, lightColor) {
        if (!this._tex) {
            this._tex = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
            if (!this._tex) return true;
        }

        const origin = Vector2.new(this._tex.Width * 0.5, proj.height * 0.5);
        const base = proj.GetAlpha(lightColor);
        const oldPos = proj.oldPos;
        const count = Math.min(TRAIL, oldPos.Length);

        for (let i = 0; i < count; i++) {
            const pos = oldPos.get_Item(i);
            const fade = (count - i) / count;

            Main.spriteBatch[DRAW](
                this._tex,
                Vector2.new(
                    pos.X - Main.screenPosition.X + origin.X,
                    pos.Y - Main.screenPosition.Y + origin.Y + proj.gfxOffY
                ),
                null,
                Color.Multiply(base, fade * 0.5),
                proj.rotation, origin, proj.scale,
                SpriteEffects.None, 0
            );
        }

        return true;
    }
}
