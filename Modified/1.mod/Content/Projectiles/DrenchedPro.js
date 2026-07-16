import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color } = Modules;

export class DrenchedPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 18;
        this.Projectile.height = 18;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.melee = true;
        this.Projectile.ownerHitCheck = true;
        this.Projectile.tileCollide = false;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 10;

        this.fadeOutTime = 10;
        this.fadeOutSpeed = 15;
        this.forwardRotation = true;
    }

    AI(proj) {
        if (this.forwardRotation) {
            proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI / 2;
        }
    }

    GetAlpha(proj, lightColor) {
        if (proj.timeLeft > this.fadeOutTime) {
            return Color.White;
        }
        const factor = proj.timeLeft / this.fadeOutTime;
        return Color.new(255, 255, 255, Math.floor(255 * factor));
    }
}