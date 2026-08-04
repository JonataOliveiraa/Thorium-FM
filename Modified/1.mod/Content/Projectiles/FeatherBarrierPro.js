import { Terraria, Modules, Microsoft } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

const LIFE = 180;
const DRAG = 0.965;
const FADE_TIME = 30;   // ticks finais em que ela some
const TRAIL = 5;        // rastros desenhados atras da pena

export class FeatherBarrierPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = TRAIL;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
    }

    SetDefaults() {
        this.Projectile.width = 24;
        this.Projectile.height = 24;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 2;
        this.Projectile.timeLeft = LIFE;
        this.Projectile.extraUpdates = 1;
        this.Projectile.tileCollide = true;
        this.Projectile.ignoreWater = true;
    }

    AI(proj) {
        const vel = Vector2.Multiply(proj.velocity, DRAG);
        proj.velocity = vel;
        proj.rotation = Math.atan2(vel.Y, vel.X) + Math.PI / 2;

        if (proj.timeLeft < FADE_TIME) {
            proj.alpha = Math.floor((1 - proj.timeLeft / FADE_TIME) * 255);
        }
    }

    // Rastro leve atras da pena
    PreDraw(proj, lightColor) {
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        if (!texture || !proj.oldPos) return true;

        const origin = Vector2.new(texture.Width * 0.5, proj.height * 0.5);
        const Draw = Main.spriteBatch[DRAW];
        const total = proj.oldPos.Length;

        for (let i = 0; i < total; i++) {
            const old = proj.oldPos.get_Item(i);
            if (old.X === 0 && old.Y === 0) continue;

            const fade = (total - i) / total * 0.25;
            Draw(
                texture,
                Vector2.new(
                    old.X - Main.screenPosition.X + origin.X,
                    old.Y - Main.screenPosition.Y + origin.Y + proj.gfxOffY
                ),
                null, Color.Multiply(proj.GetAlpha(lightColor), fade),
                proj.rotation, origin, proj.scale, SpriteEffects.None, 0
            );
        }

        return true;
    }

    OnTileCollide(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 6, 13, 3, 1);
        return true;
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 5, 13, 3, 1);
    }
}
