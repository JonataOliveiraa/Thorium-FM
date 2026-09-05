import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Rand, Vector2 } = Modules;

export class HotHornPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 10;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
    }

    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 32;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 180;
    }

    GetAlpha(proj, color) {
        return Color.Multiply(Color.White, 1 - proj.alpha / 255);
    }
    
    PreDraw(proj) {
        const Draw = Terraria.Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'];
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        const drawOrigin = Vector2.new(texture.Width * 0.5, proj.height * 0.5);
        const offset = Vector2.new(0, proj.gfxOffY);
        const screenPos = Terraria.Main.screenPosition;
        const GetPos = proj.oldPos.get_Item;
        const length = proj.oldPos.Length;
        for (let k = length - 1; k > 0; k--) {
            let drawPos = Vector2.Subtract(GetPos(k), screenPos);
            drawPos = Vector2.Add(drawPos, offset);
            drawPos = Vector2.Add(drawPos, drawOrigin);
            const alpha = (length - k) / length;
            let color = Color.Multiply(Color.White, 0.25);
            color = Color.Multiply(color, alpha);
            color = Color.Multiply(color, proj.Opacity);
            Draw(texture, drawPos, null, color, proj.rotation - 0.01 * k, drawOrigin, proj.scale, null, 0);
        }
        const drawPos = Vector2.Subtract(proj.Center, screenPos);
        const color = Color.Multiply(Color.Multiply(Color.White, 0.35), proj.Opacity);
        Draw(texture, drawPos, null, color, -proj.rotation, Vector2.new(16, 16), 1.5, null, 0);
        return true;
    }
    
    OnHitNPC(proj, npc) {
        npc.AddBuff(24, 120, false);
    }
    
    AI(proj) {
        proj.rotation += (proj.velocity.X > 0) ? 0.12 : -0.12;
        proj.spriteDirection = (proj.velocity.X > 0) ? 1 : 0;
        let index2 = Terraria.Dust.NewDust(proj.position, proj.width, proj.height, 174, 0.0, 0.0, 0, null, 1.25);
        Terraria.Main.dust[index2].noGravity = true;
        index2 = Terraria.Dust.NewDust(proj.position, proj.width, proj.height, 174, 0.0, 0.0, 0, null, 1.25);
        Terraria.Main.dust[index2].noGravity = true;
    }
    
    OnKill(proj, timeLeft) {
        const NewDustDirect = Terraria.Dust.NewDustDirect;
        for (let i = 0; i < 15; i++) {
            NewDustDirect(proj.position, proj.width, proj.height, 174, Rand.Next(-6, 7), Rand.Next(-6, 7), 0, null, 2).noGravity = true;
        }
    }
}
