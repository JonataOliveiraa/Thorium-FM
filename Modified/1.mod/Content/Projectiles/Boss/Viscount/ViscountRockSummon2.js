import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';
import { FxHelper } from '../../../Global/Utils/FxHelper.js';

const { Vector2 } = Modules;
const { Main } = Terraria;
const SolidCollision = Terraria.Collision['bool SolidCollision(Vector2 Position, int Width, int Height)'];

/**
 * Onda psiquica invisivel do grito: espalha e estoura em poeira ao bater no teto.
 */
export class ViscountRockSummon2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Empty';
    }

    SetDefaults() {
        this.Projectile.width = 20;
        this.Projectile.height = 20;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 240;
        this.Projectile.extraUpdates = 3;
        this.Projectile.tileCollide = true;
        this.Projectile.hostile = false;
        this.Projectile.friendly = false;
        this.Projectile.alpha = 255;
    }

    PreDraw(proj, lightColor) {
        return false;
    }

    AI(proj) {
        const vel = proj.velocity;
        if (SolidCollision(Vector2.new(proj.position.X + vel.X, proj.position.Y + vel.Y), proj.width, proj.height)) {
            proj.Kill();
        }
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 4, 110, 4, 0.75);
    }
}
