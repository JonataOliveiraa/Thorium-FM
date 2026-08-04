import { Terraria, Modules, Microsoft } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';
const TileCollision = Terraria.Collision['Vector2 TileCollision(Vector2 oldPosition, Vector2 oldVelocity, int Width, int Height, bool fallThrough, bool fall2, int gravDir, bool ignoreDoors, bool ignoreAetheriumPlatforms, bool hoik)'];

const TRAIL = 10;

export class YewWoodLutePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        // O kill sai NO quique, quando ai[0] chega no limite: 2 = quica uma
        // vez e morre no toque seguinte
        this.collideMax = 2;
        this.bounceSpeedReduction = 0.9;
        this.fadeOutTime = 30;
        this._tex = null;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = TRAIL;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 2;
    }

    SetDefaults() {
        this.Projectile.width = 22;
        this.Projectile.height = 22;
        this.Projectile.aiStyle = 0;
        this.Projectile.friendly = true;
        this.Projectile.alpha = 40;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 180;
        this.Projectile.extraUpdates = 2;
        this.Projectile.ignoreWater = true;

        // A colisao e feita na mao no PreAI, senao a vanilla mata a nota
        this.Projectile.tileCollide = false;
    }

    GetAlpha(proj, color) {
        return Color.Multiply(Color.White, proj.Opacity);
    }

    ModifyDamageHitbox(proj, hitbox) {
        hitbox.X -= 10;
        hitbox.Y -= 10;
        hitbox.Width += 20;
        hitbox.Height += 20;
    }

    // ai[0] conta os quiques. Ver UkulelePro: mesma colisao manual por eixo.
    PreAI(proj) {
        const ai = new ProjAI(proj, false);
        const vel = proj.velocity;

        proj.rotation = Math.atan2(vel.Y, vel.X) + Math.PI / 2;
        Effects.AddLight(proj.Center, 0.05, 0.4, 0.3);

        const oldVX = vel.X;
        const oldVY = vel.Y;
        const allowed = TileCollision(proj.position, vel, proj.width, proj.height, true, true, 1, false, false, true);

        const hitX = oldVX !== 0 && allowed.X !== oldVX;
        const hitY = oldVY !== 0 && allowed.Y !== oldVY;

        if (hitX || hitY) {
            proj.velocity = Vector2.new(
                hitX ? -oldVX * this.bounceSpeedReduction : allowed.X,
                hitY ? -oldVY * this.bounceSpeedReduction : allowed.Y
            );

            ai[0] = (ai[0] || 0) + 1;
            Effects.PlaySound(Terraria.ID.SoundID.Item10, proj.position.X, proj.position.Y);
            FxHelper.burst(proj.position, proj.width, proj.height, 4, 107, 2, 1, 0);

            if (ai[0] >= this.collideMax) {
                proj.Kill();
                return false;
            }
        } else {
            proj.velocity = Vector2.new(allowed.X, allowed.Y);
        }

        if (proj.timeLeft < this.fadeOutTime) {
            proj.Opacity = proj.timeLeft / this.fadeOutTime;
        }

        return false;
    }

    // Mesmo desenho do SinisterHonkPro. Ver UkulelePro pro porque.
    PreDraw(proj, lightColor) {
        if (!this._tex) {
            this._tex = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
            if (!this._tex) return true;
        }

        const origin = Vector2.new(this._tex.Width * 0.5, proj.height * 0.5);
        const screen = Main.screenPosition;
        const oldPos = proj.oldPos;
        const count = Math.min(TRAIL, oldPos.Length);

        for (let k = count - 1; k >= 0; k--) {
            const pos = oldPos.get_Item(k);
            if (pos.X === 0 && pos.Y === 0) continue;

            const fade = 1 - k / count;

            Main.spriteBatch[DRAW](
                this._tex,
                Vector2.new(
                    pos.X - screen.X + origin.X,
                    pos.Y - screen.Y + origin.Y + proj.gfxOffY
                ),
                null,
                Color.Multiply(Color.White, fade * 0.5 * proj.Opacity),
                proj.rotation, origin, proj.scale,
                SpriteEffects.None, 0
            );
        }

        return true;
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 5, 107, 4, 1, 0);
    }
}
