import { Terraria, Microsoft, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { Effects } from './../../TL/Modules/Effects.js';

const { Color, Vector2 } = Modules;

export class PoisonPro extends ModProjectile {
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
        this.Projectile.width = 26;
        this.Projectile.height = 14;
        this.Projectile.friendly = true;
        this.Projectile.melee = true;
        this.Projectile.penetrate = 1;
        this.Projectile.ignoreWater = true;
        this.Projectile.tileCollide = true;
        this.Projectile.hostile = false;
        this.Projectile.alpha = 0;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = -1;
        this.Projectile.timeLeft = 80;
        this.Projectile.scale = 1;
    }

    GetAlpha(proj, color) {
        return Color.Multiply(Color.new(57, 255, 20, 0), 0.75);
    }

    AI(proj) {
        proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X);

        for (let i = 0; i < 3; i++) {
            const offsetX = proj.velocity.X / 3 * i;
            const offsetY = proj.velocity.Y / 3 * i;

            const dustIdx = Terraria.Dust.NewDust(
                proj.position, proj.width, proj.height,
                91, 0, 0, 0, Color.new(57, 255, 20), 0.75
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

    OnHitNPC(proj, npc) {
        npc.AddBuff(20, 120, false);
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
                150, Color.new(57, 255, 20), 1.25
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
                Vector2.Add(Vector2.Subtract(pos, screenPos), origin),
                Vector2.new(0, proj.gfxOffY)
            );

            Terraria.Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'](
                texture, drawPos, null,
                Color.Multiply(Color.new(57, 255, 20, 200), 0.2),
                proj.rotation, origin, 1.0,
                Microsoft.Xna.Framework.Graphics.SpriteEffects.None, 0
            );
        }
        return true;
    }
}