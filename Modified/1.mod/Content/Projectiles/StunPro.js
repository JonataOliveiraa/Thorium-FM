import { ModBuff } from '../../TL/ModBuff.js';
import { Terraria, Modules, Microsoft } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Vector2 } = Modules;

export class StunPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;

            this.trailAlpha = 0.6;
        this.trailScaleDecay = 0.15;
        this.trailColorStart = Color.LightCyan
        this.trailColorEnd = Color.new(65, 86, 29, 0);     
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

    PreDraw(proj) {
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        const origin = Vector2.new(texture.Width / 2, texture.Height / 2);
        const effects = Microsoft.Xna.Framework.Graphics.SpriteEffects.None;
        const screenPos = Terraria.Main.screenPosition;
        const halfSize = Vector2.Divide(Vector2.new(proj.width, proj.height), 2);
        const gfxOffset = Vector2.Multiply(Vector2.UnitY, proj.gfxOffY);

        for (let k = proj.oldPos.Length - 1; k > 0; k--) {
            const pos = proj.oldPos.get_Item(k);
            if (pos.X === 0 && pos.Y === 0) continue;

            const drawPos = Vector2.Subtract(
                Vector2.Add(Vector2.Add(pos, halfSize), gfxOffset),
                screenPos
            );

            const alpha = this.trailAlpha * (1 - k / proj.oldPos.Length);
            const color = Color.Lerp(this.trailColorEnd, this.trailColorStart, alpha);
            const scale = Math.max(0, proj.scale - k * this.trailScaleDecay);

            Terraria.Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'](
                texture, drawPos, null, color, proj.rotation, origin, scale, effects, 0
            );
        }
        return true;
    }
}