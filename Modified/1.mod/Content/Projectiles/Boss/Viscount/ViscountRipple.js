import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';
import { SoundHelper } from '../../../Global/Utils/SoundHelper.js';
import { FxHelper } from '../../../Global/Utils/FxHelper.js';

const { Color, Vector2 } = Modules;
const SolidCollision = Terraria.Collision['bool SolidCollision(Vector2 Position, int Width, int Height)'];

const LIFE = 180;
const DUST = 110;
const SPAWN_RING = 14;  // particulas do estouro inicial
const TRAIL_RING = 8;   // particulas por anel do rastro
const TRAIL_RATE = 6;   // 1 anel a cada N ticks

let _alpha = null;

/**
 * Echo shot azul: lento e quica nas paredes.
 */
export class ViscountRipple extends ModProjectile {
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
        this.Projectile.tileCollide = false; // colisao feita na mao (ricochete)
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.ignoreWater = true;
    }

    GetAlpha(proj, lightColor) {
        return _alpha ?? (_alpha = Color.Multiply(Color.new(255, 255, 255, 150), 0.8));
    }

    AI(proj) {
        const vel = proj.velocity;
        const rot = Math.atan2(vel.Y, vel.X);
        proj.rotation = rot + Math.PI / 2; // textura aponta pra cima

        const timeLeft = proj.timeLeft;

        if (timeLeft === LIFE) {
            FxHelper.ring(proj.Center.X, proj.Center.Y, SPAWN_RING, 15, 15, DUST, 2, 1, rot, 0);
        }

        // Ricochete: um teste barato antes de decidir qual eixo inverter
        if (timeLeft < LIFE - 6 && SolidCollision(Vector2.new(proj.position.X + vel.X, proj.position.Y + vel.Y), proj.width, proj.height)) {
            const nx = SolidCollision(Vector2.new(proj.position.X + vel.X, proj.position.Y), proj.width, proj.height) ? -vel.X : vel.X;
            const ny = SolidCollision(Vector2.new(proj.position.X, proj.position.Y + vel.Y), proj.width, proj.height) ? -vel.Y : vel.Y;
            proj.velocity = Vector2.new(nx === vel.X && ny === vel.Y ? -vel.X : nx, nx === vel.X && ny === vel.Y ? -vel.Y : ny);
            SoundHelper.play(['Item10'], proj.Center.X, proj.Center.Y, 0.4, 0.5);
        }

        // Rastro: um anel achatado a cada TRAIL_RATE ticks
        if (timeLeft % TRAIL_RATE === 0) {
            FxHelper.ring(proj.Center.X, proj.Center.Y, TRAIL_RING, 8, 14, DUST, 0, 1.25, rot, 0);
        }
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 4, DUST, 4, 0.8, 0);
    }
}
