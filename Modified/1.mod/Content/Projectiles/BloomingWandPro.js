import { Terraria, Modules } from "./../../TL/ModImports.js";
import { ModProjectile } from "./../../TL/ModProjectile.js";
import { Color } from "./../../TL/Modules/Color.js";

const { Vector2 } = Modules;
const DUST_OFFSET = Vector2.new(5, 5);
const ROTATION_DELTA = (Math.PI * 6) / 50;

export class BloomingWandPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 16;
        this.Projectile.height = 16;
        this.Projectile.alpha = 255;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.magic = true;
        this.Projectile.penetrate = 3;
        this.Projectile.timeLeft = 120;
        this.Projectile.tileCollide = true;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 20;
    }

    AI(proj) {
        const dir = proj.velocity.X >= 0 ? 1 : -1;
        proj.rotation += ROTATION_DELTA * dir;
        if (proj.alpha > 0) proj.alpha = Math.max(0, proj.alpha - 25);

        const dust = Terraria.Dust.NewDustDirect(
            Vector2.Subtract(proj.Center, DUST_OFFSET),
            0, 0, 89,
            0, 0, 100, Color.LightGreen, 0.7
        );
        if (dust) {
            dust.noGravity = true;
            dust.noLight = true;
        }

        proj.velocity = Vector2.Divide(proj.velocity, 1.01);
    }

    OnKill(proj) {
        for (let i = 0; i < 10; i++) {
            const dust = Terraria.Dust.NewDustDirect(
                proj.position, proj.width, proj.height,
                89,
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 12,
                0, Color.White, 1.0
            );
            if (dust) {
                dust.noGravity = true;
                dust.noLight = true;
            }
        }
    }

    PreDraw() { return false; }
}