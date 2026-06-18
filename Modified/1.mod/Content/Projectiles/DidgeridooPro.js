import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Effects } from '../../TL/Modules/Effects.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

export class DidgeridooPro extends ModProjectile {
    static _vec = Vector2.new(0, 0);

    constructor() {
        super();
        this.Texture = null;
    }

    SetDefaults() {
        this.Projectile.width = 40;
        this.Projectile.height = 40;
        this.Projectile.aiStyle = -1;
        this.Projectile.scale = 1;
        this.Projectile.alpha = 255;
        this.Projectile.penetrate = 4;
        this.Projectile.timeLeft = 180;
        this.Projectile.friendly = true;
    }

    AI(proj) {
        const num = 20;
        const angleStep = (Math.PI * 2) / num;
        const rotation = Math.atan2(proj.velocity.Y, proj.velocity.X);
        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);
        const centerX = proj.Center.X;
        const centerY = proj.Center.Y;
        const vec = DidgeridooPro._vec;

        for (let i = 0; i < num; i++) {
            const angle = i * angleStep;
            const ellipseX = Math.cos(angle) * 10;
            const ellipseY = Math.sin(angle) * 20;

            const rotatedX = ellipseX * cosR - ellipseY * sinR;
            const rotatedY = ellipseX * sinR + ellipseY * cosR;

            const velX = rotatedX * 0.01;
            const velY = rotatedY * 0.01;

            vec.X = centerX + rotatedX;
            vec.Y = centerY + rotatedY;

            const dustIndex = Effects.NewDust(vec, 0, 0, 204, velX, velY, 0, Color.White, 0.8);
            const dust = Main.dust[dustIndex];
            if (dust) {
                dust.noGravity = true;
                dust.noLight = true;
                vec.X = velX;
                vec.Y = velY;
                dust.velocity = vec;
            }
        }
    }

    OnKill(proj) {
        const center = proj.Center;
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            Effects.NewDust(center, 0, 0, 204, Math.cos(angle) * speed, Math.sin(angle) * speed, 0, Color.White, 0.8);
        }
    }

    PreDraw() {
        return false;
    }
}