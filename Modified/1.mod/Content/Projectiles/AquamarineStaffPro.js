import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Color, Vector2 } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class AquamarineStaffPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 10;
        this.Projectile.height = 10;
        this.Projectile.alpha = 255;
        this.Projectile.penetrate = 2;
        this.Projectile.friendly = true;
        this.Projectile.magic = true;
        this.Projectile.timeLeft = 600;
    }

    AI(proj) {
        for (let i = 0; i < 2; i++) {
            const dustIndex = NewDust(
                proj.position, proj.width, proj.height,
                92,
                proj.velocity.X,
                proj.velocity.Y,
                175,
                Color.Transparent,
                1.0
            );
            if (dustIndex >= 0 && dustIndex < Terraria.Main.dust.length) {
                const dust = Terraria.Main.dust[dustIndex];
                dust.noGravity = true;
                dust.velocity = Vector2.new(
                    dust.velocity.X * 0.3,
                    dust.velocity.Y * 0.3
                );
            }
        }
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < 8; i++) {
            const dustIndex = NewDust(
                proj.position, proj.width, proj.height,
                92,
                proj.velocity.X * 0.75,
                proj.velocity.Y * 0.75,
                175,
                Color.Transparent,
                0.75
            );
            if (dustIndex >= 0 && dustIndex < Terraria.Main.dust.length) {
                Terraria.Main.dust[dustIndex].noGravity = true;
            }
        }
    }
}