import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';
import { FxHelper } from './../Global/Utils/FxHelper.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;

const FRAMES = 4;
const DUST_GRANITE = 59;
const DUST_SHINE = 229;

export class GraniteIonStaffPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.AIType = 14;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 30;
        this.Projectile.height = 30;
        this.Projectile.aiStyle = 1;
        this.Projectile.penetrate = 2;
        this.Projectile.timeLeft = 80;
        this.Projectile.light = 0.25;
        this.Projectile.tileCollide = true;
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);
        const empower = ai[0];

        const origin = Vector2.new(proj.position.X + 3, proj.position.Y + 3);
        for (let i = 0; i < empower; i++) {
            const dust = Main.dust[Effects.NewDust(
                origin, proj.width, proj.height, DUST_GRANITE, 0, 0, 100, Color.White, 1
            )];
            if (!dust) continue;
            dust.scale *= 0.8 + Math.random() * 0.2;
            dust.velocity = Vector2.Multiply(dust.velocity, 0.2);
            dust.noGravity = true;
        }

        proj.alpha = 250 - empower * 50;

        if (++proj.frameCounter > 1) {
            proj.frameCounter = 0;
            if (++proj.frame >= FRAMES) proj.frame = 0;
        }
    }

    OnKill(proj, timeLeft) {
        const center = proj.Center;
        FxHelper.ring(center.X, center.Y, 25, 10, 10, DUST_GRANITE, 1, 1.25, 0, 0);
        FxHelper.ring(center.X, center.Y, 20, 4, 4, DUST_SHINE, 1, 0.75, 0, 0);
    }
}
