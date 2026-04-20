import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { Effects } from '../../../TL/Modules/Effects.js';

export class StrangeBulbPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/NPC/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 2;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        
        this.Projectile.tileCollide = true;
        this.Projectile.ignoreWater = false;
        
        this.Projectile.timeLeft = 300;
    }

    AI(proj) {
        proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + 1.57;

        // Também emite a mesma luz rosada da planta mãe
        Effects.AddLight(proj.Center, 0.4, 0.1, 0.3);

        proj.frameCounter++;
        if (proj.frameCounter >= 6) { // A cada 6 ticks, troca de frame
            proj.frameCounter = 0;
            proj.frame++;
            if (proj.frame >= Terraria.Main.projFrames[this.Type]) {
                proj.frame = 0;
            }
        }
    }
}