import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { ThoriumPlayer } from '../Global/ThoriumPlayer.js';

const { Color, Effects, Rand, Rectangle, Vector2 } = Modules;

const EntitySpriteDraw = Terraria.Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

export class NocturnePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.Trail = this.Texture + '_Trail';
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 8;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 2;
        this.TrailTexture = tl.texture.load(`Textures/${this.Trail}.png`);
    }

    SetDefaults() {
        this.Projectile.width = 18;
        this.Projectile.height = 18;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 300;
        this.Projectile.friendly = true;
        this.Projectile.extraUpdates = 1;
    }

    GetAlpha(proj, color) {
        return Color.Multiply(Color.White, proj.Opacity);
    }

    PreDraw(proj, lightColor) {
        const screenPos = Terraria.Main.screenPosition;
        const texture = this.TrailTexture;
        const frame = Rectangle.new(0, 0, texture.Width, texture.Height);
        const drawOrigin = Vector2.new(texture.Width * 0.5, proj.height * 0.5);
        const offset = Vector2.new(0, proj.gfxOffY);
        const color = Color.Multiply(this.GetAlpha(proj, lightColor), 0.3);
        const getPos = proj.oldPos.get_Item;
        const getRot = proj.oldRot.get_Item;
        const spriteEffects = proj.spriteDirection === -1 ? Effects.SpriteEffects.FlipHorizontally : Effects.SpriteEffects.None;
        const ai0 = proj.ai.get_Item(0);
        const length = proj.oldPos.Length;

        for (let index = length - 1; index > 0; index--) {
            let drawPos = Vector2.Subtract(getPos(index), screenPos);
            drawPos = Vector2.Add(drawPos, drawOrigin);
            drawPos = Vector2.Add(drawPos, offset);
            EntitySpriteDraw(texture, drawPos, frame, color, getRot(index), drawOrigin, 1.1 + ai0, spriteEffects, 0.0);
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
        return !this.Bounce(proj, hitDirection, 2);
    }

    OnHitNPC(proj, npc) {
        const center = proj.Center;
        for (let index = 0; index < Terraria.Main.maxNPCs; index++) {
            const target = Terraria.Main.npc[index];
            if (target.CanBeChasedBy(null, false) && target.DistanceSQ(center) < 40000.0) {
                if (target.buffImmune[153]) {
                    //target.AddBuff(ModBuff.getTypeByName('LightCurse'), 600, false);
                } else {
                    target.AddBuff(153, 600, false);
                }
            }
        }

        PlaySound(Terraria.ID.SoundID.Item73, npc.Center, 0, 1);
        for (let index = 0; index < 25; index++) {
            const dust = Terraria.Dust.NewDustDirect(proj.position, proj.width, proj.height, 27, Rand.Next(-12, 13), Rand.Next(-12, 13), 255, null, 1.65);
            dust.noGravity = true;
        }
        for (let index = 0; index < 10; index++) {
            const dust = Terraria.Dust.NewDustDirect(proj.position, proj.width, proj.height, 27, Rand.Next(-6, 7), Rand.Next(-6, 7), 100, null, 1.25);
            dust.noGravity = true;
        }
    }

    AI(proj) {
        proj.spriteDirection = proj.velocity.X > 0.0 ? 1 : -1;
        Effects.AddLight(proj.Center, 0.125, 0.125, 0.45);
        proj.velocity = Vector2.Multiply(proj.velocity, 0.995);

        const ai = new ProjAI(proj);
        if (ai[1] === 0.0) {
            ai[0] += 0.025;
            if (ai[0] < 0.25) return;
            ai[1] = 1.0;
        } else {
            if (ai[1] !== 1.0) return;
            ai[0] -= 0.025;
            if (ai[0] > 0.0) return;
            ai[1] = 0.0;
        }
        
        if (proj.timeLeft < 30) {
            proj.alpha += 8;
            if (proj.alpha > 255) proj.alpha = 255;
        }
        proj.rotation = Vector2.ToRotation(proj.velocity) + 1.57;
    }

    OnKill(proj, timeLeft) {
        for (let index = 0; index < 10; index++) {
            const dust = Terraria.Dust.NewDustDirect(proj.position, proj.width, proj.height, 27, Rand.Next(-4, 5), Rand.Next(-4, 5), 255, null, 1.35);
            dust.noGravity = true;
        }
    }
}
