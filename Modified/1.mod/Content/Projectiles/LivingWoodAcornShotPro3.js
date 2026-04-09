import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Effects } = Modules;

export class LivingWoodAcornShotPro3 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 4;
    }

    SetDefaults() {
        this.Projectile.width = 10;
        this.Projectile.height = 10;
        this.Projectile.scale = 1;
        this.Projectile.aiStyle = Terraria.ID.ProjAIStyleID.Arrow;
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
        this.Visuals(proj);
    }

    Visuals(proj) {
        let frameSpeed = 5; // Velocidade da animação
        
        proj.frameCounter++;
        if (proj.frameCounter >= frameSpeed) {
            proj.frameCounter = 0;
            proj.frame++;
            if (proj.frame >= Terraria.Main.projFrames[this.Type]) {
                proj.frame = 0;
            }
        }
    }
}