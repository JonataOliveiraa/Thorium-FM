import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { ThoriumPlayer } from '../Global/ThoriumPlayer.js';

const { Color, Effects, Rand, Rectangle, Vector2 } = Modules;

const EntitySpriteDraw = Terraria.Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'];

export class DynastyGuzhengPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 8;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 2;
    }

    SetDefaults() {
        this.Projectile.width = 12;
        this.Projectile.height = 12;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 240;
        this.Projectile.alpha = 75;
        this.Projectile.friendly = true;
        this.Projectile.extraUpdates = 2;
    }
    
    PreDraw(proj, lightColor) {
        const screenPos = Terraria.Main.screenPosition;
        const texture = Terraria.GameContent.TextureAssets.Projectile[proj.type].Value;
        const frame = Rectangle.new(0, 0, texture.Width, texture.Height);
        const drawOrigin = Vector2.new(Math.floor((texture.Width - proj.width) / 2) + Math.floor(proj.width / 2), Math.floor(proj.height / 2));
        const getPos = proj.oldPos.get_Item;
        const getRot = proj.oldRot.get_Item;
        const getDir = proj.oldSpriteDirection.get_Item;
        const length = proj.oldPos.Length;
        for (let index = length - 1; index > 0; index--) {
            let drawPos = Vector2.Subtract(getPos(index), screenPos);
            drawPos = Vector2.Add(drawPos, drawOrigin);
            drawPos = Vector2.Add(drawPos, Vector2.new(this.DrawOffsetX, proj.gfxOffY));
            const color = Color.Multiply(this.GetAlpha(proj, Color.Multiply(lightColor, 0.25)), (length - index) / length);
            const spriteEffects = getDir(index) === -1 ? Effects.SpriteEffects.FlipHorizontally : Effects.SpriteEffects.None;
            EntitySpriteDraw(texture, drawPos, frame, color, getRot(index), drawOrigin, proj.scale, spriteEffects, 0.0);
        }
        return true;
    }
    
    Bounce(proj, hitDirection, collideMax) {
        // ai[2] = collide
        const ai = new ProjAI(proj);
        if (collideMax > -1 && ai[2] >= collideMax) return false;
        ai[2]++;
        const GetTile = Terraria.Main.tile.get_Item;
        const old = proj.oldPosition;
        const velocity = proj.oldVelocity;
        const width = proj.width;
        const height = proj.height;
        const tileSize = 16;
        const tileSolid = Terraria.Main.tileSolid;
        const minX = Math.floor(Math.min(old.X, old.X + velocity.X) / tileSize) - 1;
        const maxX = Math.floor(Math.max(old.X + width, old.X + width + velocity.X) / tileSize) + 1;
        const minY = Math.floor(Math.min(old.Y, old.Y + velocity.Y) / tileSize) - 1;
        const maxY = Math.floor(Math.max(old.Y + height, old.Y + height + velocity.Y) / tileSize) + 1;
        let collisionX = Infinity;
        let collisionY = Infinity;
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const tile = GetTile(x, y);
                if (!tile['bool active()']() || !tileSolid[tile.type]) continue;
                const left = x * tileSize;
                const right = left + tileSize;
                const top = y * tileSize;
                const bottom = top + tileSize;
                if (hitDirection.X !== 0 && velocity.X !== 0) {
                    const face = velocity.X > 0 ? left : right;
                    const edge = velocity.X > 0 ? old.X + width : old.X;
                    const t = (face - edge) / velocity.X;
                    if (t >= 0 && t <= 1) {
                        const y1 = old.Y + velocity.Y * t;
                        const y2 = y1 + height;
                        if (y2 > top && y1 < bottom && t < collisionX) collisionX = t;
                    }
                }
                if (hitDirection.Y !== 0 && velocity.Y !== 0) {
                    const face = velocity.Y > 0 ? top : bottom;
                    const edge = velocity.Y > 0 ? old.Y + height : old.Y;
                    const t = (face - edge) / velocity.Y;
                    if (t >= 0 && t <= 1) {
                        const x1 = old.X + velocity.X * t;
                        const x2 = x1 + width;
                        if (x2 > left && x1 < right && t < collisionY) collisionY = t;
                    }
                }
            }
        }
        const v = Vector2.new(velocity.X, velocity.Y);
        if (collisionX < collisionY) {
            v.X = -v.X;
        } else if (collisionY < collisionX) {
            v.Y = -v.Y;
        } else if (collisionX !== Infinity) {
            if (Math.abs(velocity.X) > Math.abs(velocity.Y)) v.X = -v.X;
            else v.Y = -v.Y;
        }
        proj.velocity = v;
        return true;
    }

    OnTileCollide(proj, hitDirection) {
        return !this.Bounce(proj, hitDirection, 1);
    }

    AI(proj) {
        Effects.AddLight(proj.Center, 0.05, 0.25, 0.3);
        
        proj.rotation = Vector2.ToRotation(proj.velocity) + 1.57;
        if (proj.timeLeft < 30) {
            proj.alpha += 4;
            if (proj.alpha > 255) proj.alpha = 255;
        }
    }

    OnKill(proj, timeLeft) {
        for (let index = 0; index < 5; index++) {
            const dust = Terraria.Dust.NewDustDirect(proj.position, proj.width, proj.height, 172, Rand.Next(-3, 4), Rand.Next(-3, 4), 0, Color.White, 0.75);
            dust.noGravity = true;
        }
    }
}
