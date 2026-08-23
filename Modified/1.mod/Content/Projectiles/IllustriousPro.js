import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color, Vector2 } = Modules;

export class IllustriousPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 10;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 2;
    }

    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 20;
        this.Projectile.ignoreWater = true;
        this.CloneDefaults(547);
        this.Projectile.scale = 1.0;
        this.Projectile.aiStyle = 99; // Yoyo AI style
    }
    
    AI(proj) {
        const maxSpeed = 15;
        const acceleration = 1.05;
        
        const v = proj.velocity;
        v.X *= acceleration;
        v.Y *= acceleration;
        if (v.X > maxSpeed) v.X = maxSpeed;
        if (v.X < -maxSpeed) v.X = -maxSpeed;
        if (v.Y > maxSpeed) v.Y = maxSpeed;
        if (v.Y < -maxSpeed) v.Y = -maxSpeed;
        proj.velocity = v;
    }
    
    PreDraw(proj, lightColor) {
        const Draw = Terraria.Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'];
        
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        const drawOrigin = Vector2.new(texture.Width * 0.5, texture.Height * 0.5);
        const offset = Vector2.new(drawOrigin.X, drawOrigin.Y + proj.gfxOffY);
        const screenPos = Terraria.Main.screenPosition;
        const drawColor = Color.op_Multiply(lightColor, 0.324);
        const scale = proj.scale;
        
        // Reduzir wraps == + peformance
        const GetPos = proj.oldPos.get_Item;
        const GetRot = proj.oldRot.get_Item;
        const length = proj.oldPos.Length;
        
        for (let k = length - 1; k > 0; k--) {
            let drawPos = Vector2.Add(Vector2.Subtract(GetPos(k), screenPos), offset);
            Draw(texture, drawPos, null, drawColor, GetRot(k), drawOrigin, scale, null, 0);
        }
        
        return true;
    }
}
