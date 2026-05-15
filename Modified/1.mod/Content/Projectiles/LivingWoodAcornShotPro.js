import { Terraria, Modules, Microsoft } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModPlayer } from '../../TL/ModPlayer.js';
import { ThoriumPlayer } from '../Global/ThoriumPlayer.js';

const { Color, Rand, Vector2 } = Modules;

export class LivingWoodAcornShotPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        
        // Configurações do Trail
        this.trailAlpha = 0.6;
        this.trailScaleDecay = 0.15;
        this.trailColorStart = Color.new(65, 86, 29, 255); // Verde base
        this.trailColorEnd = Color.new(65, 86, 29, 0);     // Transparente na ponta
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 6;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
        Terraria.ID.ProjectileID.Sets.MinionShot[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.width = 10;
        this.Projectile.height = 10;
        this.Projectile.scale = 1;
        this.Projectile.aiStyle = 1; // Gravidade e rotação
        this.Projectile.friendly = true;
        this.Projectile.hostile = false;
        this.Projectile.ranged = true; 
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 450;
        this.Projectile.ignoreWater = false;
        this.Projectile.tileCollide = true;
        this.Projectile.extraUpdates = 1;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = -1;
    }

    AI(proj) {
        // 1. Partícula Dust (DustID 3 = Grass/Grama)
        if (Rand.NextBool(2)) { 
            let dustIdx = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'](
                proj.position, proj.width, proj.height, 3, proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 100, Color.new(255, 255, 255, 255), 1.0
            );
            Terraria.Main.dust[dustIdx].noGravity = true;
        }

        if (ThoriumPlayer.LivingWoodAcornArmorBuff === true) {
            const searchRange = 1024;
            // A própria semente acha o alvo sem depender do lacaio!
            const target = proj['NPC FindTargetWithinRange(float maxRange, bool checkCanHit)'](searchRange, false);
            
            if (target != null && target.active) {
                let homingSpeedFactor = 20.0; // Velocidade de curva
                let direction = Vector2.Multiply(Vector2.Normalize(Vector2.Subtract(target.Center, proj.Center)), homingSpeedFactor);
                
                // Aplica a inércia perfeitamente como no seu código
                proj.velocity = Vector2.Divide(Vector2.Add(Vector2.Multiply(proj.velocity, 10), direction), 19);
            }
            
            // Gira a semente na direção do movimento e ignora a gravidade pesada do aiStyle
            proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI / 2;
            return false; 
        }
        
        return true; 
    }

    PreDraw(proj) {
        // Se a engine ainda não gravou o cache de rastro, previne crash
        if (!proj.oldPos || proj.oldPos.Length === 0) return true;

        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        const drawOrigin = Vector2.new(texture.Width * 0.5, texture.Height * 0.5);

        for (let k = proj.oldPos.Length - 1; k > 0; k--) {
            // Verifica se a posição é válida (quando o projétil acabou de nascer os slots ficam em Zero)
            if (proj.oldPos[k].X === 0 && proj.oldPos[k].Y === 0) continue;

            let drawPos = Vector2.Subtract(proj.oldPos[k], Terraria.Main.screenPosition);
            drawPos = Vector2.Add(drawPos, Vector2.new(drawOrigin.X, drawOrigin.Y + proj.gfxOffY));
            
            const alpha = this.trailAlpha * (1 - k / proj.oldPos.length);

            // Interpolação suave de cores e tamanho
            const color = Color.Lerp(this.trailColorEnd, this.trailColorStart, alpha);
            const scale = Math.max(0, proj.scale - k * this.trailScaleDecay);

            Terraria.Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'](
                texture, 
                drawPos, 
                null, 
                color, 
                proj.rotation, 
                drawOrigin, 
                scale, 
                Microsoft.Xna.Framework.Graphics.SpriteEffects.None, 
                0
            );
        }

        return true; // Retorna true para deixar o jogo desenhar a semente principal por cima do rastro
    }
}