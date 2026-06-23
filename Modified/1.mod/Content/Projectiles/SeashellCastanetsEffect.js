import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Color } from '../../TL/Modules/Color.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Vector2 } = Modules;

export class SeashellCastanetsEffect extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 26;
        this.Projectile.height = 56;
        this.Projectile.aiStyle = 1;
        this.Projectile.alpha = 60;
        this.Projectile.tileCollide = false;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 20;
        this.fadeOutTime = 16;
    }

    GetAlpha(proj, lightColor) {
        return Color.Multiply(Color.White, 0.85 * (0.1 * proj.timeLeft));
    }

    AI(proj) {
        const localAI = new ProjAI(proj, true);
        if (localAI[0] === 0 && localAI[1] === 0) {
            localAI[0] = proj.Center.X;
            localAI[1] = proj.Center.Y;
        }
        proj.Center = Vector2.new(localAI[0], localAI[1]);

        proj.spriteDirection = proj.direction;
        if (proj.timeLeft < this.fadeOutTime) {
            proj.scale += 1 / this.fadeOutTime;
        }
    }
}