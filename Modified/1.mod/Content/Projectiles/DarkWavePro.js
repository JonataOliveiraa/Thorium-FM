import { Terraria, Modules, Microsoft } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

const TRAIL = 10;
const LIFE = 120;
const BURST_AT = 118;
const BURST_COUNT = 10;
const DUST_TYPE = 227;
const FADE_TIME = 20;
const FADE_SPEED = 10;
const CURSE_TIME = 300;

export class DarkWavePro extends ModProjectile {
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
        this.Projectile.width = 22;
        this.Projectile.height = 22;
        this.Projectile.aiStyle = -1;
        this.Projectile.magic = true;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 3;
        this.Projectile.timeLeft = LIFE;
    }

    AI(proj) {
        const vel = proj.velocity;

        proj.rotation = Math.atan2(vel.Y, vel.X) + Math.PI / 2;

        if (proj.timeLeft === BURST_AT) {
            const center = proj.Center;
            FxHelper.ring(center.X, center.Y, BURST_COUNT, 2, 6, DUST_TYPE, 1, 1.35, proj.rotation, 125);
        }

        if (proj.timeLeft < FADE_TIME) {
            proj.alpha = Math.min(255, proj.alpha + FADE_SPEED);
        }
    }

    OnHitNPC(proj, npc) {
        npc.AddBuff(Terraria.ID.BuffID.ShadowFlame, CURSE_TIME, false);
    }

    GetAlpha(proj, color) {
        const opacity = 1 - proj.alpha / 255;
        return Color.new(255, 255, 255, Math.round(225 * opacity));
    }

    PostDraw(proj, lightColor) {
        if (!this._tex) {
            this._tex = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
            if (!this._tex) return;
        }

        const opacity = 1 - proj.alpha / 255;
        const origin = Vector2.new(this._tex.Width * 0.5, proj.height * 0.5);
        const tint = Color.new(255, 255, 255, 0);
        const oldPos = proj.oldPos;
        const count = Math.min(TRAIL, oldPos.Length);

        for (let i = 0; i < count; i++) {
            const scale = 0.1 * (TRAIL - i);
            const pos = oldPos.get_Item(i);

            Main.spriteBatch[DRAW](
                this._tex,
                Vector2.new(
                    pos.X - Main.screenPosition.X + origin.X,
                    pos.Y - Main.screenPosition.Y + origin.Y + proj.gfxOffY
                ),
                null,
                Color.Multiply(tint, 0.15 * opacity),
                proj.rotation, origin, scale,
                SpriteEffects.None, 0
            );
        }
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 10, DUST_TYPE, 2, 1.25, 100);
    }
}
