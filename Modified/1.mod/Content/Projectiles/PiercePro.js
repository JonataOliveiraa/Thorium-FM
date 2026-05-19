import { Terraria, Microsoft, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { Effects } from './../../TL/Modules/Effects.js';

const { Color, Vector2, Rectangle } = Modules;

export class PiercePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 1;
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 5;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.magic = true;
        this.Projectile.penetrate = 2;
        this.Projectile.timeLeft = 120;
    }

    GetAlpha(proj, lightColor) {
        return Color.Multiply(Color.new(255, 255, 255, 0), 0.75);
    }

    AI(proj) {
        proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI / 2;

        for (let i = 0; i < 3; i++) {
            const offsetX = proj.velocity.X / 3 * i;
            const offsetY = proj.velocity.Y / 3 * i;

            const dustIdx = Terraria.Dust.NewDust(
                proj.position, proj.width, proj.height,
                91, 0, 0, 0, Color.White, 0.75
            );
            const dust = Terraria.Main.dust[dustIdx];
            if (dust) {
                const pos = dust.position;
                pos.X = proj.Center.X - offsetX;
                pos.Y = proj.Center.Y - offsetY;
                dust.position = pos;
                const vel = dust.velocity;
                vel.X = 0;
                vel.Y = 0;
                dust.velocity = vel;
                dust.noGravity = true;
            }
        }
    }

    OnTileCollide(proj, oldVelocity) {
        Effects.PlaySound(Terraria.ID.SoundID.Item10, proj.position.X, proj.position.Y);
        return true;
    }

    OnKill(proj) {
        for (let i = 0; i < 10; i++) {
            const dustIdx = Terraria.Dust.NewDust(
                proj.position, proj.width, proj.height,
                91,
                proj.velocity.X * 0.25,
                proj.velocity.Y * 0.25,
                150, Color.White, 1.25
            );
            const dust = Terraria.Main.dust[dustIdx];
            if (dust) dust.noGravity = true;
        }
    }

    PreDraw(proj) {
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        const origin = Vector2.new(texture.Width * 0.5, proj.height * 0.5);
        const screenPos = Terraria.Main.screenPosition;

        for (let k = 0; k < proj.oldPos.Length; k++) {
            const pos = proj.oldPos.get_Item(k);
            const drawPos = Vector2.Add(
                Vector2.Add(
                    Vector2.Subtract(pos, screenPos),
                    origin
                ),
                Vector2.new(0, proj.gfxOffY)
            );

            Terraria.Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'](
                texture, drawPos, null,
                Color.Multiply(Color.White, 0.2),
                proj.rotation, origin, 1.0,
                Microsoft.Xna.Framework.Graphics.SpriteEffects.None, 0
            );
        }
        return true;
    }
}