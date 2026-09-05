import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color, Vector2 } = Modules;

const EntitySpriteDraw = Terraria.Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'];
const Frame = Terraria.Utils['Rectangle Frame(Texture2D tex, int horizontalFrames, int verticalFrames, int frameX, int frameY, int sizeOffsetX, int sizeOffsetY)'];

export class BongoEffect extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 2;
    }

    SetDefaults() {
        this.Projectile.width = 62;
        this.Projectile.height = 62;
        this.Projectile.aiStyle = -1;
        this.Projectile.scale = 0.75;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 16;
        this.Projectile.tileCollide = false;
    }

    GetAlpha(proj, color) {
        return Color.Multiply(Color.new(255, 255, 255, 0), 0.8);
    }

    PreDraw(proj, lightColor) {
        const texture = Terraria.GameContent.TextureAssets.Projectile[proj.type].Value;
        const rectangle = Frame(texture, 1, Terraria.Main.projFrames[proj.type], 0, proj.frame, 0, 0);
        const drawPos = Vector2.Subtract(proj.Center, Terraria.Main.screenPosition);
        const drawOrigin = Vector2.new(rectangle.Width * 0.5, rectangle.Height * 0.5);
        EntitySpriteDraw(texture, drawPos, rectangle, this.GetAlpha(lightColor), proj.rotation, drawOrigin, proj.scale, null, 0.0);
        return false;
    }

    AI(proj) {
        if (proj.timeLeft > 12) {
            proj.scale += 0.06;
        } else {
            proj.scale -= 0.06;
        }
        
        proj.frameCounter++;
        if (proj.frameCounter > 2) {
            proj.frame++;
            proj.frameCounter = 0;
        }
        if (proj.frame < 2) return;
        proj.frame = 0;
    }
}
