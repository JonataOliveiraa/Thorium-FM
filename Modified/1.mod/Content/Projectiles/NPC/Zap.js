import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';
import { SoundHelper } from '../../Global/Utils/SoundHelper.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;
const WHITE = Color.White;

const FRAMES = 4;
const FRAME_TIME = 2;
const LIFE = 300;

const SPARK_DUST = 57;      // faisca eletrica
const BURST_COUNT = 15;     // anel que estoura quando o raio nasce

export class Zap extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = 0;
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.penetrate = 2;
        this.Projectile.timeLeft = LIFE;

        this.AIType = 14;
    }

    AI(proj) {
        // Rastro de faiscas subindo
        const trail = Main.dust[Effects.NewDust(
            proj.position, proj.width, proj.height,
            SPARK_DUST, proj.velocity.X * 0.1, -5, 125, WHITE, 0.75
        )];
        if (trail) trail.noGravity = true;

        if (proj.timeLeft === LIFE) this._spawnBurst(proj);

        if (++proj.frameCounter > FRAME_TIME) {
            proj.frameCounter = 0;
            proj.frame = (proj.frame + 1) % FRAMES;
        }
    }

    // Estouro alongado no sentido do disparo, no nascimento do raio
    _spawnBurst(proj) {
        const center = proj.Center;
        SoundHelper.play(['Item117', 'Item93', 'Item14'], center.X, center.Y);

        const rotation = Math.atan2(proj.velocity.Y, proj.velocity.X);
        FxHelper.ring(center.X, center.Y, BURST_COUNT, 2, 10, SPARK_DUST, 1, 1.25, rotation, 0);
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 10, SPARK_DUST, 4, 1, 0);
    }
}
