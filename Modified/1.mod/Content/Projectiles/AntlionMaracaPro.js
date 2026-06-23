// AntlionMaracaPro.js
import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Effects } from '../../TL/Modules/Effects.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

export class AntlionMaracaPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = null;
    }

    SetDefaults() {
        this.Projectile.width = 8;
        this.Projectile.height = 8;
        this.Projectile.aiStyle = 1;
        this.Projectile.scale = 1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 20;
        this.Projectile.alpha = 255;
    }

    AI(proj) {
        const num = 3;
        for (let i = 0; i < num; i++) {
            const dustPos = Vector2.new(
                proj.Center.X - (proj.velocity.X / num) * i,
                proj.Center.Y - (proj.velocity.Y / num) * i
            );
            const dustIndex = Effects.NewDust(dustPos, 0, 0, 32, 0, 0, 150, Color.White, 1.25);
            const dust = Main.dust[dustIndex];
            if (dust) {
                dust.noGravity = true;
                dust.velocity = Vector2.Zero;
            }
        }
    }

    PreDraw() {
        return false;
    }
}