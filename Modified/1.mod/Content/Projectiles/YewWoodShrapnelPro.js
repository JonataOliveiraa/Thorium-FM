import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color, Rectangle, Vector2 } = Modules;

export class YewWoodShrapnelPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 2;
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 15;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
    }

    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 10;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 30;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 30;
        this.fadeOutTime = 10;
        this.fadeOutSpeed = 20;
        this.forwardRotation = true;
    }
    
    AI(proj) {
        proj.velocity = Vector2.Multiply(proj.velocity, 0.965);
        proj.rotation = proj.ai.val0;
    }
    
    OnTileCollide(proj) {
        proj.tileCollide = false;
        proj.friendly = false;
        proj.velocity = Vector2.Multiply(proj.oldVelocity, 0.5);
        if (proj.timeLeft > 20) proj.timeLeft = 20;
        return false;
    }
    
    PreDraw(proj, lightColor) {
        const Draw = Terraria.Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'];
        
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        const frameHeight = Math.floor(texture.Height / Terraria.Main.projFrames[this.Type]);
        const frame = Rectangle.new(0, proj.frame * frameHeight, texture.Width, frameHeight);
        
        const drawOrigin = Vector2.new(texture.Width * 0.5, texture.Height * 0.5);
        const offset = Vector2.new(0, proj.gfxOffY);
        const screenPos = Terraria.Main.screenPosition;
        const drawColor = Color.Multiply(Color.Multiply(lightColor, 0.25), proj.Opacity);
        
        // Reduzir wraps == + peformance
        const GetPos = proj.oldPos.get_Item;
        const length = proj.oldPos.Length;
        
        for (let k = length - 1; k > 0; k--) {
            let num = 0.15 * (15 - k);
            if (num > 1) num = 1;
            let drawPos = Vector2.Add(Vector2.Add(Vector2.Subtract(GetPos(k), screenPos), drawOrigin), offset);
            if (k % 3 === 0) Draw(texture, drawPos, frame, drawColor, proj.rotation, drawOrigin, num, null, 0);
        }
        
        return true;
    }
}
