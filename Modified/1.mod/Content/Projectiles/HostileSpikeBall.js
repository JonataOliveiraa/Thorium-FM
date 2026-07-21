import { Terraria, Modules, Microsoft } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color, Vector2, Rectangle } = Modules;
const { Main } = Terraria;

export class HostileSpikeBall extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._effectTex = null;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = 14;
        this.Projectile.hostile = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 120;
        this.AIType = 24;
        this.fadeOutTime = 30;
    }

    OnTileCollide(proj, oldVelocity) {
        return false;
    }

    PreDraw(proj, lightColor) {
        if (!this._effectTex) {
            this._effectTex = tl.texture.load('Textures/Projectiles/HostileSpikeBall_Effect.png');
        }
        if (!this._effectTex) return true;

        const drawPos = Vector2.Subtract(proj.Center, Main.screenPosition);
        const origin = Vector2.new(7, 7);
        const opacity = proj.Opacity * 0.75;
        const color = Color.new(255, 255, 255, Math.floor(100 * opacity));

        Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, Vector2 scale, SpriteEffects effects, float worthless)'](
            this._effectTex,
            drawPos,
            null,
            color,
            proj.rotation,
            origin,
            Vector2.new(1.25, 1.25),
            Microsoft.Xna.Framework.Graphics.SpriteEffects.None,
            0
        );

        return true;
    }
}