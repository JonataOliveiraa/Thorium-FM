import { Terraria, Microsoft, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { Rectangle } from '../../TL/Modules/Rectangle.js';
import { SoundHelper } from '../Global/Utils/SoundHelper.js';

const { Color, Vector2, Rand } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;

const EntitySpriteDraw = Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'];
const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const LIFETIME = 300;
const FADE_AT = 3;
const BURST_SIZE = 80;
const GRAVITY_STEP = 1.025;
const GRAVITY_DELAY = -15;
const DRAG = 1.0065;
const FRAMES = 4;
const DUST_LEAF = 39;

const BUFF_POISONED = 20;
const BUFF_OOZED = 197;

const SFX_POP = ['NPCHit1'];

export class CorpseBloomPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._origin = null;
        this._frames = null;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 4;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
    }

    SetDefaults() {
        this.Projectile.width = 20;
        this.Projectile.height = 20;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = 2;
        this.Projectile.timeLeft = LIFETIME;
        this.Projectile.hostile = true;
        this.Projectile.tileCollide = false;
    }

    GetAlpha(proj, lightColor) {
        return Color.Multiply(Color.White, proj.timeLeft <= FADE_AT ? 0 : 0.75);
    }

    AI(proj) {
        if (proj.timeLeft <= FADE_AT) {
            if (proj.width !== BURST_SIZE) this._expand(proj);
            return;
        }

        if (proj.timeLeft === LIFETIME) this._spawnBurst(proj);

        const ai = new ProjAI(proj, false);
        const vel = proj.velocity;
        vel.Y /= DRAG;

        if (++ai[1] >= 0) {
            vel.Y += GRAVITY_STEP;
            ai[1] = GRAVITY_DELAY;
        }
        proj.velocity = vel;

        if (++proj.frameCounter > 5) {
            proj.frameCounter = 0;
            if (++proj.frame >= FRAMES) proj.frame = 0;
        }
    }

    _expand(proj) {
        const cx = proj.position.X + proj.width / 2;
        const cy = proj.position.Y + proj.height / 2;
        proj.velocity = Vector2.Zero;
        proj.tileCollide = false;
        proj.alpha = 255;
        proj.width = BURST_SIZE;
        proj.height = BURST_SIZE;
        proj.position = Vector2.new(cx - BURST_SIZE / 2, cy - BURST_SIZE / 2);
    }

    _spawnBurst(proj) {
        const center = proj.Center;
        const rot = Vector2.ToRotation(proj.velocity);
        const cos = Math.cos(rot);
        const sin = Math.sin(rot);
        const count = 20;

        for (let i = 0; i < count; i++) {
            const angle = i * (Math.PI * 2 / count);
            const ox = -Math.sin(angle) * 2;
            const oy = Math.cos(angle) * 8;
            const rx = ox * cos - oy * sin;
            const ry = ox * sin + oy * cos;
            const len = Math.sqrt(rx * rx + ry * ry) || 1;

            const dust = NewDustDirect(center, 0, 0, DUST_LEAF, 0, 0, 175, Color.White, 1.25);
            if (!dust) continue;
            dust.noGravity = true;
            dust.position = Vector2.new(center.X + rx, center.Y + ry);
            dust.velocity = Vector2.new(rx / len, ry / len);
        }
    }

    PreDraw(proj, lightColor) {
        if (proj.timeLeft <= FADE_AT) return true;

        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        if (!texture) return false;

        if (!this._frames) {
            const frameHeight = texture.Height / FRAMES;
            this._origin = Vector2.new(texture.Width * 0.5, frameHeight * 0.5);
            this._frames = [];
            for (let i = 0; i < FRAMES; i++) {
                this._frames.push(Rectangle.new(0, i * frameHeight, texture.Width, frameHeight));
            }
        }

        const source = this._frames[proj.frame] ?? this._frames[0];
        const effects = proj.spriteDirection === -1 ? SpriteEffects.FlipHorizontally : SpriteEffects.None;
        const alpha = this.GetAlpha(proj, lightColor);
        const origin = this._origin;
        const oldPos = proj.oldPos;
        const len = oldPos.Length;
        const screen = Main.screenPosition;

        for (let k = len - 1; k > 0; k--) {
            const pos = oldPos.get_Item(k);
            if (pos.X === 0 && pos.Y === 0) continue;

            EntitySpriteDraw(
                texture,
                Vector2.new(pos.X - screen.X + origin.X, pos.Y - screen.Y + origin.Y + proj.gfxOffY),
                source,
                Color.Multiply(alpha, (len - k) / len),
                proj.rotation, origin, proj.scale, effects, 0
            );
        }
        return true;
    }

    OnHitPlayer(proj, target, info) {
        target.AddBuff(BUFF_POISONED, 300, false);
        target.AddBuff(BUFF_OOZED, 120, false);
        if (proj.timeLeft <= 4) return;

        proj.timeLeft = 4;
        SoundHelper.play(SFX_POP, proj.position.X, proj.position.Y);
        this._popDust(proj, 6, 1.25, 150);
    }

    OnKill(proj, timeLeft) {
        this._popDust(proj, 1, 1.15, 75);
    }

    _popDust(proj, spread, scale, alpha) {
        const center = proj.Center;
        for (let i = 0; i < 15; i++) {
            const dust = NewDustDirect(center, 10, 10, DUST_LEAF,
                Rand.NextFloat(-spread, spread), Rand.NextFloat(-spread, spread), alpha, Color.White, scale);
            if (dust) dust.noGravity = true;
        }
    }
}
