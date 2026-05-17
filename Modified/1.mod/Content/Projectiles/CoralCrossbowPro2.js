import { Rand } from '../../TL/Modules/Rand.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { CoralCrossbowPro } from './CoralCrossbowPro.js';

const { Color, Vector2 } = Modules;

export class CoralCrossbowPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 3;
    }

    SetDefaults() {
        this.Projectile.width = 9;
        this.Projectile.height = 18;
        this.Projectile.friendly = false; // começa false, ativa depois
        this.Projectile.ranged = true;
        this.Projectile.penetrate = 1;
        this.Projectile.ignoreWater = true;
        this.Projectile.tileCollide = true;
        this.Projectile.hostile = false;
        this.Projectile.alpha = 0;
        this.Projectile.aiStyle = -1;
        this.Projectile.timeLeft = 240;
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);

        if (ai[0] > 0) {
            ai[0]--;
            proj.friendly = false;
        } else {
            proj.friendly = true;
        }

        proj.rotation = Vector2.ToRotation(proj.velocity) + Math.PI / 2;

        const vel = proj.velocity;
        vel.Y += 0.4;
        proj.velocity = vel;

        proj.frameCounter++;
        if (proj.frameCounter >= 3) {
            proj.frameCounter = 0;
            proj.frame = (proj.frame + 1) % 3;
        }
    }

    OnKill(proj, timeLeft) {
        CoralCrossbowPro.CoralDust(proj)
    }
}