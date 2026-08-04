import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';

const { Color, Vector2, Effects } = Modules;
const WHITE = Color.White;
const { Main } = Terraria;

const LIFE = 45;

/**
 * Efeito visual do grito (nao causa dano). Cresce e some.
 */
export class CountScream extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 142;
        this.Projectile.height = 86;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = LIFE;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.hostile = false;
        this.Projectile.friendly = false;
        this.Projectile.alpha = 60;
        this.Projectile.scale = 0.9;
    }

    CanDamage(proj) {
        return false;
    }

    AI(proj) {
        proj.spriteDirection = proj.velocity.X < 0 ? -1 : 1;
        proj.scale += 0.02;

        const t = 1 - proj.timeLeft / LIFE;
        proj.alpha = Math.min(255, 60 + Math.floor(t * 260));

        if (proj.timeLeft % 8 === 0) {
            const center = proj.Center;
            const dust = Main.dust[Effects.NewDust(center, 0, 0, 110, 0, 0, 100, WHITE, 1.2)];
            if (dust) {
                dust.noGravity = true;
                dust.position = Vector2.new(center.X + Math.random() * 80 - 40, center.Y + Math.random() * 60 - 30);
                dust.velocity = Vector2.Zero;
            }
        }
    }
}
