import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Vector2, Rectangle } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class FreezePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 1;
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
        
        proj.direction = proj.spriteDirection = (proj.velocity.X > 0) ? 1 :  1;
        
        proj.rotation = Vector2.ToRotation(proj.velocity);

        if (Math.random() < 1.4) {
            let dust = Terraria.Dust.NewDustDirect(
                proj.position, 
                proj.width, 
                proj.height, 
                135,
                proj.velocity.X * 0.2, proj.velocity.Y * 0.2,
                100, 
                Color.new(120, 200, 255),
                2.4
            );
            if (dust) {
        dust.noGravity = true; // ← ADICIONE
        }
    }
}
    
    FadeInAndOut(proj, ai) {
        if (proj.timeLeft > 80) {
            proj.alpha -= 25;
            if (proj.alpha < 0) proj.alpha = 0;
        }
    }
    
    OnHitNPC(proj, npc) {
    npc.AddBuff(44, 120, false);
}
}
