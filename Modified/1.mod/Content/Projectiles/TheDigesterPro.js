import { Terraria, Modules } from "../../TL/ModImports.js";
import { ModProjectile } from "../../TL/ModProjectile.js";

const { Color, Vector2 } = Modules;

export class TheDigesterPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 20;
        this.Projectile.height = 20;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 300;
        this.Projectile.magic = true;
    }

    AI(proj) {
        const vel = proj.velocity;
        proj.velocity = Vector2.new(vel.X, vel.Y + 0.125);
        proj.rotation += 0.1;

        if (proj.timeLeft >= 298) return;

        for (let i = 0; i < 2; i++) {
            const pos = Vector2.Subtract(proj.position, proj.velocity);
            const dust = Terraria.Dust.NewDustDirect(
                pos, proj.width, proj.height,
                157, 0, 0, 125, Color.Transparent, 1.25
            );
            if (dust) {
                dust.velocity = Vector2.Zero;
                dust.noGravity = true;
            }
        }
    }

    OnHitNPC(proj, npc) {
        npc.AddBuff(20, 180, false);
        Terraria.Main.player[proj.own].Heal(2)
        
        for (let i = 0; i < 10; i++) {
            const dust = Terraria.Dust.NewDustDirect(
                proj.Center, 10, 10,
                157,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                125, Color.Transparent, 1.25
            );
            if (dust) dust.noGravity = true;
        }
    }

    OnTileCollide(proj, oldVelocity) {
        for (let i = 0; i < 15; i++) {
            const dust = Terraria.Dust.NewDustDirect(
                proj.Center, 10, 10,
                157,
                proj.velocity.X * 0.75,
                proj.velocity.Y * 0.75,
                125, Color.Transparent, 1.25
            );
            if (dust) {
                dust.fadeIn = 1 + Math.random() * 0.15;
                dust.noGravity = true;
            }
        }
        return true;
    }
}