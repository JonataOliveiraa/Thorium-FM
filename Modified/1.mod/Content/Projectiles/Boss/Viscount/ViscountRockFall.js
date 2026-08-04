import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';
import { SoundHelper } from '../../../Global/Utils/SoundHelper.js';
import { FxHelper } from '../../../Global/Utils/FxHelper.js';
import { ProjAI } from '../../../../TL/ProjAI.js';

const { Vector2 } = Modules;
const { Main } = Terraria;
const SolidCollision = Terraria.Collision['bool SolidCollision(Vector2 Position, int Width, int Height)'];

const LIFE = 180;
const READY_AT = 172; // so machuca / colide depois de "descolar" do teto

/**
 * Pedra que cai do teto apos o grito. ai[0] = variacao do sprite (0..5).
 */
export class ViscountRockFall extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 6;
    }

    SetDefaults() {
        this.Projectile.width = 30;
        this.Projectile.height = 30;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = LIFE;
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.tileCollide = false;
    }

    CanDamage(proj) {
        return proj.timeLeft < READY_AT;
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);
        proj.frame = Math.max(0, Math.min(5, ai[0] | 0));

        // Acelera na queda
        const vel = Vector2.Multiply(proj.velocity, 1.02);
        proj.velocity = vel;

        // Morre no chao (colisao feita na mao pra nao depender do aiStyle)
        if (proj.timeLeft < READY_AT &&
            SolidCollision(Vector2.new(proj.position.X, proj.position.Y + vel.Y), proj.width, proj.height)) {
            proj.Kill();
            return;
        }

        // Sentido da rotacao sorteado uma vez (localAI[0])
        const local = new ProjAI(proj, true);
        if (local[0] === 0) {
            local[0] = Math.random() < 0.5 ? 1 : -1;
        }
        proj.rotation += local[0] * 0.05;

    }

    OnKill(proj) {
        SoundHelper.play(['Item10'], proj.position.X, proj.position.Y);
        FxHelper.burst(proj.position, proj.width, proj.height, 5, 1, 5, 1, 0);
    }
}
