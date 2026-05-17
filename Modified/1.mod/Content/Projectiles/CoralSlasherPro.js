import { Terraria, Modules } from "../../TL/ModImports.js";
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Color } from "../../TL/Modules/Color.js";
import { Rand } from "../../TL/Modules/Rand.js";

const { Vector2 } = Modules;

const SLASH_COLORS = [
    Color.new(255, 183, 220),
    Color.new(105, 255, 164),
    Color.new(111, 251, 255),
    Color.new(247, 171, 128),
];

export class CoralSlasherPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 22;
        this.Projectile.height = 22;
        this.Projectile.aiStyle = -1;
        this.Projectile.alpha = 255;
        this.Projectile.friendly = true;
        this.Projectile.melee = true;
        this.Projectile.penetrate = 1;
        this.Projectile.tileCollide = false;
        this.Projectile.timeLeft = 120;
    }

    AI(proj) {
        const vel = proj.velocity;
        proj.velocity = Vector2.Multiply(vel, 0.9);
        proj.spriteDirection = proj.velocity.X > 0 ? 1 : -1;
        if (proj.alpha > 0) proj.alpha = Math.max(0, proj.alpha - 13);
        proj.rotation += 0.2 * proj.spriteDirection;
    }

    OnKill(proj) {
        for (let i = 0; i < 4; i++) {
            const dustIdx = Terraria.Dust.NewDust(
                proj.position, proj.width, proj.height,
                2,
                proj.velocity.X * 0.75,
                proj.velocity.Y * 0.75,
                0,
                SLASH_COLORS[Math.floor(Math.random() * SLASH_COLORS.length)],
                1.0
            );
            const dust = Terraria.Main.dust[dustIdx];
            if (dust) dust.noGravity = true;
        }
    }
}