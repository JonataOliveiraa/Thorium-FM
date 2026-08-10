import { Terraria, Modules, Microsoft } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { SoundHelper } from '../Global/Utils/SoundHelper.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const TRAIL = 10;

let _burstType = -1;

export class JunglesWrathPro extends ModProjectile {
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
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = -1;
        this.Projectile.magic = true;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 120;
    }

    AI(proj) {
        const vel = proj.velocity;
        proj.rotation = Math.atan2(vel.Y, vel.X) + Math.PI / 2;

        const dust = Main.dust[Effects.NewDust(
            Vector2.new(proj.position.X - vel.X * 0.5, proj.position.Y - vel.Y * 0.5),
            proj.width, proj.height, 44, 0, 0, 150, Color.White, 1
        )];
        if (dust) {
            dust.velocity = Vector2.Multiply(dust.velocity, 0.2);
            dust.noGravity = true;
        }

        // O Thorium usa fadeOutTime/fadeOutSpeed; aqui e na mao
        if (proj.timeLeft < 20) proj.alpha = Math.min(255, proj.alpha + 10);
    }

    GetAlpha(proj, color) {
        const opacity = 1 - proj.alpha / 255;
        return Color.Multiply(Color.new(255, 255, 255, 0), 0.85 * opacity);
    }

    // Rastro de copias cada vez menores atras do projetil
    PreDraw(proj, lightColor) {
        if (!this._tex) {
            this._tex = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
            if (!this._tex) return true;
        }

        const origin = Vector2.new(this._tex.Width * 0.5, proj.height * 0.5);
        const tint = Color.Multiply(Color.new(255, 255, 255, 0), 0.2);
        const oldPos = proj.oldPos;
        const count = Math.min(TRAIL, oldPos.Length);

        for (let i = 0; i < count; i++) {
            const pos = oldPos.get_Item(i);

            Main.spriteBatch[DRAW](
                this._tex,
                Vector2.new(
                    pos.X - Main.screenPosition.X + origin.X,
                    pos.Y - Main.screenPosition.Y + origin.Y + proj.gfxOffY
                ),
                null, tint, proj.rotation, origin,
                0.08 * (TRAIL - i),
                SpriteEffects.None, 0
            );
        }

        return true;
    }

    // Estoura num anel de 12 esporos que se abrem pra fora
    OnKill(proj) {
        const center = proj.Center;
        SoundHelper.play(['Item34', 'Item14'], center.X, center.Y);

        if (Main.myPlayer !== proj.owner) return;

        if (_burstType === -1) _burstType = ModProjectile.getTypeByName('JunglesWrathPro2') ?? -2;
        if (_burstType < 0) return;

        const source = null;
        const count = 12;

        for (let i = 0; i < count; i++) {
            const angle = i * Math.PI * 2 / count;
            const ox = Math.cos(angle);
            const oy = Math.sin(angle);

            NewProjectile(
                source,
                Vector2.new(center.X + ox * 10, center.Y + oy * 10),
                Vector2.new(ox * 1.15, oy * 1.15),
                _burstType, proj.damage, proj.knockBack, Main.myPlayer,
                0, 0, 0, null
            );
        }
    }
}
