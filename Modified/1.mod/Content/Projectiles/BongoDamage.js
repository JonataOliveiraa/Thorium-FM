import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color, Vector2 } = Modules;

const EntitySpriteDraw = Terraria.Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'];

export class BongoDamage extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.ownerHitCheck = true;
        this.Projectile.width = 700;
        this.Projectile.height = 700;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 10;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = false;
    }

    PreDraw(proj, lightColor) {
        const player = Terraria.Main.player[proj.owner];
        let drawPos = Vector2.Subtract(player.Center, Terraria.Main.screenPosition);
        drawPos = Vector2.Add(drawPos, Vector2.new(0, player.gfxOffY));
        const texture = Terraria.GameContent.TextureAssets.Projectile[proj.type].Value;
        const drawOrigin = Vector2.new(texture.Width * 0.5, texture.Height * 0.5);
        const color = Color.Multiply(Color.new(255, 255, 255, 0), 0.02 * proj.timeLeft);
        EntitySpriteDraw(texture, drawPos, null, color, proj.rotation, drawOrigin, 1.7, null, 0.0);
        return false;
    }

    CanCutTiles(proj) {
        return false;
    }
}
