import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ProjAI } from '../../../TL/ProjAI.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';
import { SoundHelper } from '../../Global/Utils/SoundHelper.js';

const { Main } = Terraria;

const FRAMES = 4;
const FRAME_TIME = 3;

export class NestlingAttack extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 16;
        this.Projectile.height = 16;
        this.Projectile.scale = 0.9;
        this.Projectile.aiStyle = 1;
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 600;

        this.AIType = 14;
    }

    // ai[0] marca que o som de nascimento ja tocou
    AI(proj) {
        const ai = new ProjAI(proj, false);
        if (ai[0] !== 1) {
            ai[0] = 1;
            SoundHelper.play(['Item17', 'Item1'], proj.Center.X, proj.Center.Y);
        }

        if (++proj.frameCounter > FRAME_TIME) {
            proj.frameCounter = 0;
            proj.frame = (proj.frame + 1) % FRAMES;
        }
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width + 5, proj.height + 5, 10, 13, 1, 1, 100);
    }
}
