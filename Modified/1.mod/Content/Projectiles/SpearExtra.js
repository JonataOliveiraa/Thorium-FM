import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Rand, Vector2 } = Modules;

export class SpearExtra extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 14;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.melee = true
        this.Projectile.penetrate = 2;
        this.Projectile.timeLeft = 30;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 30;
        this.fadeOutTime = 10;
        this.fadeOutSpeed = 10;
        this.forwardRotation = true;
    }
    
    AI(proj) {
        proj.rotation = Vector2.ToRotation(proj.velocity) + 1.57;
    }

    OnTileCollide(proj, hitDirection) {
        for (let i = 0; i < 8; i++) {
            const dust = Terraria.Dust.NewDustDirect(proj.Center, proj.width * 0.5, proj.height * 0.5, 1, proj.velocity.X * 0.5, proj.velocity.Y * 0.5, 0, null, 0.75);
            dust.fadeIn = 1 + Rand.NextFloat() * 0.25;
            dust.noGravity = true;
        }
        return true;
    }
}