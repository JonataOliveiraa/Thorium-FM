import { Terraria, Modules, Microsoft } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Main, Lighting } = Terraria;
const { Color, Effects, Vector2 } = Modules;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const GetColor = Lighting['Color GetColor(int x, int y)'];
const DrawSignature = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, Vector2 scale, SpriteEffects effects, float layerDepth)';

export class ShambleBall extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._debuffType = -1;
        this._chainTex = null;
        this._chainTried = false;
    }

    SetDefaults() {
        this.Projectile.width = 26;
        this.Projectile.height = 26;
        this.Projectile.aiStyle = 14;
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.tileCollide = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 270;
    }

    DebuffType() {
        if (this._debuffType === -1) this._debuffType = ModBuff.getTypeByName('ShambleBallDebuff') ?? -2;
        return this._debuffType;
    }

    ChainTexture() {
        if (this._chainTried) return this._chainTex;
        this._chainTried = true;
        try { this._chainTex = tl.texture.load('Textures/Projectiles/ScorpainPro2_Chain.png'); } catch (_) { }
        return this._chainTex;
    }

    AI(proj) {
        if (proj.timeLeft < 30) proj.alpha = Math.floor(255 * (1 - proj.timeLeft / 30));

        const local = new ProjAI(proj, true);
        if (local[0] === 0) {
            local[0] = 1;
            local[1] = proj.ai.val1;
        }

        const index = local[1];
        if (index < 0 || index > 254) return;

        const player = Main.player[index];
        const debuff = this.DebuffType();
        const center = proj.Center;

        if (!player || !player.active || player.dead || (debuff > 0 && player.buffImmune[debuff])) {
            local[1] = 255;
            this.Unshackle(proj, player);
            return;
        }

        const target = player.Center;
        const dx = center.X - target.X;
        const dy = center.Y - target.Y;
        const distSq = dx * dx + dy * dy;

        if (distSq > 62500) {
            local[1] = 255;
            this.Unshackle(proj, player);
            return;
        }

        if (debuff > 0) player.AddBuff(debuff, 2, false);
        if (distSq < 5625) return;

        const dist = Math.sqrt(distSq);
        const vel = player.velocity;
        let vy = vel.Y;
        if (vy * player.gravDir < 0) vy *= 0.7;
        player.velocity = Vector2.new(
            (vel.X * 9 + dx * 2 / dist) / 10,
            (vy * 9 + dy * 2 / dist) / 10
        );
    }

    Unshackle(proj, player) {
        if (Main.dedServ || !player) return;
        const center = proj.Center;
        const target = player.Center;
        const dx = (target.X - center.X) / 8;
        const dy = (target.Y - center.Y) / 8;
        for (let i = 0; i < 8; i++) {
            Effects.NewDust(
                Vector2.new(center.X + dx * i - 2, center.Y + dy * i - 2),
                4, 4, 26, dx * 0.15, dy * 0.15 - 1.5, 0, Color.White, 0.9
            );
        }
        Effects.PlaySound(2, (center.X + dx * 4) | 0, (center.Y + dy * 4) | 0, 37, 0, 0.5);
    }

    OnTileCollide(proj, hitDirection) {
        const local = new ProjAI(proj, true);
        if (local[2] === 0) {
            local[2] = 1;
            const center = proj.Center;
            Effects.PlaySound(3, center.X | 0, center.Y | 0, 4, 0, 0.55);
        }
        return true;
    }

    PreDraw(proj, lightColor) {
        const local = new ProjAI(proj, true);
        if (local[0] === 0) return true;

        const index = local[1];
        if (index < 0 || index > 254) return true;

        const player = Main.player[index];
        if (!player || !player.active || player.dead) return true;

        const texture = this.ChainTexture();
        if (!texture) return true;

        const segment = texture.Height;
        const origin = Vector2.new(texture.Width * 0.5, segment * 0.5);
        const screen = Main.screenPosition;
        const scale = Vector2.One;
        const draw = Main.spriteBatch[DrawSignature];

        let x = proj.Center.X;
        let y = proj.Center.Y;
        const target = player.MountedCenter;
        const rotation = Math.atan2(target.Y - y, target.X - x) - Math.PI / 2;
        const color = GetColor(Math.floor(x / 16), Math.floor(y / 16));

        let guard = 0;
        while (guard++ < 48) {
            const dx = target.X - x;
            const dy = target.Y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < segment + 1) break;
            x += dx / dist * segment;
            y += dy / dist * segment;
            draw(
                texture,
                Vector2.new(x - screen.X, y - screen.Y),
                null,
                color,
                rotation,
                origin,
                scale,
                SpriteEffects.None,
                0
            );
        }

        return true;
    }
}
