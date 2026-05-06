import { ModBuff } from '../../TL/ModBuff.js';
import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Vector2 } = Modules;

export class StunPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 1;
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 15;
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
        return Color.new(255, 255, 255, 255 - proj.alpha);
    }

    AI(proj) {
        const ai = new ProjAI(proj);
        ai[0]++;
        this.FadeInAndOut(proj, ai);

        if (++proj.frameCounter >= 2) {
            proj.frameCounter = 0;
            if (++proj.frame >= Terraria.Main.projFrames[this.Type]) {
                proj.frame = 0;
            }
        }

        proj.direction = proj.spriteDirection = proj.velocity.X > 0 ? 1 : -1;
        proj.rotation = Vector2.ToRotation(proj.velocity) + Math.PI / 2;;

        const dustIndex = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'](
            proj.Center, 0, 0,
            267,
            0, 0,
            0,
            Color.new(80, 220, 255, 0),
            1.2
        );

        if (dustIndex >= 0 && dustIndex < 2000) {
            const dust = Terraria.Main.dust[dustIndex];
            dust.noGravity = true;
            let dv = dust.velocity;
            dv.X = 0;
            dv.Y = 0;
            dust.velocity = dv;
        }
    }

    FadeInAndOut(proj, ai) {
        if (proj.timeLeft > 80) {
            proj.alpha -= 25;
            if (proj.alpha < 0) proj.alpha = 0;
        }
    }

    OnHitNPC(proj, npc) {
        const player = Terraria.Main.player[proj.owner];
        if (!player.active || player.dead) return;
        npc.AddBuff(ModBuff.getTypeByName('StunnedBuff'), 60, true);
    }

    PreDraw(proj, lightColor) {
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        const origin = Vector2.new(texture.Width / 2, texture.Height / 2);

        for (let k = proj.oldPos.length - 1; k >= 0; k--) {
            if (proj.oldPos[k].X === 0 && proj.oldPos[k].Y === 0) continue;

            const progress = k / proj.oldPos.length;
            const alpha = (1 - progress) * 0.6;
            const scale = proj.scale * (1 - progress * 0.4);

            const color = Color.new(
                Math.floor(80 * (1 - progress)),
                Math.floor(220 * (1 - progress * 0.3)),
                Math.floor(255 * (1 - progress * 0.1)),
                Math.floor(alpha * 255)
            );

            let drawPos = Vector2.Subtract(proj.oldPos[k], Terraria.Main.screenPosition);
            drawPos = Vector2.Add(drawPos, Vector2.new(proj.width / 2, proj.height / 2));

            Terraria.Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'](
                texture,
                drawPos,
                null,
                color,
                proj.rotation,
                origin,
                scale,
                0,
                0
            );
        }

        return true;
    }
}