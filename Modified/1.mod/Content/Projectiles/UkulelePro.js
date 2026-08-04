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

export class UkulelePro extends ModProjectile {
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
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = 0;
        this.Projectile.friendly = true;
        this.Projectile.alpha = 50;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 120;
        this.Projectile.extraUpdates = 1;
        this.Projectile.ignoreWater = true;

        // A colisao e feita na mao no PreAI, senao a vanilla mata a nota
        this.Projectile.tileCollide = false;
    }

    GetAlpha(proj, color) {
        return Color.Multiply(Color.White, proj.Opacity);
    }

    // A nota bate um pouco alem do proprio corpo
    ModifyDamageHitbox(proj, hitbox) {
        hitbox.X -= 3;
        hitbox.Y -= 3;
        hitbox.Width += 6;
        hitbox.Height += 6;
    }

    /**
     * ai[0] conta os quiques. Pergunta pro jogo quanto do movimento e permitido
     * e, quando um eixo e barrado, inverte so aquele eixo. E o que faz ela
     * ricochetear de verdade em vez de morrer ou grudar na parede.
     */
    PreAI(proj) {
        const ai = new ProjAI(proj, false);
        const vel = proj.velocity;

        proj.rotation = Math.atan2(vel.Y, vel.X) + Math.PI / 2;
        Effects.AddLight(proj.Center, 0.05, 0.25, 0.45);

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
            FxHelper.burst(proj.position, proj.width, proj.height, 4, 56, 2, 0.75, 255);

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

    /**
     * Mesmo desenho do SinisterHonkPro: a origem serve de pivo E de
     * deslocamento do ponto de desenho, e todas as copias usam a rotacao
     * ATUAL. Usar oldRot por copia deixava o rastro torto em varios angulos.
     */
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
        FxHelper.burst(proj.position, proj.width, proj.height, 6, 56, 3, 0.75, 255);
    }
}
