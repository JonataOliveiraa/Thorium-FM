import { Terraria } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Main } = Terraria;

const FRAMES = 4;
const FRAME_TIME = 2;
const LIFE = 20;
const FADE_START = 16; // a partir daqui a fumaca some

export class SluggerCloud extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 18;
        this.Projectile.height = 18;
        this.Projectile.aiStyle = 0;
        this.Projectile.alpha = 120;
        this.Projectile.scale = 1.4;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = LIFE;
        this.Projectile.tileCollide = false;
        this.Projectile.friendly = false;
        this.Projectile.hostile = false;
    }

    // So enfeite: nao causa dano, so anima e desaparece
    AI(proj) {
        if (++proj.frameCounter > FRAME_TIME) {
            proj.frameCounter = 0;
            proj.frame = (proj.frame + 1) % FRAMES;
        }

        if (proj.timeLeft < FADE_START) {
            proj.alpha = Math.min(255, proj.alpha + 8);
        }
    }

    CanDamage(proj) {
        return false;
    }
}
