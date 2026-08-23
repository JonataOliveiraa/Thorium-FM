import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Main } = Terraria;
const { MathHelper, Vector2 } = Modules;

const EntitySpriteDraw = Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'];
const GetColor = Terraria.Lighting['Color GetColor(int x, int y)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

export class SpringHookPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Main.projHook[this.Type] = true;
    }

    SetDefaults() {
        this.CloneDefaults(Terraria.ID.ProjectileID.GemHookAmethyst); 
        this.Projectile.width = this.Projectile.height = 22;
        this.Projectile.penetrate = -1;
        this.Projectile.aiStyle = 7;
    }

    SetStaticDefaults() {
        this.ChainTexture = tl.texture.load('Textures/Projectiles/SpringHookPro_Chain.png');
        this.GrappleRange = 250;
        this.NumGrappleHooks = 1;
    }
    
    AI(proj) {
        const ai = new ProjAI(proj);
        const player = Main.player[proj.owner];
        
        const dist = player.Distance(proj.Center);
        
        if (ai[0] === 0) {
            if (dist > this.GrappleRange) {
                ai[0] = 1;
            }
        }
        
        if (ai[0] !== 1) {
            if (proj.velocity.X === 0 && proj.velocity.Y === 0) {
                const v = proj.oldVelocity;
                const length = Math.sqrt(v.X * v.X + v.Y * v.Y);
                const speed = Math.min(12, 12 * (1 - dist / 250));
                player.velocity = Vector2.new(-v.X / length * speed, -v.Y / length * speed);
                PlaySound(Terraria.ID.SoundID.Item56, proj.position, 0, 1);
                ai[0] = 1;
            }
        }
    }
    
    UseGrapple(player, type) {
        if (player.ownedProjectileCounts[type] >= this.NumGrappleHooks) {
            const projArr = Main.projectile;
            let oldestHook = null;
            for (let i = 0; i < 1000; i++) {
                const proj = projArr[i];
                if (proj && proj.active && proj.type === type && proj.owner === player.whoAmI && (!oldestHook || proj.timeLeft < oldestHook.timeLeft)) oldestHook = proj;
            }
            if (oldestHook) oldestHook.Kill();
        }
        return type;
    }
    
    PreDraw(proj, lightColor) {
        const screenPos = Main.screenPosition;
        const player = Main.player[Main.myPlayer];
        const playerCenter = player.MountedCenter;
        let center = proj.Center;
        let directionToPlayer = Vector2.Subtract(playerCenter, center);
        let distanceToPlayer = directionToPlayer['float Length()']();
        const chainRotation = Vector2.ToRotation(directionToPlayer) - MathHelper.PiOver2;
        const origin = Vector2.new(this.ChainTexture.Width / 2, this.ChainTexture.Height / 2);
        
        while (distanceToPlayer > 20 && !Number.isNaN(distanceToPlayer)) {
            directionToPlayer = Vector2.Divide(directionToPlayer, distanceToPlayer); // get unit vector
            directionToPlayer = Vector2.Multiply(directionToPlayer, this.ChainTexture.Height); // multiply by chain link length
            center = Vector2.Add(center, directionToPlayer);
            directionToPlayer = Vector2.Subtract(playerCenter, center);
            distanceToPlayer = directionToPlayer['float Length()']();
            
            const drawColor = GetColor(center.X / 16, center.Y / 16);
            EntitySpriteDraw(
                this.ChainTexture,
                Vector2.Subtract(center, screenPos),
                null, drawColor, chainRotation, origin, 1.0, null, 0
            );
        }
        
        return true;
    }
}