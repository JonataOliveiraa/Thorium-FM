import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';
import { SoundHelper } from '../../../Global/Utils/SoundHelper.js';
import { FxHelper } from '../../../Global/Utils/FxHelper.js';

const { Color } = Modules;

const LIFE = 120;
const DUST = 90;
const SPAWN_RING = 14;  // particulas do estouro inicial
const TRAIL_RING = 8;   // particulas por anel do rastro
const TRAIL_RATE = 6;   // 1 anel a cada N ticks

let _alpha = null;

/**
 * Echo shot vermelho: rapido e atravessa blocos.
 */
export class ViscountRipple2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 32;
        this.Projectile.height = 32;
        this.Projectile.aiStyle = -1;
        this.Projectile.alpha = 50;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = LIFE;
        this.Projectile.tileCollide = false;
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.ignoreWater = true;
    }

    GetAlpha(proj, lightColor) {
        return _alpha ?? (_alpha = Color.Multiply(Color.new(255, 255, 255, 150), 0.8));
    }

    ModifyDamageHitbox(proj, hitbox) {
        hitbox.X += 4;
        hitbox.Y += 4;
        hitbox.Width -= 8;
        hitbox.Height -= 8;
        return hitbox;
    }

    AI(proj) {
        const vel = proj.velocity;
        const rot = Math.atan2(vel.Y, vel.X);
        proj.rotation = rot + Math.PI / 2; // textura aponta pra cima

        const timeLeft = proj.timeLeft;

        if (timeLeft === LIFE) {
            FxHelper.ring(proj.Center.X, proj.Center.Y, SPAWN_RING, 15, 15, DUST, 2, 1, rot, 0);
        }

        // Rastro: um anel achatado a cada TRAIL_RATE ticks
        if (timeLeft % TRAIL_RATE === 0) {
            FxHelper.ring(proj.Center.X, proj.Center.Y, TRAIL_RING, 8, 14, DUST, 0, 0.75, rot, 0);
        }
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 6, DUST, 4, 0.8, 0);
    }
}
