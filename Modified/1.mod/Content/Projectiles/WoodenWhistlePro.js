import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color, Vector2 } = Modules;

export class WoodenWhistlePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Bard/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 8;
        this.Projectile.height = 8;
        this.Projectile.aiStyle = Terraria.ID.ProjAIStyleID.Arrow;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 1;
        this.Projectile.ignoreWater = false;
        this.Projectile.tileCollide = true;
        this.Projectile.timeLeft = 120;
        this.Projectile.scale = 0.8;
        this.Projectile.alpha = 0;
    }

    AI(proj) {
        let vel = proj.velocity
        vel.Y += 0.10
        proj.velocity = vel

        proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X);

        if (Math.random() < 0.35) {
            const dustIdx = Terraria.Dust.NewDust(
                proj.position, proj.width, proj.height,
                91, 
                proj.velocity.X * 0.1,
                proj.velocity.Y * 0.1,
                100, Color.SkyBlue, 0.6
            );
            const dust = Terraria.Main.dust[dustIdx];
            if (dust) {
                dust.noGravity = true;
                const vel = dust.velocity;
                vel.X *= 0.3;
                vel.Y *= 0.3;
                dust.velocity = vel;
            }
        }
    }

    OnKill(proj) {
        for (let i = 0; i < 8; i++) {
            const dustIdx = Terraria.Dust.NewDust(
                proj.position, proj.width, proj.height,
                91,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                100, Color.SkyBlue, 0.8
            );
            const dust = Terraria.Main.dust[dustIdx];
            if (dust) dust.noGravity = true;
        }
    }

    PreDraw() { return false; }
}